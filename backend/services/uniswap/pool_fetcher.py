"""
Live pool fetcher — pulls real TVL/volume data from each protocol's public API.
No API keys required for any of these endpoints.
"""
import requests
from typing import List
from .screener import PoolCandidate

TIMEOUT = 10


# ── Uniswap v3 ────────────────────────────────────────────────────────────────
# Uses The Graph's hosted service (free, no key)
UNISWAP_GRAPH = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"

UNISWAP_QUERY = """
{
  pools(
    first: 20
    orderBy: totalValueLockedUSD
    orderDirection: desc
    where: { totalValueLockedUSD_gt: "5000000" }
  ) {
    id
    token0 { symbol }
    token1 { symbol }
    feeTier
    totalValueLockedUSD
    volumeUSD
    poolDayData(first: 1, orderBy: date, orderDirection: desc) {
      volumeUSD
    }
  }
}
"""


def fetch_uniswap_pools() -> List[PoolCandidate]:
    try:
        resp = requests.post(UNISWAP_GRAPH, json={"query": UNISWAP_QUERY}, timeout=TIMEOUT)
        pools = resp.json()["data"]["pools"]
        result = []
        for p in pools:
            vol24h = float(p["poolDayData"][0]["volumeUSD"]) if p["poolDayData"] else 0
            result.append(PoolCandidate(
                name=f"{p['token0']['symbol']}/{p['token1']['symbol']}",
                tokenA=p["token0"]["symbol"],
                tokenB=p["token1"]["symbol"],
                poolAddress=p["id"],
                chain="ethereum",
                tvl=float(p["totalValueLockedUSD"]),
                volume24h=vol24h,
                fee=float(p["feeTier"]) / 10000,
                notes="Uniswap v3",
            ))
        return result
    except Exception as e:
        print(f"⚠️  [Uniswap fetcher] {e}")
        return []


# ── Curve Finance ─────────────────────────────────────────────────────────────
# Curve's own public REST API
CURVE_API = "https://api.curve.fi/api/getPools/ethereum/main"


def fetch_curve_pools() -> List[PoolCandidate]:
    try:
        resp = requests.get(CURVE_API, timeout=TIMEOUT)
        data = resp.json()["data"]["poolData"]
        result = []
        for p in data:
            coins = p.get("coins", [])
            if len(coins) < 2:
                continue
            sym_a = coins[0].get("symbol", "?")
            sym_b = coins[1].get("symbol", "?")
            tvl = float(p.get("usdTotal", 0))
            if tvl < 1_000_000:
                continue
            result.append(PoolCandidate(
                name=p.get("name", f"{sym_a}/{sym_b}"),
                tokenA=sym_a,
                tokenB=sym_b,
                poolAddress=p.get("address"),
                chain="ethereum",
                tvl=tvl,
                volume24h=float(p.get("volumeUSD", 0)),
                fee=float(p.get("fee", "0.04").replace("%", "")) if isinstance(p.get("fee"), str) else float(p.get("fee", 0.04)),
                notes="Curve Finance",
            ))
        # Return top 5 by TVL
        result.sort(key=lambda x: x.tvl or 0, reverse=True)
        return result[:5]
    except Exception as e:
        print(f"⚠️  [Curve fetcher] {e}")
        return []


# ── Aave v3 ───────────────────────────────────────────────────────────────────
# Aave's public REST API
AAVE_API = "https://aave-api-v2.aave.com/data/markets-data"


def fetch_aave_pools() -> List[PoolCandidate]:
    try:
        resp = requests.get(AAVE_API, timeout=TIMEOUT)
        markets = resp.json().get("v3", {})
        result = []
        for market_key, market in markets.items():
            for reserve in market.get("reserves", []):
                symbol = reserve.get("symbol", "?")
                tvl = float(reserve.get("totalLiquidityUSD", 0))
                if tvl < 5_000_000:
                    continue
                supply_apy = float(reserve.get("supplyAPY", 0)) * 100
                result.append(PoolCandidate(
                    name=f"{symbol} (Aave v3)",
                    tokenA=symbol,
                    tokenB=f"a{symbol}",
                    chain="ethereum",
                    tvl=tvl,
                    volume24h=0,
                    fee=0.0,
                    notes="Aave v3",
                ))
        result.sort(key=lambda x: x.tvl or 0, reverse=True)
        return result[:5]
    except Exception as e:
        print(f"⚠️  [Aave fetcher] {e}")
        return []


