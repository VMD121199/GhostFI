import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { AGENTS_DB } from '../data/agents'

const AGENTS = AGENTS_DB.filter(a => !a.myAgent)
const SECTORS = ['All', 'Stablecoin', 'Lending', 'Restaking', 'RWA', 'Liquidity']

export default function Marketplace() {
  const { page, showPage, resetCreate, forkAgent, walletConnected, setWalletModalOpen, openInft } = useApp()
  const [activeSector, setActiveSector] = useState('All')

  const filtered = activeSector === 'All' ? AGENTS : AGENTS.filter(a => a.sector === activeSector)

  if (page !== 'marketplace') return null

  return (
    <div className="page active" style={{ paddingTop: 60 }}>
      <div className="page-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div className="page-title">Marketplace</div>
            <div className="page-sub">Browse and fork AI strategy agents — click any card to view its iNFT page</div>
          </div>
          <button className="btn btn-md btn-white" onClick={() => {
            if (walletConnected) { showPage('create'); resetCreate() }
            else setWalletModalOpen(true)
          }}>
            + Deploy agent
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card"><div className="sc-label">Total TVL</div><div className="sc-val">$4.2M</div><div className="sc-sub">+$182K today</div></div>
          <div className="stat-card"><div className="sc-label">Active agents</div><div className="sc-val">247</div><div className="sc-sub">+12 this week</div></div>
          <div className="stat-card"><div className="sc-label">Avg 7d yield</div><div className="sc-val green">+8.4%</div><div className="sc-sub green">vs +2.1% manual</div></div>
        </div>

        {/* Token / Protocol strip */}
        <div className="token-strip">
          <span className="ts-label">Tokens</span>
          <span className="ts-tok"><img src="https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png" alt="USDC" />USDC</span>
          <span className="ts-tok"><img src="https://s2.coinmarketcap.com/static/img/coins/64x64/825.png" alt="USDT" />USDT</span>
          <span className="ts-tok"><img src="https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png" alt="DAI" />DAI</span>
          <span className="ts-tok"><img src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" alt="ETH" />ETH</span>
          <span className="ts-sep">|</span>
          <span className="ts-label">Protocols</span>
          <span className="ts-tok">🦄 Uniswap</span>
          <span className="ts-tok">👻 Aave</span>
          <span className="ts-tok">〜 Curve</span>
          <span className="ts-tok">🔷 Morpho</span>
        </div>

        <div className="section-label">Sectors</div>
        <div className="chips-row">
          {SECTORS.map(s => (
            <button key={s} className={`chip ${activeSector === s ? 'active' : ''}`} onClick={() => setActiveSector(s)}>{s}</button>
          ))}
        </div>

        <div className="agent-grid">
          {filtered.map(agent => (
            <div key={agent.name} className="agent-card" onClick={() => openInft(agent)}>
              <div className="ac-top">
                <div className="ac-row">
                  <div>
                    <div className="ac-name">
                      <span style={{ fontSize: 20 }}>{agent.emoji}</span>
                      {agent.name}
                    </div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <span className="badge badge-gray">{agent.sector}</span>
                      {agent.inft && <span className="badge badge-pink">iNFT {agent.inft}</span>}
                      {agent.isArena1 && <span className="badge badge-pink">Arena #1</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`ac-yield ${agent.pos ? 'pos' : 'neg'}`}>{agent.yield}</div>
                    <div className="ac-yield-lbl">7d yield</div>
                  </div>
                </div>
                <div className="ac-desc">{agent.desc}</div>
              </div>
              <div className="ac-bottom">
                <div className="ac-meta">TVL <span>{agent.tvl}</span> · Copies <span>{agent.copies}</span></div>
                <button
                  className={`btn btn-sm ${agent.isArena1 ? 'btn-white' : 'btn-ghost'}`}
                  onClick={(e) => { e.stopPropagation(); forkAgent(agent.name, agent.sector, agent.emoji) }}
                >Fork →</button>
              </div>
            </div>
          ))}

          {/* Deploy card */}
          <div className="agent-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 148, boxShadow: 'var(--neu-in)' }}
            onClick={() => { showPage('create'); resetCreate() }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, opacity: .15, marginBottom: 7 }}>+</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.05em', textTransform: 'uppercase' }}>Deploy your agent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
