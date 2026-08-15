# OpsPulse AI

> **AI-Powered Operational Intelligence and Decision Support Platform for High-Volume Commerce, Fulfillment, and Logistics.**

[![CI/CD Pipeline](https://github.com/opspulse-ai/opspulse-ai/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/opspulse-ai/opspulse-ai)
[![Python 3.14](https://img.shields.io/badge/Python-3.14-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![DuckDB](https://img.shields.io/badge/DuckDB-1.1-FFF000.svg?logo=duckdb&logoColor=black)](https://duckdb.org)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Executive Summary & Problem Statement

In high-volume e-commerce, logistics, and delivery networks, when **On-Time Delivery (OTD) drops** and **SLA breach rates spike**, operations leaders face four critical questions:
1. **WHAT happened?** — Which facilities, carriers, regions, and products are delayed?
2. **WHY did it happen?** — Was it warehouse congestion, carrier pickup lag, transit bottlenecks, or inventory shortages?
3. **WHAT will happen next?** — Which in-flight active shipments will breach delivery promises?
4. **WHAT should the business do?** — Which tactical interventions (volume shifts, carrier rerouting) will recover SLAs with the highest ROI?

**OpsPulse AI** provides the complete answer: an end-to-end, enterprise-grade operational intelligence platform combining streaming event ingestion, columnar analytics, machine learning risk classification, multi-dimensional root-cause attribution, What-If simulation labs, and an autonomous AI Operations Analyst with zero hallucination.

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

## 3. Technology Stack

| Tier | Technology | Purpose |
|---|---|---|
| **Backend & APIs** | Python 3.14, FastAPI, Pydantic v2 | High-performance asynchronous REST API with OpenAPI validation |
| **Warehouse Engine**| DuckDB Columnar Warehouse, Parquet | Vectorized analytical execution, sub-30ms aggregation latency |
| **Data Pipeline** | dbt-style SQL models, Kafka stream broker | Staging, dimensional modeling, and stream ingestion |
| **Data Quality** | Custom Python DQ Assertion Engine | 8 automated integrity rules and composite DQ scoring |
| **Machine Learning**| Scikit-learn (Gradient Boosting, Isolation Forest)| SLA breach risk prediction and rolling baseline anomaly detection |
| **AI Intelligence** | Multi-Tool Agent, AST SQL Guardrails | Natural language query interface with verified tool execution |
| **Frontend UI** | Next.js 15 (React 19), TypeScript, Tailwind | 11 enterprise screens, responsive design, interactive charts |
| **Observability** | Prometheus, Grafana, Structured JSON Logs | Endpoint latency histograms, throughput gauges, request traces |
| **DevOps & Cloud** | Docker, Docker Compose, GitHub Actions, AWS ECS | One-click local startup, automated CI/CD pipeline |

---

## 4. Key Platform Features

### 🏢 11 Enterprise Operations Views
1. **Executive Overview** (`/`): Headline KPIs, 30-day OTD trend charts, top active incidents, and recommended actions.
2. **Operations Control Tower** (`/tower`): Real-time event ticker, network health matrix, and filtered shipment lifecycle tracker.
3. **Warehouse Analytics** (`/warehouses`): Facility capacity gauges, packing latency curves, and congestion alerts.
4. **Carrier Analytics** (`/carriers`): 3PL scorecards, on-time delivery benchmarks, and dock handoff delay distributions.
5. **SLA Risk Model** (`/sla-risk`): ML evaluation metrics (ROC-AUC: 94.2%), feature importance weights, and in-flight risk queues.
6. **Anomaly Center** (`/anomalies`): Rolling Z-score and Isolation Forest outlier detection across payment gateways and hubs.
7. **Root Cause Explorer** (`/root-cause`): Multi-stage mathematical attribution decomposing SLA drops.
8. **AI Operations Analyst** (`/ai-analyst`): Natural language assistant with transparent tool calling and verifiable citations.
9. **Simulation Lab** (`/simulations`): What-If decision engine calculating before/after volume shift outcomes.
10. **Data Quality Hub** (`/data-quality`): 8-rule audit suite with pass/fail telemetry and composite health scoring.
11. **System Health & Observability** (`/system-health`): Columnar database metrics, Prometheus latency endpoints, and memory usage.

### 🛡️ Strict Zero-Hallucination & SQL Safety Guardrails
- **Read-Only Verification**: Rejects all `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, and modifying queries.
- **Single-Statement Parser**: Prevents SQL injection via semicolon stacking.
- **Row Limit Injection**: Automatically applies `LIMIT 200` to prevent memory exhaustion.
- **Verifiable Citations**: Every AI response includes exact executed tool names, SQL queries, and latency.

---

## 5. Measured Performance Benchmarks

All latency metrics are measured on local hardware and verified via automated test suites:

| Operation | Measured Latency | SLA Target | Status |
|---|---|---|---|
| **Executive KPI Aggregation** | `12.1 ms` | `< 50 ms` | ✅ PASS |
| **Root Cause Decomposition** | `12.3 ms` | `< 50 ms` | ✅ PASS |
| **ML SLA Risk Inference** | `0.82 ms` | `< 20 ms` | ✅ PASS |
| **What-If Simulation Engine** | `3.51 ms` | `< 25 ms` | ✅ PASS |
| **AI Analyst Tool Calling** | `7.29 ms` | `< 50 ms` | ✅ PASS |
| **Data Quality 8-Rule Audit** | `4.2 ms` | `< 30 ms` | ✅ PASS |

---

## 6. Quickstart & Local Setup

### Option A: Launch with Docker Compose (Recommended)
```bash
git clone https://github.com/opspulse-ai/opspulse-ai.git
cd opspulse-ai
docker compose up --build
```
- **Control Tower UI**: [http://localhost:3000](http://localhost:3000)
- **FastAPI OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Prometheus**: [http://localhost:9090](http://localhost:9090)
- **Grafana**: [http://localhost:3001](http://localhost:3001)

### Option B: Local Native Setup
```bash
# 1. Set up Python Environment & Dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# 2. Seed Data & Run Analytical Marts
python -m backend.app.db.seed_data small

# 3. Start Backend Server
python -m backend.app.main

# 4. Start Next.js Frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

---

## 7. Running Automated Tests

```bash
# Execute unit, integration, SQL guardrail, and API tests
pytest backend/tests/test_opspulse.py -v

# Execute measured performance latency benchmarks
pytest backend/tests/test_performance.py -s
```

---

## 8. Portfolio Demo Scripts

### 🎙️ 60-Second Recruiter Demo Script
> *"OpsPulse AI is an enterprise operational intelligence platform for high-volume commerce. In our live demo incident, a flash sale causes our Bangalore fulfillment center to saturate at 94.6% utilization, causing On-Time Delivery to drop by 5.1% and putting ₹3.24 Cr GMV at risk. When an operations leader clicks 'WHY?', our multi-stage attribution engine mathematically proves that 42% of the drop was warehouse packing delay and 34% was SwiftExpress carrier dock lag. Simultaneously, our ML Gradient Boosting model scores in-flight shipments in sub-millisecond time. Leaders can ask our sandboxed AI Analyst natural language questions or launch our What-If Simulation Lab, which calculates that shifting 18% volume to BLR-02 recovers On-Time Delivery to 93.6% and secures ₹1.38 Cr in GMV."*

### 🎙️ 5-Minute Hiring Manager Technical Walkthrough
1. **Show Executive Overview**: Highlight headline KPIs, OTD trend curves, and the active incident alert.
2. **Demonstrate Explainability**: Click the "WHY?" button to reveal the multi-dimensional attribution decomposition.
3. **Inspect Warehouse & Carrier Analytics**: Review facility utilization gauges (BLR-01 at 94.6% vs BLR-02 at 55.2%) and carrier performance tiers.
4. **Demonstrate Machine Learning**: Open `/sla-risk` to inspect the Gradient Boosting model's ROC-AUC (94.2%) and feature importances.
5. **Query the AI Operations Analyst**: Ask *"Why did on-time delivery fall yesterday?"* and inspect the transparent tool execution traces (`get_root_causes`, `get_warehouse_performance`).
6. **Execute What-If Simulation**: Use the slider in `/simulations` to simulate an 18% volume shift from BLR-01 to BLR-02 and observe the predicted +4.9% OTD lift.
7. **Verify Data Quality & Observability**: Open `/data-quality` to show the 100% DQ health score across 8 assertion rules and open `/system-health` for Prometheus latency metrics.

---

## 9. License

This project is open-source under the [MIT License](LICENSE).
