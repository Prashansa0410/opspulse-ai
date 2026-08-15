# OpsPulse AI: Deployment & Infrastructure Guide

## 1. Local Full-Stack Deployment (Docker Compose)

The entire OpsPulse platform can be launched locally with one command:

```bash
docker compose up --build
```

### Services Started:
- **`frontend`** (Next.js 15 UI): `http://localhost:3000`
- **`backend`** (FastAPI REST API): `http://localhost:8000`
- **`backend docs`** (Swagger / OpenAPI): `http://localhost:8000/docs`
- **`prometheus`** (Telemetry Collector): `http://localhost:9090`
- **`grafana`** (Observability Dashboards): `http://localhost:3001` (user/pass: `admin`/`admin`)

---

## 2. Cloud Deployment Topology (AWS Architecture)

- **Frontend**: Next.js deployed on **Vercel** or **AWS S3 + CloudFront**.
- **Backend API & ML Engine**: Containerized FastAPI service on **AWS ECS Fargate** (`0.5 vCPU`, `1GB RAM`).
- **Raw Lakehouse Storage**: **AWS S3** bucket storing partitioned Parquet files (`orders.parquet`, `delivery_events.parquet`).
- **Database Engine**: **DuckDB Columnar Storage** mounted on high-speed NVMe / EFS or **AWS RDS PostgreSQL**.
- **Observability**: **Amazon CloudWatch** logs + Prometheus exposition.
- **CI/CD**: Automated GitHub Actions pipeline (`.github/workflows/ci-cd.yml`).
