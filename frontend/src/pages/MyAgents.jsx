import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { AGENTS_DB } from '../data/agents'

const MY_AGENTS = [
  { ...AGENTS_DB.find(a => a.name === 'StableMax v2'),   status: 'on',   statusLabel: 'Running',   copies: 312 },
  { ...AGENTS_DB.find(a => a.name === 'LendLoop Alpha'), status: 'on',   statusLabel: 'Running',   copies: 198 },
  { ...AGENTS_DB.find(a => a.name === 'GhostStake v1'), status: 'warn', statusLabel: 'Verifying', copies: 'new' },
]

const BAR_HEIGHTS = [38, 52, 47, 68, 60, 82, 100]

export default function MyAgents() {
  const { page, showPage, resetCreate, openInft, myAgents, walletAddress } = useApp()
  const [apiAgents, setApiAgents] = useState([])

  useEffect(() => {
    if (page !== 'myagents') return
    const url = walletAddress
      ? `https://ghostfi-1.onrender.com/api/agents?address=${walletAddress}`
      : 'https://ghostfi-1.onrender.com/api/agents'
    fetch(url)
      .then(r => r.json())
      .then(data => { if (data.agents) setApiAgents(data.agents) })
      .catch(() => {})
  }, [page, walletAddress])

  if (page !== 'myagents') return null

  // API agents take priority, then context (optimistic), then static demo data
  const allAgents = apiAgents.length > 0
    ? apiAgents
    : [...myAgents, ...MY_AGENTS]

  return (
    <div className="page active" style={{ paddingTop: 60 }}>
      <div className="page-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div className="page-title">My agents</div>
            <div className="page-sub">0xGhost.eth · 3 active agents · click any card to view its iNFT page</div>
          </div>
          <button className="btn btn-md btn-white" onClick={() => { showPage('create'); resetCreate() }}>
            + New agent
          </button>
        </div>

        {/* 4-stat dashboard */}
        <div className="dgrid">
          <div className="dcrd">
            <div className="dl">Portfolio TVL</div>
            <div className="dv">$2.64M</div>
            <div className="ds green">+$47K today</div>
          </div>
          <div className="dcrd">
            <div className="dl">7d earnings</div>
            <div className="dv green">+$3,847</div>
            <div className="ds green">+12.4% vs last week</div>
          </div>
          <div className="dcrd">
            <div className="dl">Total copies</div>
            <div className="dv">510</div>
            <div className="ds green">+42 this week</div>
          </div>
          <div className="dcrd">
            <div className="dl">iNFT royalties</div>
            <div className="dv">$284</div>
            <div className="ds green">+$18 today</div>
          </div>
        </div>

        {/* Earnings panel */}
        <div className="ep">
          <div className="er">
            <div>
              <div className="section-label">Daily yield — last 7 days</div>
              <div className="eb">+$3,847</div>
              <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4, fontFamily: 'var(--mono)' }}>3 agents · 1,099 trades</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="section-label">Arena ranking</div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, color: 'var(--pink)' }}>#1</div>
              <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 3, fontFamily: 'var(--mono)' }}>Top creator</div>
            </div>
          </div>
          <div className="bc">
            {BAR_HEIGHTS.map((h, i) => (
              <div key={i} className={`bar ${i === BAR_HEIGHTS.length - 1 ? 'tdy' : ''}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="section-label" style={{ marginBottom: 14 }}>Active agents</div>
        <div className="mygrid">
          {allAgents.map(agent => (
            <div key={agent.name} className="mac" onClick={() => openInft(agent)}>
              <div className="mh">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="mav">{agent.emoji}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{agent.name}</div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <span className="badge badge-gray">{agent.sector}</span>
                      {agent.inft && <span className="badge badge-pink">iNFT {agent.inft}</span>}
                    </div>
                  </div>
                </div>
                <div className="ms2" style={{ color: agent.status === 'on' ? 'var(--green)' : 'var(--amber)' }}>
                  <span className={`sdot ${agent.status}`} />
                  {agent.statusLabel}
                </div>
              </div>
              <div className="mb">
                <div><div className="msl">7d yield</div><div className={`msv ${agent.pos ? 'green' : 'red'}`}>{agent.yield}</div></div>
                <div><div className="msl">TVL</div><div className="msv">{agent.tvl}</div></div>
                <div><div className="msl">Copies</div><div className="msv" style={{ color: agent.copies === 'new' ? 'var(--t3)' : 'var(--white)' }}>{agent.copies}</div></div>
              </div>
              <div className="mf" onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => openInft(agent)}>iNFT page</button>
                <button className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                  {agent.status === 'warn' ? 'Resume' : 'Pause'}
                </button>
                <button className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: 'center', color: 'var(--red)' }}>Stop</button>
              </div>
            </div>
          ))}

          {/* Add card */}
          <div className="mac" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160, boxShadow: 'var(--neu-in)', cursor: 'pointer' }}
            onClick={() => { showPage('create'); resetCreate() }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, opacity: .15, marginBottom: 7 }}>+</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                Deploy new agent
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
