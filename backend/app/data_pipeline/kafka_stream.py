"""Kafka and In-Memory Event Streaming Processor for OpsPulse AI."""
import asyncio
import json
import logging
from typing import Callable, Any
from backend.app.config import settings

logger = logging.getLogger("opspulse.stream")


class EventStreamBroker:
    """High-throughput event queue with support for Kafka and in-memory queue."""

    def __init__(self):
        self._in_memory_queues: dict[str, list[dict[str, Any]]] = {
            settings.KAFKA_TOPIC_ORDERS: [],
            settings.KAFKA_TOPIC_EVENTS: [],
            settings.KAFKA_TOPIC_ANOMALIES: [],
        }
        self.subscribers: dict[str, list[Callable[[dict[str, Any]], None]]] = {}
        self.total_published = 0
        self.total_consumed = 0

    def publish(self, topic: str, message: dict[str, Any]) -> None:
        """Publish an event to a topic."""
        if topic not in self._in_memory_queues:
            self._in_memory_queues[topic] = []
        
        self._in_memory_queues[topic].append(message)
        self.total_published += 1
        
        # Trigger immediate subscribers if registered
        if topic in self.subscribers:
            for sub in self.subscribers[topic]:
                try:
                    sub(message)
                    self.total_consumed += 1
                except Exception as e:
                    logger.error(f"Error in subscriber for {topic}: {e}")

    def subscribe(self, topic: str, callback: Callable[[dict[str, Any]], None]) -> None:
        """Subscribe a handler callback to a topic."""
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(callback)

    def get_queue_size(self, topic: str) -> int:
        """Get number of messages in the topic buffer."""
        return len(self._in_memory_queues.get(topic, []))

    def flush(self, topic: str) -> list[dict[str, Any]]:
        """Flush and return all buffered events for batch loading."""
        events = self._in_memory_queues.get(topic, [])
        self._in_memory_queues[topic] = []
        return events


# Global stream broker instance
stream_broker = EventStreamBroker()
