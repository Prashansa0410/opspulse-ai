# OpsPulse AI: Local Development Guide

## 1. Prerequisites
- **Python**: 3.12+ (or 3.14)
- **Node.js**: 20+ (or 24)
- **Git**: 2.30+

---

## 2. Quickstart Steps

### Step 1: Clone and Set Up Virtual Environment
```bash
cd opspulse-ai

# Python Virtual Environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### Step 2: Seed the Operational Warehouse
```bash
# Ingest 3,600+ orders, 24,000+ events, and run analytical transformations
python -m backend.app.db.seed_data small
```

### Step 3: Run Backend API Server
```bash
python -m backend.app.main
# Server starts on http://localhost:8000 (OpenAPI docs at http://localhost:8000/docs)
```

### Step 4: Run Frontend Control Tower (In a separate terminal)
```bash
cd frontend
npm install
npm run dev
# Next.js UI starts on http://localhost:3000
```

---

## 3. Running Automated Tests
```bash
pytest backend/tests/ -v -s
```
