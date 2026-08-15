# OpsPulse AI: Cloud Cost Analysis & Budget Control

## 1. Local Environment Cost
- **Local Cost**: **$0.00 / month** (Runs completely self-contained via Docker Compose or native Python + Next.js).

---

## 2. Estimated AWS Production Cost (Cost-Conscious Architecture)

| AWS Resource | Configuration | Estimated Monthly Cost | Purpose |
|---|---|---|---|
| **AWS ECS Fargate** | 1 Task (0.5 vCPU, 1 GB RAM) | ~$14.50 | FastAPI Backend & ML inference |
| **AWS S3** | Standard Storage (< 10 GB Parquet) | ~$0.25 | Raw Parquet Lakehouse snapshot storage |
| **AWS CloudWatch** | Logs (14-day retention, 2 GB ingestion) | ~$1.20 | Structured JSON audit logs & traces |
| **Frontend (Vercel / CloudFront)** | Hobby / Free Tier | $0.00 | Static edge Next.js frontend hosting |
| **AWS Route 53 & ACM** | Hosted zone & SSL certificate | ~$0.50 | Custom domain & HTTPS encryption |
| **Data Transfer / Egress** | Standard internet egress (< 15 GB) | ~$1.35 | API responses & telemetry data |
| **TOTAL ESTIMATED MONTHLY COST** | — | **~$17.80 / month** | Complete Cloud Production Deployment |

---

## 3. High-Cost Anti-Patterns Avoided
1. **No Managed MSK Kafka Cluster**: Avoided AWS MSK ($150+/mo) by utilizing containerized streaming brokers and high-speed in-memory async queues.
2. **No Idle RDS Multi-AZ Database**: Avoided high-cost RDS PostgreSQL ($60+/mo) by deploying vectorized columnar DuckDB directly with Parquet persistence.
3. **No Over-provisioned GPU Nodes**: ML tabular models (Gradient Boosting & Isolation Forest) run in sub-millisecond latency on standard CPU instances.
