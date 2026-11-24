---
title: How to Install Rancher inside AWS EKS
date: 2021-03-21
summary: A step-by-step guide to installing Rancher inside a running AWS EKS cluster, from the IAM roles to the first login.
tags: [aws, eks, kubernetes, rancher, devops]
cover: /posts/how-to-install-rancher-inside-aws-eks/cover.png
---

> Note: I wrote this guide in 2021, so the versions below are old (Kubernetes 1.19, cert-manager 1.0.4 and ingress-nginx 0.44). On top of that, the Kubernetes project retired ingress-nginx in March 2026, which means it no longer gets security fixes, so think twice before using it for anything real.

Rancher is an abstraction built on top of Kubernetes that helps you deal with a lot of clusters, in different services and regions, through a useful dashboard.

By using it, you are able to deploy .yml files, deployments, custom apps, default apps, SSL certificates and so on in an easier way (and even other clusters on services like AWS, Google Cloud, etc).

The "Rancher" name comes from a common DevOps joke: "Cattle vs Pets". Usually DevOps people want to treat their apps as cattle instead of pets, since a pet needs to be taken care of, while with cattle you just replace it when needed (no emotional attachment here).

One of the ways of installing Rancher is by creating a master node and installing it there, but we consider that a bad idea since, if you lose the master, you lose the whole cluster.

A better way is to install Rancher inside the cluster itself, so it keeps running across the nodes instead of living on a single machine. So today we will learn how to install it inside a running AWS EKS cluster.

We will do it in four parts. First we prepare the AWS account (roles and a key pair), then we create the cluster and its nodes, then we connect your machine to it, and in the end we install Rancher on top of it.

## Before You Start

You will need three things along the way, so it is worth checking them now:

- **An AWS account** where you can create IAM roles, EKS clusters and EC2 resources.
- **A domain you control**, since Rancher will answer on a subdomain of it (in my case, rancher.example.com).
- **A Linux terminal**, since the install commands below are for Linux x86_64.

## Preparing the AWS Account

Before creating the cluster, AWS needs to know what the cluster and its machines are allowed to do, and we need a way to reach those machines later. So this part creates two IAM roles and one EC2 key pair, and nothing here costs money yet.

### Creating the Cluster Service Role

Since our cluster needs permission to manage some AWS resources by itself, the first role is for the cluster. At first, open IAM by searching for it on the AWS console (you can use the search input at the top of the page).

![IAM Service Search](/posts/how-to-install-rancher-inside-aws-eks/iam-aws-console-search.png "Open IAM from the search at the top of the console.")

After selecting the service, go to the Roles item of the left side menu and click on the Create Role button.

![IAM Roles Page](/posts/how-to-install-rancher-inside-aws-eks/iam-roles-page.png "Every role of this guide starts from this button.")

Select EKS from the list that will be shown, select EKS Cluster on the sub-item list at the bottom of the page and click on the Next button.

![Cluster Service Role Selection](/posts/how-to-install-rancher-inside-aws-eks/iam-roles-eks-role-selection.png "EKS on top, EKS Cluster at the bottom: this gives the role the cluster permissions.")

We will name this role cluster-service-role, and then you can click on the Create Role button.

![Cluster Service Role Finish](/posts/how-to-install-rancher-inside-aws-eks/iam-roles-eks-role-finish.png "Remember this name, since you will pick it when creating the cluster.")

### Creating the Node Group Role

The machines of the cluster need their own permissions too (joining the cluster, pulling images and setting up the network), so we create a second role for them. Click on the Create Role button on the Roles page again, and this time select EC2 on the top list and EC2 on the bottom list.

![Node Group Role Selection](/posts/how-to-install-rancher-inside-aws-eks/iam-roles-node-group-role-selection.png "EC2 on both lists, since the nodes are EC2 instances.")

For this role, you need to select the following policies manually: AmazonEKSWorkerNodePolicy, AmazonEC2ContainerRegistryReadOnly and AmazonEKS_CNI_Policy. After selecting them, name the role node-group-role and click on the Create Role button.

![Node Group Role Finish](/posts/how-to-install-rancher-inside-aws-eks/iam-roles-node-group-role-finish.png "Check that the three policies are listed before creating the role.")

### Creating an EC2 Key Pair

In order to access the cluster nodes later, we need a key pair to authenticate with them. So, go to the EC2 page by searching for it on the console.

![EC2 Console Search](/posts/how-to-install-rancher-inside-aws-eks/ec2-aws-console-search.png "Open EC2 from the console search.")

Select Key Pairs on the left side menu and click on the Create Key Pair button.

![Key Pair EC2 Page](/posts/how-to-install-rancher-inside-aws-eks/key-pair-ec2-page.png "Key Pairs lives in the left side menu of EC2.")

