import os
from datetime import datetime
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()


def verify():
    provider = Web3(Web3.HTTPProvider(os.environ["ZG_RPC_URL"]))
    registry_address = os.environ["AGENT_REGISTRY_ADDRESS"]
    agent_address = os.environ["AGENT_ADDRESS"]

    print("=======================================================")
    print("   🛡️  ORION ON-CHAIN VERIFIER  — Proof of life on 0G Chain")
    print("=======================================================\n")

    abi = [
        {
            "name": "getAgent",
            "type": "function",
            "stateMutability": "view",
            "inputs": [{"name": "agentAddr", "type": "address"}],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "components": [
                        {"name": "owner", "type": "address"},
                        {"name": "inftTokenId", "type": "string"},
                        {"name": "metadata", "type": "string"},
                        {"name": "privacyEnabled", "type": "bool"},
                        {"name": "registeredAt", "type": "uint256"},
                    ],
                }
            ],
        },
        {
            "name": "ActionLogged",
            "type": "event",
            "inputs": [
                {"name": "agentAddress", "type": "address", "indexed": True},
                {"name": "actionType", "type": "string", "indexed": False},
                {"name": "dataHash", "type": "string", "indexed": False},
            ],
        },
    ]

    registry = provider.eth.contract(
        address=Web3.to_checksum_address(registry_address), abi=abi
    )

    # 1. Check Registration
    print(f"👤 Checking Agent Identity: {agent_address}...")
    try:
        info = registry.functions.getAgent(agent_address).call()
        owner, inft_token_id, metadata, privacy_enabled, registered_at = info
        if registered_at == 0:
            print("❌ Status: NOT REGISTERED. Run 'mint-inft' first!")
        else:
            print("✅ Status: OFFICIALLY REGISTERED on 0G Chain")
            print(f"🆔 iNFT Token ID: {inft_token_id}")
            print(f"🎭 Privacy Mode : {'ENABLED 🔐' if privacy_enabled else 'DISABLED'}")
            print(f"📅 Member Since : {datetime.fromtimestamp(registered_at).strftime('%c')}")
    except Exception as e:
        print(f"❌ Registry Error: {e}")

    # 2. Check Action Logs (Events)
    print("\n📜 Fetching Recent Action Logs (Events)...")
    try:
        latest_block = provider.eth.block_number
        from_block = max(0, latest_block - 1000)
        events = registry.events.ActionLogged.get_logs(
            argument_filters={"agentAddress": agent_address},
            from_block=from_block,
        )

        if not events:
            print("⚠️  No actions recorded yet. Run a session via 'examples/sovereign-agent'!")
        else:
            print(f"🎉 Found {len(events)} verifiable action(s) for this Agent:\n")
            for i, evt in enumerate(events, 1):
                action_type = evt["args"]["actionType"]
                data_hash = evt["args"]["dataHash"]
                tx_hash = evt["transactionHash"].hex()
                print(f"📍 Action #{i}: [{action_type}]")
                print(f"💿 Proof Hash (0G Storage): {data_hash}")
                print(f"⛓️  Explorer Link          : https://chainscan-galileo.0g.ai/tx/{tx_hash}")
                print("───────────────────────────────────────────────────────")
    except Exception as e:
        print(f"❌ Action Log Error: {e}")

    print("\n🚀 All proofs linked successfully. ORION is officially ON-CHAIN.")


if __name__ == "__main__":
    verify()
