---
title: How to Install Rancher inside AWS EKS
date: 2021-03-21
summary: A step-by-step guide to installing Rancher inside a running AWS EKS cluster, from the IAM roles to the first login.
tags: [aws, eks, kubernetes, rancher, devops]
---

> Note: I wrote this guide in 2021, so the versions below are old (Kubernetes 1.19, cert-manager 1.0.4 and ingress-nginx 0.44). On top of that, the Kubernetes project retired ingress-nginx in March 2026, which means it no longer gets security fixes, so think twice before using it for anything real.

Rancher is an abstraction built on top of Kubernetes that helps you deal with a lot of clusters, in different services and regions, through a useful dashboard.

By using it, you are able to deploy .yml files, deployments, custom apps, default apps, SSL certificates and so on in an easier way (and even other clusters on services like AWS, Google Cloud, etc).

The "Rancher" name comes from a common DevOps joke: "Cattle vs Pets". Usually DevOps people want to treat their apps as cattle instead of pets, since a pet needs to be taken care of, while with cattle you just replace it when needed (no emotional attachment here).

One of the ways of installing Rancher is by creating a master node and installing it there, but we consider that a bad idea since, if you lose the master, you lose the whole cluster.

A better way is to install Rancher inside the cluster itself, so it keeps running across the nodes instead of living on a single machine. So today we will learn how to install it inside a running AWS EKS cluster.

## Creating the IAM Roles

Since our cluster and its resources need permission to do some actions inside AWS, we must create two roles on AWS IAM.

At first, we need to open IAM by searching for it on the AWS console (you can use the search input at the top of the page).

![IAM Service Search](/posts/how-to-install-rancher-inside-aws-eks/iam-aws-console-search.png)

After selecting the service, go to the Roles item of the left side menu and click on the Create Role button.

![IAM Roles Page](/posts/how-to-install-rancher-inside-aws-eks/iam-roles-page.png)

### Creating the Cluster Service Role

The first role gives some permissions to the cluster itself. So, select EKS from the list that will be shown, select EKS Cluster on the sub-item list at the bottom of the page and click on the Next button.

![Cluster Service Role Selection](/posts/how-to-install-rancher-inside-aws-eks/iam-roles-eks-role-selection.png)

We will name this role cluster-service-role, and then you can click on the Create Role button.

![Cluster Service Role Finish](/posts/how-to-install-rancher-inside-aws-eks/iam-roles-eks-role-finish.png)

### Creating the Node Group Role

Click on the Create Role button on the Roles page again, in order to create a new role for the node group. This time we need to select EC2 on the top list and EC2 on the bottom list.

![Node Group Role Selection](/posts/how-to-install-rancher-inside-aws-eks/iam-roles-node-group-role-selection.png)

For this role, you need to select the following policies manually: AmazonEKSWorkerNodePolicy, AmazonEC2ContainerRegistryReadOnly and AmazonEKS_CNI_Policy. After selecting them, name the role node-group-role and click on the Create Role button.

![Node Group Role Finish](/posts/how-to-install-rancher-inside-aws-eks/iam-roles-node-group-role-finish.png)

## Creating an EC2 Key Pair

In order to access the cluster nodes later, we need a key pair to authenticate with them. So, go to the EC2 page by searching for it on the console.

![EC2 Console Search](/posts/how-to-install-rancher-inside-aws-eks/ec2-aws-console-search.png)

Select Key Pairs on the left side menu and click on the Create Key Pair button.

![Key Pair EC2 Page](/posts/how-to-install-rancher-inside-aws-eks/key-pair-ec2-page.png)

Name it the way you prefer (in my case I chose test-node), select the pem format and click on the Create Key Pair button. Keep in mind that the private key file is downloaded by the browser, so store it somewhere safe.

![Key Pair Finish](/posts/how-to-install-rancher-inside-aws-eks/key-pair-finish.png)

## Creating the Cluster

Now it is time for the cluster itself, so go to the EKS page by searching for it on the console.

![EKS Console Search](/posts/how-to-install-rancher-inside-aws-eks/eks-aws-console-search.png)

Open the Clusters page from the left side menu and click on the Create Cluster button.

![EKS Page](/posts/how-to-install-rancher-inside-aws-eks/eks-page.png)

At first, choose the name you prefer for the cluster (in my case I used test-cluster), select the cluster service role you created before and click on the Next button.

