---
title: Migrating the Bill, Not the Architecture
date: 2026-11-26
summary: "Lessons from a hybrid cloud migration from AWS to Huawei Cloud that cut the bill by about 17%: map the cost first and move only where the money is."
tags: [aws, huawei-cloud, hybrid-cloud, cloud-migration, finops, devops]
cover: /covers/migrating-the-bill-not-the-architecture.svg
---

A hybrid cloud migration moves part of a system to a second cloud provider while the rest keeps running on the first one, and both work as one product for the user. In my case, the photo path of a gallery product moved from AWS to Huawei Cloud, while the main database and a few older features stayed on AWS.

Done well, you pay the cheaper provider's prices where they matter most, without the months and the risk of a full migration (and you keep a way back, since the old cloud is still there).

Think of it like moving to a cheaper apartment. You take the furniture you use every day, but the old piano stays at your parents' house, since carrying it down three floors costs more than the space it takes there (and nobody has played it in years).

The common approach is to treat a migration as a list of services to recreate on the new cloud, one by one, until the old account is empty. That fails because each piece has its own moving cost and its own saving, and some pieces cost almost nothing to keep where they are, so a full migration can spend months moving things that never pay for themselves.

I owned this project end to end, from the first map of the architecture to the last customer on the new cloud, and this post is what I learned doing it. It is not a step-by-step tutorial, but a set of lessons for anyone thinking of moving part of their infrastructure to cut costs, and the short version is the title: migrate the bill, not the architecture.

We will go in five parts. First we map the architecture by what it costs, then we choose what moves and what stays, then we build the bridge that lets two clouds serve one product, then we roll it out in small steps, and in the end we see what broke on the way (and what it cost).

## Mapping the Architecture by Cost

A cloud migration to cut costs starts from the bill, not from the list of services. So this part is about finding where the money goes before deciding anything, and in the end you have a map that already says where to start.

### Drawing Every Resource and What It Depends On

Before touching any code, I drew a high-level diagram with every infrastructure resource of the product and the dependencies between them: servers, functions, buckets, CDNs, queues, caches and the database. It is boring work, but it is the only way to see which pieces can move alone and which ones drag others with them.

After that, I highlighted the resources with the highest monthly values right in the diagram. That way anyone looking at it (me included, a few weeks later) could see at a glance where to focus first.

### Finding Where the Money Is

In our case, the cost was concentrated in two places: photo storage on S3 and the data transfer to deliver those photos to customers. Servers, functions and caches were small next to them, so the bill told me more about the architecture than the architecture diagram did (a photo product is, in the end, a storage and bandwidth business).

At that time we paid about US$ 12,000 a month, all on AWS.

### Comparing Prices Before Choosing the Provider

Huawei Cloud won for two reasons. Its storage and compute are cheaper, and in Brazil AWS bills in dollars with about 13.8% in taxes on top for the conversion, which Huawei does not charge. On a bill dominated by storage, both add up quickly.

So, the lesson of this part: sort the bill by resource before drawing any plan, since the top two or three lines usually decide the whole migration.

## Choosing What Moves and What Stays

What moves in a hybrid cloud migration is a decision made piece by piece. A piece moves only if its saving pays for its moving cost and its risk, so this part ends with two lists, and both are on purpose.

### Moving the Path Where Cost Concentrates

I picked one flow to move: the whole photo path of the gallery, which is upload, processing, viewing, ZIP download, delivery and selection. That is where storage and transfer happen, so that is where the saving is.

Each AWS service in that path had a Huawei Cloud equivalent, though not always an identical one. The third column is what I wish I had known before starting.

| AWS                 | Huawei Cloud                              | What was different                                                              |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| EC2                 | Elastic Cloud Server (ECS)                | No unlimited mode for CPU credits: when they end, performance drops             |
| S3                  | Object Storage Service (OBS)              | Same idea, lower price per GB                                                   |
| CloudFront          | Content Delivery Network (CDN)            | Huawei does not cover costs from attacks, so set a usage cap and a burst alert  |
| Lambda              | FunctionGraph                             | No Serverless Framework: you deploy a Docker image, and logs are off by default |
| API Gateway         | API Gateway                               | Every function needs an explicit API in an API group to be reachable            |
| ECS on Fargate      | Cloud Container Instance 2.0              | No tasks started from the SDK in our region, so we used FunctionGraph           |
| ElastiCache         | Distributed Cache Service (DCS) for Redis | Same idea                                                                       |
| ECR                 | SoftWare Repository for Container (SWR)   | Same idea                                                                       |
| Certificate Manager | Cloud Certificate Manager                 | A managed certificate costs about US$ 500 a year, so we used Let's Encrypt      |

### Leaving the Expensive Parts to Move Behind

The main database stayed on AWS. Moving it meant moving every feature that reads it at the same time, or living with cross-cloud latency in all of them, and the database was not where the money was.

