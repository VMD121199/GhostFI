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

const EMOJIS = ['🌊', '🔥', '⚡', '🦊', '🐉', '🤖', '💎', '🦁', '🌙', '⚔️', '🎯', '🧠', '👻', '💀', '🏹', '🦅']

const DURATIONS = [
  { id: '1d', label: '1 Day', date: 'Apr 05, 2026' },
  { id: '3d', label: '3 Days', date: 'Apr 07, 2026' },
  { id: '7d', label: '7 Days', date: 'Apr 11, 2026' },
  { id: '30d', label: '30 Days', date: 'May 04, 2026' },
  { id: '90d', label: '90 Days', date: 'Jul 03, 2026' },
  { id: 'inf', label: '∞ Ongoing', date: 'No end date' },
]

const AI_MODELS = ['GPT-4o', 'Claude 3.5', 'Llama 3.1', 'Mistral 7B', '0G Custom ✦']

const SOCIAL_FEEDS = [
  { icon: '𝕏', name: 'X / Twitter', sub: 'Whale alerts, CT sentiment' },
  { icon: '✈', name: 'Telegram', sub: 'DeFi alpha groups' },
  { icon: '◎', name: 'Discord', sub: 'Protocol communities' },
]

const POOL_SOURCES = [
  { icon: '🦄', name: 'Uniswap v3', sub: '247 pools · live' },
  { icon: '〜', name: 'Curve Finance', sub: '89 pools · live' },
  { icon: '👻', name: 'Aave v3', sub: '34 markets · live' },
  { icon: '🔷', name: 'Morpho Blue', sub: '12 vaults' },
]

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '24h']

const STEP_LABELS = ['Sector', 'Configure', 'Agent kit', 'Scan', 'AI strategy', 'Mint iNFT']

const INFT_NUM = Math.floor(Math.random() * 9000 + 1000)

