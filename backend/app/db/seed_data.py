"""Seed data execution script for OpsPulse AI."""
import logging
import sys
from backend.app.config import settings
from backend.app.db.session import db_manager
from backend.app.data_pipeline.ingestion import ingestion_engine
from backend.app.data_pipeline.dbt_transforms import transformation_engine
from backend.app.data_pipeline.data_quality import dq_framework

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("opspulse.seed")


def run_seed(volume: str = "small", seed: int = 42) -> None:
    """Initialize schema, ingest seed dataset, run transformations and DQ audits."""
    logger.info(f"Starting OpsPulse data seed pipeline (volume={volume}, seed={seed})...")
    
    # 1. Ingest Raw Data
    counts = ingestion_engine.populate_seed_data(volume=volume, seed=seed)
    logger.info(f"Ingested records count summary: {counts}")
    
    # 2. Run dbt-style Analytical Transformations
    transformation_engine.run_all_transforms()
    
    # 3. Execute Data Quality Checks
    dq_report = dq_framework.run_all_checks()
    logger.info(f"Data Quality Score: {dq_report.dq_score_pct}% ({dq_report.passed_checks}/{dq_report.total_checks} rules passed)")
    
    logger.info("Pipeline seed run finished successfully.")


if __name__ == "__main__":
    vol = sys.argv[1] if len(sys.argv) > 1 else settings.DATA_VOLUME
    run_seed(volume=vol, seed=settings.RANDOM_SEED)
