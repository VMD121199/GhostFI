import { useApp } from '../context/AppContext'
import { AGENTS_DB } from '../data/agents'

const MY_AGENTS = [
  { ...AGENTS_DB.find(a => a.name === 'StableMax v2'),  status: 'on',   statusLabel: 'Live',      copies: 312 },
  { ...AGENTS_DB.find(a => a.name === 'LendLoop Alpha'), status: 'on',   statusLabel: 'Live',      copies: 198 },
  { ...AGENTS_DB.find(a => a.name === 'GhostStake v1'), status: 'warn', statusLabel: 'Verifying', copies: 'new' },
]

export default function MyAgents() {
  const { page, showPage, resetCreate, openInft } = useApp()

  if (page !== 'myagents') return null

  return (
    <div className="page active" style={{ paddingTop: 60 }}>
      <div className="page-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div className="page-title">My agents</div>
            <div className="page-sub">Manage your deployed DeFi strategy agents</div>
          </div>
          <button className="btn btn-md btn-white" onClick={() => { showPage('create'); resetCreate() }}>
            + Deploy agent
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="sc-label">My agents</div>
            <div className="sc-val">3</div>
            <div className="sc-sub">2 live · 1 verifying</div>
          </div>
          <div className="stat-card">
            <div className="sc-label">My TVL</div>
            <div className="sc-val">$2.64M</div>
            <div className="sc-sub">+$64K today</div>
          </div>
          <div className="stat-card">
            <div className="sc-label">Avg yield</div>
            <div className="sc-val green">+11.4%</div>
            <div className="sc-sub" style={{ color: 'var(--green)' }}>this week</div>
          </div>
        </div>

        <div className="mac-grid">
          {MY_AGENTS.map(agent => (
            <div key={agent.name} className="mac" style={{ cursor: 'pointer' }} onClick={() => openInft(agent)}>
              <div className="mac-head">
                <div className="mac-id">
                  <div className="mac-em">{agent.emoji}</div>
                  <div>
                    <div className="mac-name">{agent.name}</div>
                    <div className="mac-sub">{agent.sector}</div>
                  </div>
                </div>
                <div className="mac-status" style={{ color: agent.status === 'on' ? 'var(--green)' : 'var(--amber)' }}>
                  <span className={`sdot ${agent.status}`} />
                  {agent.statusLabel}
                </div>
              </div>
              <div className="mac-body">
                <div>
                  <div className="mac-sl">7d yield</div>
                  <div className="mac-sv green">{agent.yield}</div>
                </div>
                <div>
                  <div className="mac-sl">TVL</div>
                  <div className="mac-sv">{agent.tvl}</div>
                </div>
                <div>
                  <div className="mac-sl">Copies</div>
                  <div className="mac-sv" style={{ color: agent.copies === 'new' ? 'var(--t3)' : 'var(--white)' }}>
                    {agent.copies}
                  </div>
                </div>
              </div>
              <div className="mac-ftr" onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Logs</button>
                <button className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Pause</button>
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