Two older features stayed too: a legacy site builder and an album proofing tool. I checked the usage before deciding, and the album tool had 6 customers in the last month, all long-time customers who also used the legacy site, with no replacement in the newer product. So turning them off risked more revenue in churn than they cost to run, and moving them meant a lot of effort for almost no saving (they are the piano in the old house). The email service stayed on AWS as well.

### Running the Payback Math for Old Data

New galleries could be born on Huawei, but about 110 TB of old photos were still on AWS. I ran the numbers for a forced copy: moving 10 TB would cost about US$ 1,300 in data transfer, requests and retrieval, to save about US$ 63 a month after the move. That is more than a year to pay back, so we did not do it unless Huawei paid for the transfer.

Instead, old galleries move passively. When a customer downloads a gallery as a ZIP, the file is already outside AWS (on Backblaze B2), so a job extracts it and saves the photos on Huawei with no extra transfer cost. I checked that an extracted photo has the same MD5 hash as the original, and the job keeps the AWS copy (for a rollback) until we delete it on purpose.

```mermaid alt="The monthly bill split into what moved to Huawei Cloud and what stayed on AWS"
flowchart TD
  B[Monthly bill<br/>by resource] --> M[Moves to Huawei]
  B --> S[Stays on AWS]
  M --> M1[Photo storage,<br/>delivery, upload,<br/>ZIP and processing]
  S --> S1[Main database,<br/>legacy features<br/>and email]
```

So, the lesson of this part: a piece moves only when its saving pays for its moving cost, and leaving one behind is a decision, not a debt.

## Building the Hybrid Bridge

A hybrid cloud only works if every request finds the cloud where its data lives. So this part is about the small set of changes that let AWS and Huawei Cloud serve one product, with the user never knowing which one answered.

### Marking Where Each Gallery Lives

I added a `cloud_provider` column (`aws` or `huawei`) to the galleries table and to the photos table, and an environment variable that tells each server which cloud it runs on. Every piece of code that touches storage, the CDN, ZIP or PDF generation reads one of the two: the entity's provider when it handles existing data, the server's provider when it creates new data.

Keep in mind that this is the boring part that makes everything else possible. Once every gallery knows where it lives, the rest of the bridge is routing.

### Redirecting Instead of Proxying

The front-end still calls AWS as its entry point. When the gallery lives on Huawei, a middleware answers with a 307 Temporary Redirect to the Huawei server, and the browser repeats the request there.

I chose 307 because it tells the browser to reuse the same method and body at the new address, so an upload goes straight to Huawei instead of passing through AWS (and paying the data transfer twice). Safari was the exception, and needed a small workaround in the front-end[^1].

```mermaid alt="Requests enter through AWS and are redirected to Huawei Cloud when the gallery lives there, while both clouds read the database on AWS"
flowchart TD
  F[Front-end] --> A[AWS API<br/>entry point]
  A -->|gallery on AWS| AS[AWS S3<br/>and CDN]
  A -->|307 redirect| H[Huawei API]
  H --> HS[Huawei OBS<br/>and CDN]
  A --> DB[(Database<br/>on AWS)]
  H -.->|with cache| DB
```

### Caching What the Database Answers

Since the database stayed in the United States (us-west) and the new servers run in Santiago, Chile, every query from Huawei crossed the continent. In order to keep the pages fast, I added a cache on the checks every request makes (who owns the gallery, authentication data) with a long duration, and on plan data with a short one.

Caching plan data had a price. A customer who upgraded the plan to unlock watermarks could still be treated as being on the old plan until the cache expired, so I added a `withCache` flag that skips the cache on those critical checks (a patch that should disappear once the database moves too).

So, the lesson of this part: a hybrid setup turns latency into a consistency problem, so write down every cache you add and the data it can make stale.

## Rolling It Out Gradually

A gradual rollout lets real traffic test the new cloud while most customers stay on the old one. So a mistake hits a few galleries instead of all of them, and each step tells you whether the next one is safe.

### Testing With the Support Team First

Before any customer, the support team created galleries on Huawei and used them the way customers do. They found no errors, which is the best reason I know to move on to real customers (and the support team is also who hears first when something breaks later).

### Releasing to Random Customers in Growing Steps

Then I let new galleries be created on Huawei for customers picked at random among the paid plans, with a bigger group each day: 50 customers on October 27, 2025, then 100, 200, 1,000 and 1,000 more, and everyone on November 5. Between the steps I watched the metrics with support and scaled the server when the load asked for it (more memory before the second group of 1,000, more CPU the day after the full release).

The old galleries followed the same idea in January 2026, with the passive migration turned on for 100 customers, then 400, then 500, and then everyone.

### Keeping the Way Back Open

Every step only added customers to a list, so stopping was as simple as not running the next one. Nothing was deleted from AWS either: the photos that moved keep their AWS copy, and two fields on each gallery record what was copied, so a rollback or a cleanup can be done later from data, not from memory.

