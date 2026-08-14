# OpsPulse AI: Master Project Plan

**Project**: OpsPulse AI (AI-Powered Operational Intelligence and Decision Support Platform)  
**Repository**: `opspulse-ai`  
**Author**: Autonomous Senior Engineering Team  
**Date**: August 2026  
**Status**: In Progress  

---

## 1. Executive Summary & Product Vision

OpsPulse AI is an enterprise-grade operational intelligence and decision support platform engineered for high-volume commerce, logistics, fulfillment, and marketplace ecosystems. It solves four fundamental operational questions:
1. **WHAT happened?** — Real-time and historical KPI telemetry across orders, revenue, on-time delivery (OTD), SLA breach rates, carrier latency, and warehouse throughput.
2. **WHY did it happen?** — Multi-dimensional Root Cause Analysis (RCA) decomposing SLA breaches into warehouse bottlenecks, carrier handoff delays, transit choke points, and inventory shortages.
3. **WHAT will happen next?** — ML-driven Predictive SLA Risk scoring for in-flight shipments and unsupervised anomaly detection across payment gateways, fulfillment nodes, and support queues.
4. **WHAT should the business do?** — Decision support engine with "What-If" intervention simulations and an autonomous AI Operations Analyst utilizing sandboxed tool-calling with zero hallucination risk.

---

## 2. System Architecture

```
                  +----------------------------------------------+
                  |           Synthetic Event Stream             |
                  |  (Causal, Deterministic, 10M+ Event Capable) |
                  +----------------------------------------------+
                                         |
                                         v
                  +----------------------------------------------+
                  |         Kafka / Ingestion Buffer             |
                  |     (Stream Consumer + Batch Flusher)        |
                  +----------------------------------------------+
                                         |
                                         v
                  +----------------------------------------------+
                  |            Raw Parquet & Staging             |
                  +----------------------------------------------+
                                         |
                                         v
                  +----------------------------------------------+
                  |               dbt Transforms                 |
                  |   (Staging -> Dims & Facts -> KPI Marts)     |
                  +----------------------------------------------+
                                         |
                                         v
                  +----------------------------------------------+
                  |         Analytical Warehouse Engine          |
                  |             (DuckDB / PostgreSQL)            |
                  +----------------------------------------------+
                         |               |               |
                         v               v               v
           +-----------------+   +---------------+   +------------------+
           | Analytics & KPI |   |   ML Models   |   |   AI Analyst     |
           |  Decomposition  |   | (SLA Risk +   |   |  Tool-Calling &  |
           |    (SQL Marts)  |   |   Anomalies)  |   |  SQL Guardrails  |
           +-----------------+   +---------------+   +------------------+
                         \               |               /
                          \              |              /
                           v             v             v
                  +----------------------------------------------+
                  |             FastAPI Backend Layer            |
                  |      (REST, OpenAPI, Prometheus, Pydantic)   |
                  +----------------------------------------------+
                                         |
                                         v
                  +----------------------------------------------+
                  |        Next.js Operations Control Tower      |
                  |  (11 Specialized Views + Persona Switcher)   |
                  +----------------------------------------------+
```

---

## 3. Technology Stack Decisions

| Tier | Technology | Rationale |
|---|---|---|
| **Backend API** | Python 3.14 / FastAPI / Pydantic v2 | High-performance asynchronous REST APIs with auto-generated OpenAPI schemas, strict data validation, and native async support. |
| **Warehouse Engine** | DuckDB + PostgreSQL | DuckDB delivers columnar vectorized execution with blazing speed for analytical aggregates and zero external server dependency; PostgreSQL compatible schema for cloud production. |
| **Streaming / Ingestion** | Kafka (with in-memory async fallback) | Decouples event generation from raw storage; enables real-time stream ingestion and batch micro-bursting. |
| **Transformation** | dbt (Data Build Tool) models & SQLX | Modular SQL data modeling with lineage, tests, documentation, and staging/fact/dimension separation. |
| **Machine Learning** | Scikit-learn / LightGBM / XGBoost | Gradient boosted trees for tabular SLA breach risk classification; Isolation Forests and rolling z-scores for anomaly detection. |
| **AI / Decision Support**| Function-Calling Agent + Guardrails | Multi-tool orchestrator with strict AST-based SQL query sanitizer (read-only verification, limit injection, injection prevention) and factual citations. |
| **Frontend UI** | Next.js (React 19) / TypeScript / Tailwind / Lucide / Recharts | Type-safe, responsive enterprise design system with zero bloat, high data density, and interactive KPI explainability drawers. |
| **Observability** | Prometheus / Grafana / JSON Logs | Structured logging, Prometheus endpoint metrics for latency, throughput, and error rates, and pre-built Grafana dashboards. |
| **Infrastructure** | Docker, Docker Compose, GitHub Actions, AWS ECS/Terraform | One-command local spin up (`docker compose up`) and production CI/CD pipelines. |

