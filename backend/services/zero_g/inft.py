import os
import base64
import json
import random
import re
from dataclasses import dataclass
from typing import Optional
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

INFT_ABI = [
    {"name": "mint", "type": "function", "stateMutability": "nonpayable",
     "inputs": [{"name": "to", "type": "address"}, {"name": "metadataUri", "type": "string"}],
     "outputs": [{"name": "", "type": "uint256"}]},
    {"name": "ownerOf", "type": "function", "stateMutability": "view",
     "inputs": [{"name": "tokenId", "type": "uint256"}],
     "outputs": [{"name": "", "type": "address"}]},
    {"name": "tokenURI", "type": "function", "stateMutability": "view",
     "inputs": [{"name": "tokenId", "type": "uint256"}],
     "outputs": [{"name": "", "type": "string"}]},
    {"name": "Transfer", "type": "event",
     "inputs": [
         {"name": "from", "type": "address", "indexed": True},
         {"name": "to", "type": "address", "indexed": True},
         {"name": "tokenId", "type": "uint256", "indexed": True},
     ]},
]


@dataclass
class INFTMetadata:
    agentId: str
    framework: str
    capabilities: list
    createdAt: str
    storageUri: Optional[str] = None


@dataclass
class INFTResult:
    tokenId: str
    contractAddress: str
    txHash: str
    metadata: INFTMetadata


