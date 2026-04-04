import json
import os
from dataclasses import dataclass, field
from typing import List, Optional
from .pool_inference import ZGPoolRankingClient, AIRankingResult


@dataclass
class PoolCandidate:
    name: str
    tokenA: str
    tokenB: str
    poolAddress: Optional[str] = None
    chain: Optional[str] = None
    tvl: Optional[float] = None
    volume24h: Optional[float] = None
    fee: Optional[float] = None
    notes: Optional[str] = None


@dataclass
class ScreeningResult:
    aiResult: AIRankingResult
    timestamp: int
    totalAnalyzed: int
    topPool: PoolCandidate
    inputPools: List[PoolCandidate]


class PoolScreener:
    def __init__(self):
        self.ranker = ZGPoolRankingClient()

    def screen_from_file(self, file_path: str) -> ScreeningResult:
        abs_path = os.path.abspath(file_path)
        print(f"\n📂 [Pool Screener] Loading pool list from: {abs_path}")
        with open(abs_path, "r") as f:
            raw = json.load(f)
        if not isinstance(raw, list) or not raw:
            raise ValueError("pools.json must be a non-empty JSON array.")
        pools = [PoolCandidate(**p) for p in raw]
        return self.screen(pools)

    def screen(self, pools: List[PoolCandidate]) -> ScreeningResult:
        import time
        print(f"\n🔍 [Pool Screener] Preparing {len(pools)} pool(s) for 0G AI comparative analysis...")
        self._print_pool_summary(pools)
        ai_result = self.ranker.rank_pools(pools)
        best_name = ai_result.bestPool.poolName
        top_pool = next((p for p in pools if p.name == best_name), pools[0])
        return ScreeningResult(
            aiResult=ai_result,
            timestamp=int(time.time() * 1000),
            totalAnalyzed=len(pools),
            topPool=top_pool,
            inputPools=pools,
        )

    def _print_pool_summary(self, pools: List[PoolCandidate]):
        print("─" * 55)
        for p in pools:
            vol_ratio = f"{(p.volume24h or 0) / p.tvl * 100:.1f}%" if p.tvl else "N/A"
            print(
                f"  • {p.name:<12} | TVL: ${self._fmt(p.tvl)}"
                f" | Vol/TVL: {vol_ratio} | Fee: {p.fee or '?'}% | Chain: {p.chain or '?'}"
            )
        print("─" * 55)

    def _fmt(self, n) -> str:
        if not n:
            return "N/A"
        if n >= 1_000_000:
            return f"{n / 1_000_000:.1f}M"
        if n >= 1_000:
            return f"{n / 1_000:.0f}K"
        return str(n)
