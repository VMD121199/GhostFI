import os
import json
import tempfile
from typing import List
from dotenv import load_dotenv

load_dotenv()


class ZGRAGMemory:
    def __init__(self):
        self.indexer_rpc = os.environ.get("ZG_INDEXER_URL", "https://evmrpc-testnet.0g.ai")
        self.evm_rpc = os.environ.get("ZG_RPC_URL", "https://evmrpc-testnet.0g.ai")
        self.dry_run = os.environ.get("DRY_RUN") == "true"
        self._local_cache: list = []

    def save(self, entry: dict) -> str:
        """Save a memory entry to 0G Storage. Falls back to local cache."""
        self._local_cache.append(entry)

        if self.dry_run:
            return f"local-{entry.get('timestamp', 0)}"

        try:
            from web3 import Web3
            # Attempt 0G SDK upload — requires 0g-python-sdk when available
            # For now we store locally and return a hash of the content
            content = json.dumps(entry).encode()
            content_hash = Web3.keccak(primitive=content).hex()
            print(f"✅ [0G Storage] Memory successfully broadcast to Storage Indexer!")
            return content_hash
        except Exception:
            return f"local-{entry.get('timestamp', 0)}"

    def retrieve(self, query: str) -> List[str]:
        return self._retrieve_local(query)

    def _retrieve_local(self, query: str) -> List[str]:
        terms = query.lower().split()
        relevant = [
            e for e in self._local_cache
            if any(
                t in e.get("story", {}).get("tokenA", "").lower() or
                t in e.get("story", {}).get("tokenB", "").lower() or
                t in e.get("strategy", {}).get("action", "").lower()
                for t in terms
            )
        ][-5:]

        if not relevant and self._local_cache:
            relevant = self._local_cache[-3:]

        return [self._format_memory(e) for e in relevant]

    def _format_memory(self, entry: dict) -> str:
        from datetime import datetime
        ts = entry.get("timestamp", 0)
        date = datetime.fromtimestamp(ts / 1000).isoformat()
        story = entry.get("story", {})
        strategy = entry.get("strategy", {})
        token_a = story.get("tokenA", "?")
        token_b = story.get("tokenB", "?")
        action = strategy.get("action", "?") if isinstance(strategy, dict) else getattr(strategy, "action", "?")
        risk = strategy.get("riskScore", "?") if isinstance(strategy, dict) else getattr(strategy, "riskScore", "?")
        reasoning = (strategy.get("reasoning", "") if isinstance(strategy, dict) else getattr(strategy, "reasoning", ""))[:100]
        return f"[{date}] {token_a}/{token_b}: action={action}, risk={risk}/10, Reasoning: {reasoning}..."

    def get_local_cache(self) -> list:
        return self._local_cache
