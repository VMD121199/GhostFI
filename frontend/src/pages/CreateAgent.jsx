import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'

const SECTORS = [
  { icon: '💵', name: 'Stablecoin', desc: 'Optimize yield across USDC, USDT, DAI pools. Low risk, continuous rebalancing via Uniswap v3.' },
  { icon: '🏦', name: 'Lending', desc: 'Supply to Aave, Compound, Morpho for optimal lending rates.' },
  { icon: '🔄', name: 'Restaking', desc: 'EigenLayer AVS restaking with AI-scored operator risk.' },
  { icon: '🏠', name: 'RWA', desc: 'Tokenized T-bills and real-world asset yield.' },
  { icon: '💧', name: 'Liquidity', desc: 'Concentrated liquidity ranges. Dynamic fee tier optimization.' },
  { icon: '📈', name: 'Yield', desc: 'Multi-strategy yield aggregator.' },
]

const EMOJIS = ['🌊','🔥','⚡','🦊','🐉','🤖','💎','🦁','🌙','⚔️','🎯','🧠','🏹','🦅','👻','💀']

const KITS = [
  { icon: '🧠', name: '0G Compute', sub: 'Verifiable inference' },
  { icon: '⚡', name: 'Hedera Agent Kit', sub: 'On-chain execution' },
  { icon: '🔀', name: 'Uniswap API', sub: 'Routing + liquidity' },
  { icon: '🌐', name: 'Web3 Data', sub: 'On-chain analytics' },
  { icon: '🔗', name: 'Chainlink', sub: 'Price feeds + VRF' },
  { icon: '📊', name: 'DeFiLlama', sub: 'TVL + protocol data' },
]

const INTERVALS = ['1m','5m','15m','1h','4h','24h']

const SCAN_LINES = [
  {t:'00:00',m:'Initialising 0G Compute node...',c:''},
  {t:'00:01',m:'Connecting to Uniswap v3 pool API...',c:''},
  {t:'00:03',m:'Fetching 247 stablecoin pools...',c:''},
  {t:'00:07',m:'Running verifiable inference on 0G...',c:'hi'},
  {t:'00:12',m:'USDC/DAI — 8.3% APY · risk 2.1/10',c:'ok'},
  {t:'00:14',m:'USDT/USDC — 6.1% APY · risk 1.8/10',c:''},
  {t:'00:15',m:'DAI/FRAX — 5.7% APY · risk 2.4/10',c:''},
  {t:'00:18',m:'Competitor agent activity detected',c:'warn'},
  {t:'00:21',m:'Proof hash posted: 0x4f2a…c831',c:'hi'},
  {t:'00:22',m:'Scan complete. Best pool identified.',c:'ok'},
]

const STEP_LABELS = ['Sector','Configure','Agent kit','Scan','AI strategy','Mint iNFT']

