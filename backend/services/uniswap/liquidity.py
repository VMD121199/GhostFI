import os
import math
from dataclasses import dataclass
from typing import Optional
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

POSITION_MANAGER = "0x1238536071E1c677A632429e3655c799b22cDA52"
ADDRESS_MAP = {
    "ETH": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
    "USDC": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
}
UINT128_MAX = 2**128 - 1


@dataclass
class LPParams:
    tokenA: str
    tokenB: str
    amountA: str
    amountB: str
    fee: int = 3000


@dataclass
class LPResult:
    txHash: str
    status: str  # "success" | "failed"
    tokenId: Optional[str] = None


class LiquidityManager:
    def __init__(self):
        self.dry_run = os.environ.get("DRY_RUN") == "true"
        rpc = os.environ.get("ETHEREUM_RPC_URL", "https://rpc.sepolia.org")
        self.provider = Web3(Web3.HTTPProvider(rpc))
        self.signer = None
        pk = os.environ.get("TRADER_PRIVATE_KEY")
        if pk and not self.dry_run:
            self.signer = self.provider.eth.account.from_key(pk)

    def mint_position(self, params: LPParams) -> LPResult:
        if self.dry_run:
            return self._mock_mint(params)
        if not self.signer:
            raise RuntimeError("No private key configured for execution.")

        print(f"🏦 [LP Manager] Providing liquidity: {params.amountA} {params.tokenA} + {params.amountB} {params.tokenB}")
        try:
            addr_a = ADDRESS_MAP.get(params.tokenA)
            addr_b = ADDRESS_MAP.get(params.tokenB)
            if not addr_a or not addr_b:
                raise ValueError(f"Token addresses not found for {params.tokenA}/{params.tokenB}")

            is_a0 = addr_a.lower() < addr_b.lower()
            token0_addr = addr_a if is_a0 else addr_b
            token1_addr = addr_b if is_a0 else addr_a
            amount0 = params.amountA if is_a0 else params.amountB
            amount1 = params.amountB if is_a0 else params.amountA
            token0_sym = params.tokenA if is_a0 else params.tokenB
            token1_sym = params.tokenB if is_a0 else params.tokenA

            self._approve_token(token0_addr, amount0)
            self._approve_token(token1_addr, amount1)

            manager_abi = [{
                "name": "mint", "type": "function", "stateMutability": "payable",
                "inputs": [{"name": "params", "type": "tuple", "components": [
                    {"name": "token0", "type": "address"}, {"name": "token1", "type": "address"},
                    {"name": "fee", "type": "uint24"}, {"name": "tickLower", "type": "int24"},
                    {"name": "tickUpper", "type": "int24"}, {"name": "amount0Desired", "type": "uint256"},
                    {"name": "amount1Desired", "type": "uint256"}, {"name": "amount0Min", "type": "uint256"},
                    {"name": "amount1Min", "type": "uint256"}, {"name": "recipient", "type": "address"},
                    {"name": "deadline", "type": "uint256"},
                ]}],
                "outputs": [{"name": "tokenId", "type": "uint256"}, {"name": "liquidity", "type": "uint128"},
                            {"name": "amount0", "type": "uint256"}, {"name": "amount1", "type": "uint256"}],
            }]
            manager = self.provider.eth.contract(
                address=Web3.to_checksum_address(POSITION_MANAGER), abi=manager_abi
            )

            decimals0 = 6 if token0_sym == "USDC" else 18
            decimals1 = 6 if token1_sym == "USDC" else 18

            import time
            mint_params = (
                Web3.to_checksum_address(token0_addr),
                Web3.to_checksum_address(token1_addr),
                params.fee,
                -887220,  # tickLower
                887220,   # tickUpper
                Web3.to_wei(float(amount0), "mwei" if decimals0 == 6 else "ether"),
                Web3.to_wei(float(amount1), "mwei" if decimals1 == 6 else "ether"),
                0, 0,
                self.signer.address,
                int(time.time()) + 600,
            )

            msg_value = 0
            if token0_sym == "ETH":
                msg_value = Web3.to_wei(float(amount0), "ether")
            elif token1_sym == "ETH":
                msg_value = Web3.to_wei(float(amount1), "ether")

            owner = self.signer.address
            tx = manager.functions.mint(mint_params).build_transaction({
                "from": owner,
                "nonce": self.provider.eth.get_transaction_count(owner),
                "gas": 500000,
                "gasPrice": self.provider.eth.gas_price,
                "value": msg_value,
            })
            print("📡 [LP Manager] Broadcasting mint transaction...")
            signed = self.signer.sign_transaction(tx)
            tx_hash = self.provider.eth.send_raw_transaction(signed.raw_transaction)
            self.provider.eth.wait_for_transaction_receipt(tx_hash)
            print(f"✅ [LP Manager] Liquidity provided! TX: {tx_hash.hex()}")
            return LPResult(txHash=tx_hash.hex(), status="success")
        except Exception as e:
            print(f"❌ [LP Manager] Minting failed: {e}")
            return LPResult(txHash="", status="failed")

    def withdraw_position(self, token_id: str) -> LPResult:
        if self.dry_run:
            return self._mock_withdraw(token_id)
        if not self.signer:
            raise RuntimeError("Signer not configured.")

        print(f"🏦 [LP Manager] Withdrawing position ID: {token_id}")
        try:
            manager_abi = [
                {"name": "positions", "type": "function", "stateMutability": "view",
                 "inputs": [{"name": "tokenId", "type": "uint256"}],
                 "outputs": [{"name": "nonce", "type": "uint96"}, {"name": "operator", "type": "address"},
                             {"name": "token0", "type": "address"}, {"name": "token1", "type": "address"},
                             {"name": "fee", "type": "uint24"}, {"name": "tickLower", "type": "int24"},
                             {"name": "tickUpper", "type": "int24"}, {"name": "liquidity", "type": "uint128"},
                             {"name": "feeGrowthInside0LastX128", "type": "uint256"},
                             {"name": "feeGrowthInside1LastX128", "type": "uint256"},
                             {"name": "tokensOwed0", "type": "uint128"}, {"name": "tokensOwed1", "type": "uint128"}]},
                {"name": "decreaseLiquidity", "type": "function", "stateMutability": "payable",
                 "inputs": [{"name": "params", "type": "tuple", "components": [
                     {"name": "tokenId", "type": "uint256"}, {"name": "liquidity", "type": "uint128"},
                     {"name": "amount0Min", "type": "uint256"}, {"name": "amount1Min", "type": "uint256"},
                     {"name": "deadline", "type": "uint256"},
                 ]}],
                 "outputs": [{"name": "amount0", "type": "uint256"}, {"name": "amount1", "type": "uint256"}]},
                {"name": "collect", "type": "function", "stateMutability": "payable",
                 "inputs": [{"name": "params", "type": "tuple", "components": [
                     {"name": "tokenId", "type": "uint256"}, {"name": "recipient", "type": "address"},
                     {"name": "amount0Max", "type": "uint128"}, {"name": "amount1Max", "type": "uint128"},
                 ]}],
                 "outputs": [{"name": "amount0", "type": "uint256"}, {"name": "amount1", "type": "uint256"}]},
            ]
            manager = self.provider.eth.contract(
                address=Web3.to_checksum_address(POSITION_MANAGER), abi=manager_abi
            )
            pos = manager.functions.positions(int(token_id)).call()
            liquidity = pos[7]
            import time
            owner = self.signer.address

            if liquidity > 0:
                print(f"📡 [LP Manager] Decreasing liquidity ({liquidity})...")
                dec_params = (int(token_id), liquidity, 0, 0, int(time.time()) + 600)
                dec_tx_data = manager.functions.decreaseLiquidity(dec_params).build_transaction({
                    "from": owner, "nonce": self.provider.eth.get_transaction_count(owner),
                    "gas": 300000, "gasPrice": self.provider.eth.gas_price,
                })
                signed = self.signer.sign_transaction(dec_tx_data)
                self.provider.eth.wait_for_transaction_receipt(
                    self.provider.eth.send_raw_transaction(signed.raw_transaction)
                )

            print("📡 [LP Manager] Collecting tokens from position...")
            coll_params = (int(token_id), owner, UINT128_MAX, UINT128_MAX)
            coll_tx_data = manager.functions.collect(coll_params).build_transaction({
                "from": owner, "nonce": self.provider.eth.get_transaction_count(owner),
                "gas": 300000, "gasPrice": self.provider.eth.gas_price,
            })
            signed = self.signer.sign_transaction(coll_tx_data)
            coll_hash = self.provider.eth.send_raw_transaction(signed.raw_transaction)
            self.provider.eth.wait_for_transaction_receipt(coll_hash)
            print(f"✅ [LP Manager] Position withdrawn! TX: {coll_hash.hex()}")
            return LPResult(txHash=coll_hash.hex(), status="success")
        except Exception as e:
            print(f"❌ [LP Manager] Withdrawal failed: {e}")
            return LPResult(txHash="", status="failed")

    def get_balances_and_positions(self) -> dict:
        if not self.signer:
            raise RuntimeError("Signer not configured.")
        address = self.signer.address
        results = {"address": address, "eth": "0.0", "usdc": "0.0", "positions": []}
        try:
            bal_wei = self.provider.eth.get_balance(address)
            results["eth"] = str(Web3.from_wei(bal_wei, "ether"))

            usdc_abi = [{"name": "balanceOf", "type": "function", "stateMutability": "view",
                         "inputs": [{"name": "account", "type": "address"}],
                         "outputs": [{"name": "", "type": "uint256"}]}]
            usdc = self.provider.eth.contract(
                address=Web3.to_checksum_address(ADDRESS_MAP["USDC"]), abi=usdc_abi
            )
            results["usdc"] = str(usdc.functions.balanceOf(address).call() / 10**6)

            pm_abi = [
                {"name": "balanceOf", "type": "function", "stateMutability": "view",
                 "inputs": [{"name": "owner", "type": "address"}],
                 "outputs": [{"name": "", "type": "uint256"}]},
                {"name": "tokenOfOwnerByIndex", "type": "function", "stateMutability": "view",
                 "inputs": [{"name": "owner", "type": "address"}, {"name": "index", "type": "uint256"}],
                 "outputs": [{"name": "", "type": "uint256"}]},
                {"name": "positions", "type": "function", "stateMutability": "view",
                 "inputs": [{"name": "tokenId", "type": "uint256"}],
                 "outputs": [{"name": "nonce", "type": "uint96"}, {"name": "operator", "type": "address"},
                             {"name": "token0", "type": "address"}, {"name": "token1", "type": "address"},
                             {"name": "fee", "type": "uint24"}, {"name": "tickLower", "type": "int24"},
                             {"name": "tickUpper", "type": "int24"}, {"name": "liquidity", "type": "uint128"},
                             {"name": "feeGrowthInside0LastX128", "type": "uint256"},
                             {"name": "feeGrowthInside1LastX128", "type": "uint256"},
                             {"name": "tokensOwed0", "type": "uint128"}, {"name": "tokensOwed1", "type": "uint128"}]},
            ]
            pm = self.provider.eth.contract(
                address=Web3.to_checksum_address(POSITION_MANAGER), abi=pm_abi
            )
            nft_count = pm.functions.balanceOf(address).call()
            for i in range(nft_count):
                token_id = pm.functions.tokenOfOwnerByIndex(address, i).call()
                pos = pm.functions.positions(token_id).call()
                results["positions"].append({
                    "tokenId": str(token_id),
                    "token0": pos[2], "token1": pos[3],
                    "liquidity": str(pos[7]), "fee": pos[4],
                })
        except Exception as e:
            print(f"❌ [LP Manager] Balance fetch failed: {e}")
        return results

    def _approve_token(self, token_address: str, amount: str):
        if token_address.lower() == ADDRESS_MAP["ETH"].lower():
            return
        print(f"🔓 [LP Manager] Approving token: {token_address}")
        erc20_abi = [{"name": "approve", "type": "function", "stateMutability": "nonpayable",
                      "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
                      "outputs": [{"name": "", "type": "bool"}]}]
        contract = self.provider.eth.contract(
            address=Web3.to_checksum_address(token_address), abi=erc20_abi
        )
        decimals = 6 if token_address.lower() == ADDRESS_MAP["USDC"].lower() else 18
        amount_units = int(float(amount) * 10**decimals)
        owner = self.signer.address
        tx = contract.functions.approve(
            Web3.to_checksum_address(POSITION_MANAGER), amount_units
        ).build_transaction({
            "from": owner, "nonce": self.provider.eth.get_transaction_count(owner),
            "gas": 100000, "gasPrice": self.provider.eth.gas_price,
        })
        signed = self.signer.sign_transaction(tx)
        self.provider.eth.wait_for_transaction_receipt(
            self.provider.eth.send_raw_transaction(signed.raw_transaction)
        )

    def _mock_mint(self, params: LPParams) -> LPResult:
        print(f"🎭 [LP Manager] DRY-RUN: Simulated LP deposit of {params.amountA} {params.tokenA} + {params.amountB} {params.tokenB}")
        return LPResult(txHash="0x_mock_mint_hash", tokenId="404", status="success")

    def _mock_withdraw(self, token_id: str) -> LPResult:
        print(f"🎭 [LP Manager] DRY-RUN: Simulated LP withdrawal for position {token_id}")
        return LPResult(txHash="0x_mock_withdraw_hash", status="success")
