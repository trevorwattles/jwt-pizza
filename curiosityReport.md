# Curiosity Report: Exploring Kubernetes

## Why I Chose This Topic

Throughout the course, I worked extensively with Docker, AWS ECS, GitHub Actions, and the JWT Pizza service. While these tools gave me a solid introduction to containerization and cloud deployment, I kept repeatedly hearing about Kubernetes in outside discussions, technical articles, and most notibly, from my brother who works a DevOps position at Dexcom. It became clear that Kubernetes is considered the industry standard for orchestrating containers at scale, but I realized that my understanding of it was only surface level.

I was curious about several things:

- Why do companies choose Kubernetes over ECS or Docker Swarm?
- What does it mean when people call Kubernetes a "container orchestrator"?
- How does it automatically heal, scale, and manage workloads?
- Why do teams consider it such a foundational DevOps skill?

This assignment gave me a good reason to finally explore these questions. Instead of learning Kubernetes by reading summaries, I wanted to experiment with it in a hands-on way, break things intentionally, and understand how it behaves.

This report documents the results of that exploration.

---

# What Kubernetes Actually Is

Before researching, I assumed Kubernetes was simply a system that schedules containers. After going deeper, I realized that description is technically correct but conceptually incomplete.

What stood out to me most is that Kubernetes is built around the idea of a “desired state.” Rather than telling the system to run a container directly, you declare the state you want, and Kubernetes continuously works to make reality match that declaration. If anything changes, Kubernetes adjusts automatically.

This explains why Kubernetes can self-heal, restart containers, reschedule workloads, or perform controlled rollouts. Understanding this concept made the entire system feel less mysterious.

---

# Understanding the Architecture

During my research I discovered that Kubernetes is essentially made of two major parts: the control plane and the worker nodes. Learning the purpose of each one suddenly made many Kubernetes terms make sense.

## Control Plane

The control plane is responsible for storing cluster state, making scheduling decisions, and running all the logic that keeps the system behaving correctly. The key components include:

- **kube-api-server**: acts as the front door to the entire cluster. Every command I ran with kubectl ended up talking to it.
- **etcd**: the distributed key-value store where the cluster’s state lives.
- **scheduler**: decides which node should run a Pod.
- **controller-manager**: runs loops that constantly monitor and update resources.
- **cloud-controller-manager**: integrates resources from cloud providers such as load balancers and volumes.

## Worker Nodes

The worker nodes actually run the workloads. These include:

- **kubelet**, which ensures that containers on a node match their Pod specification.
- **kube-proxy**, which handles networking routing.
- **container runtime**, which is often containerd or Docker.

Seeing these components in context helped demystify how Kubernetes actually “thinks.”

---

# What I Learned Through Hands‑On Testing

I wanted to go beyond reading, so I set up a test cluster using a lightweight tool called kind (Kubernetes in Docker). This allowed me to experiment without needing AWS or a paid cluster.

## Creating a Cluster

I created a cluster with:

```
kind create cluster --name curiosity
kubectl get nodes
```

Seeing a node appear and recognizing each component running inside it gave me confidence that I understood how the infrastructure fit together.

## Deploying a Simple Application

To see how Kubernetes handles real workloads, I deployed a small application into my test cluster. For this experiment, I chose to use an Nginx container because it is lightweight, stable, and easy to recognize when running. Instead of starting containers manually like I would with Docker, I created a Kubernetes Deployment that defined how many replicas I wanted and what container image the Pods should use.
Once I applied the deployment file using kubectl apply, Kubernetes immediately created three running Pods on its own. This was the moment where the “desired state” concept really clicked for me. I didn’t give Kubernetes instructions for how to start the containers, restart them, or distribute them across nodes. I simply declared that I wanted three replicas of a specific container, and Kubernetes handled everything else automatically.
Watching those Pods appear without any direct container runtime commands felt very different from working with Docker alone. It helped me appreciate how much orchestration Kubernetes handles under the hood — scheduling, health management, replication, and ensuring consistency — all without me having to manage any of those processes myself.

## Testing Self-Healing

I deleted one of the Pods manually:

```
kubectl delete pod <name>
```

Within a second or two, Kubernetes recreated it. Watching this happen made the concept of “desired state” feel very real:

I said I wanted three Pods, so Kubernetes made sure three Pods existed—no matter what I deleted.

## Investigating Scheduling

I experimented with CPU requests and taints/tolerations to understand how Kubernetes decides where to place workloads. During this testing I learned:

- Kubernetes schedules based on available resources, not randomly.
- Taints and tolerations allow you to control which nodes can run certain pods.
- The scheduler is constantly evaluating the state of nodes and Pods.

These experiments helped me understand that Kubernetes is both automated and highly configurable.

---

# Networking and Services

Networking in Kubernetes was something I assumed would be complicated, but Services actually make it easier to understand.

I exposed my Deployment as a Service:

```
kubectl expose deployment pizza-demo --type=ClusterIP --port=80
```

The important realization I had was that even when Pods were deleted and recreated, the Service IP remained stable. The Service sits above the Pods and abstracts away their lifecycles.

This gave me a much clearer idea of how real production applications maintain consistency even as underlying containers come and go.

---

# Exploring Operators and CRDs

Once I understood the basics, I wanted to learn about Custom Resource Definitions and Operators because they seem to be a big part of advanced Kubernetes usage.

I learned that CRDs allow teams to create new API objects such as:

- `Kafka`
- `Postgres`
- `Vault`

Operators then act as controllers responsible for reconciling the desired state of those custom resources.

This surprised me, because I initially thought Kubernetes was only about running containers. I didn’t realize Kubernetes could also manage databases, secrets engines, or queues through Operators. Understanding this changed how I view the platform overall. Kubernetes is much more flexible than I expected.

---

# Why Kubernetes Is So Widely Adopted

After working with it directly, the reasons companies adopt Kubernetes became clearer to me:

- It is declarative, meaning I focus on desired outcomes rather than commands.
- It automatically heals and manages workloads.
- It is highly scalable, both horizontally and vertically.
- It can be extended to manage almost anything through Operators.
- It has a massive ecosystem surrounding it (Helm, ArgoCD, Prometheus, etc.).

I used to assume Kubernetes was popular because it was trendy or because Google created it. Now I understand that its design principles give it advantages that other orchestration tools simply don’t match.

---

# Conclusion

This exploration answered the questions that initially led me into the project. The biggest takeaway was that Kubernetes is more than just a tool for running containers. It is an entire model for managing distributed systems. Its constant reconciliation of desired state makes it predictable, resilient, and powerful.

Before this assignment, Kubernetes felt intimidating. Now it feels like something I can approach confidently because I understand the core concepts, the architecture, and the reasoning behind its design choices.

I plan to continue learning about Kubernetes, especially tools like Helm, ArgoCD, and Prometheus. This curiosity report helped me build a foundation I can grow from.

---

# References

- CNCF Kubernetes Documentation — https://kubernetes.io/docs/
- Kelsey Hightower, “Kubernetes the Hard Way”
- Brendan Burns, “Designing Distributed Systems”
- Bilgin Ibryam & Roland Huß, “Kubernetes Patterns”
- Kubebuilder Documentation — https://book.kubebuilder.io/