export default function CreateAgent() {
  const {
    page, showPage,
    createStep, setCreateStep,
    agentSector, setAgentSector,
    agentEmoji, setAgentEmoji,
    agentName, setAgentName,
    agentDesc, setAgentDesc,
    agentCapital, setAgentCapital,
    agentRisk, setAgentRisk,
    agentInterval, setAgentInterval,
    agentKits, toggleKit,
    resetCreate, forkAgent,
  } = useApp()

  const [scanLines, setScanLines] = useState([])
  const [scanDone, setScanDone] = useState(false)
  const [scanCount, setScanCount] = useState('0')
  const [scanBest, setScanBest] = useState('—')
  const [scanVerified, setScanVerified] = useState('—')
  const [scanStatus, setScanStatus] = useState('Ready to scan')
  const [deployed, setDeployed] = useState(false)
  const scanRef = useRef(null)

  if (page !== 'create') return null

  const selectedSector = SECTORS.find(s => s.name === agentSector) || SECTORS[0]

  const goToStep = (n) => {
    if (n > createStep + 1 && createStep < n - 1) return
    setCreateStep(n)
  }

  const startScan = () => {
    setScanLines([])
    setScanDone(false)
    setScanCount('0')
    setScanBest('—')
    setScanVerified('—')
    setScanStatus('Scanning...')
    SCAN_LINES.forEach((line, i) => {
      setTimeout(() => {
        setScanLines(prev => [...prev, line])
        if (i === 4) { setScanCount('247'); setScanBest('8.3%') }
        if (i === SCAN_LINES.length - 1) {
          setScanVerified('Yes · 0G Chain')
          setScanStatus('Done. 247 scanned.')
          setScanDone(true)
        }
      }, i * 270)
    })
  }

  const deploy = () => setDeployed(true)

  if (deployed) {
    return (
      <div className="page active" style={{ paddingTop: 60 }}>
        <div className="page-inner">
          <div className="done-panel">
            <span className="done-em">{agentEmoji}</span>
            <div className="done-title">{agentName || 'StableGhost v1'} is live!</div>
            <div className="done-sub">
              Your agent has been deployed and minted as an iNFT on-chain.<br />
              It's now scanning pools and executing your strategy 24/7.
            </div>
            <div className="done-actions">
              <button className="btn btn-lg btn-white" onClick={() => { setDeployed(false); showPage('myagents') }}>
                View my agents →
              </button>
              <button className="btn btn-lg btn-ghost" onClick={() => { setDeployed(false); showPage('arena') }}>
                Check arena
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page active" style={{ paddingTop: 60 }}>
      <div className="page-inner">
        <div style={{ marginBottom: 24 }}>
          <div className="page-title">Create agent</div>
          <div className="page-sub">Configure and deploy your DeFi strategy agent</div>
        </div>

        {/* Steps bar */}
        <div className="steps-bar">
          {STEP_LABELS.map((label, idx) => {
            const n = idx + 1
            const state = n < createStep ? 'done' : n === createStep ? 'active' : ''
            return (
              <div key={n} className={`cstep ${state}`} onClick={() => goToStep(n)}>
                <div className={`sc-circle`}>
                  {n < createStep ? '✓' : n}
                </div>
                <div className="slabel">{label}</div>
              </div>
            )
          })}
        </div>

        {/* STEP 1: SECTOR */}
        {createStep === 1 && (
          <div className="create-layout">
            <div className="create-main">
              <div className="section-label" style={{ marginBottom: 16 }}>Choose your strategy sector</div>
              <div className="sector-grid">
                {SECTORS.map(s => (
                  <div key={s.name} className={`sopt ${agentSector === s.name ? 'active' : ''}`}
                    onClick={() => setAgentSector(s.name)}>
                    <div className="sopt-icon">{s.icon}</div>
                    <div className="sopt-name">{s.name}</div>
                  </div>
                ))}
              </div>
              <div className="create-nav">
                <button className="btn btn-md btn-white" onClick={() => goToStep(2)}>Next: Configure →</button>
              </div>
            </div>
            <div className="create-side">
              <div className="side-title">Selection</div>
              <div className="sum-row"><span className="sum-key">Sector</span><span className="sum-val">{agentSector}</span></div>
              <div className="neu-divider" />
              <div className="neu-well">
                <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.7 }}>{selectedSector.desc}</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIGURE */}
        {createStep === 2 && (
          <div className="create-layout">
            <div className="create-main">
              <div className="section-label" style={{ marginBottom: 16 }}>Agent identity & configuration</div>
              <div className="field-group">
                <div className="field-label">Agent avatar — choose an emoji</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div className="avatar-preview">{agentEmoji}</div>
                  <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.7 }}>
                    This emoji becomes your agent's identity<br />and iNFT artwork on the marketplace.
                  </div>
                </div>
                <div className="emoji-grid">
                  {EMOJIS.map(e => (
                    <button key={e} className={`emoji-opt ${agentEmoji === e ? 'active' : ''}`}
                      onClick={() => setAgentEmoji(e)}>{e}</button>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <div className="field-label">Agent name *</div>
                <input className="neu-input" type="text" value={agentName}
                  onChange={ev => setAgentName(ev.target.value)} placeholder="e.g. MyStableAgent v1" />
              </div>
              <div className="field-group">
                <div className="field-label">Strategy (natural language)</div>
                <textarea className="neu-input" value={agentDesc}
                  onChange={ev => setAgentDesc(ev.target.value)}
                  placeholder={'Describe your strategy...\ne.g. Scan stablecoin pools every 15 min, rotate to highest APY if delta exceeds 0.5%...'} />
              </div>
              <div className="field-group">
                <div className="field-label">Capital to deploy *</div>
                <input className="neu-input" type="text" value={agentCapital}
                  onChange={ev => setAgentCapital(ev.target.value)} placeholder="e.g. $10,000 USDC" />
              </div>
              <div className="field-group">
                <div className="field-label">Risk level</div>
                <div className="risk-row">
                  {['low','med','high'].map(r => (
                    <button key={r} className={`risk-opt ${agentRisk === r ? 'active' : ''}`}
                      onClick={() => setAgentRisk(r)}>
                      {r === 'low' ? 'Low' : r === 'med' ? 'Medium' : 'High'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="create-nav">
                <button className="btn btn-md btn-ghost" onClick={() => goToStep(1)}>← Back</button>
                <button className="btn btn-md btn-white" onClick={() => goToStep(3)}>Next: Agent kit →</button>
              </div>
            </div>
            <div className="create-side">
              <div className="side-title">Agent preview</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="avatar-preview" style={{ width: 44, height: 44, fontSize: 22 }}>{agentEmoji}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{agentName || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{agentSector}</div>
                </div>
              </div>
              <div className="sum-row"><span className="sum-key">Capital</span><span className="sum-val">{agentCapital || '—'}</span></div>
              <div className="sum-row"><span className="sum-key">Risk</span><span className="sum-val">{agentRisk === 'low' ? 'Low' : agentRisk === 'med' ? 'Medium' : 'High'}</span></div>
            </div>
          </div>
        )}

        {/* STEP 3: AGENT KIT */}
        {createStep === 3 && (
          <div className="create-layout">
            <div className="create-main">
              <div className="section-label" style={{ marginBottom: 16 }}>Agent kit — select intelligence sources</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 18, lineHeight: 1.7 }}>
                Choose which AI agent frameworks and data sources power your agent's decision-making. These configure the inference pipeline.
              </div>
              <div className="field-group">
                <div className="field-label">AI inference layer</div>
                <div className="kit-grid">
                  {KITS.map(k => (
                    <div key={k.name} className={`kit-opt ${agentKits.includes(k.name) ? 'active' : ''}`}
                      onClick={() => toggleKit(k.name)}>
                      <div className="kit-icon">{k.icon}</div>
                      <div>
                        <div className="kit-name">{k.name}</div>
                        <div style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)', marginTop: 2 }}>{k.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="field-group" style={{ marginTop: 20 }}>
                <div className="field-label">Rebalance interval</div>
                <div className="risk-row">
                  {INTERVALS.map(i => (
                    <button key={i} className={`risk-opt ${agentInterval === i ? 'active' : ''}`}
                      onClick={() => setAgentInterval(i)}>{i}</button>
                  ))}
                </div>
              </div>
              <div className="create-nav">
                <button className="btn btn-md btn-ghost" onClick={() => goToStep(2)}>← Back</button>
                <button className="btn btn-md btn-white" onClick={() => goToStep(4)}>Next: Scan →</button>
              </div>
            </div>
            <div className="create-side">
              <div className="side-title">Kit summary</div>
              <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.9 }}>
                {agentKits.length ? agentKits.map(k => <div key={k}>✓ {k}</div>) : <div style={{ color: 'var(--t3)' }}>None selected</div>}
              </div>
              <div className="neu-divider" />
              <div className="sum-row"><span className="sum-key">Interval</span><span className="sum-val">{agentInterval}</span></div>
            </div>
          </div>
        )}

        {/* STEP 4: SCAN */}
        {createStep === 4 && (
          <div className="create-layout">
            <div className="create-main">
              <div className="section-label" style={{ marginBottom: 16 }}>Pool scan — powered by 0G Compute</div>
              <div className="scan-stats">
                <div className="ss-card"><div className="ss-label">Pools scanned</div><div className="ss-val">{scanCount}</div></div>
                <div className="ss-card"><div className="ss-label">Best APY found</div><div className="ss-val" style={{ color: 'var(--green)' }}>{scanBest}</div></div>
                <div className="ss-card"><div className="ss-label">Proof verified</div><div className="ss-val" style={{ fontSize: 10, color: 'var(--blue)' }}>{scanVerified}</div></div>
              </div>
              <div className="scan-terminal" ref={scanRef}>
                <div className="ghost-wm">
                  <div className="ghost-wm-dot" />
                  <div className="ghost-wm-dot" />
                  <div className="ghost-wm-dot" />
                  <span style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)', marginLeft: 6 }}>0g-ghostfi-scanner</span>
                  <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{scanStatus}</span>
                </div>
                {scanLines.map((line, i) => (
                  <div key={i} className="scan-line" style={{ animationDelay: '0s' }}>
                    <span className="st">{line.t}</span>
                    <span className={`sm ${line.c}`}>{line.m}</span>
                  </div>
                ))}
              </div>
              {scanDone && (
                <div className="pool-results">
                  <div className="section-label">Top pools identified</div>
                  {[
                    { pool: 'USDC/DAI', apy: '8.3%', risk: 'risk 2.1/10' },
                    { pool: 'USDT/USDC', apy: '6.1%', risk: 'risk 1.8/10' },
                    { pool: 'DAI/FRAX', apy: '5.7%', risk: 'risk 2.4/10' },
                  ].map(p => (
                    <div key={p.pool} className="pr-row">
                      <span className="pr-pool">{p.pool}</span>
                      <span className="pr-apy">{p.apy} APY</span>
                      <span className="pr-risk">{p.risk}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="create-nav">
                <button className="btn btn-md btn-ghost" onClick={() => goToStep(3)}>← Back</button>
                <button className="btn btn-md btn-green" onClick={startScan}>▶ Run scan</button>
                <button className="btn btn-md btn-white"
                  style={{ opacity: scanDone ? 1 : 0.35, pointerEvents: scanDone ? 'auto' : 'none' }}
                  onClick={() => goToStep(5)}>
                  Next: AI strategy →
                </button>
              </div>
            </div>
            <div className="create-side">
              <div className="side-title">Scan config</div>
              <div className="sum-row"><span className="sum-key">Sector</span><span className="sum-val">{agentSector}</span></div>
              <div className="sum-row"><span className="sum-key">Interval</span><span className="sum-val">{agentInterval}</span></div>
              <div className="sum-row"><span className="sum-key">Kit</span><span className="sum-val">{agentKits[0] || '—'}</span></div>
            </div>
          </div>
        )}

        {/* STEP 5: AI STRATEGY */}
        {createStep === 5 && (
          <div className="create-layout">
            <div className="create-main">
              <div className="section-label" style={{ marginBottom: 16 }}>AI strategy — generated by 0G inference</div>
              <div className="ai-panel">
                <div className="ai-header">
                  <span className="ai-label">▶ 0G · verifiable inference</span>
                  <span className="badge badge-blue">Proof: 0x4f2a…c831</span>
                </div>
                <div className="ai-stream">
                  <strong>Strategy: {agentSector} Optimiser</strong><br /><br />
                  Based on scan results, I recommend allocating capital to{' '}
                  <em>USDC/DAI (8.3% APY)</em> as the primary pool with a 70% weighting.<br /><br />
                  <strong>Trigger conditions:</strong><br />
                  — Rebalance when APY delta exceeds <em>0.5%</em><br />
                  — Swap out if pool risk score exceeds <em>4.0/10</em><br />
                  — Check competitor agent activity every <em>{agentInterval}</em><br /><br />
                  <strong>Risk assessment:</strong> This strategy is rated{' '}
                  <em>{agentRisk === 'low' ? 'LOW' : agentRisk === 'med' ? 'MEDIUM' : 'HIGH'}</em> risk
                  based on pool stability and liquidity depth over 30 days.<br /><br />
                  All inference verified on-chain via 0G Compute proof system.
                </div>
              </div>
              <div className="create-nav">
                <button className="btn btn-md btn-ghost" onClick={() => goToStep(4)}>← Back</button>
                <button className="btn btn-md btn-white" onClick={() => goToStep(6)}>Next: Mint iNFT →</button>
              </div>
            </div>
            <div className="create-side">
              <div className="side-title">Strategy summary</div>
              <div className="sum-row"><span className="sum-key">Primary pool</span><span className="sum-val">USDC/DAI</span></div>
              <div className="sum-row"><span className="sum-key">Target APY</span><span className="sum-val" style={{ color: 'var(--green)' }}>8.3%</span></div>
              <div className="sum-row"><span className="sum-key">Risk score</span><span className="sum-val">2.1 / 10</span></div>
            </div>
          </div>
        )}

        {/* STEP 6: MINT iNFT */}
        {createStep === 6 && (
          <div className="create-layout">
            <div className="create-main">
              <div className="section-label" style={{ marginBottom: 16 }}>Mint your agent as a tradeable iNFT</div>
              <div className="inft-panel">
                <div className="inft-card">
                  <div className="inft-avatar">{agentEmoji}</div>
                  <div>
                    <div className="inft-name">{agentName || 'StableGhost v1'}</div>
                    <div className="inft-id">ghostfi.eth / #{Math.floor(Math.random() * 9000 + 1000)}</div>
                    <div className="inft-traits">
                      <span className="badge">{agentSector}</span>
                      <span className="badge badge-blue">{agentKits[0] || '0G'}</span>
                      <span className="badge badge-green">{agentRisk === 'low' ? 'Low risk' : agentRisk === 'med' ? 'Med risk' : 'High risk'}</span>
                      <span className="badge badge-purple">{agentInterval}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 18 }}>
                  Your agent will be minted as an intelligent NFT (iNFT) — a tradeable on-chain asset that embeds your strategy and performance history. Others can fork it, and you earn creator fees.
                </div>
                <div className="sum-row"><span className="sum-key">Mint fee</span><span className="sum-val">0.002 ETH</span></div>
                <div className="sum-row"><span className="sum-key">Creator royalty</span><span className="sum-val">2.5%</span></div>
                <div className="sum-row"><span className="sum-key">Capital to lock</span><span className="sum-val">{agentCapital || '$0'}</span></div>
              </div>
              <div className="create-nav">
                <button className="btn btn-md btn-ghost" onClick={() => goToStep(5)}>← Back</button>
                <button className="btn btn-lg btn-white" onClick={deploy}>
                  🚀 Deploy & mint iNFT
                </button>
              </div>
            </div>
            <div className="create-side">
              <div className="side-title">Final summary</div>
              <div className="sum-row"><span className="sum-key">Name</span><span className="sum-val">{agentName || '—'}</span></div>
              <div className="sum-row"><span className="sum-key">Sector</span><span className="sum-val">{agentSector}</span></div>
              <div className="sum-row"><span className="sum-key">Capital</span><span className="sum-val">{agentCapital || '—'}</span></div>
              <div className="sum-row"><span className="sum-key">Risk</span><span className="sum-val">{agentRisk === 'low' ? 'Low' : agentRisk === 'med' ? 'Medium' : 'High'}</span></div>
              <div className="sum-row"><span className="sum-key">Interval</span><span className="sum-val">{agentInterval}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