# ── Morpho Blue ───────────────────────────────────────────────────────────────
MORPHO_GRAPH = "https://blue-api.morpho.org/graphql"

MORPHO_QUERY = """
{
  markets(first: 10, orderBy: { field: TotalSupplyUsd, direction: Desc }) {
    items {
      uniqueKey
      loanAsset { symbol }
      collateralAsset { symbol }
      state { supplyApy totalSupplyUsd }
    }
  }
}
"""


def fetch_morpho_pools() -> List[PoolCandidate]:
    try:
        resp = requests.post(MORPHO_GRAPH, json={"query": MORPHO_QUERY}, timeout=TIMEOUT)
        items = resp.json()["data"]["markets"]["items"]
        result = []
        for m in items:
            loan = m["loanAsset"]["symbol"]
            coll = (m.get("collateralAsset") or {}).get("symbol", "ETH")
            tvl = float(m["state"].get("totalSupplyUsd", 0))
            if tvl < 1_000_000:
                continue
            result.append(PoolCandidate(
                name=f"{loan} (Morpho)",
                tokenA=loan,
                tokenB=f"m{loan}",
                chain="ethereum",
                tvl=tvl,
                volume24h=0,
                fee=0.0,
                notes="Morpho Blue",
            ))
        return result[:3]
    except Exception as e:
        print(f"⚠️  [Morpho fetcher] {e}")
        return []


# ── Master fetcher ────────────────────────────────────────────────────────────
FETCHERS = {
    "Uniswap v3":   fetch_uniswap_pools,
    "Curve Finance": fetch_curve_pools,
    "Aave v3":      fetch_aave_pools,
    "Morpho Blue":  fetch_morpho_pools,
}

# Fallback static data used when all live fetches fail
STATIC_FALLBACK = [
    PoolCandidate(name='USDC/DAI',              tokenA='USDC', tokenB='DAI',   tvl=42_000_000,    volume24h=8_400_000,  fee=0.05, chain='ethereum', notes='Uniswap v3'),
    PoolCandidate(name='USDT/USDC',             tokenA='USDT', tokenB='USDC',  tvl=280_000_000,   volume24h=42_000_000, fee=0.01, chain='ethereum', notes='Uniswap v3'),
    PoolCandidate(name='WETH/USDC 0.05%',       tokenA='WETH', tokenB='USDC',  tvl=310_000_000,   volume24h=91_000_000, fee=0.05, chain='ethereum', notes='Uniswap v3'),
    PoolCandidate(name='3pool (USDC/USDT/DAI)', tokenA='USDC', tokenB='USDT',  tvl=420_000_000,   volume24h=38_000_000, fee=0.04, chain='ethereum', notes='Curve Finance'),
    PoolCandidate(name='FRAX/USDC',             tokenA='FRAX', tokenB='USDC',  tvl=95_000_000,    volume24h=9_800_000,  fee=0.04, chain='ethereum', notes='Curve Finance'),
    PoolCandidate(name='USDC (Aave v3)',         tokenA='USDC', tokenB='aUSDC', tvl=1_200_000_000, volume24h=0,          fee=0.0,  chain='ethereum', notes='Aave v3'),
    PoolCandidate(name='DAI (Aave v3)',          tokenA='DAI',  tokenB='aDAI',  tvl=380_000_000,   volume24h=0,          fee=0.0,  chain='ethereum', notes='Aave v3'),
    PoolCandidate(name='USDC (Morpho)',          tokenA='USDC', tokenB='mUSDC', tvl=62_000_000,    volume24h=0,          fee=0.0,  chain='ethereum', notes='Morpho Blue'),
]


def fetch_live_pools(sources: list) -> tuple[List[PoolCandidate], bool]:
    """
    Fetch pools from all requested sources in parallel.
    Returns (pools, is_live) where is_live=False means static fallback was used.
    """
    import concurrent.futures

    results: List[PoolCandidate] = []
    with concurrent.futures.ThreadPoolExecutor() as ex:
        futures = {ex.submit(FETCHERS[s]): s for s in sources if s in FETCHERS}
        for future in concurrent.futures.as_completed(futures):
            results.extend(future.result())

    if not results:
        print("⚠️  All live fetches failed — using static fallback pool list")
        fallback = [p for p in STATIC_FALLBACK if (p.notes or '') in sources] or STATIC_FALLBACK
        return fallback, False

    return results, True