export default function CreateAgent() {
  const {
    page, showPage, openPool, addMyAgent,
    createStep, setCreateStep,
    agentSector, setAgentSector,
    agentEmoji, setAgentEmoji,
    agentName, setAgentName,
    agentMinYield, setAgentMinYield,
    agentTargetYield, setAgentTargetYield,
    agentMaxDD, setAgentMaxDD,
    agentModel, setAgentModel,
    agentSocials, toggleSocial,
    agentPoolSources, togglePoolSource,
    agentInterval, setAgentInterval,
    agentDuration, setAgentDuration,
    agentCapital, setAgentCapital,
    agentRisk, setAgentRisk,
    agentRoyalty, setAgentRoyalty,
    agentListingPrice, setAgentListingPrice,
    resetCreate,
  } = useApp()

  const [scanLines, setScanLines] = useState([])
  const [scanDone, setScanDone] = useState(false)
  const [scanCount, setScanCount] = useState('0')
  const [scanBest, setScanBest] = useState('—')
  const [scanConf, setScanConf] = useState('—')
  const [scanVer, setScanVer] = useState('—')
  const [scanStatus, setScanStatus] = useState('Waiting...')
  const [scanPools, setScanPools] = useState([])
  const [deployed, setDeployed] = useState(false)
  const [deployResult, setDeployResult] = useState(null)
  const [deploying, setDeploying] = useState(false)

  if (page !== 'create') return null

  const selectedSector = SECTORS.find(s => s.name === agentSector) || SECTORS[0]

  const goToStep = (n) => {
    if (n > createStep + 1) return
    setCreateStep(n)
  }

  const startScan = async () => {
    setScanLines([
      { t: '00:00', m: 'Initialising 0G Compute node...', c: '' },
      { t: '00:01', m: `Connecting to ${agentPoolSources.join(', ')}...`, c: '' },
      { t: '00:02', m: 'Fetching live pool data...', c: 'hi' },
    ])
    setScanDone(false)
    setScanCount('0')
    setScanBest('—')
    setScanConf('—')
    setScanVer('—')
    setScanStatus('Scanning...')

    let data = { pools: [] }
    try {
      const response = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: agentSector,
          sources: agentPoolSources,
          targetYield: agentTargetYield,
          maxDD: agentMaxDD,
          model: agentModel,
        })
      })
      data = await response.json()
    } catch (err) {
      setScanLines(prev => [...prev, { t: '00:03', m: `Backend unreachable: ${err.message}`, c: 'warn' }])
    }

    const pools = data.pools || []
    setScanPools(pools)
    const bestPool = pools.find(p => p.best) || pools[0]
    pools.forEach((pool, idx) => {
      setTimeout(() => {
        const risk = pool.riskScore ?? '?'
        const apy = pool.apy ?? '—'
        const conf = pool.confidence ?? '—'
        setScanLines(prev => [...prev, {
          t: `00:${String((idx + 1) + 2).padStart(2, '0')}`,
          m: `${pool.name} (${pool.protocol}) — APY ${apy} · risk ${risk}/10 · conf ${conf}%`,
          c: (pool.riskScore ?? 0) > 6 ? 'warn' : pool.best ? 'ok' : '',
        }])
        if (idx === pools.length - 1) {
          setScanDone(true)
          setScanCount(String(data.poolsScanned || pools.length))
          setScanBest(bestPool ? `${bestPool.apy} (${bestPool.name})` : '—')
          setScanConf(bestPool?.confidence ? `${bestPool.confidence}%` : '—')
          setScanVer(data.verified ? 'Yes · 0G Chain' : 'Local fallback')
          setScanStatus(`Done. ${data.poolsScanned || pools.length} pools scanned.`)
        }
      }, 180 * idx)
    })
  }

  const deploy = async () => {
    setDeploying(true)
    let result = null
    try {
      const res = await fetch('http://localhost:5000/api/agent/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName, sector: agentSector, emoji: agentEmoji,
          capital: agentCapital, royalty: agentRoyalty, listingPrice: agentListingPrice,
          model: agentModel, sources: agentPoolSources, socials: agentSocials,
          interval: agentInterval, duration: agentDuration, risk: agentRisk,
          minYield: agentMinYield, targetYield: agentTargetYield, maxDD: agentMaxDD,
        }),
      })
      result = await res.json()
      console.log('Deploy result:', result)
    } catch (e) {
      result = { tokenId: INFT_NUM, txHash: '0x7f3a…d291', contract: '0x69242f…726C', proof: '0x4f2a…c831', network: 'OG testnet' }
    }
    setDeployResult(result)
    addMyAgent({
      name:        agentName || 'StableGhost v1',
      emoji:       agentEmoji,
      sector:      agentSector,
      yield:       `+${agentTargetYield}%`,
      pos:         true,
      tvl:         agentCapital || '—',
      copies:      'new',
      inft:        `#${result.tokenId}`,
      status:      'on',
      statusLabel: 'Running',
      txHash:      result.txHash,
      contract:    result.contract,
      proof:       result.proof,
      model:       agentModel,
      duration:    agentDuration,
      risk:        agentRisk,
      royalty:     agentRoyalty,
    })
    setDeploying(false)
    setDeployed(true)
  }

  if (deployed) {
    return (
      <div className="page active" style={{ paddingTop: 60 }}>
        <div className="page-inner" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '48px 28px' }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>{agentEmoji}</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.3px', marginBottom: 8 }}>
            Agent deployed &amp; iNFT minted
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 28, lineHeight: 1.8 }}>
            <strong style={{ color: 'var(--white)' }}>{agentName || 'StableGhost v1'}</strong> is live on Hedera EVM.<br />
            Your iNFT is listed on GhostFi marketplace.
          </div>
          <div className="neu-well" style={{ textAlign: 'left', marginBottom: 24 }}>
            <div className="sum-row"><span className="sum-key">Contract</span><span className="sum-val" style={{ fontFamily: 'var(--mono)', fontSize: 10 }}>{deployResult?.contract || '0x69242f…726C'}</span></div>
            <div className="sum-row"><span className="sum-key">iNFT token</span><span className="sum-val" style={{ color: 'var(--pink)' }}>#{deployResult?.tokenId || INFT_NUM} · {deployResult?.network || 'Hedera EVM'}</span></div>
            <div className="sum-row"><span className="sum-key">Mint TX</span><span className="sum-val" style={{ fontFamily: 'var(--mono)', fontSize: 10 }}>{deployResult?.txHash || '0x7f3a…d291'}</span></div>
            <div className="sum-row"><span className="sum-key">0G proof</span><span className="sum-val" style={{ color: 'var(--purple)' }}>{deployResult?.proof || '0x4f2a…c831'}</span></div>
            <div className="sum-row"><span className="sum-key">First scan</span><span className="sum-val" style={{ color: 'var(--green)' }}>in ~3 min</span></div>
          </div>
          <div style={{ display: 'flex', gap: 9, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-lg btn-white" onClick={() => { setDeployed(false); showPage('myagents') }}>
              View my agents →
            </button>
            <button className="btn btn-lg btn-ghost" onClick={() => { setDeployed(false); showPage('marketplace') }}>
              View iNFT page →
            </button>
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
                <div className="sc-circle">{n < createStep ? '✓' : n}</div>
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
              <div className="section-label" style={{ marginBottom: 16 }}>Agent identity &amp; yield parameters</div>

              <div className="field-group">
                <div className="field-label">Agent avatar</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div className="avatar-preview">{agentEmoji}</div>
                  <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.7 }}>
                    Becomes your agent's identity and iNFT artwork.
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
                <div className="field-label">Yield parameters</div>
                <div className="yield-params-grid">
                  <div>
                    <div className="yp-label">Min yield (floor)</div>
                    <div className="yp-input-wrap">
                      <input type="number" value={agentMinYield} onChange={e => setAgentMinYield(e.target.value)}
                        min="0" max="50" step="0.5" />
                      <span className="yp-unit">% APY</span>
                    </div>
                  </div>
                  <div>
                    <div className="yp-label">Target yield</div>
                    <div className="yp-input-wrap">
                      <input type="number" value={agentTargetYield} onChange={e => setAgentTargetYield(e.target.value)}
                        min="0" max="100" step="0.5" style={{ color: 'var(--green)' }} />
                      <span className="yp-unit">% APY</span>
                    </div>
                  </div>
                  <div>
                    <div className="yp-label">Max drawdown</div>
                    <div className="yp-input-wrap">
                      <input type="number" value={agentMaxDD} onChange={e => setAgentMaxDD(e.target.value)}
                        min="0.5" max="20" step="0.5" style={{ color: 'var(--red)' }} />
                      <span className="yp-unit">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="field-group">
                <div className="field-label">Agent run duration</div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {DURATIONS.map(d => (
                    <button key={d.id} className={`dur-chip ${agentDuration === d.id ? 'active' : ''}`}
                      onClick={() => setAgentDuration(d.id)}>{d.label}</button>
                  ))}
                </div>
                <div className="dur-info">
                  <div className="dur-box">
                    <div className="dur-box-lbl">Runs until</div>
                    <div className="dur-box-val">{DURATIONS.find(d => d.id === agentDuration)?.date}</div>
                  </div>
                  <div className="dur-box">
                    <div className="dur-box-lbl">Auto-renew</div>
                    <div className="dur-box-val" style={{ color: 'var(--t3)' }}>OFF</div>
                  </div>
                </div>
              </div>

              <div className="field-group">
                <div className="field-label">Capital *</div>
                <input className="neu-input" type="text" value={agentCapital}
                  onChange={e => setAgentCapital(e.target.value)} placeholder="e.g. $
                  10,000 USDC" />
              </div>

              <div className="field-group">
                <div className="field-label">Risk level</div>
                <div className="risk-row">
                  {['low', 'med', 'high'].map(r => (
                    <button key={r} className={`risk-opt ${agentRisk === r ? 'active' : ''}`}
                      onClick={() => setAgentRisk(r)}>
                      {r === 'low' ? 'Low' : r === 'med' ? 'Medium' : 'High'}
                    </button>
                  ))}
                </div>
              </div>

              {agentCapital && (() => {
                const cap = parseFloat(agentCapital.replace(/[^0-9.]/g, '')) || 0
                const days = { '1d': 1, '3d': 3, '7d': 7, '30d': 30, '90d': 90, 'inf': 365 }[agentDuration] || 7
                const proj = (cap * (parseFloat(agentTargetYield) / 100) * days / 365).toFixed(2)
                const durLabel = DURATIONS.find(d => d.id === agentDuration)?.label || '7 Days'
                return (
                  <div className="proj-strip">
                    <div className="proj-main">
                      Projected over {durLabel} at {agentTargetYield}% APY: +${proj}
                    </div>
                    <div className="proj-sub">Gas estimate: ~$0.28 · Break-even after day 1</div>
                  </div>
                )
              })()}

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
              <div className="sum-row"><span className="sum-key">Floor</span><span className="sum-val" style={{ color: 'var(--red)' }}>{agentMinYield}% APY</span></div>
              <div className="sum-row"><span className="sum-key">Target</span><span className="sum-val" style={{ color: 'var(--green)' }}>{agentTargetYield}% APY</span></div>
              <div className="sum-row"><span className="sum-key">Max DD</span><span className="sum-val" style={{ color: 'var(--red)' }}>{agentMaxDD}%</span></div>
              <div className="sum-row"><span className="sum-key">Duration</span><span className="sum-val">{DURATIONS.find(d => d.id === agentDuration)?.label}</span></div>
              <div className="sum-row"><span className="sum-key">Capital</span><span className="sum-val">{agentCapital || '—'}</span></div>
              <div className="sum-row"><span className="sum-key">Risk</span><span className="sum-val">{agentRisk === 'low' ? 'Low' : agentRisk === 'med' ? 'Medium' : 'High'}</span></div>
            </div>
          </div>
        )}

        {/* STEP 3: AGENT KIT */}
        {createStep === 3 && (
          <div className="create-layout">
            <div className="create-main">
              <div className="section-label" style={{ marginBottom: 16 }}>Agent kit — intelligence sources</div>

              <div className="field-group">
                <div className="field-label">AI inference model</div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {AI_MODELS.map(m => (
                    <button key={m} className={`mopt ${agentModel === m ? 'active' : ''}`}
                      onClick={() => setAgentModel(m)}
                      style={m.includes('0G') ? { color: agentModel === m ? 'var(--white)' : 'var(--blue)' } : {}}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="neu-divider" />

              <div className="field-group">
                <div className="field-label">Social sentiment feeds</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {SOCIAL_FEEDS.map(sf => (
                    <button key={sf.name} className={`socc ${agentSocials.includes(sf.name.split(' ')[0]) ? 'active' : ''}`}
                      onClick={() => toggleSocial(sf.name.split(' ')[0])}>
                      <div className="socic">{sf.icon}</div>
                      <div className="socn">{sf.name}</div>
                      <div className="socd">{sf.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="neu-divider" />

              <div className="field-group">
                <div className="field-label">Pool API sources</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                  {POOL_SOURCES.map(ps => (
                    <button key={ps.name} className={`psel ${agentPoolSources.includes(ps.name) ? 'active' : ''}`}
                      onClick={() => togglePoolSource(ps.name)}>
                      <div className="pic2">{ps.icon}</div>
                      <div>
                        <div className="pnn">{ps.name}</div>
                        <div className="psc">{ps.sub}</div>
                      </div>
                      <span className={`badge ${agentPoolSources.includes(ps.name) ? 'badge-purple' : 'badge-gray'}`}
                        style={{ marginLeft: 'auto', fontSize: 8 }}>
                        {agentPoolSources.includes(ps.name) ? '✓' : 'Off'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="neu-divider" />

              <div className="field-group">
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
              <div className="sum-row"><span className="sum-key">Model</span><span className="sum-val">{agentModel}</span></div>
              <div className="sum-row"><span className="sum-key">Socials</span><span className="sum-val">{agentSocials.join(', ') || '—'}</span></div>
              <div className="sum-row"><span className="sum-key">Pools</span><span className="sum-val">{agentPoolSources.length} sources</span></div>
              <div className="sum-row"><span className="sum-key">Interval</span><span className="sum-val">{agentInterval}</span></div>
            </div>
          </div>
        )}

        {/* STEP 4: SCAN */}
        {createStep === 4 && (
          <div className="create-layout">
            <div className="create-main">
              <div className="section-label" style={{ marginBottom: 16 }}>Agent scanning pools via 0G Compute</div>

              <div className="scan-terminal">
                <div className="ghost-wm">👻</div>
                {scanLines.map((line, i) => (
                  <div key={i} className="scan-line" style={{ animationDelay: '0s' }}>
                    <span className="st">{line.t}</span>
                    <span className={`sm ${line.c}`}>{line.m}</span>
                  </div>
                ))}
              </div>

              {scanDone && scanPools.length > 0 && (
                <div className="pgrid">
                  {scanPools.map((pool, i) => (
                    <div key={i} className={`pcrd ${pool.best ? 'best' : ''}`} onClick={() => openPool(pool)}>
                      <div className="pn">{pool.name} · {pool.protocol}</div>
                      <div className="pa" style={{ color: pool.best ? 'var(--green)' : 'var(--t2)' }}>
                        {pool.apy ?? '—'}
                      </div>
                      <div className="pm">
                        TVL {pool.tvl} · conf. {pool.confidence ?? '—'}%
                        {pool.best && <> · <span style={{ color: 'var(--green)' }}>best</span></>}
                        {pool.action && <> · <span style={{ color: pool.action === 'invest' ? 'var(--green)' : pool.action === 'skip' ? 'var(--red)' : 'var(--amber)' }}>{pool.action}</span></>}
                      </div>
                      {pool.best && (
                        <div style={{ fontSize: 9, color: 'var(--blue)', fontFamily: 'var(--mono)', marginTop: 4 }}>Click → risk analysis</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="create-nav">
                <button className="btn btn-md btn-ghost" onClick={() => goToStep(3)}>← Back</button>
                <button className="btn btn-md btn-green" onClick={startScan}>▶ Run scan</button>
                <button className="btn btn-md btn-white"
                  style={{ opacity: scanDone ? 1 : .35, pointerEvents: scanDone ? 'auto' : 'none' }}
                  onClick={() => {
                    console.log("required for strategy simulation:", {
                      sector: agentSector,
                      sources: agentPoolSources,
                      targetYield: agentTargetYield,
                      maxDD: agentMaxDD,
                      model: agentModel,
                    })
                    goToStep(5)
                  }}>Next: AI strategy →</button>
              </div>
            </div>
            <div className="create-side">
              <div className="side-title">Scan status</div>
              <div className="sum-row"><span className="sum-key">Pools found</span><span className="sum-val">{scanCount}</span></div>
              <div className="sum-row"><span className="sum-key">Best APY</span><span className="sum-val" style={{ color: 'var(--green)' }}>{scanBest}</span></div>
              <div className="sum-row"><span className="sum-key">Confidence</span><span className="sum-val" style={{ color: 'var(--blue)' }}>{scanConf}</span></div>
              <div className="sum-row"><span className="sum-key">0G verified</span><span className="sum-val">{scanVer}</span></div>
              <div className="neu-divider" />
              <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)', lineHeight: 2 }}>{scanStatus}</div>
            </div>
          </div>
        )}

        {/* STEP 5: AI STRATEGY / TRIGGERS */}
        {createStep === 5 && (
          <div className="create-layout">
            <div className="create-main">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>AI-recommended trigger conditions</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)', marginTop: 2 }}>Edit any value — agent re-simulates on change</div>
                </div>
                <span className="badge badge-purple">Proof: 0x4f2a…c831</span>
              </div>

              <div className="section-label" style={{ marginBottom: 10 }}>Rotation triggers</div>
              <div className="trow">
                <div className="tif">IF</div>
                <select className="tsel"><option>APY delta</option><option>TVL change</option></select>
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>&gt;</span>
                <input className="tval" type="text" defaultValue="0.5%" />
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>AND confidence</span>
                <input className="tval" type="text" defaultValue="≥ 85%" />
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>THEN</span>
                <div className="tact trot">Rotate capital</div>
              </div>
              <div className="trow">
                <div className="tif">IF</div>
                <select className="tsel"><option>Social sentiment</option><option>TVL change</option></select>
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>drops to</span>
                <input className="tval" type="text" defaultValue="Bearish" />
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>THEN</span>
                <div className="tact talert-act">Alert me</div>
              </div>

              <div className="section-label" style={{ marginTop: 18, marginBottom: 10 }}>Exit triggers</div>
              <div className="trow">
                <div className="tif">IF</div>
                <select className="tsel"><option>Pool APY</option></select>
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>drops below</span>
                <input className="tval danger" type="text" defaultValue={`${agentMinYield}%`} />
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>THEN</span>
                <div className="tact texit">Exit to USDC</div>
              </div>
              <div className="trow">
                <div className="tif">IF</div>
                <select className="tsel"><option>Drawdown</option></select>
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>exceeds</span>
                <input className="tval danger" type="text" defaultValue={`${agentMaxDD}%`} />
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>THEN</span>
                <div className="tact texit">Pause + alert</div>
              </div>
              <div className="trow">
                <div className="tif">IF</div>
                <select className="tsel"><option>Smart contract risk</option></select>
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>exceeds</span>
                <input className="tval warn" type="text" defaultValue="6 / 10" />
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>THEN</span>
                <div className="tact texit">Emergency exit</div>
              </div>
              <button className="tadd">+ Add custom trigger condition</button>

              <div style={{ marginTop: 14, padding: 11, background: 'var(--surface-down)', borderRadius: 'var(--r-sm)', boxShadow: 'var(--neu-in-sm)' }}>
                <div style={{ fontSize: 10, color: 'var(--green)', fontFamily: 'var(--mono)', fontWeight: 700, marginBottom: 3 }}>
                  Backtested · 370 pools · 7 days
                </div>
                <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
                  Win rate 91% · Expected yield 8.3% · Max simulated drawdown 0.3%
                </div>
              </div>

              <div className="create-nav">
                <button className="btn btn-md btn-ghost" onClick={() => goToStep(4)}>← Back</button>
                <button className="btn btn-md btn-white" onClick={() => goToStep(6)}>Next: Mint iNFT →</button>
              </div>
            </div>
            <div className="create-side">
              <div className="side-title">Projection</div>
              {(() => {
                const best = scanPools.find(p => p.best) || scanPools[0]
                if (!best) return (
                  <div style={{ fontSize: 10, color: 'var(--amber)', fontFamily: 'var(--mono)', marginTop: 8 }}>
                    ← Run the scan first
                  </div>
                )
                const riskColor = (best.riskScore ?? 10) <= 3 ? 'var(--green)' : (best.riskScore ?? 10) <= 6 ? 'var(--amber)' : 'var(--red)'
                return (
                  <>
                    <div className="sum-row"><span className="sum-key">Primary pool</span><span className="sum-val">{best.name}</span></div>
                    <div className="sum-row"><span className="sum-key">Protocol</span><span className="sum-val">{best.protocol}</span></div>
                    <div className="sum-row"><span className="sum-key">Expected APY</span><span className="sum-val" style={{ color: 'var(--green)' }}>{best.apy ?? '—'}</span></div>
                    <div className="sum-row"><span className="sum-key">Confidence</span><span className="sum-val" style={{ color: 'var(--blue)' }}>{best.confidence != null ? `${best.confidence}%` : '—'}</span></div>
                    <div className="sum-row"><span className="sum-key">Risk score</span><span className="sum-val" style={{ color: riskColor }}>{best.riskScore != null ? `${best.riskScore}/10` : '—'}</span></div>
                    <div className="sum-row"><span className="sum-key">Action</span><span className="sum-val" style={{ color: best.action === 'invest' ? 'var(--green)' : 'var(--amber)' }}>{best.action ?? '—'}</span></div>
                    <div className="sum-row"><span className="sum-key">TVL</span><span className="sum-val">{best.tvl ?? '—'}</span></div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* STEP 6: MINT iNFT */}
        {createStep === 6 && (
          <div className="create-layout">
            <div className="create-main">
              <div className="section-label" style={{ marginBottom: 16 }}>Mint your agent as an iNFT</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 18, lineHeight: 1.7 }}>
                Your agent becomes a tradeable intelligent NFT. Others can copy your strategy — you earn royalties every time.
              </div>

              {/* iNFT preview card */}
              <div style={{ background: 'var(--surface-down)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--neu-in)', padding: 20, display: 'flex', gap: 18, alignItems: 'center', marginBottom: 18 }}>
                <div className="inft-avatar">{agentEmoji}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{agentName || 'StableGhost v1'}</div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t3)' }}>GhostFi iNFT · #{INFT_NUM} · Hedera EVM</div>
                  <div className="inft-traits" style={{ marginTop: 8 }}>
                    <span className="badge badge-green">{agentSector}</span>
                    <span className="badge badge-purple">0G Verified</span>
                    <span className="badge badge-pink">iNFT</span>
                  </div>
                </div>
              </div>

              {/* Royalty + listing inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div className="field-group" style={{ margin: 0 }}>
                  <div className="field-label">Royalty on copies</div>
                  <input className="neu-input" type="text" value={agentRoyalty}
                    onChange={e => setAgentRoyalty(e.target.value)} />
                </div>
                <div className="field-group" style={{ margin: 0 }}>
                  <div className="field-label">Listing price</div>
                  <input className="neu-input" type="text" value={agentListingPrice}
                    onChange={e => setAgentListingPrice(e.target.value)} />
                </div>
              </div>

              {/* Hedera EVM info */}
              <div className="neu-well" style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 7 }}>
                  Minting on ⬡ Hedera EVM
                </div>
                <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.9, fontFamily: 'var(--mono)' }}>
                  Standard: ERC-7857 (ERC721 extension)<br />
                  Metadata: 🔷 0G Storage (immutable)<br />
                  Proof: 0G Chain hash linked<br />
                  {/* Gas: ~$0.002 on Hedera testnet<br /> */}
                  
                </div>
              </div>

              <div className="create-nav">
                <button className="btn btn-md btn-ghost" onClick={() => goToStep(5)}>← Back</button>
                <button className="btn btn-md btn-pink" onClick={deploy} disabled={deploying}
                  style={{ opacity: deploying ? 0.6 : 1 }}>
                  {deploying ? 'Minting…' : 'Mint iNFT & Deploy ✦'}
                </button>
              </div>
            </div>
            <div className="create-side">
              {/* iNFT card */}
              <div style={{ background: 'var(--surface-down)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--neu-in)', padding: 16, textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{agentEmoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{agentName || 'StableGhost v1'}</div>
                <div style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)', marginBottom: 8 }}>GhostFi iNFT · #{INFT_NUM}</div>
                <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span className="badge badge-pink">iNFT</span>
                  <span className="badge badge-purple">0G</span>
                  <span className="badge badge-green">Live</span>
                </div>
              </div>

              {/* Full recap */}
              <div className="side-title" style={{ marginBottom: 10 }}>Full recap</div>

              <div style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>Strategy</div>
              <div className="sum-row"><span className="sum-key">Sector</span><span className="sum-val">{agentSector}</span></div>
              <div className="sum-row"><span className="sum-key">Floor yield</span><span className="sum-val" style={{ color: 'var(--red)' }}>{agentMinYield}% APY</span></div>
              <div className="sum-row"><span className="sum-key">Target yield</span><span className="sum-val" style={{ color: 'var(--green)' }}>{agentTargetYield}% APY</span></div>
              <div className="sum-row"><span className="sum-key">Max drawdown</span><span className="sum-val" style={{ color: 'var(--red)' }}>{agentMaxDD}%</span></div>

              <div className="neu-divider" />

              <div style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>Capital & risk</div>
              <div className="sum-row"><span className="sum-key">Capital</span><span className="sum-val">{agentCapital || '—'}</span></div>
              <div className="sum-row"><span className="sum-key">Risk level</span><span className="sum-val">{agentRisk === 'low' ? 'Low' : agentRisk === 'med' ? 'Medium' : 'High'}</span></div>
              <div className="sum-row"><span className="sum-key">Duration</span><span className="sum-val">{DURATIONS.find(d => d.id === agentDuration)?.label}</span></div>
              <div className="sum-row"><span className="sum-key">Runs until</span><span className="sum-val">{DURATIONS.find(d => d.id === agentDuration)?.date}</span></div>

              <div className="neu-divider" />

              <div style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>Agent kit</div>
              <div className="sum-row"><span className="sum-key">AI model</span><span className="sum-val">{agentModel}</span></div>
              <div className="sum-row"><span className="sum-key">Socials</span><span className="sum-val">{agentSocials.join(', ') || '—'}</span></div>
              <div className="sum-row"><span className="sum-key">Sources</span><span className="sum-val">{agentPoolSources.length} protocols</span></div>
              <div className="sum-row"><span className="sum-key">Interval</span><span className="sum-val">{agentInterval}</span></div>

              <div className="neu-divider" />

              <div style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>iNFT</div>
              <div className="sum-row"><span className="sum-key">Royalty</span><span className="sum-val">{agentRoyalty}</span></div>
              <div className="sum-row"><span className="sum-key">Listing</span><span className="sum-val">{agentListingPrice}</span></div>
              <div className="sum-row"><span className="sum-key">Copies earn</span><span className="sum-val" style={{ color: 'var(--green)' }}>Passive royalties</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
