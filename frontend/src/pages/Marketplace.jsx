import { useState } from 'react'
import { useApp } from '../context/AppContext'

const AGENTS = [
  { emoji: '🌊', name: 'StableMax v2', sector: 'Stablecoin', yield: '+14.2%', pos: true, tvl: '$820K', copies: 312, desc: 'Rotates between USDC/USDT/DAI pools using verifiable AI inference on 0G Compute.', top: true },
  { emoji: '🏦', name: 'LendLoop Alpha', sector: 'Lending', yield: '+11.8%', pos: true, tvl: '$1.1M', copies: 198, desc: 'Monitors Aave, Compound, Morpho supply rates. Auto-compounds daily rewards.' },
  { emoji: '🔄', name: 'ReStake Pro', sector: 'Restaking', yield: '+9.3%', pos: true, tvl: '$540K', copies: 87, desc: 'EigenLayer AVS restaking with AI operator risk scoring every 6 hours.' },
  { emoji: '🏠', name: 'RWA Harvester', sector: 'RWA', yield: '+7.6%', pos: true, tvl: '$290K', copies: 54, desc: 'Tokenized T-bill and real-world asset yield optimization across protocols.' },
  { emoji: '📉', name: 'BearGuard', sector: 'Stablecoin', yield: '−1.2%', pos: false, tvl: '$88K', copies: 12, desc: 'Defensive stablecoin agent. Underperforming this week due to pool rebalancing event.' },
]

const SECTORS = ['All', 'Stablecoin', 'Lending', 'Restaking', 'RWA', 'Liquidity']

export default function Marketplace() {
  const { page, showPage, resetCreate, forkAgent } = useApp()
  const [activeSector, setActiveSector] = useState('All')

  const filtered = activeSector === 'All' ? AGENTS : AGENTS.filter(a => a.sector === activeSector)

  if (page !== 'marketplace') return null

  return (
    <div className="page active" style={{ paddingTop: 60 }}>
      <div className="page-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div className="page-title">Marketplace</div>
            <div className="page-sub">Browse and fork AI strategy agents across all DeFi sectors</div>
          </div>
          <button className="btn btn-md btn-white" onClick={() => { showPage('create'); resetCreate() }}>
            + Deploy agent
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="sc-label">Total TVL</div>
            <div className="sc-val">$4.2M</div>
            <div className="sc-sub">+$182K today</div>
          </div>
          <div className="stat-card">
            <div className="sc-label">Active agents</div>
            <div className="sc-val">247</div>
            <div className="sc-sub">+12 this week</div>
          </div>
          <div className="stat-card">
            <div className="sc-label">Avg 7d yield</div>
            <div className="sc-val green">+8.4%</div>
            <div className="sc-sub" style={{ color: 'var(--green)' }}>vs +2.1% manual</div>
          </div>
        </div>

        <div className="section-label">Sectors</div>
        <div className="chips-row">
          {SECTORS.map(s => (
            <button key={s} className={`chip ${activeSector === s ? 'active' : ''}`} onClick={() => setActiveSector(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="agent-grid">
          {filtered.map(agent => (
            <div key={agent.name} className="agent-card">
              <div className="ac-top">
                <div className="ac-row">
                  <div>
                    <div className="ac-name">
                      <span style={{ fontSize: 20 }}>{agent.emoji}</span>
                      {agent.name}
                    </div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <span className="badge">{agent.sector}</span>
                      {agent.top && <span className="badge badge-pink">Arena #1</span>}
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
                  className={`btn btn-sm ${agent.top ? 'btn-white' : 'btn-ghost'}`}
                  onClick={() => forkAgent(agent.name, agent.sector, agent.emoji)}
                >
                  Fork →
                </button>
              </div>
            </div>
          ))}

          {/* Deploy card */}
          <div className="agent-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 148, boxShadow: 'var(--neu-in)' }}
            onClick={() => { showPage('create'); resetCreate() }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, opacity: .15, marginBottom: 7 }}>+</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                Deploy your agent
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