---

## 4. Milestones & Delivery Schedule

- [x] **Milestone 0: Project Setup & Environment Baseline**
  - Verify tools, initialize Git repo, configure workspace structure, generate project plan and task state.
- [ ] **Milestone 1: Realistic Causal Data Generator & Seeding Engine**
  - Generate core entities (customers, orders, items, warehouses, shipments, carriers, delivery events, support tickets, payments).
  - Seed realistic causal incident: Weekend volume surge -> BLR-01 congestion -> carrier pickup backlog -> SLA breach spike -> payment provider anomaly.
  - Support volume modes: `DATA_VOLUME=small`, `medium`, `large` with deterministic seeds.
- [ ] **Milestone 2: Ingestion, Streaming & dbt Data Warehouse**
  - Build Kafka stream consumer, raw parquet/staging tables, dbt transformation models, and Data Quality validation framework (scoring, nulls, orphans, time inversions).
- [ ] **Milestone 3: SQL Analytics & Root Cause Decomposition**
  - Implement dimensional marts: Daily KPIs, Warehouse Performance, Carrier Scorecards, Regional SLA decomposition, GMV at risk.
  - Build mathematical attribution engine for SLA drops.
- [ ] **Milestone 4: ML Risk Models, Anomaly Detection & What-If Simulation**
  - SLA Breach Risk Classifier (features: warehouse time, carrier delay, zone distance, day of week, capacity).
  - Unsupervised Anomaly Detection engine (Isolation Forest + Z-score alerts).
  - What-If Simulation Engine (volume reallocation, carrier rebalancing, predicted SLA lift).
- [ ] **Milestone 5: AI Operations Analyst & Guardrails Engine**
  - Natural language function-calling agent with 9 dedicated operational tools.
  - Strict AST SQL safety guardrail (reject UPDATE/DELETE/DROP/ALTER, enforce read-only and query limits).
- [ ] **Milestone 6: FastAPI Backend & OpenAPI REST Service**
  - Implement all v1 endpoints with Pydantic validation, error handling, pagination, CORS, and Prometheus metrics.
- [ ] **Milestone 7: Next.js Operations Control Tower UI**
  - 11 enterprise screens: Executive Overview, Control Tower, Warehouses, Carriers, SLA Risk, Anomalies, Root Cause Explorer, AI Analyst, What-If Lab, Data Quality, System Health.
  - Persona switcher & "Why?" modal breakdown.
- [ ] **Milestone 8: Comprehensive Testing & Performance Benchmarks**
  - Unit tests, integration tests, DQ validation tests, SQL safety tests, end-to-end flow tests, query latency benchmarks.
- [ ] **Milestone 9: Docker, Observability & CI/CD**
  - Dockerfiles, docker-compose.yml, Prometheus config, Grafana dashboard, GitHub Actions workflow, Kubernetes manifests, AWS deployment specs.
- [ ] **Milestone 10: Documentation, GitHub Connection & Recruiter Demo Script**
  - Complete docs (README, ARCHITECTURE, DATA_MODEL, API, ML, AI_ANALYST, DEPLOYMENT, TESTING, COST, DEMO_SCENARIO).

---

## 5. Definition of Done

1. Complete end-to-end application runs locally with `docker compose up` or standard script.
2. Synthetic data generator deterministic incident runs cleanly.
3. Ingestion and dbt transformations populate all analytical fact and dimension tables.
4. Data quality scoring evaluates rules and produces DQ health reports.
5. All 11 frontend pages render cleanly, are responsive, and display live data from backend APIs.
6. ML SLA Risk model evaluates live shipments and outputs risk scores with top features.
7. Anomaly detector accurately flags simulated payment provider and warehouse delays.
8. AI Operations Analyst successfully answers natural language questions using tool calls and adheres to safety guardrails.
9. What-If simulator calculates before/after intervention metrics and confidence bounds.
10. All automated tests pass with >85% coverage.
11. Git commits are clean, well-structured, and pushed to GitHub.