Name it the way you prefer (in my case I chose test-node), select the pem format and click on the Create Key Pair button. Keep in mind that the private key file is downloaded by the browser only once, so store it somewhere safe.

![Key Pair Finish](/posts/how-to-install-rancher-inside-aws-eks/key-pair-finish.png "The pem format works with the ssh command on Linux.")

## Creating the Cluster

Now that AWS knows what the cluster may do, we can create it. This part has two steps: the cluster itself (the control plane, which AWS runs for us) and the node group (the EC2 machines where our apps, Rancher included, will run).

### Creating the EKS Cluster

Go to the EKS page by searching for it on the console.

![EKS Console Search](/posts/how-to-install-rancher-inside-aws-eks/eks-aws-console-search.png "Open EKS from the console search.")

Open the Clusters page from the left side menu and click on the Create Cluster button.

![EKS Page](/posts/how-to-install-rancher-inside-aws-eks/eks-page.png "The Clusters page starts empty.")

At first, choose the name you prefer for the cluster (in my case I used test-cluster), select the cluster service role you created before and click on the Next button.

![EKS Cluster Config](/posts/how-to-install-rancher-inside-aws-eks/eks-cluster-config.png "Pick the cluster-service-role here, not the node group one.")

Now you need to select the networking config of your cluster. Usually you just need to click on the Next button here, since EKS already selects the default configs for you (but you can change them in case you need).

![EKS Networking Config](/posts/how-to-install-rancher-inside-aws-eks/eks-networking-config.png "The defaults are fine for this guide.")

After that, you can select some logging configs with CloudWatch (set them the way you prefer, I usually keep it off).

![EKS Log Config](/posts/how-to-install-rancher-inside-aws-eks/eks-log-config.png "Logging is optional; I keep it off.")

The last step lets you review everything you set, so you just have to click on the Create button to finish creating the cluster.

The cluster will be available after some minutes, so take the opportunity to make some coffee before the next steps.

### Adding the Node Group

After the cluster is deployed successfully, we need a node group, which is basically a group of EC2 instances that we can scale the way we prefer to run our cluster on. In order to create it, click on the Add Node Group button.

![Node Group List](/posts/how-to-install-rancher-inside-aws-eks/eks-node-group-list.png "The button only works once the cluster is active.")

Name the node group the way you prefer (I chose test-node-group), select the node group role you created before and click on the Next button.

![EKS Node Group Config](/posts/how-to-install-rancher-inside-aws-eks/eks-node-group-config.png "This time pick the node-group-role.")

Now it is time to select the resources of the node group. In order to run Rancher inside the cluster, we need at least 2 instances of type t2.medium, so that is the config you will see on the screenshot (but you can change it later and scale the way you want).

![Node Group Resources Config](/posts/how-to-install-rancher-inside-aws-eks/node-group-resources-config.png "Two t2.medium instances are the minimum for Rancher.")

Then we get to the networking config of the node group. EKS suggests the default config, which most of the time is all you need, but you can change it if you want. Select the key pair you created before and click on the Next button.

![Node Group Networking Config](/posts/how-to-install-rancher-inside-aws-eks/node-group-networking-config.png "Select the key pair from the first part here.")

The last step is the review again, so click on the Create button to finish creating the node group.

The node group takes some minutes to get up since EC2 instances are being created, but we can move on to the next steps anyway.

## Connecting Your Machine

The cluster is running, but so far only the AWS console can see it. In this part we install the tools that talk to it from your terminal and give them your credentials, so every command after this one runs against the new cluster.

### Installing the AWS CLI

In order to reach the cluster from the terminal, we need the AWS CLI. You can install it with the commands below, which download the installer, unzip it and run it.

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Creating the Access Keys

After installing the AWS CLI, you need to authenticate in order to access your AWS resources, so we will generate the access keys of the root user.

At first, click on your name at the top right corner and then on the My Security Credentials link.

![AWS User Menu](/posts/how-to-install-rancher-inside-aws-eks/aws-user-menu.png "Your credentials live under your name, at the top right.")

On the page that opens, go to the Access Keys section in the middle of the page and click on the Create New Access Key button.

![AWS User Credentials](/posts/how-to-install-rancher-inside-aws-eks/aws-user-credentials.png "Access Keys sits in the middle of the credentials page.")

Now you have access to your Access Key and Secret Key. Download the key file right away, since you will not be able to see the secret key again, and if you lose it you will have to create a new one.

![User Generated Credentials](/posts/how-to-install-rancher-inside-aws-eks/user-generated-credentials.png "This is the only time the secret key is shown.")

With the keys in hand, run the command below and paste them when it asks for them (it also asks for a default region and an output format).

```bash
aws configure
```

### Linking kubectl with the Cluster

