import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()


def check_privacy():
    privacy_address = os.environ.get("PRIVACY_VAULT_ADDRESS")
    zg_rpc = os.environ.get("ZG_RPC_URL", "https://rpc-testnet.0g.ai")

    if not privacy_address:
        print("❌ Error: PRIVACY_VAULT_ADDRESS is missing in .env")
        return

    provider = Web3(Web3.HTTPProvider(zg_rpc))
    print(f"\n🔐 [Privacy Tracker] Investigating 0G PrivacyVault @ {privacy_address}\n")

    abi = [
        {
            "name": "ExecutionLinked",
            "type": "event",
            "inputs": [
                {"name": "commitmentHash", "type": "bytes32", "indexed": True},
                {"name": "txHash", "type": "string", "indexed": False},
            ],
        }
    ]

    vault = provider.eth.contract(
        address=Web3.to_checksum_address(privacy_address), abi=abi
    )

    try:
        events = vault.events.ExecutionLinked.get_logs(from_block=0)

        if not events:
            print("⚠️  No privacy records found in the CURRENT contract.")
            print("   Note: If you redeployed recently, previous records stay in the OLD contract address.")
        else:
            print(f"📜 Verified {len(events)} Proofs on 0G Newton:\n")
            for evt in events:
                commitment_hash = evt["args"]["commitmentHash"].hex()
                tx_hash = evt["args"]["txHash"]
                print(f"[PROOF] Strategy Committed: {commitment_hash}")
                print(f"        👉 Real-World TX: {tx_hash}")
                print("        --------------------------------------------------")
    except Exception as e:
        print(f"❌ RPC Error while querying 0G: {e}")


if __name__ == "__main__":
    check_privacy()
