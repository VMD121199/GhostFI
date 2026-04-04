"""
Simple file-backed agent store.
Persists deployed agents across Flask restarts without a database.
"""
import json
import os
from datetime import datetime

STORE_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'agents.json')


def _load() -> list:
    os.makedirs(os.path.dirname(STORE_PATH), exist_ok=True)
    if not os.path.exists(STORE_PATH):
        return []
    try:
        with open(STORE_PATH) as f:
            return json.load(f)
    except Exception:
        return []


def _save(agents: list):
    os.makedirs(os.path.dirname(STORE_PATH), exist_ok=True)
    with open(STORE_PATH, 'w') as f:
        json.dump(agents, f, indent=2)


def save_agent(agent: dict):
    """Append a newly deployed agent to the store."""
    agents = _load()
    # Avoid duplicates by tokenId
    agents = [a for a in agents if a.get('tokenId') != agent.get('tokenId')]
    agent['savedAt'] = datetime.now().isoformat()
    agents.insert(0, agent)
    _save(agents)


def get_agents(owner_address: str = None) -> list:
    """
    Return all agents, optionally filtered by owner address.
    Also tries to enrich with on-chain tokenURI data.
    """
    agents = _load()
    if owner_address:
        addr = owner_address.lower()
        agents = [a for a in agents if (a.get('owner') or '').lower() == addr]
    return agents


def enrich_from_chain(agents: list) -> list:
    """
    Try to fetch latest tokenURI from Hedera EVM for each agent.
    Silently skips if RPC is unreachable.
    """
    import os
    from web3 import Web3

    rpc = os.environ.get('ZG_RPC_URL') or os.environ.get('HEDERA_JSON_RPC_URL')
    contract_addr = os.environ.get('INFT_CONTRACT_ADDRESS')
    if not rpc or not contract_addr:
        return agents

    try:
        w3 = Web3(Web3.HTTPProvider(rpc, request_kwargs={'timeout': 5}))
        if not w3.is_connected():
            return agents
        abi = [
            {"name": "tokenURI", "type": "function", "stateMutability": "view",
             "inputs": [{"name": "tokenId", "type": "uint256"}],
             "outputs": [{"name": "", "type": "string"}]},
        ]
        contract = w3.eth.contract(address=Web3.to_checksum_address(contract_addr), abi=abi)
        for agent in agents:
            try:
                token_id = int(agent.get('tokenId', 0))
                uri = contract.functions.tokenURI(token_id).call()
                agent['metadataUri'] = uri
                agent['onChain'] = True
            except Exception:
                agent['onChain'] = False
    except Exception:
        pass

    return agents
