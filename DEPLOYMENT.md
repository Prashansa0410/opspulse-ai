# OpsPulse AI: Deployment & Hosting Guide

> *"For the portfolio deployment I deliberately chose a zero-cost architecture, while the system is designed so the storage, compute and database layers can be moved to AWS when production scale requires it."*

---

## 1. Zero-Cost ($0/Month) Live Portfolio Deployment

### A. Deploy Frontend to Vercel ($0.00 / month)
1. **Push code to GitHub** (Repository: `opspulse-ai`).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `opspulse-ai` repository and select **Root Directory**: `frontend`.
4. Configure Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://<YOUR-RENDER-BACKEND-URL>/api/v1`
5. Click **"Deploy"**. Vercel will build and deploy the Next.js 15 application automatically to a global CDN with free HTTPS.

---

### B. Deploy Backend FastAPI to Render / Koyeb ($0.00 / month)

#### Option 1: Render Free Web Service
1. Sign in to [render.com](https://render.com).
2. Click **"New +"** -> **"Web Service"** and link the `opspulse-ai` repository.
3. Configure the service:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt && python -m backend.app.db.seed_data small`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free` ($0/mo)
4. Environment Variables:
   - `ENVIRONMENT`: `production`
   - `DATA_VOLUME`: `small`
   - `RANDOM_SEED`: `42`
5. Click **"Create Web Service"**.

#### Option 2: Render Blueprint (1-Click)
Render automatically detects `render.yaml` in the root of the repository. Simply select **"New Blueprint Instance"** to deploy with pre-configured settings.

---

### C. (Optional) Deploy Database to Supabase ($0.00 / month)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the schema from [`backend/app/db/supabase_schema.sql`](file:///Users/prashansa/.gemini/antigravity/scratch/opspulse-ai/backend/app/db/supabase_schema.sql).
4. Copy the connection string into the backend environment variable:
   - `DATABASE_URL`: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

---

## 2. Local Full-Stack Containerized Development (Docker Compose)

For local development and testing, run the complete multi-container stack:

```bash
docker compose up --build
```

### Local Services & Ports:
- **Next.js Frontend Control Tower**: `http://localhost:3000`
- **FastAPI REST Backend**: `http://localhost:8000`
- **FastAPI OpenAPI Swagger Docs**: `http://localhost:8000/docs`
- **Prometheus Telemetry Scraper**: `http://localhost:9090`
- **Grafana Monitoring Dashboard**: `http://localhost:3001` (login: `admin` / `admin`)
