import os
import time
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


@dataclass
class AgentAnalysis:
    strategy: object   # StrategyRecommendation
    confidence: str    # "low" | "medium" | "high"
    reasoning: str
    timestamp: int
    storageHash: Optional[str] = None


class PrivacyDeFiAgent:
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.dry_run = os.environ.get("DRY_RUN") == "true"
        from ..services.zero_g.inference import ZGInferenceClient
        from ..services.zero_g.storage import ZGRAGMemory
        self.inference = ZGInferenceClient()
        self.memory = ZGRAGMemory()

    def analyze(self, story, metadata=None) -> AgentAnalysis:
        print(f"\n🧠 [Groq Alpha AI] Analyzing market narrative...")
        print(f"   Pair: {story.tokenA}/{story.tokenB} | Network: {', '.join(story.sources)}")

        context = self.memory.retrieve(f"{story.tokenA} {story.tokenB} DeFi strategy")

        strategy = self.inference.reason(
            story=story,
            historical_context=context,
            agent_id=self.agent_id,
            metadata=metadata,
        )

        import dataclasses
        storage_hash = self.memory.save({
            "timestamp": int(time.time() * 1000),
            "story": dataclasses.asdict(story) if dataclasses.is_dataclass(story) else vars(story),
            "strategy": dataclasses.asdict(strategy) if dataclasses.is_dataclass(strategy) else vars(strategy),
            "agentId": self.agent_id,
        })

        analysis = AgentAnalysis(
            strategy=strategy,
            confidence=story.confidence,
            reasoning=strategy.reasoning,
            storageHash=storage_hash,
            timestamp=int(time.time() * 1000),
        )
        self._log_analysis(analysis)
        return analysis

    def identity(self) -> dict:
        return {
            "agentId": self.agent_id,
            "framework": "GroqAlpha",
            "version": "1.0.0",
            "capabilities": ["defi-strategy", "private-inference", "autonomous-trading"],
        }

    def _log_analysis(self, analysis: AgentAnalysis):
        s = analysis.strategy
        action = s.action if hasattr(s, "action") else s.get("action")
        risk = s.riskScore if hasattr(s, "riskScore") else s.get("riskScore")
        reasoning = s.reasoning if hasattr(s, "reasoning") else s.get("reasoning")
        print(f"\n📊 [Groq Alpha AI] Strategic Analysis Result:")
        print(f"   Action   : {action.upper()}")
        print(f"   Risk     : {risk}/10")
        print(f"   Summary  : {reasoning}")
        ab = s.analysis_breakdown if hasattr(s, "analysis_breakdown") else s.get("analysis_breakdown")
        if ab:
            print("   --- Deep Analysis Breakdown ---")
            print(f"   🌐 Market Sentiment : {ab.get('market_sentiment', '')}")
            print(f"   🧬 Technical Health : {ab.get('technical_health', '')}")
            print(f"   💰 Yield Analysis    : {ab.get('yield_analysis', '')}")
            print(f"   🛡️  Risk Mitigation  : {ab.get('risk_mitigation', '')}")
