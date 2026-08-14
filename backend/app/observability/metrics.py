"""Prometheus Observability Metrics for OpsPulse AI."""
import time
from fastapi import Request, Response
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST

# Define Metrics
REQUEST_COUNT = Counter(
    "opspulse_http_requests_total",
    "Total count of HTTP requests",
    ["method", "endpoint", "status_code"]
)

REQUEST_LATENCY = Histogram(
    "opspulse_http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"]
)

ML_INFERENCE_LATENCY = Histogram(
    "opspulse_ml_inference_duration_seconds",
    "ML model inference duration in seconds",
    ["model_name"]
)

AI_TOOL_LATENCY = Histogram(
    "opspulse_ai_tool_duration_seconds",
    "AI Agent Tool execution duration in seconds",
    ["tool_name"]
)

ACTIVE_ANOMALIES_GAUGE = Gauge(
    "opspulse_active_anomalies_count",
    "Number of active operational anomalies"
)

OTD_RATE_GAUGE = Gauge(
    "opspulse_on_time_delivery_rate_pct",
    "Current system-wide on-time delivery rate percentage"
)


async def metrics_middleware(request: Request, call_next):
    """Middleware collecting HTTP request count and latency metrics."""
    start_time = time.time()
    response: Response = await call_next(request)
    duration = time.time() - start_time
    
    endpoint = request.url.path
    method = request.method
    status_code = str(response.status_code)

    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
    REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)
    
    return response


def get_prometheus_metrics() -> Response:
    """Export raw Prometheus metrics."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