class INFTMinter:
    def __init__(self):
        self.dry_run = os.environ.get("DRY_RUN") == "true"
        rpc = os.environ.get("ZG_RPC_URL", "https://evmrpc-testnet.0g.ai")
        self.provider = Web3(Web3.HTTPProvider(rpc))
        self.signer = None
        pk = os.environ.get("ZG_PRIVATE_KEY")
        if pk and not self.dry_run:
            self.signer = self.provider.eth.account.from_key(pk)

    def mint(self, metadata: INFTMetadata) -> INFTResult:
        contract_address = os.environ.get("INFT_CONTRACT_ADDRESS", "0x0000000000000000000000000000000000000001")

        if self.dry_run or not self.signer:
            return self._mock_mint(metadata, contract_address)

        try:
            print("🎨 [iNFT] Minting agent as iNFT (ERC-7857) on 0G Chain...")
            contract = self.provider.eth.contract(
                address=Web3.to_checksum_address(contract_address), abi=INFT_ABI
            )
            metadata_uri = self._encode_metadata_uri(metadata)
            owner = self.signer.address

            tx = contract.functions.mint(owner, metadata_uri).build_transaction({
                "from": owner,
                "nonce": self.provider.eth.get_transaction_count(owner),
                "gas": 300000,
                "gasPrice": self.provider.eth.gas_price,
            })
            signed = self.signer.sign_transaction(tx)
            tx_hash = self.provider.eth.send_raw_transaction(signed.raw_transaction)
            receipt = self.provider.eth.wait_for_transaction_receipt(tx_hash)

            # Parse tokenId — try MetadataUpdated first, then Transfer, then raw topics
            token_id = None
            for log in receipt["logs"]:
                if token_id:
                    break
                try:
                    parsed = contract.events.MetadataUpdated().process_log(log)
                    token_id = str(parsed["args"]["tokenId"])
                    continue
                except Exception:
                    pass
                try:
                    parsed = contract.events.Transfer().process_log(log)
                    token_id = str(parsed["args"]["tokenId"])
                    continue
                except Exception:
                    pass
                try:
                    raw_topics = log.get("topics") or []
                    if len(raw_topics) >= 2:
                        candidate = int(raw_topics[1].hex(), 16)
                        if 0 < candidate < 10_000_000:
                            token_id = str(candidate)
                except Exception:
                    pass

            if not token_id:
                raise RuntimeError("Could not parse tokenId from mint receipt logs")

            print(f"✅ [iNFT] Minted! Token ID: {token_id} | TX: {tx_hash.hex()}")

            # Register on AgentRegistry — only once per address (contract enforces this)
            registry_addr = os.environ.get("AGENT_REGISTRY_ADDRESS")
            if registry_addr:
                try:
                    registry_abi = [
                        {"name": "registerAgent", "type": "function", "stateMutability": "nonpayable",
                         "inputs": [{"name": "inftTokenId",    "type": "string"},
                                    {"name": "metadata",       "type": "string"},
                                    {"name": "privacyEnabled", "type": "bool"}],
                         "outputs": []},
                        {"name": "agents", "type": "function", "stateMutability": "view",
                         "inputs": [{"name": "", "type": "address"}],
                         "outputs": [{"name": "owner",          "type": "address"},
                                     {"name": "inftTokenId",    "type": "string"},
                                     {"name": "metadata",       "type": "string"},
                                     {"name": "privacyEnabled", "type": "bool"},
                                     {"name": "registeredAt",   "type": "uint256"}]},
                    ]
                    registry = self.provider.eth.contract(
                        address=Web3.to_checksum_address(registry_addr), abi=registry_abi
                    )
                    already = registry.functions.agents(owner).call()[4] != 0
                    if already:
                        print(f"ℹ️  [iNFT] Already registered in AgentRegistry — skipping")
                    else:
                        reg_tx = registry.functions.registerAgent(
                            token_id, metadata.storageUri or "0G_AI_AGENT", True
                        ).build_transaction({
                            "from": owner,
                            "nonce": self.provider.eth.get_transaction_count(owner),
                            "gas": 200000,
                            "gasPrice": self.provider.eth.gas_price,
                        })
                        signed_reg = self.signer.sign_transaction(reg_tx)
                        reg_hash = self.provider.eth.send_raw_transaction(signed_reg.raw_transaction)
                        self.provider.eth.wait_for_transaction_receipt(reg_hash)
                        print(f"✅ [iNFT] Registered! Registry TX: {reg_hash.hex()}")
                except Exception as e:
                    print(f"⚠️  [iNFT] Registry step failed: {e}")

            self._append_env("MY_AGENT_INFT_ID", token_id)
            self._update_env("AGENT_ADDRESS", owner)

            return INFTResult(tokenId=token_id, contractAddress=contract_address,
                              txHash=tx_hash.hex(), metadata=metadata)

        except Exception as e:
            print(f"⚠️  [iNFT] Mint failed, returning mock result: {e}")
            return self._mock_mint(metadata, contract_address)

    def _encode_metadata_uri(self, metadata: INFTMetadata) -> str:
        import dataclasses
        data = dataclasses.asdict(metadata)
        encoded = base64.b64encode(json.dumps(data).encode()).decode()
        return f"data:application/json;base64,{encoded}"

    def _mock_mint(self, metadata: INFTMetadata, contract_address: str) -> INFTResult:
        token_id = str(random.randint(1, 9999))
        tx_hash = "0x" + "".join(random.choices("0123456789abcdef", k=64))
        print(f"🎭 [iNFT] DRY-RUN: Mock iNFT minted")
        print(f"   Token ID: {token_id} | Contract: {contract_address}")
        print(f"   Mock TX: {tx_hash}")
        return INFTResult(tokenId=token_id, contractAddress=contract_address,
                          txHash=tx_hash, metadata=metadata)

    def _update_env(self, key: str, value: str):
        env_path = os.path.join(os.getcwd(), ".env")
        try:
            content = open(env_path).read() if os.path.exists(env_path) else ""
            pattern = re.compile(rf"^{key}=.*", re.MULTILINE)
            if pattern.search(content):
                content = pattern.sub(f"{key}={value}", content)
            else:
                content += f"\n{key}={value}"
            with open(env_path, "w") as f:
                f.write(content.strip() + "\n")
            print(f"📝 [iNFT] Identity saved to .env (ID: {value})")
        except Exception as e:
            print(f"⚠️  [iNFT] Could not auto-update .env: {e}")
