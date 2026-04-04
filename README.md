# GhostFI

GhostFI is a prototype for verifiable AI DeFi agents.

It combines pool discovery, AI-driven strategy selection, proof-backed metadata, and an agent marketplace into one product experience. The goal is simple: let users create, own, fork, and monitor DeFi agents that can scan yield opportunities and execute onchain logic with a transparent audit trail.

## What GhostFI is

GhostFI turns a DeFi strategy into an ownable agent.

A user can:
- scan pools and markets across multiple protocols
- review AI-ranked opportunities
- deploy a strategy agent
- mint that agent as an iNFT
- list or fork agents in a marketplace
- compare live performance in an arena leaderboard

The project is currently a prototype / hackathon-style codebase with both live integrations and demo data.

## Why GhostFI

DeFi is fragmented, fast-moving, and difficult to monitor manually.

GhostFI is built around three ideas:

1. AI agents should do the repetitive work  
   Agents watch pools, compare opportunities, and recommend actions faster than a human can.

2. Agent actions should be verifiable  
   Strategy outputs, metadata, and execution references should be traceable instead of opaque.

3. Great strategies should be ownable and reusable  
   A strong agent should not just be a script. It should be something users can mint, showcase, fork, and improve.

## Core experience

GhostFI is designed around this flow:

1. Choose a strategy sector  
   Stablecoin, lending, restaking, RWA, liquidity, and more.

2. Configure the agent  
   Define parameters such as target yield, drawdown tolerance, model preferences, and source selection.

3. Scan live opportunities  
   Pull pool / market data from supported protocols.

4. Rank opportunities with AI  
   Compare candidates and surface the best pool or market based on yield, liquidity, fees, and risk.

5. Deploy the strategy agent  
   Store agent context and strategy metadata, then prepare the execution path.

6. Mint the agent as an iNFT  
   Attach identity, proof metadata, and marketplace presence to the strategy.

## How it's made

We built GhostFI as a full-stack prototype with a React + Vite frontend and a Python Flask backend. The frontend handles the agent creation flow, marketplace, arena, and pool detail views, while the backend exposes scan/deploy endpoints and orchestrates DeFi data fetching plus AI-assisted strategy selection.

On the data side, the pool fetcher queries live market data from Uniswap v3, Curve, Aave v3, and Morpho Blue in parallel, then falls back to a static pool set if live APIs fail so the demo never hard-stops. We also wired in a Naryo listener that polls Unichain Sepolia logs with `eth_getLogs` to simulate event-driven market monitoring, and the product flow is framed around 0G-backed verification plus Hedera EVM / iNFT-style agent minting.

One hacky but useful choice was mixing real protocol data with graceful local fallbacks and mock deployment results, which lets us demo the end-to-end UX even when infra or partner endpoints are unstable. The result is a working agent platform that feels live, even though parts of the backend are still intentionally lightweight and modular for rapid iteration.

## Current repository structure