In order to run kubectl commands against the cluster we created, we need a simple config. In case you do not have kubectl yet, you can install it with the following commands, which download the binary, make it executable and add it to your PATH.

```bash
curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.19.6/2021-01-05/bin/linux/amd64/kubectl
chmod +x ./kubectl
mkdir -p $HOME/bin && cp ./kubectl $HOME/bin/kubectl && export PATH=$PATH:$HOME/bin
```

Next, you need eksctl, the official CLI for EKS. The commands below download it and move it to a folder in your PATH.

```bash
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

Now you just need to run the command below to write the cluster access into your kubeconfig (remember to use the region where you created the cluster and the name you gave to it).

```bash
aws eks --region us-east-1 update-kubeconfig --name test-cluster
```

## Installing Rancher

Everything so far was setup, and now we get to Rancher itself. Requests from the internet need a way into the cluster, so we start with an ingress controller and a domain pointing to it, and only then install Rancher with Helm.

### Setting Up the Ingress Controller

The first and most important step is to install an ingress controller, which handles all the requests of the cluster in one single place.

You can install the right one with the command below (keep in mind that if you install the wrong ingress controller, the Rancher installation can get messed up, so we usually go with the open source version of nginx).

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.44.0/deploy/static/provider/aws/deploy.yaml
```

### Pointing a Domain to the Load Balancer

After that, a load balancer is created on AWS automatically, and you need to point the CNAME you prefer to its DNS (it will be the entry point of the Rancher console). To find it, go to the EC2 page again.

![EC2 Console Search](/posts/how-to-install-rancher-inside-aws-eks/ec2-console-search.png "Back to EC2, this time for the load balancer.")

Click on Load Balancers on the left side menu, select the load balancer on the list and look at the DNS name field of its description.

![EC2 Load Balancer](/posts/how-to-install-rancher-inside-aws-eks/ec2-load-balancer.png "The DNS name field is what your domain will point to.")

Now point your domain to that DNS, so you can reach the Rancher console later. In my case I used the following config:

- CNAME rancher.example.com -> Load Balancer DNS

### Installing Rancher with Helm

Now we need Helm to proceed (in case you already have it installed, you can skip this part). The commands below download the install script, make it executable and run it.

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

Now add the Rancher chart repository, so Helm knows where to find it.

```bash
helm repo add rancher-latest https://releases.rancher.com/server-charts/latest
```

Then create a namespace for Rancher.

```bash
kubectl create namespace cattle-system
```

After that, we install cert-manager, which will create the SSL certificates of our cluster resources automatically. The first command installs its custom resource definitions, and the rest creates its namespace and installs the chart.

```bash
kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.0.4/cert-manager.crds.yaml
kubectl create namespace cert-manager
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --version v1.0.4
```

In the end, we just need to run the command below to install Rancher on the cluster. Remember to use the domain you pointed to the load balancer in the hostname option, and to change the email field, which Let's Encrypt will use to issue the SSL certificates.

```bash
helm install rancher rancher-latest/rancher \
  --namespace cattle-system \
  --set hostname=rancher.example.com \
  --set ingress.tls.source=letsEncrypt \
  --set letsEncrypt.email=you@example.com
```

Now you need to wait some minutes until Rancher finishes installing on the cluster. After that, open the domain you pointed to the load balancer (in my case it was rancher.example.com) and a beautiful page will show up, like the one below.

![Rancher Initial Page](/posts/how-to-install-rancher-inside-aws-eks/rancher-initial-page.png "If you see this page, Rancher is running inside the cluster.")

## Where to Go Next

Congratulations! Now you have Rancher running inside your AWS EKS, spread across the nodes of the cluster instead of living on a single machine, and reachable on your own domain with an SSL certificate.

From here, select the configs you prefer on the page above and start testing things on the Rancher dashboard (there is a lot of good stuff to do there). If you plan to use this setup for anything real, swap the ingress controller first, since ingress-nginx no longer gets security fixes (see the note at the top).

## References

- [Installing the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux.html)
- [Configuring credentials on the AWS CLI](https://docs.aws.amazon.com/cli/latest/reference/configure/index.html)
- [Installing kubectl](https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html)
- [Installing eksctl](https://docs.aws.amazon.com/eks/latest/userguide/eksctl.html)
- [Linking the cluster with kubectl](https://aws.amazon.com/premiumsupport/knowledge-center/eks-cluster-connection/)
- [Installing the ingress controller](https://kubernetes.github.io/ingress-nginx/deploy/#network-load-balancer-nlb)
- [Installing Helm](https://helm.sh/docs/intro/install/#from-script)
- [Rancher documentation](https://docs.rancher.com/)
- [Ingress NGINX Retirement: What You Need to Know](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/)
