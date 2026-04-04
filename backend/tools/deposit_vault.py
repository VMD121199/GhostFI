import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()


def deposit():
    vault_address = os.environ.get("STRATEGY_VAULT_ADDRESS")
    private_key = os.environ.get("TRADER_PRIVATE_KEY")
    rpc_url = os.environ.get("ETHEREUM_RPC_URL", "https://rpc.sepolia.org")

    if not vault_address or not private_key:
        print("❌ Error: STRATEGY_VAULT_ADDRESS or TRADER_PRIVATE_KEY is missing in .env")
        return

    provider = Web3(Web3.HTTPProvider(rpc_url))
    account = provider.eth.account.from_key(private_key)
    amount = Web3.to_wei(0.01, "ether")

    print(f"\n🏦 [Deposit Tool] Initializing 0.01 ETH deposit...")
    print(f"   Source Wallet : {account.address}")
    print(f"   Target Vault  : {vault_address}")

    try:
        tx = {
            "to": Web3.to_checksum_address(vault_address),
            "value": amount,
            "gas": 30000,
            "gasPrice": provider.eth.gas_price,
            "nonce": provider.eth.get_transaction_count(account.address),
            "chainId": provider.eth.chain_id,
        }
        signed = account.sign_transaction(tx)
        tx_hash = provider.eth.send_raw_transaction(signed.raw_transaction)

        print(f"📡 [Deposit Tool] Broadcasting transaction. Hash: {tx_hash.hex()}")

        receipt = provider.eth.wait_for_transaction_receipt(tx_hash)
        if receipt["status"] == 1:
            print(f"\n✅ SUCCESS: 0.01 ETH has been safely deposited into StrategyVault!")
            print(f"   Explorer Link : https://sepolia.etherscan.io/tx/{tx_hash.hex()}")

            balance = provider.eth.get_balance(Web3.to_checksum_address(vault_address))
            print(f"   Current Vault Balance: {Web3.from_wei(balance, 'ether')} ETH")
    except Exception as e:
        print(f"\n❌ FAILED to deposit: {e}")


if __name__ == "__main__":
    deposit()
