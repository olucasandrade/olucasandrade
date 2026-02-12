# System Design Series – "Building Systems That Scale"

A comprehensive blog series covering system design concepts from fundamentals to advanced topics, with real-world case studies.

**Total articles:** 28 (bilingual: 56 posts)

---

## 1. The Fundamentals

| # | Title (EN) | Título (PT) | Status |
|---|------------|-------------|--------|
| 1 | What is System Design (and why every developer should care) | O que é System Design (e por que todo dev deveria se importar) | |
| 2 | Latency, Throughput, and Bottlenecks | Latência, Throughput e Gargalos | |
| 3 | Load Balancing Demystified | Load Balancing Desmistificado | |

---

## 2. Performance & Delivery

| # | Title (EN) | Título (PT) | Status |
|---|------------|-------------|--------|
| 4 | CDNs: How the Internet Delivers Content in Milliseconds | CDNs: Como a Internet Entrega Conteúdo em Milissegundos | |
| 5 | Caching Strategies That Actually Work | Estratégias de Cache que Realmente Funcionam | |
| 6 | Rate Limiting & Throttling | Rate Limiting e Throttling | |

---

## 3. Messaging & Communication

| # | Title (EN) | Título (PT) | Status |
|---|------------|-------------|--------|
| 7 | Event-Driven Architecture: Rethinking How Systems Communicate | Arquitetura Orientada a Eventos: Repensando Como Sistemas se Comunicam | |
| 8 | Kafka, RabbitMQ, and Beyond | Kafka, RabbitMQ e Além | |
| 9 | Pub/Sub & Message Brokers Explained | Pub/Sub e Message Brokers Explicados | |

---

## 4. Reliability & Fault Tolerance

| # | Title (EN) | Título (PT) | Status |
|---|------------|-------------|--------|
| 10 | Circuit Breaker Pattern: When to Let Things Fail Gracefully | Circuit Breaker: Quando Deixar as Coisas Falharem com Elegância | |
| 11 | Retry Patterns, Backoff, and Dead Letter Queues | Padrões de Retry, Backoff e Dead Letter Queues | |
| 12 | Chaos Engineering: Breaking Things on Purpose | Chaos Engineering: Quebrando Coisas de Propósito | |

---

## 5. Orchestration & Scalability

| # | Title (EN) | Título (PT) | Status |
|---|------------|-------------|--------|
| 13 | From Containers to Clusters: Why We Need Orchestrators | De Containers a Clusters: Por que Precisamos de Orquestradores | |
| 14 | Service Discovery & Health Checks | Service Discovery e Health Checks | |
| 15 | Horizontal vs. Vertical Scaling | Escalabilidade Horizontal vs. Vertical | |

---

## 6. Storage & Data Layer

| # | Title (EN) | Título (PT) | Status |
|---|------------|-------------|--------|
| 16 | Database Sharding, Partitioning, and Replication | Sharding, Particionamento e Replicação de Banco de Dados | |
| 17 | Event Sourcing & CQRS | Event Sourcing e CQRS | |
| 18 | Caching at the Database Layer (Redis, Memcached) | Cache na Camada de Banco de Dados (Redis, Memcached) | |

---

## 7. Observability & Maintenance

| # | Title (EN) | Título (PT) | Status |
|---|------------|-------------|--------|
| 19 | Monitoring, Metrics, and Alerting | Monitoramento, Métricas e Alertas | |
| 20 | Logging and Tracing in Distributed Systems | Logging e Tracing em Sistemas Distribuídos | |
| 21 | Feature Flags, Rollbacks, and Blue-Green Deploys | Feature Flags, Rollbacks e Blue-Green Deploys | |

---

## 8. Advanced Topics

| # | Title (EN) | Título (PT) | Status |
|---|------------|-------------|--------|
| 22 | API Gateways and Service Meshes | API Gateways e Service Meshes | |
| 23 | Data Consistency and CAP Theorem in Practice | Consistência de Dados e Teorema CAP na Prática | |
| 24 | Designing for Multiregion and Global Scale | Projetando para Multirregião e Escala Global | |
| 25 | Designing for Cost Efficiency in the Cloud | Projetando para Eficiência de Custos na Cloud | |

