"""On-demand live simulation endpoint.

The simulator is intentionally request-driven so free/serverless-style deployments
only do work while a user is actively viewing the dashboard.
"""
from fastapi import APIRouter
from backend.app.data_pipeline.live_simulator import live_simulator

router = APIRouter(prefix="/live", tags=["Live Simulation"])


@router.post("/tick")
def live_tick():
    """Generate a small bounded batch of synthetic operational events."""
    return live_simulator.tick(orders_per_tick=5)
