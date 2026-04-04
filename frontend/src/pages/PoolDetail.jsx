import { useApp } from '../context/AppContext'

const RISK_FACTORS = [
  { label: 'Smart contract',   pct: 18, val: '1.8/10', color: 'var(--green)' },
  { label: 'Liquidity depth',  pct: 22, val: '2.2/10', color: 'var(--green)' },
  { label: 'Counterparty',     pct: 20, val: '2.0/10', color: 'var(--green)' },
  { label: 'Oracle reliability',pct:15, val: '1.5/10', color: 'var(--green)' },
  { label: 'Social sentiment', pct: 28, val: '2.8/10', color: 'var(--amber)' },
  { label: 'TVL concentration',pct: 55, val: '5.5/10', color: 'var(--amber)' },
]

const APY_BARS = [70,58,82,65,75,88,72,80,91,100]

export default function PoolDetail() {
  const { page, goBack, showPage } = useApp()

  if (page !== 'pool-detail') return null

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
                USDC / DAI
              </div>
              <div className="pool-sub" style={{ marginTop: 6 }}>
                🦄 Uniswap v3 · 0.05% fee · ⟠ Ethereum
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <span className="badge badge-green">Selected by agent</span>
                <span className="badge badge-purple">0G Verified</span>
                <span className="badge badge-blue">Stablecoin pair</span>
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
                    strokeDasharray="174 27" strokeDashoffset="44" strokeLinecap="round" />
                </svg>
                <div className="conf-score" style={{ color: 'var(--green)' }}>87%</div>
              </div>
            </div>
          </div>

          <div className="pmgrid">
            {[
              { label: 'Current APY',         val: '8.3%',   sub: '30d avg: 7.8%',  c: 'var(--green)' },
              { label: 'Total value locked',   val: '$42.1M', sub: '+$1.2M (24h)',   c: 'var(--white)' },
              { label: 'Risk score',           val: '2.1 / 10', sub: 'Low risk',     c: 'var(--green)' },
              { label: 'IL estimate',          val: '~0.01%', sub: 'Minimal',        c: 'var(--green)' },
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
            {RISK_FACTORS.map(r => (
              <div key={r.label} className="rb-row">
                <div className="rb-lbl">{r.label}</div>
                <div className="rb-track">
                  <div className="rb-fill" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
                <div className="rb-val" style={{ color: r.color }}>{r.val}</div>
              </div>
            ))}
            <div className="neu-divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>Composite</span>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--green)' }}>2.1/10 — LOW</span>
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
                <span style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>30d low: 5.8%</span>
                <span style={{ fontSize: 9, color: 'var(--green)', fontFamily: 'var(--mono)' }}>Today: 8.3%</span>
              </div>
            </div>
            <div className="neu-card" style={{ padding: 18 }}>
              <div className="section-label">Pool metrics</div>
              {[
                { k: 'Volume 24h',      v: '$18.4M',  c: '' },
                { k: 'Fee revenue 24h', v: '$9,200',  c: 'var(--green)' },
                { k: 'Top 5 LPs hold',  v: '58% TVL', c: 'var(--amber)' },
                { k: 'Oracle latency',  v: '< 1s',    c: 'var(--green)' },
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
          <div className="section-label">AI reasoning — Claude 3.5 + 0G Custom</div>
          <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.85, fontFamily: 'var(--mono)' }}>
            USDC/DAI is a stablecoin pair with near-zero IL risk. TVL concentration moderate (top 5 LPs hold 58%).
            Chainlink oracle latency &lt;1s. Sentiment neutral. 8.3% APY is above 30-day avg of 7.8%.{' '}
            <span style={{ color: 'var(--green)' }}>Recommendation: Deploy. Confidence: 87%.</span>
          </div>
        </div>

        {/* 0G verification strip */}
        <div style={{ background: 'var(--surface-down)', borderRadius: 'var(--r-sm)', boxShadow: 'var(--neu-in-sm)', padding: '10px 14px', marginBottom: 18 }}>
          <div style={{ fontSize: 9, color: 'var(--blue)', fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>
            0G Chain verification
          </div>
          <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
            Model: Claude 3.5 + 0G Custom · Proof: <span style={{ color: 'var(--purple)' }}>0x4f2a…c831</span> · Timestamp: Apr 04, 2026 14:22 UTC
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
