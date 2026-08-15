"""OpsPulse AI - Backend Application Entrypoint."""
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.api.v1.router import api_router
from backend.app.api.v1.live import router as live_router
from backend.app.db.session import db_manager
from backend.app.db.seed_data import run_seed
from backend.app.data_pipeline.live_simulator import live_simulator
from backend.app.observability.metrics import metrics_middleware, get_prometheus_metrics
from backend.app.observability.logger import LoggingMiddleware, setup_structured_logging

logger = logging.getLogger("opspulse.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    setup_structured_logging()
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.ENVIRONMENT})...")

    try:
        conn = db_manager.get_connection()
        tables = conn.execute("SHOW TABLES;").fetchall()
        if not tables or len(tables) < 5:
            logger.info("Initializing database and seeding baseline operational scenario...")
            run_seed(volume=settings.DATA_VOLUME, seed=settings.RANDOM_SEED)
        else:
            logger.info(f"Existing database loaded with {len(tables)} tables.")
    except Exception as e:
        logger.warning(f"Database initialization exception: {e}. Executing seed fallback...")
        run_seed(volume=settings.DATA_VOLUME, seed=settings.RANDOM_SEED)

    # No always-on worker. This keeps free hosting idle when nobody is using the app.
    yield

    logger.info("Shutting down OpsPulse AI services...")
    db_manager.close()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Operational Intelligence and Decision Support Platform for High-Volume Commerce & Logistics",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)


@app.middleware("http")
async def request_driven_live_demo(request: Request, call_next):
    """Generate one small live batch only when the dashboard asks for KPIs.

    This avoids an always-running background process on the free backend. The
    dashboard remains request-driven: no viewer means no synthetic workload.
    """
    if request.method == "GET" and request.url.path.endswith("/api/v1/kpis"):
        try:
            live_simulator.tick(orders_per_tick=5)
        except Exception:
            logger.exception("Request-driven live simulation tick failed")
    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)
app.middleware("http")(metrics_middleware)

app.include_router(api_router, prefix="/api")
app.include_router(live_router, prefix="/api/v1")


@app.get("/metrics", tags=["Observability"], summary="Prometheus Metrics Endpoint")
def metrics():
    return get_prometheus_metrics()


@app.get("/", tags=["Health"], summary="Root Service Information")
def root():
    return {
        "service": settings.APP_NAME,
        "tagline": "AI-Powered Operational Intelligence and Decision Support Platform",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "api_v1": "/api/v1",
        "health": "/api/v1/health",
        "status": "ONLINE",
        "simulation_mode": "request-driven"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