From the first map in early September to the full release, it took about two months, with a two-week break in the middle[^2].

So, the lesson of this part: grow the rollout by customers, not by features, and keep the old copy until the new one has earned your trust.

## What Broke on the Way

Most of what broke in this hybrid cloud migration came from costs and limits that AWS never showed us, because AWS handled them for us. So this part is the list of surprises, starting with the most expensive one.

### Hitting the Bandwidth Limit

The main server on Huawei got a public IP (an EIP) billed by traffic, with a default limit of 300 Mbit/s. On AWS we never paid for bandwidth on its own (the limits are high and set automatically), so we had never measured our peak, and the real demand turned out to be about twice that limit. Uploads became visibly slow for customers.

Raising the limit depended on Huawei's support, which was slow. While we waited, I switched the IP to fixed bandwidth, and that added more than US$ 6,000 to the bill (Huawei later gave it all back as credits, but it was still a scary invoice).

The final fix was horizontal: several load balancers pointing to the same server, each with its own limit, and the application picking the upload destination by round robin. It works, but it adds certificates to manage on each load balancer and routing logic inside the back-end.

If I did it again, I would try to predict the hidden costs before the rollout. On AWS we did not pay for bandwidth, so we did not even know this problem existed; on Huawei, bandwidth matters, so measure your traffic peak and ask for the limit you need before the first customer, not during the rollout.

### Speeding Up the ZIP Generation

ZIP generation reads the photos and writes the file to Backblaze B2, in the United States. The first tests from Huawei were much slower, so I timed the same 2 GB ZIP in each setup:

| Setup                                                    | Time for a 2 GB ZIP |
| -------------------------------------------------------- | ------------------- |
| AWS S3 (us-west) to Backblaze B2 (us-west)               | About 2 min         |
| Huawei OBS (Santiago) to Backblaze B2, public access     | About 12 min        |
| Huawei OBS to Backblaze B2, through a public NAT gateway | About 3 min         |
| Huawei OBS to Huawei OBS                                 | About 2 min         |
| Huawei OBS to Cloudflare R2                              | About 10 min        |

The cause was the function's public access, which uses network bandwidth shared with other users of the same machine (fine for tests, not for production). With a public NAT gateway on the VPC, the function got its own way out to the internet. Even the NAT's bandwidth package mattered: with 5 Mbit/s of fixed bandwidth it was slower than public access, and with 300 Mbit/s billed by traffic it was much faster.

Keeping the ZIPs on Huawei would be as fast as AWS, but I estimated about US$ 3,165 a month for it, against about US$ 1,287 for Huawei plus Backblaze through the NAT (and about US$ 1,212 on AWS). So the ZIPs stayed on Backblaze.

### Running Functions Instead of Containers

On AWS, the ZIP generation ran as Fargate tasks started from the SDK. In the Santiago region, Huawei only offers Cloud Container Instance 2.0, which runs on a managed Kubernetes and cannot start a task that way, so the ZIP generation moved to FunctionGraph, at a similar cost (long jobs are not what functions are made for, so this one is on my list to review).

Since FunctionGraph runs our code from a Docker image, cold starts were slow at first. Following Huawei's performance practices, I made the images smaller, kept one reserved instance for the function that serves the photos and raised its memory from 2 GB to 3 GB.

### Tagging Every Resource

The last lesson is a small one: tag every resource on Huawei from day one. That way the billing shows the cost per resource, you can compare each one with what AWS charged, and you can spot a service that should be cheaper but is not.

So, the lesson of this part: the new cloud bills you for things the old one gave you for free, and those are the costs you will not see in any price table.

## Where to Go Next

That is the whole story so far. Our bill went from about US$ 12,000 a month, all on AWS, to about US$ 10,000: US$ 7,500 on Huawei Cloud and US$ 2,500 still on AWS, roughly 17% less, with the database and the older features still waiting for their own decision.

If you are thinking about a migration like this, the next step is small and costs nothing: before touching anything, open your bill by resource, tag what has no tag and sort it by cost. That list is the first map of your migration, and it usually shows that only a few lines are worth moving.

## References

- [307 Temporary Redirect](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/307), on MDN
- [What Is NAT Gateway?](https://support.huaweicloud.com/intl/en-us/productdesc-natgateway/en-us_topic_0086739762.html), Huawei Cloud
- [FunctionGraph performance optimization](https://support.huaweicloud.com/intl/en-us/bestpractice-functiongraph/functiongraph_05_0100.html), Huawei Cloud

[^1]: Safari's `fetch` did not send the request body again after a 307 redirect, and the browser does not let the page read the `Location` header because of CORS. So the front-end does the redirect by hand, with the Huawei addresses written in its code, which is on my list to clean up.

[^2]: The break was a trip to China, invited by Huawei to visit their offices there. It was one of the best things this migration brought me, and not one I expected from a cost-cutting project.
