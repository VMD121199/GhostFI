import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()


def check():
    provider = Web3(Web3.HTTPProvider(os.environ["ZG_RPC_URL"]))
    contract_address = os.environ["INFT_CONTRACT_ADDRESS"]

    abi = [
        {
            "name": "balanceOf",
            "type": "function",
            "stateMutability": "view",
            "inputs": [{"name": "owner", "type": "address"}],
            "outputs": [{"name": "", "type": "uint256"}],
        },
        {
            "name": "tokenOfOwnerByIndex",
            "type": "function",
            "stateMutability": "view",
            "inputs": [
                {"name": "owner", "type": "address"},
                {"name": "index", "type": "uint256"},
            ],
            "outputs": [{"name": "", "type": "uint256"}],
        },
    ]

    contract = provider.eth.contract(
        address=Web3.to_checksum_address(contract_address), abi=abi
    )
    owner = "0x335145400C12958600C0542F9180e03B917F7BbB"

    try:
        bal = contract.functions.balanceOf(owner).call()
        print(f"👤 Owner balance: {bal} iNFTs")
        if bal > 0:
            token_id = contract.functions.tokenOfOwnerByIndex(owner, bal - 1).call()
            print(f"🔥 LATEST ID: {token_id}")
    except Exception as e:
        print(f"❌ Contract error (might not support enumerable): {e}")


if __name__ == "__main__":
    check()
