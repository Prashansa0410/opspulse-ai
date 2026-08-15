"""Background scheduler for the bounded live operational simulator."""
import logging
import threading
import time

from backend.app.data_pipeline.live_simulator import live_simulator

logger = logging.getLogger("opspulse.live_runner")


class LiveSimulationRunner:
    """Run a small synthetic event batch periodically while the API is alive."""

    def __init__(self, interval_seconds: int = 60):
        self.interval_seconds = interval_seconds
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._run, name="opspulse-live-simulator", daemon=True)
        self._thread.start()
        logger.info("Live simulation runner started (interval=%ss)", self.interval_seconds)

    def stop(self) -> None:
        self._stop.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=5)
        self._thread = None
        logger.info("Live simulation runner stopped")

    def _run(self) -> None:
        # Let the application finish its startup/seed work before the first tick.
        if self._stop.wait(15):
            return
        while not self._stop.is_set():
            try:
                result = live_simulator.tick(orders_per_tick=5)
                logger.info("Live simulation tick: %s", result)
            except Exception:
                logger.exception("Live simulation tick failed")
            if self._stop.wait(self.interval_seconds):
                break


live_runner = LiveSimulationRunner(interval_seconds=60)
