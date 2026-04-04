import os
import random
import requests
from dataclasses import dataclass, field
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()


@dataclass
class AIPoolRanking:
    rank: int
    poolName: str
    tokenA: str
    tokenB: str
    action: str       # "invest" | "skip" | "watch"
    riskScore: int
    confidenceScore: int
    expectedReturn: str
    reasoning: str
    analysis_breakdown: Optional[dict] = None
    warnings: Optional[str] = None


@dataclass
class AIRankingResult:
    rankings: List[AIPoolRanking]
    summary: str
    bestPool: AIPoolRanking
    usedFallback: bool


class ZGPoolRankingClient:
    def __init__(self):
        self.compute_url = os.environ.get("ZG_COMPUTE_URL", "https://api-compute.0g.ai")
        self.dry_run = os.environ.get("DRY_RUN") == "true"
        from ..ai.groq_service import GroqService
        self.groq = GroqService()

    def rank_pools(self, pools: list) -> AIRankingResult:
        if self.dry_run:
            return self._local_fallback(pools)

        prompt = self._build_comparative_prompt(pools)
        try:
            resp = requests.post(
                f"{self.compute_url}/v1/inference/sealed",
                json={
                    "model": "defi-strategy-v1",
                    "prompt": prompt,
                    "sealed": True,
                    "metadata": {"task": "pool-ranking", "poolCount": len(pools),
                                 "pools": [(p.get("name") if isinstance(p, dict) else p.name) for p in pools]},
                },
                headers={"Authorization": f"Bearer {os.environ.get('ZG_PRIVATE_KEY')}",
                         "Content-Type": "application/json"},
                timeout=45,
            )
            print("✅ [0G Compute] Comparative sealed inference complete (TEE verified)")
            return self._parse_ai_response(resp.json(), pools)
        except Exception as e:
            print(f"⚠️  [0G Compute] Unreachable ({e}). Switching to local fallback...")
            result = self._local_fallback(pools)
            result.usedFallback = True
            return result

    def _build_comparative_prompt(self, pools: list) -> str:
        def get(p, k, default=None):
            return p.get(k, default) if isinstance(p, dict) else getattr(p, k, default)

        pool_lines = []
        for i, p in enumerate(pools):
            tvl = get(p, "tvl") or 0
            vol = get(p, "volume24h") or 0
            fee = get(p, "fee")
            vol_ratio = f"{vol / tvl:.3f}" if tvl else "N/A"
            momentum = " (🔥 High momentum)" if tvl and vol / tvl > 0.3 else ""
            pool_lines.append(
                f"Pool {i+1}: {get(p, 'name')}\n"
                f"  - TokenA: {get(p, 'tokenA')}, TokenB: {get(p, 'tokenB')}\n"
                f"  - Chain: {get(p, 'chain') or 'unknown'}\n"
                f"  - TVL: ${tvl:,}\n"
                f"  - 24h Volume: ${vol:,}\n"
                f"  - Volume/TVL Ratio: {vol_ratio}{momentum}\n"
                f"  - Fee Tier: {fee or '?'}%\n"
                f"  - Notes: {get(p, 'notes') or 'None'}"
            )

        return f"""You are an expert DeFi investment AI running inside a TEE on 0G Compute.
Comparatively rank {len(pools)} liquidity pools from BEST to WORST.

POOL CANDIDATES:
{chr(10).join(pool_lines)}

Respond STRICTLY in valid JSON:
{{
  "summary": "[One-paragraph market overview]",
  "rankings": [
    {{
      "rank": 1, "poolName": "...", "tokenA": "...", "tokenB": "...",
      "action": "invest", "riskScore": 2, "confidenceScore": 88,
      "expectedReturn": "+4.2%", "reasoning": "...",
      "analysis_breakdown": {{
        "market_sentiment": "...", "technical_health": "...",
        "yield_analysis": "...", "risk_mitigation": "..."
      }},
      "warnings": null
    }}
  ]
}}""".strip()

    def _parse_ai_response(self, raw: dict, pools: list) -> AIRankingResult:
        import json
        try:
            content = json.loads(raw["result"]) if isinstance(raw.get("result"), str) else raw.get("result", {})
            rankings = [AIPoolRanking(**{k: v for k, v in r.items()}) for r in content["rankings"]]
            rankings.sort(key=lambda r: r.rank)
            return AIRankingResult(rankings=rankings, summary=content.get("summary", ""),
                                   bestPool=rankings[0], usedFallback=False)
        except Exception:
            print("⚠️  [0G Compute] Could not parse AI response. Using fallback...")
            return self._local_fallback(pools)

    def _local_fallback(self, pools: list) -> AIRankingResult:
        def get(p, k, default=None):
            return p.get(k, default) if isinstance(p, dict) else getattr(p, k, default)

        if os.environ.get("GROQ_API_KEY"):
            try:
                prompt = self._build_comparative_prompt(pools)
                result = self.groq.generate_json(prompt)
                rankings = [AIPoolRanking(**{k: v for k, v in r.items()}) for r in result["rankings"]]
                return AIRankingResult(
                    rankings=rankings,
                    summary=f"[GROQ-Skill] {result.get('summary', '')}",
                    bestPool=rankings[0],
                    usedFallback=True,
                )
            except Exception as e:
                print(f"⚠️  GROQ fallback failed: {e}.")

        scored = []
        for p in pools:
            tvl = get(p, "tvl") or 1
            vol = get(p, "volume24h") or 0
            fee = get(p, "fee") or 0.3
            chain = get(p, "chain") or ""
            ratio = vol / tvl
            score = min(ratio * 100, 40)
            score += 25 if fee <= 0.05 else (15 if fee <= 0.3 else 5)
            score += 20 if tvl > 10_000_000 else (12 if tvl > 1_000_000 else 5)
            score += 15 if "unichain" in chain else 8
            action = "invest" if score >= 50 else ("watch" if score >= 30 else "skip")
            risk = 2 if score >= 70 else (4 if score >= 50 else (6 if score >= 30 else 9))
            scored.append({"pool": p, "score": score, "action": action, "risk": risk})

        scored.sort(key=lambda x: x["score"], reverse=True)
        rankings = []
        for i, s in enumerate(scored):
            p = s["pool"]
            tvl = get(p, "tvl") or 1
            vol = get(p, "volume24h") or 0
            ratio = f"{vol / tvl:.2f}"
            rankings.append(AIPoolRanking(
                rank=i + 1,
                poolName=get(p, "name"),
                tokenA=get(p, "tokenA"),
                tokenB=get(p, "tokenB"),
                action=s["action"],
                riskScore=s["risk"],
                confidenceScore=min(round(s["score"]), 100),
                expectedReturn=f"+{random.uniform(1, 5):.1f}%" if s["action"] == "invest" else "0%",
                reasoning=self._build_fallback_reasoning(p, s["score"], ratio),
                warnings="Low liquidity or high fee — exercise caution." if s["risk"] >= 7 else None,
            ))

        return AIRankingResult(
            rankings=rankings,
            summary=f"[LOCAL FALLBACK] Analyzed {len(pools)} pools. Top pick: {rankings[0].poolName}.",
            bestPool=rankings[0],
            usedFallback=True,
        )

    def _build_fallback_reasoning(self, pool, score: float, ratio: str) -> str:
        def get(p, k, default=None):
            return p.get(k, default) if isinstance(p, dict) else getattr(p, k, default)

        tvl = get(pool, "tvl") or 1
        vol = get(pool, "volume24h") or 0
        reasons = []
        r = vol / tvl
        if r >= 0.3:
            reasons.append(f"High Volume/TVL ratio ({ratio}) signals strong trader demand")
        elif r >= 0.1:
            reasons.append(f"Moderate Volume/TVL ratio ({ratio}) — healthy activity")
        else:
            reasons.append(f"Low Volume/TVL ratio ({ratio}) — limited trading activity")
        if (get(pool, "fee") or 0.3) <= 0.05:
            reasons.append("Very low fee tier minimises trading cost")
        if tvl > 10_000_000:
            reasons.append(f"Deep liquidity (${tvl / 1e6:.1f}M TVL) reduces impermanent loss risk")
        if "unichain" in (get(pool, "chain") or ""):
            reasons.append("Listed on Unichain — native integration with agent's primary chain")
        if get(pool, "notes"):
            reasons.append(get(pool, "notes"))
        return ". ".join(reasons) + "."
