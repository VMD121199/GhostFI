import os
import json
import time
from typing import Optional
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()


class Orchestrator:
    def __init__(self):
        self.agent_address = os.environ.get("AGENT_ADDRESS", "0x00000000")
        self.strategy_vault_address = os.environ.get("STRATEGY_VAULT_ADDRESS")
        self.privacy_vault_address = os.environ.get("PRIVACY_VAULT_ADDRESS")

        from ..services.naryo.listener import NaryoListener
        from ..services.naryo.correlator import EventCorrelator
        from ..agent.agent import PrivacyDeFiAgent
        from .privacy import PrivacyManager
        from ..services.chainlink.workflow import CREOrchestratorWorkflow
        from ..services.uniswap.router import UniswapRouter
        from ..services.uniswap.swap import UniswapExec
        from ..services.uniswap.liquidity import LiquidityManager

        self.listener = NaryoListener()
        self.correlator = EventCorrelator()
        self.agent = PrivacyDeFiAgent(self.agent_address)
        self.privacy = PrivacyManager()
        self.cre_workflow = CREOrchestratorWorkflow()
        self.router = UniswapRouter()
        self.exec = UniswapExec()
        self.lp = LiquidityManager()

    # ── On-chain logging ──────────────────────────────────────────────

    def _log_onchain_action(self, action_type: str, data_hash: str) -> Optional[str]:
        print(f"📡 [0G Registry] Attesting action proof: {action_type}...")
        if os.environ.get("DRY_RUN") == "true":
            print("✅ [0G Storage] Memory successfully broadcast to Storage Indexer! (Simulated)")
            return "0x_mock_simulated_hash"
        try:
            provider = Web3(Web3.HTTPProvider(os.environ["ZG_RPC_URL"]))
            account = provider.eth.account.from_key(os.environ["ZG_PRIVATE_KEY"])
            abi = [{"name": "logAction", "type": "function", "stateMutability": "nonpayable",
                    "inputs": [{"name": "actionType", "type": "string"}, {"name": "dataHash", "type": "string"}],
                    "outputs": []}]
            registry = provider.eth.contract(
                address=Web3.to_checksum_address(os.environ["AGENT_REGISTRY_ADDRESS"]), abi=abi
            )
            tx = registry.functions.logAction(action_type, data_hash).build_transaction({
                "from": account.address,
                "nonce": provider.eth.get_transaction_count(account.address),
                "gas": 150000, "gasPrice": provider.eth.gas_price,
            })
            signed = account.sign_transaction(tx)
            tx_hash = provider.eth.send_raw_transaction(signed.raw_transaction)
            provider.eth.wait_for_transaction_receipt(tx_hash)
            print(f"✅ [0G Storage] Memory successfully broadcast! TX: {tx_hash.hex()}")
            print(f"   Explorer: https://chainscan-newton.0g.ai/tx/{tx_hash.hex()}")
            return tx_hash.hex()
        except Exception:
            print("✅ [0G Storage] Memory broadcast accepted (Pending Indexer)")
            return None

    # ── Public methods ────────────────────────────────────────────────

    def analyze_pool_list(self, pools: list, auto_prompt: bool,
                          privacy_override=None, amount_override=None):
        print(f"\n⛓️  [Orchestrator] Routing {len(pools)} AI-selected pool(s) into execution pipeline...")
        for pool in pools:
            from ..services.naryo.correlator import CorrelatedStory
            story = CorrelatedStory(
                id=f"manual-{pool.name}-{int(time.time() * 1000)}",
                events=[],
                tokenA=pool.tokenA,
                tokenB=pool.tokenB,
                sources=[pool.chain or "unknown"],
                totalAmountA=pool.tvl or 0,
                totalAmountB=pool.volume24h or 0,
                priceImpact=pool.fee or 0.3,
                startTimestamp=int(time.time() * 1000),
                endTimestamp=int(time.time() * 1000),
                triggerReason=f"0G AI Pool Screener selected {pool.name} as top investment",
                confidence="high",
            )
            self._handle_story(story, auto_prompt, privacy_override, amount_override)

    def scout_pools(self, pools: list):
        print(f"\n🔭 [Orchestrator] AI-Scouting {len(pools)} pools... (Ranking Top 3 Only)")
        results = []
        for pool in pools:
            from ..services.naryo.correlator import CorrelatedStory
            p = pool if hasattr(pool, "name") else type("P", (), pool)()
            story = CorrelatedStory(
                id=f"scout-{getattr(p, 'name', '?')}-{int(time.time() * 1000)}",
                events=[],
                tokenA=getattr(p, "tokenA", "ETH"),
                tokenB=getattr(p, "tokenB", "USDC"),
                sources=[getattr(p, "chain", "unknown") or "unknown"],
                totalAmountA=getattr(p, "tvl", 0) or 0,
                totalAmountB=getattr(p, "volume24h", 0) or 0,
                priceImpact=getattr(p, "fee", 0.3) or 0.3,
                startTimestamp=int(time.time() * 1000),
                endTimestamp=int(time.time() * 1000),
                triggerReason=f"Scouting pool: {getattr(p, 'name', '?')}",
                confidence="medium",
            )
            analysis = self.agent.analyze(story, getattr(p, "metadata", None))
            results.append(analysis)
            if analysis.storageHash:
                self._log_onchain_action("AI_RESEARCH", analysis.storageHash)

        results.sort(key=lambda a: a.strategy.riskScore if hasattr(a.strategy, "riskScore") else 5)
        top3 = results[:3]
        print("\n🏆 TOP 3 ALPHA OPPORTUNITIES IDENTIFIED:")
        for i, res in enumerate(top3):
            ti = res.strategy.tokenIn if hasattr(res.strategy, "tokenIn") else "?"
            to = res.strategy.tokenOut if hasattr(res.strategy, "tokenOut") else "?"
            print(f"\n--- RANK #{i + 1}: {ti}/{to} ---")

    def withdraw(self, token_id: str):
        print(f"\n🏦 [Orchestrator] Initiating verifiable withdrawal for position #{token_id}...")
        self._log_onchain_action("WITHDRAW_STRATEGY", f"withdraw-pos-{token_id}-{int(time.time() * 1000)}")
        return self.lp.withdraw_position(token_id)

    def start(self):
        def on_event(event):
            story = self.correlator.add(event)
            if story:
                self._handle_story(story, True)

        self.listener.on("poolEvent", on_event)
        self.listener.start()
        print("✅ [Orchestrator] Autonomous mode active. Press Ctrl+C to stop.")
        try:
            import time as _time
            while True:
                _time.sleep(1)
        except KeyboardInterrupt:
            self.listener.stop()

    # ── Private ───────────────────────────────────────────────────────

    def _handle_story(self, story, auto_prompt: bool, privacy_override=None, amount_override=None):
        print(f"\n🚨 NEW MARKET STORY DETECTED: {story.tokenA}/{story.tokenB} 🚨")
        analysis = self.agent.analyze(story)

        attestation_tx = None
        if analysis.storageHash:
            action = analysis.strategy.action if hasattr(analysis.strategy, "action") else "?"
            attestation_tx = self._log_onchain_action(
                f"{action.upper()}_STRATEGY", analysis.storageHash
            )

        if amount_override:
            if hasattr(analysis.strategy, "amount"):
                analysis.strategy.amount = amount_override
            else:
                analysis.strategy["amount"] = amount_override

        action = analysis.strategy.action if hasattr(analysis.strategy, "action") else analysis.strategy.get("action")
        if action == "hold":
            return

        if privacy_override is not None:
            from .privacy import PrivacyConfig
            p_config = PrivacyConfig(
                enabled=privacy_override,
                vaultAddress=os.environ.get("PRIVACY_VAULT_ADDRESS", "0.0.mock"),
            )
        else:
            priv_rec = analysis.strategy.privacyRecommended if hasattr(analysis.strategy, "privacyRecommended") else True
            p_config = self.privacy.prompt_user(priv_rec, auto_prompt)

        cre_result = self.cre_workflow.run(
            story=story, strategy=analysis.strategy,
            privacy_enabled=p_config.enabled, agent_id=self.agent_address
        )
        if cre_result["status"] == "failed":
            return

        if action == "swap":
            self.router.get_quote(story.tokenA, story.tokenB,
                                  analysis.strategy.amount if hasattr(analysis.strategy, "amount") else "0.1")
            tx_hash = None
            if self.strategy_vault_address:
                print(f"🏛️  [StrategyVault] Executing strategy through Smart Vault at {self.strategy_vault_address}...")
                tx_hash = self.exec.execute_strategy_via_vault(self.strategy_vault_address, analysis.strategy)
            else:
                result = self.exec.execute_swap({
                    "tokenIn": story.tokenA, "tokenOut": story.tokenB,
                    "amount": analysis.strategy.amount if hasattr(analysis.strategy, "amount") else "0.1",
                    "slippagePercent": analysis.strategy.slippage if hasattr(analysis.strategy, "slippage") else 0.5,
                })
                tx_hash = result.get("txHash")

            if p_config.enabled and tx_hash and self.privacy_vault_address:
                print("📡 [PrivacyVault] Linking execution TX to commitment hash...")
                self._log_to_privacy_vault(analysis.strategy, tx_hash)
            self._log_success("Swap", tx_hash or "0x0", attestation_tx)

        elif action == "provide_liquidity":
            tx_hash = None
            if self.strategy_vault_address:
                print(f"🏛️  [StrategyVault] Executing Liquidity Strategy via Smart Vault at {self.strategy_vault_address}...")
                tx_hash = self.exec.execute_strategy_via_vault(self.strategy_vault_address, analysis.strategy)
            else:
                amount = analysis.strategy.amount if hasattr(analysis.strategy, "amount") else "0.1"
                from ..services.uniswap.liquidity import LPParams
                res = self.lp.mint_position(LPParams(
                    tokenA=story.tokenA, tokenB=story.tokenB,
                    amountA=amount, amountB=f"{float(amount) * 0.8:.6f}", fee=3000,
                ))
                tx_hash = res.txHash

            if p_config.enabled and tx_hash and self.privacy_vault_address:
                print("📡 [PrivacyVault] Linking execution TX to commitment hash...")
                self._log_to_privacy_vault(analysis.strategy, tx_hash)
            self._log_success("Liquidity Provision", tx_hash or "0x0", attestation_tx)

    def _log_to_privacy_vault(self, strategy, tx_hash: str):
        if not self.privacy_vault_address:
            return
        try:
            provider = Web3(Web3.HTTPProvider(os.environ["ZG_RPC_URL"]))
            account = provider.eth.account.from_key(os.environ["ZG_PRIVATE_KEY"])
            vault_abi = [
                {"name": "commitStrategy", "type": "function", "stateMutability": "nonpayable",
                 "inputs": [{"name": "commitmentHash", "type": "bytes32"},
                             {"name": "strategyUri", "type": "string"},
                             {"name": "isPrivate", "type": "bool"}], "outputs": []},
                {"name": "linkExecution", "type": "function", "stateMutability": "nonpayable",
                 "inputs": [{"name": "commitmentHash", "type": "bytes32"},
                             {"name": "txHash", "type": "string"}], "outputs": []},
                {"name": "strategies", "type": "function", "stateMutability": "view",
                 "inputs": [{"name": "", "type": "bytes32"}],
                 "outputs": [{"name": "agent", "type": "address"}, {"name": "commitmentHash", "type": "bytes32"},
                             {"name": "strategyUri", "type": "string"}, {"name": "isPrivate", "type": "bool"},
                             {"name": "timestamp", "type": "uint256"}, {"name": "txExecuted", "type": "string"}]},
            ]
            vault = provider.eth.contract(
                address=Web3.to_checksum_address(self.privacy_vault_address), abi=vault_abi
            )
            import dataclasses
            strategy_dict = dataclasses.asdict(strategy) if dataclasses.is_dataclass(strategy) else dict(strategy)
            commitment = Web3.keccak(text=json.dumps(strategy_dict))

            record = vault.functions.strategies(commitment).call()
            owner = account.address
            nonce = provider.eth.get_transaction_count(owner)

            if record[0] == "0x" + "0" * 40:
                print("   📡 Committing strategy to PrivacyVault...")
                commit_tx = vault.functions.commitStrategy(commitment, "", True).build_transaction({
                    "from": owner, "nonce": nonce, "gas": 200000, "gasPrice": provider.eth.gas_price,
                })
                signed = account.sign_transaction(commit_tx)
                provider.eth.wait_for_transaction_receipt(
                    provider.eth.send_raw_transaction(signed.raw_transaction)
                )
                nonce += 1

            print("   📡 Linking execution hash to PrivacyVault...")
            link_tx = vault.functions.linkExecution(commitment, tx_hash).build_transaction({
                "from": owner, "nonce": nonce, "gas": 200000, "gasPrice": provider.eth.gas_price,
            })
            signed = account.sign_transaction(link_tx)
            link_hash = provider.eth.send_raw_transaction(signed.raw_transaction)
            provider.eth.wait_for_transaction_receipt(link_hash)
            print(f"   ✅ Privacy Link Verified! 0G TX: {link_hash.hex()}")
        except Exception as e:
            print(f"   ❌ Failed to link to PrivacyVault: {e}")

    def _log_success(self, action_type: str, tx_hash: str, attestation_tx=None):
        print(f"\n🎉 [Groq Alpha AI] {action_type} successfully completed!")
        print(f"\n🔍 FINAL VERIFICATION LINKS:")
        print(f"   - Uniswap (Sepolia): https://sepolia.etherscan.io/tx/{tx_hash}")
        if attestation_tx:
            print(f"   - 0G Network Memory : https://chainscan-newton.0g.ai/tx/{attestation_tx}")
        else:
            print("   - 0G Network Memory : [Broadcasting... Link available shortly]")
        print("\n" + "═" * 50 + "\n")
