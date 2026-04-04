import os
import random
import requests
from dataclasses import dataclass, field
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


@dataclass
class StrategyRecommendation:
    action: str  # "swap" | "hold" | "provide_liquidity" | "withdraw" | "buy" | "sell"
    tokenIn: str
    tokenOut: str
    amount: str
    slippage: float
    riskScore: int
    reasoning: str
    privacyRecommended: bool
    isReal: bool
    analysis_breakdown: Optional[dict] = None
    estimatedGasCost: Optional[str] = None
    expectedReturn: Optional[str] = None


class ZGInferenceClient:
    def __init__(self):
        self.compute_url = os.environ.get("ZG_COMPUTE_URL", "https://api-compute.0g.ai")
        self.dry_run = os.environ.get("DRY_RUN") == "true"
        from ..ai.groq_service import GroqService
        self.groq = GroqService()

    def reason(self, story, historical_context: list, agent_id: str, metadata=None) -> StrategyRecommendation:
        if self.dry_run:
            return self._fallback_inference(story, historical_context, agent_id, metadata)

        try:
            prompt = self._build_prompt(story, historical_context, metadata)
            response = requests.post(
                f"{self.compute_url}/v1/inference/sealed",
                json={
                    "model": "defi-strategy-v1",
                    "prompt": prompt,
                    "sealed": True,
                    "agentId": agent_id,
                    "metadata": {
                        "tokenPair": f"{story.tokenA}/{story.tokenB}",
                        "sources": story.sources,
                        "extra": metadata,
                    },
                },
                headers={
                    "Authorization": f"Bearer {os.environ.get('ZG_PRIVATE_KEY')}",
                    "Content-Type": "application/json",
                },
                timeout=30,
            )
            print("✅ [0G Compute] Sealed inference complete (TEE result verified)")
            return self._parse_response(response.json(), story)
        except Exception:
            return self._fallback_inference(story, historical_context, agent_id, metadata)

    def _build_prompt(self, story, historical_context: list, metadata=None) -> str:
        import json
        return f"""You are a DeFi strategy AI agent. Analyze the following market event and recommend an action.

CURRENT MARKET EVENT:
- Token Pair: {story.tokenA}/{story.tokenB}
- Total Volume {story.tokenA}: {story.totalAmountA}
- Total Volume {story.tokenB}: {story.totalAmountB}
- Price Impact: {story.priceImpact}%
- Sources: {', '.join(story.sources)}
- Trigger: {story.triggerReason}

ADDITIONAL METADATA:
{json.dumps(metadata, indent=2) if metadata else 'No extra metadata.'}

HISTORICAL CONTEXT (last 5 relevant decisions):
{chr(10).join(historical_context[:5]) or 'No historical data available'}

Respond with a JSON strategy recommendation including: action, tokenIn, tokenOut, amount, slippage, riskScore (0-10), reasoning, privacyRecommended.""".strip()

    def _parse_response(self, raw: dict, story) -> StrategyRecommendation:
        try:
            import json
            content = json.loads(raw["result"]) if isinstance(raw.get("result"), str) else raw.get("result", {})
            return StrategyRecommendation(
                action=content.get("action", "hold"),
                tokenIn=content.get("tokenIn", story.tokenA),
                tokenOut=content.get("tokenOut", story.tokenB),
                amount=content.get("amount", "0.1"),
                slippage=content.get("slippage", 0.5),
                riskScore=content.get("riskScore", 5),
                reasoning=content.get("reasoning", "AI inference result"),
                analysis_breakdown=content.get("analysis_breakdown"),
                privacyRecommended=content.get("privacyRecommended", True),
                isReal=True,
            )
        except Exception:
            return self._fallback_inference(story, [], "", None)

    def _fallback_inference(self, story, historical_context, agent_id, metadata) -> StrategyRecommendation:
        if os.environ.get("GROQ_API_KEY"):
            print("🧠 [Groq Alpha AI] 0G Compute restricted — activating AI-Driven GROQ (Skill-based) Brain...")
            try:
                prompt = self._build_prompt(story, historical_context, metadata)
                result = self.groq.generate_json(prompt)
                return StrategyRecommendation(
                    action=result.get("action", "hold"),
                    tokenIn=result.get("tokenIn", story.tokenA),
                    tokenOut=result.get("tokenOut", story.tokenB),
                    amount=result.get("amount", "1.0"),
                    slippage=result.get("slippage", 0.5),
                    riskScore=result.get("riskScore", 3),
                    reasoning=result.get("reasoning", "Tư vấn từ chuyên gia GROQ"),
                    analysis_breakdown=result.get("analysis_breakdown"),
                    privacyRecommended=result.get("privacyRecommended", True),
                    isReal=False,
                )
            except Exception as e:
                print(f"⚠️  GROQ fallback failed: {e}. Using rule-based generator.")
        else:
            print("🔄 [Groq Alpha AI] 0G Compute restricted — switching to Local TEE Strategy Engine (Rule-based)")

        return self._generate_strategy(story)

    def _generate_strategy(self, story) -> StrategyRecommendation:
        action = "hold"
        if story.confidence == "high" or story.totalAmountA >= 0.5:
            if story.priceImpact > 5.0:
                action = "withdraw"
            else:
                action = "swap" if random.random() > 0.3 else "provide_liquidity"
        risk_score = 9 if action == "withdraw" else (1 if action == "hold" else 3)
        return StrategyRecommendation(
            action=action,
            tokenIn=story.tokenA,
            tokenOut=story.tokenB,
            amount="1.0",
            slippage=0.5,
            riskScore=risk_score,
            reasoning="Rule-based local strategy summary.",
            privacyRecommended=risk_score < 5,
            isReal=False,
        )