---

## 9. Case Studies

| # | Title (EN) | Título (PT) | Status |
|---|------------|-------------|--------|
| 26 | How Netflix Handles a Billion Streams | Como a Netflix Lida com Bilhões de Streams | |
| 27 | Inside Uber's Event-Driven Architecture | Por Dentro da Arquitetura Orientada a Eventos do Uber | |
| 28 | Lessons from AWS: Building for Failure | Lições da AWS: Construindo para Falhar | |

---

## Article Content Notes

### 1. What is System Design
Core concepts, trade-offs, scalability and resilience thinking.

### 2. Latency, Throughput, and Bottlenecks
Identifying bottlenecks, measuring efficiency in distributed systems.

### 3. Load Balancing Demystified
Strategies (round-robin, least connections, IP hash) and cloud usage.

### 4. CDNs
CDN role, edge caching, when to use one.

### 5. Caching Strategies
Application, database, and edge cache – cache stampede risks.

### 6. Rate Limiting & Throttling
API protection, traffic spike stability.

### 7. Event-Driven Architecture
Request-response vs events, advantages and challenges.

### 8. Kafka, RabbitMQ, and Beyond
Queues vs streams, idempotency, reprocessing.

### 9. Pub/Sub & Message Brokers
Pub/sub models, delivery guarantees (at-most-once, at-least-once, exactly-once).

### 10. Circuit Breaker Pattern
Fallback, retries, timeouts with real examples.

### 11. Retry Patterns, Backoff, and Dead Letter Queues
Handling temporary failures in distributed systems.

### 12. Chaos Engineering
Why testing system resilience is essential.

### 13. Containers to Clusters
Kubernetes, Nomad, ECS – how and when to use.

### 14. Service Discovery & Health Checks
How services find and monitor each other in dynamic environments.

### 15. Horizontal vs. Vertical Scaling
How to decide between scaling machines or instances.

### 16. Database Sharding, Partitioning, and Replication
Scaling databases without losing consistency.

### 17. Event Sourcing & CQRS
Event-based persistence models.

### 18. Caching at the Database Layer
Cache patterns and invalidation (Redis, Memcached).

### 19. Monitoring, Metrics, and Alerting
Prometheus, Grafana, OpenTelemetry best practices.

### 20. Logging and Tracing
Request tracing across multiple services.

### 21. Feature Flags, Rollbacks, and Blue-Green Deploys
Safe deploy strategies and release control.

### 22. API Gateways and Service Meshes
Traffic control between microservices with security and resilience.

### 23. Data Consistency and CAP Theorem
Balancing consistency, availability, and partition tolerance.

### 24. Multiregion and Global Scale
Geographic replication and intercontinental latency.

### 25. Cost Efficiency in the Cloud
Infrastructure optimization without sacrificing performance.

### 26. How Netflix Handles a Billion Streams
CDN, resiliency, microservices at massive scale.

### 27. Inside Uber's Event-Driven Architecture
Queues, Kafka, geodistribution working together.

### 28. Lessons from AWS: Building for Failure
Fault tolerance philosophy and practices.

---

## Series Tags

Primary tag for all posts: `system-design`

Additional tags per article:
- Fundamentals: `architecture`, `scalability`
- Performance: `caching`, `cdn`, `performance`
- Messaging: `event-driven`, `kafka`, `messaging`
- Reliability: `fault-tolerance`, `resilience`
- Orchestration: `kubernetes`, `containers`, `scaling`
- Storage: `database`, `redis`, `data`
- Observability: `monitoring`, `devops`, `observability`
- Advanced: `microservices`, `distributed-systems`
- Case Studies: `netflix`, `uber`, `aws`, `case-study`

---

## Writing Notes

- Each post is standalone but can reference related posts in the series
- Store diagrams in `/public/static/images/system-design/`
- Include practical examples, not just theory
- Link to official documentation and further reading
- Add "Prerequisites" section for advanced topics referencing earlier posts
