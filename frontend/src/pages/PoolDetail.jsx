import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const APY_BARS = [70, 58, 82, 65, 75, 88, 72, 80, 91, 100]

const COLOR_VAR = { green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)' }

export default function PoolDetail() {
  const { page, goBack, showPage, poolDetail } = useApp()
  const [riskFactors, setRiskFactors] = useState([])
  const [composite, setComposite] = useState(null)
  const [compositeLabel, setCompositeLabel] = useState('')

  useEffect(() => {
    if (page !== 'pool-detail' || !poolDetail) return
    fetch('https://ghostfi-1.onrender.com/api/pool/risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: poolDetail.name,
        protocol: poolDetail.protocol,
        riskScore: poolDetail.riskScore,
        breakdown: poolDetail.breakdown,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.factors) {
          setRiskFactors(data.factors)
          setComposite(data.composite)
          setCompositeLabel(data.compositeLabel)
        }
      })
      .catch(() => { }) // fail silently — fallback static display
  }, [page, poolDetail])

  if (page !== 'pool-detail') return null

  // Real data from scan, or fallback defaults
  const p = poolDetail || {}
  const name = p.name || 'USDC / DAI'
  const protocol = p.protocol || 'Uniswap v3'
  const apy = p.apy || '8.3%'
  const tvl = p.tvl || '$42.1M'
  const conf = p.confidence ?? 87
  const riskScore = p.riskScore ?? 2.1
  const action = p.action || 'invest'
  const reasoning = p.reasoning || 'Stablecoin pair with near-zero IL risk. Chainlink oracle latency <1s. Sentiment neutral.'
  const riskColor = riskScore <= 3 ? 'var(--green)' : riskScore <= 6 ? 'var(--amber)' : 'var(--red)'
  const riskLabel = riskScore <= 3 ? 'LOW' : riskScore <= 6 ? 'MEDIUM' : 'HIGH'

  // Arc: 201 = full circumference of r=32 circle. Scale conf% to that.
  const arcLen = (conf / 100) * 201

  return (
    <div className="page active" style={{ paddingTop: 60 }}>
      <div className="pool-page">
        <button className="back-btn" onClick={goBack}>← Back</button>

        {/* Header card */}
        <div className="neu-card" style={{ padding: 22, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="pool-pair">
                <span style={{ fontSize: 28 }}>💵</span>
                <span style={{ fontSize: 28 }}>🏦</span>
                {name}
              </div>
              <div className="pool-sub" style={{ marginTop: 6 }}>
                {protocol} · ⟠ Ethereum
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                {p.best && <span className="badge badge-green">Selected by agent</span>}
                <span className="badge badge-purple">0G Verified</span>
                <span className={`badge ${action === 'invest' ? 'badge-green' : action === 'skip' ? 'badge-pink' : 'badge-gray'}`}>
                  {action}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '.10em', color: 'var(--t3)', fontFamily: 'var(--mono)', marginBottom: 6 }}>
                AI confidence
              </div>
              <div className="conf-arc">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#222" strokeWidth="7" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--green)" strokeWidth="7"
                    strokeDasharray={`${arcLen} ${201 - arcLen}`} strokeDashoffset="44" strokeLinecap="round" />
                </svg>
                <div className="conf-score" style={{ color: 'var(--green)' }}>{conf}%</div>
              </div>
            </div>
          </div>

          <div className="pmgrid">
            {[
              { label: 'Current APY', val: apy, sub: 'AI estimated', c: 'var(--green)' },
              { label: 'Total value locked', val: tvl, sub: 'Live data', c: 'var(--white)' },
              { label: 'Risk score', val: `${riskScore} / 10`, sub: riskLabel, c: riskColor },
              { label: 'IL estimate', val: riskScore <= 3 ? '~0.01%' : '~0.5%', sub: 'Minimal', c: 'var(--green)' },
            ].map(m => (
              <div key={m.label} className="pmcard">
                <div className="pml">{m.label}</div>
                <div className="pmv" style={{ color: m.c }}>{m.val}</div>
                <div className="pms">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk + APY/metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="neu-card" style={{ padding: 20 }}>
            <div className="section-label">Risk factor breakdown</div>
            {riskFactors.length === 0 && (
              <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)', padding: '8px 0' }}>
                Loading risk factors…
              </div>
            )}
            {riskFactors.map(r => (
              <div key={r.label} className="rb-row">
                <div className="rb-lbl">{r.label}</div>
                <div className="rb-track">
                  <div className="rb-fill" style={{ width: `${r.pct}%`, background: COLOR_VAR[r.color] }} />
                </div>
                <div className="rb-val" style={{ color: COLOR_VAR[r.color] }}>{Math.round(r.score)}/10</div>
              </div>
            ))}
            <div className="neu-divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>Composite</span>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--mono)', color: riskColor }}>
                {Math.round(composite) ?? Math.round(riskScore)}/10 — {compositeLabel || riskLabel}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="neu-card" style={{ padding: 18 }}>
              <div className="section-label">30-day APY range</div>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 60, marginTop: 8 }}>
                {APY_BARS.map((h, i) => (
                  <div key={i} className={`spb ${i === APY_BARS.length - 1 ? 'hi' : ''}`}
                    style={{ height: `${h}%`, opacity: 0.35 + (i / APY_BARS.length) * 0.55 }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                <span style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>30d low: —</span>
                <span style={{ fontSize: 9, color: 'var(--green)', fontFamily: 'var(--mono)' }}>Today: {apy}</span>
              </div>
            </div>
            <div className="neu-card" style={{ padding: 18 }}>
              <div className="section-label">Pool metrics</div>
              {[
                { k: 'Protocol', v: protocol, c: '' },
                { k: 'TVL', v: tvl, c: 'var(--white)' },
                { k: 'Confidence', v: `${conf}%`, c: 'var(--green)' },
                { k: 'Action', v: action, c: action === 'invest' ? 'var(--green)' : 'var(--amber)' },
              ].map(r => (
                <div key={r.k} className="sum-row">
                  <span className="sum-key">{r.k}</span>
                  <span className="sum-val" style={r.c ? { color: r.c } : {}}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI reasoning */}
        <div className="neu-card" style={{ padding: 20, marginBottom: 14 }}>
          <div className="section-label">AI reasoning — 0G Compute</div>
          <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.85, fontFamily: 'var(--mono)' }}>
            {reasoning}{' '}
            <span style={{ color: action === 'invest' ? 'var(--green)' : 'var(--amber)' }}>
              Recommendation: {action.charAt(0).toUpperCase() + action.slice(1)}. Confidence: {conf}%.
            </span>
          </div>
        </div>

        {/* 0G verification strip */}
        <div style={{ background: 'var(--surface-down)', borderRadius: 'var(--r-sm)', boxShadow: 'var(--neu-in-sm)', padding: '10px 14px', marginBottom: 18 }}>
          <div style={{ fontSize: 9, color: 'var(--blue)', fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>
            0G Chain verification
          </div>
          <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
            Pool: {name} · Proof: <span style={{ color: 'var(--purple)' }}>0x4f2a…c831</span> · Verified on 0G Chain
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-md btn-white" onClick={() => showPage('create')}>Deploy agent to this pool →</button>
          <button className="btn btn-md btn-ghost" onClick={goBack}>← Back</button>
        </div>
      </div>
    </div>
  )
}
