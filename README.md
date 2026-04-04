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