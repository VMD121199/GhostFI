import time
from dataclasses import dataclass, field
from typing import List, Optional
from .listener import PoolEvent


@dataclass
class CorrelatedStory:
    id: str
    events: List[PoolEvent]
    tokenA: str
    tokenB: str
    sources: List[str]
    totalAmountA: float
    totalAmountB: float
    priceImpact: float
    startTimestamp: int
    endTimestamp: int
    confidence: str  # "low" | "medium" | "high"
    triggerReason: str


class EventCorrelator:
    def __init__(self, window_ms: int = 30_000, volume_threshold: int = 2):
        self.window_ms = window_ms
        self.volume_threshold = volume_threshold
        self._buffer: List[PoolEvent] = []

    def add(self, event: PoolEvent) -> Optional[CorrelatedStory]:
        now = int(time.time() * 1000)
        self._buffer = [e for e in self._buffer if now - e.timestamp < self.window_ms]
        self._buffer.append(event)

        groups = self._group_by_pair()
        for pair, events in groups.items():
            if len(events) >= self.volume_threshold:
                story = self._build_story(pair, events)
                consumed_ids = {id(e) for e in events}
                self._buffer = [e for e in self._buffer if id(e) not in consumed_ids]
                return story
        return None

    def _group_by_pair(self) -> dict:
        groups = {}
        for evt in self._buffer:
            key = "/".join(sorted([evt.tokenA, evt.tokenB]))
            groups.setdefault(key, []).append(evt)
        return groups

    def _build_story(self, pair: str, events: List[PoolEvent]) -> CorrelatedStory:
        parts = pair.split("/")
        tokenA, tokenB = parts[0], parts[1]
        sources = list({e.source for e in events})
        total_a = sum(float(e.amountA or 0) for e in events)
        total_b = sum(float(e.amountB or 0) for e in events)
        avg_impact = sum(e.priceImpact or 0 for e in events) / len(events)
        timestamps = [e.timestamp for e in events]

        if len(sources) >= 2:
            confidence = "high"
        elif len(events) >= 3:
            confidence = "medium"
        else:
            confidence = "low"

        return CorrelatedStory(
            id=f"story-{int(time.time() * 1000)}",
            events=events,
            tokenA=tokenA,
            tokenB=tokenB,
            sources=sources,
            totalAmountA=total_a,
            totalAmountB=total_b,
            priceImpact=avg_impact,
            startTimestamp=min(timestamps),
            endTimestamp=max(timestamps),
            confidence=confidence,
            triggerReason=(
                f"Detected {len(events)} correlated {pair} pool events across "
                f"[{', '.join(sources)}] within {self.window_ms / 1000}s window"
            ),
        )