![EKS Cluster Config](/posts/how-to-install-rancher-inside-aws-eks/eks-cluster-config.png)

Now you need to select the networking config of your cluster. Usually you just need to click on the Next button here, since EKS already selects the default configs for you (but you can change them in case you need).

![EKS Networking Config](/posts/how-to-install-rancher-inside-aws-eks/eks-networking-config.png)

After that, you can select some logging configs with CloudWatch (set them the way you prefer, I usually keep it off).

![EKS Log Config](/posts/how-to-install-rancher-inside-aws-eks/eks-log-config.png)

The last step lets you review everything you set, so you just have to click on the Create button to finish creating the cluster.

The cluster will be available after some minutes, so take the opportunity to make some coffee before the next steps.

## Creating the Node Group

After the cluster is deployed successfully, we need a node group, which is basically a group of EC2 instances that we can scale the way we prefer to run our cluster on. In order to create it, click on the Add Node Group button.

![Node Group List](/posts/how-to-install-rancher-inside-aws-eks/eks-node-group-list.png)

Name the node group the way you prefer (I chose test-node-group), select the node group role you created before and click on the Next button.

![EKS Node Group Config](/posts/how-to-install-rancher-inside-aws-eks/eks-node-group-config.png)

Now it is time to select the resources of the node group. In order to run Rancher inside the cluster, we need at least 2 instances of type t2.medium, so that is the config you will see on the screenshot (but you can change it later and scale the way you want).

![Node Group Resources Config](/posts/how-to-install-rancher-inside-aws-eks/node-group-resources-config.png)

Then we get to the networking config of the node group. EKS suggests the default config, which most of the time is all you need, but you can change it if you want. Select the key pair you created before and click on the Next button.

![Node Group Networking Config](/posts/how-to-install-rancher-inside-aws-eks/node-group-networking-config.png)

The last step is the review again, so click on the Create button to finish creating the node group.

The node group takes some minutes to get up since EC2 instances are being created, but we can move on to the next steps anyway.

## Configuring the AWS CLI

In order to reach the cluster from the terminal, we need the AWS CLI. You can install it with the commands below, which download the installer, unzip it and run it.

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

## Creating the Access Keys

After installing the AWS CLI, you need to authenticate in order to access your AWS resources, so we will generate the access keys of the root user.

At first, click on your name at the top right corner and then on the My Security Credentials link.

![AWS User Menu](/posts/how-to-install-rancher-inside-aws-eks/aws-user-menu.png)

On the page that opens, go to the Access Keys section in the middle of the page and click on the Create New Access Key button.

![AWS User Credentials](/posts/how-to-install-rancher-inside-aws-eks/aws-user-credentials.png)

Now you have access to your Access Key and Secret Key. Download the key file right away, since you will not be able to see the secret key again, and if you lose it you will have to create a new one.

![User Generated Credentials](/posts/how-to-install-rancher-inside-aws-eks/user-generated-credentials.png)

With the keys in hand, run the command below and paste them when it asks for them (it also asks for a default region and an output format).

```bash
aws configure
```

## Linking kubectl with the Cluster

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

## Setting Up the Ingress Controller

Now it is time to start the Rancher setup. The first and most important step is to install an ingress controller, which handles all the requests of the cluster in one single place.

You can install the right one with the command below (keep in mind that if you install the wrong ingress controller, the Rancher installation can get messed up, so we usually go with the open source version of nginx).

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.44.0/deploy/static/provider/aws/deploy.yaml
```

After that, a load balancer is created on AWS automatically, and you need to point the CNAME you prefer to its DNS (it will be the entry point of the Rancher console). To find it, go to the EC2 page again.

![EC2 Console Search](/posts/how-to-install-rancher-inside-aws-eks/ec2-console-search.png)

Click on Load Balancers on the left side menu, select the load balancer on the list and look at the DNS name field of its description.

![EC2 Load Balancer](/posts/how-to-install-rancher-inside-aws-eks/ec2-load-balancer.png)

Now point your domain to that DNS, so you can reach the Rancher console later. In my case I used the following config:

- CNAME rancher.example.com -> Load Balancer DNS

## Installing Rancher with Helm

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

![Rancher Initial Page](/posts/how-to-install-rancher-inside-aws-eks/rancher-initial-page.png)

Congratulations! Now you have Rancher running inside your AWS EKS! Select the configs you prefer on the page above and start testing things on the Rancher dashboard (there is a lot of good stuff to do there).

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