```text
GhostFI/
├── backend/
│   ├── agent/
│   ├── core/
│   ├── services/
│   │   ├── ai/
│   │   ├── chainlink/
│   │   ├── naryo/
│   │   ├── uniswap/
│   │   └── zero_g/
│   ├── tools/
│   ├── app.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── data/
    │   ├── images/
    │   └── pages/
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Frontend

The frontend is a React + Vite app for the GhostFI product experience.

Main screens include:
- Landing
- Marketplace
- Create Agent
- Pool Detail
- My Agents
- Arena
- iNFT Detail

The current UI already models:
- marketplace browsing
- agent forking
- pool detail inspection
- arena rankings
- create-agent flow
- iNFT-oriented agent presentation

## Backend

The backend is a Python service layer built around Flask, Web3, and protocol-specific modules.

It includes modules for:
- agent orchestration
- privacy routing
- 0G-backed inference / storage helpers
- Uniswap execution and pool screening
- Chainlink validation workflow
- Naryo event listening / correlation
- AI provider adapters

## Integrations in the repo

GhostFI currently includes code or UX hooks for:

- 0G
  - inference / reasoning client
  - storage / memory layer
  - proof-linked strategy metadata
  - iNFT-related backend modules

- Uniswap and DeFi market sources
  - Uniswap v3
  - Curve Finance
  - Aave v3
  - Morpho Blue

- Chainlink
  - price validation workflow before execution

- Naryo / Unichain-style event flow
  - pool-event listening
  - event correlation into a market “story”

- Hedera-facing iNFT UX
  - the create flow and product language already position agent minting around a Hedera EVM experience

## Tech stack

Frontend
- React
- Vite
- JavaScript
- CSS

Backend
- Python
- Flask
- Flask-RESTful
- Flask-CORS
- Web3.py
- Requests
- python-dotenv

AI / model connectors in repo
- Groq
- OpenAI
- Google Gemini

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/VMD121199/GhostFI.git
cd GhostFI
```

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Install backend dependencies

```bash
cd ../backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

On Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Environment variables

Create a `.env` file in `backend/` and add the values you need for your setup.

Example:

```env
DRY_RUN=true

# AI / 0G
ZG_COMPUTE_URL=
ZG_INDEXER_URL=
ZG_RPC_URL=
ZG_PRIVATE_KEY=
INFT_CONTRACT_ADDRESS=
AGENT_REGISTRY_ADDRESS=
AGENT_ADDRESS=

# DeFi / execution
ETHEREUM_RPC_URL=
UNICHAIN_RPC_URL=
STRATEGY_VAULT_ADDRESS=
PRIVACY_VAULT_ADDRESS=

# Optional model providers
GROQ_API_KEY=
OPENAI_API_KEY=
GOOGLE_API_KEY=
```

## Notes on the current state

This repository is best understood as a prototype in active construction.

Right now:
- the frontend experience is the most visible / complete part
- backend integrations exist as service modules
- some frontend content is still driven by local demo data
- the top-level Flask app is still minimal and should be expanded into proper API routes
- parts of the cross-chain mint / proof story still need consolidation into one production-ready flow

That is normal for a hackathon or early-stage prototype.

## How GhostFI works conceptually

GhostFI follows this high-level loop:

1. Listen to market or pool events  
2. Correlate those events into a market story  
3. Pull historical or contextual memory  
4. Rank / reason over the opportunity with AI  
5. Validate the strategy with policy + price checks  
6. Execute or route the action  
7. Store metadata / proof references  
8. Surface the result in the UI, marketplace, and arena

## Example use cases

- Stablecoin rotation agents  
  Move between pools when yield and liquidity conditions improve.

- Lending optimization agents  
  Compare Aave / Morpho-style opportunities and shift capital accordingly.

- Liquidity agents  
  Identify attractive LP conditions and automate concentrated liquidity strategies.

- Competitive agent marketplace  
  Publish an agent, let others inspect it, and allow them to fork or copy the idea.

## Roadmap

Short-term
- add real backend API routes for pool scan, deploy, and marketplace actions
- replace remaining local mock data with backend responses
- standardize the deploy / mint / proof flow
- add wallet and transaction state handling end-to-end

Mid-term
- complete production-grade strategy execution
- improve proof UX and explorer links
- add better analytics for agent performance
- support richer fork / royalty mechanics for iNFT agents

Long-term
- multi-chain agent execution
- stronger private execution guarantees
- fully onchain agent registry and performance attestations
- creator economy for reusable trading agents

## Screenshots

Add screenshots or GIFs here once the UI is stable:
- landing page
- marketplace
- create-agent flow
- pool detail page
- arena leaderboard
- iNFT detail page

## License

License: TBD

## Acknowledgments

GhostFI brings together ideas from:
- DeFi automation
- agentic AI
- onchain verification
- iNFT / programmable identity
- cross-chain developer tooling
