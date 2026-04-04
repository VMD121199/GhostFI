import os
import time
import threading
from dataclasses import dataclass, field
from typing import Optional, Callable, List
from dotenv import load_dotenv
import requests

load_dotenv()

SWAP_TOPIC = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67"


@dataclass
class PoolEvent:
    id: str
    source: str  # "unichain" | "ethereum"
    type: str    # "swap" | "mint" | "burn" | "sync"
    pool: str
    tokenA: str
    tokenB: str
    amountA: str
    amountB: str
    timestamp: int
    txHash: str
    priceImpact: Optional[float] = None
    blockNumber: Optional[int] = None
    rawData: Optional[dict] = None


class NaryoListener:
    def __init__(self):
        self.unichain_rpc_url = os.environ.get("UNICHAIN_RPC_URL", "https://sepolia.unichain.org")
        self._running = False
        self._handlers: List[Callable] = []
        self._thread: Optional[threading.Thread] = None

    def on(self, event: str, handler: Callable):
        """Register an event handler for 'poolEvent'."""
        if event == "poolEvent":
            self._handlers.append(handler)

    def _emit(self, event: PoolEvent):
        for handler in self._handlers:
            handler(event)

    def start(self):
        self._running = True
        print("🔍 [Naryo] Starting multichain event listener...")
        self._thread = threading.Thread(target=self._poll_unichain, daemon=True)
        self._thread.start()
        print("✅ [Naryo] Listening on Unichain Sepolia")

    def stop(self):
        self._running = False
        print("⛔ [Naryo] Listener stopped.")

    def _poll_unichain(self):
        last_block = 0
        while self._running:
            try:
                block_resp = requests.post(self.unichain_rpc_url, json={
                    "jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []
                }, timeout=10)
                current_block = int(block_resp.json()["result"], 16)
                if last_block == 0:
                    last_block = current_block - 10
                if current_block <= last_block:
                    time.sleep(12)
                    continue

                logs_resp = requests.post(self.unichain_rpc_url, json={
                    "jsonrpc": "2.0", "id": 2, "method": "eth_getLogs",
                    "params": [{
                        "fromBlock": hex(last_block),
                        "toBlock": hex(current_block),
                        "topics": [SWAP_TOPIC],
                    }]
                }, timeout=10)

                logs = logs_resp.json().get("result", [])
                for log in logs[:5]:
                    evt = self._parse_unichain_log(log)
                    if evt:
                        print(f"📡 [Naryo/Unichain] Pool event: {evt.type} on {evt.pool} ({evt.tokenA}/{evt.tokenB})")
                        self._emit(evt)

                last_block = current_block
            except Exception as e:
                if os.environ.get("LOG_LEVEL") == "debug":
                    print(f"[Naryo/Unichain] Poll error: {e}")
            time.sleep(12)

    def _parse_unichain_log(self, log: dict) -> Optional[PoolEvent]:
        try:
            return PoolEvent(
                id=f"unichain-{log.get('transactionHash')}-{log.get('logIndex')}",
                source="unichain",
                type="swap",
                pool=str(log.get("address", "unknown")),
                tokenA="ETH",
                tokenB="USDC",
                amountA="0",
                amountB="0",
                timestamp=int(time.time() * 1000),
                txHash=str(log.get("transactionHash", "")),
                blockNumber=int(log["blockNumber"], 16) if log.get("blockNumber") else None,
                rawData=log,
            )
        except Exception:
            return None

    def simulate_event(self, overrides: dict = None) -> PoolEvent:
        evt = PoolEvent(
            id=f"sim-{int(time.time() * 1000)}",
            source="unichain",
            type="swap",
            pool="0xD0232Da7069B7B...E4C",
            tokenA="ETH",
            tokenB="USDC",
            amountA="0.1",
            amountB="350",
            priceImpact=0.05,
            timestamp=int(time.time() * 1000),
            txHash="0xsimulatedtxhash",
        )
        if overrides:
            for k, v in overrides.items():
                setattr(evt, k, v)
        self._emit(evt)
        return evt
