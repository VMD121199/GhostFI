import { useState } from 'react'
import { useApp } from '../context/AppContext'

const TRADE_LOG = [
  { ts: '04 Apr 14:22', action: 'Rotate', actionColor: 'var(--green)', pool: 'USDC/DAI · Uniswap v3', apy: '8.3%', result: '+$12.40', resColor: 'var(--green)' },
  { ts: '04 Apr 09:15', action: 'Hold',   actionColor: 'var(--blue)',  pool: 'USDC/DAI · Uniswap v3', apy: '8.1%', result: '+$9.82',  resColor: 'var(--green)' },
  { ts: '03 Apr 22:47', action: 'Rotate', actionColor: 'var(--green)', pool: 'USDT/USDC · Curve',    apy: '6.8%', result: '+$6.54',  resColor: 'var(--green)' },
  { ts: '03 Apr 14:03', action: 'Alert',  actionColor: 'var(--amber)', pool: 'Sentiment bearish spike', apy: '—', result: 'Held position', resColor: 'var(--amber)' },
]

const PROOF_LOG = [
  { ts: '04 Apr 14:22', decision: 'Rotate to USDC/DAI',    hash: '0x4f2a…c831', model: 'Claude 3.5 + 0G' },
  { ts: '04 Apr 09:15', decision: 'Hold position',          hash: '0x8a1b…f204', model: 'Claude 3.5 + 0G' },
  { ts: '03 Apr 22:47', decision: 'Rotate to USDT/USDC',   hash: '0x3c9d…a417', model: 'Claude 3.5 + 0G' },
]

const COPIES_LOG = [
  { wallet: '0xA3f2…b841', forked: 'Apr 01', capital: '$5,000',  yield: '+13.8%', pos: true,  status: 'Running' },
  { wallet: '0xD7c1…e293', forked: 'Mar 28', capital: '$50,000', yield: '+14.1%', pos: true,  status: 'Running' },
  { wallet: '0x5e8a…1f07', forked: 'Mar 22', capital: '$2,000',  yield: '−0.4%',  pos: false, status: 'Paused' },
]

export default function InftDetail() {
  const { page, goBack, inftAgent, showPage, forkAgent } = useApp()
  const [tab, setTab] = useState('perf')

  if (page !== 'inft-detail' || !inftAgent) return null

  const a = inftAgent

  const statusBadge = () => {
    if (!a.pos) return { label: 'Underperforming', cls: 'badge-red' }
    if (!a.inft) return { label: 'Verifying', cls: 'badge-amber' }
    return { label: 'Live', cls: 'badge-green' }
  }
  const sb = statusBadge()

  return (
    <div className="page active" style={{ paddingTop: 60 }}>
      <div className="inft-page">
        <button className="back-btn" onClick={goBack}>← Back</button>

        {/* Hero */}
        <div className="inft-hero">
          <div className="inft-av">{a.emoji}</div>
          <div style={{ flex: 1 }}>
            <div className="inft-tags">
              {a.inft && <span className="badge badge-pink">iNFT {a.inft}</span>}
              <span className={`badge ${sb.cls}`}>{sb.label}</span>
              <span className="badge badge-purple">0G Verified</span>
              <span className="badge badge-blue">Hedera EVM</span>
              {a.isArena1 && <span className="badge badge-amber">Arena #1</span>}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--white)', marginBottom: 4, letterSpacing: '-.3px' }}>{a.name}</div>
            <div style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)', marginBottom: 10 }}>
              by {a.owner} · {a.sector} sector · Deployed Mar 2025
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.7 }}>{a.desc}</div>
            <div style={{ display: 'flex', gap: 9, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn btn-md btn-pink" onClick={() => forkAgent(a.name, a.sector, a.emoji)}>Fork this agent ✦</button>
              <button className="btn btn-md btn-ghost" onClick={() => showPage('pool-detail')}>View current pool →</button>
              <button className="btn btn-md btn-ghost">View on 0G Chain</button>
            </div>
          </div>
        </div>

        {/* Perf row */}
        <div className="inft-perf">
          {[
            { label: '7d yield',     val: a.yield,   color: a.pos ? 'var(--green)' : 'var(--red)' },
            { label: 'TVL',          val: a.tvl,      color: 'var(--white)' },
            { label: 'Total trades', val: a.trades,   color: 'var(--white)' },
            { label: 'Win rate',     val: a.wr,       color: 'var(--green)' },
            { label: 'Max drawdown', val: a.dd,       color: 'var(--green)' },
          ].map(m => (
            <div key={m.label} className="ipc">
              <div className="ipl">{m.label}</div>
              <div className="ipv" style={{ color: m.color }}>{m.val}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="inft-tabs">
          {[['perf','Performance'],['proof','Proof trail'],['copies','Copies'],['strat','Strategy']].map(([id, label]) => (
            <button key={id} className={`itab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* Performance tab */}
        {tab === 'perf' && (
          <div className="ipanel active">
            <div className="twolay">
              <div className="neu-card" style={{ padding: 18 }}>
                <div className="section-label">7-day APY history</div>
                <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 80, marginTop: 8 }}>
                  {[55,68,62,80,74,90,100].map((h, i) => (
                    <div key={i} className={`spb ${h >= 85 ? 'hi' : ''}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>7d ago · {a.apyLow}</span>
                  <span style={{ fontSize: 9, color: 'var(--green)', fontFamily: 'var(--mono)' }}>Today · {a.apyNow}</span>
                </div>
              </div>
              <div className="neu-card" style={{ padding: 18 }}>
                <div className="section-label">iNFT economics</div>
                <div style={{ fontSize: 11, color: 'var(--t2)', fontFamily: 'var(--mono)', lineHeight: 2.4 }}>
                  {[
                    { k: 'Royalty on copies', v: a.royalty, c: 'var(--pink)' },
                    { k: 'Copies sold',       v: a.copies,  c: 'var(--white)' },
                    { k: 'Earned from copies',v: a.earned,  c: 'var(--green)' },
                    { k: 'Floor price',       v: 'Free',     c: 'var(--white)' },
                  ].map(row => (
                    <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {row.k}<span style={{ color: row.c, fontWeight: 700 }}>{row.v}</span>
                    </div>
                  ))}
                </div>
                <div className="neu-divider" />
                <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
                  Proof hash: <span style={{ color: 'var(--purple)' }}>{a.proof}</span> · 0G Chain
                </div>
              </div>
            </div>
            <div className="neu-card" style={{ padding: 18, marginTop: 14 }}>
              <div className="section-label">Recent trade log</div>
              <table className="ptable">
                <thead><tr><th>Timestamp</th><th>Action</th><th>Pool</th><th style={{ textAlign: 'right' }}>APY</th><th style={{ textAlign: 'right' }}>Result</th></tr></thead>
                <tbody>
                  {TRADE_LOG.map((r, i) => (
                    <tr key={i}>
                      <td>{r.ts}</td>
                      <td style={{ color: r.actionColor }}>{r.action}</td>
                      <td>{r.pool}</td>
                      <td style={{ textAlign: 'right', color: 'var(--green)' }}>{r.apy}</td>
                      <td style={{ textAlign: 'right', color: r.resColor }}>{r.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Proof trail tab */}
        {tab === 'proof' && (
          <div className="ipanel active">
            <div className="neu-card" style={{ padding: 18 }}>
              <div className="section-label">On-chain proof trail — 0G Chain</div>
              <table className="ptable">
                <thead><tr><th>Timestamp</th><th>Decision</th><th>Proof hash</th><th>Model</th><th style={{ textAlign: 'right' }}>Status</th></tr></thead>
                <tbody>
                  {PROOF_LOG.map((r, i) => (
                    <tr key={i}>
                      <td>{r.ts}</td>
                      <td>{r.decision}</td>
                      <td style={{ color: 'var(--purple)' }}>{r.hash}</td>
                      <td>{r.model}</td>
                      <td style={{ textAlign: 'right' }}><span className="badge badge-green">Verified</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)', marginTop: 10 }}>
                All decisions immutably stored on 0G Chain. Each proof hash links to full inference record including model inputs and confidence scores.
              </div>
            </div>
          </div>
        )}

        {/* Copies tab */}
        {tab === 'copies' && (
          <div className="ipanel active">
            <div className="neu-card" style={{ padding: 18 }}>
              <div className="section-label">Copies of this agent ({a.copies})</div>
              <table className="ptable">
                <thead><tr><th>Wallet</th><th>Forked</th><th style={{ textAlign: 'right' }}>Capital</th><th style={{ textAlign: 'right' }}>7d yield</th><th style={{ textAlign: 'right' }}>Status</th></tr></thead>
                <tbody>
                  {COPIES_LOG.map((r, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--blue)' }}>{r.wallet}</td>
                      <td>{r.forked}</td>
                      <td style={{ textAlign: 'right' }}>{r.capital}</td>
                      <td style={{ textAlign: 'right', color: r.pos ? 'var(--green)' : 'var(--red)' }}>{r.yield}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${r.status === 'Running' ? 'badge-green' : 'badge-amber'}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)', marginTop: 10 }}>
                {a.royalty} royalty earned on each copy's yield. Total earned: {a.earned.replace('+', '')}
              </div>
            </div>
          </div>
        )}

        {/* Strategy tab */}
        {tab === 'strat' && (
          <div className="ipanel active">
            <div className="neu-card" style={{ padding: 18 }}>
              <div className="section-label">Strategy configuration</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <div className="section-label" style={{ fontSize: 9, marginBottom: 10 }}>Parameters</div>
                  {[
                    { k: 'Pool',           v: a.pool,   c: '' },
                    { k: 'Min yield floor',v: a.floor,  c: 'var(--red)' },
                    { k: 'Target yield',   v: a.target, c: 'var(--green)' },
                    { k: 'Max drawdown',   v: a.maxdd,  c: 'var(--red)' },
                    { k: 'Scan interval',  v: '5 min',  c: '' },
                  ].map(r => (
                    <div key={r.k} className="sum-row">
                      <span className="sum-key">{r.k}</span>
                      <span className="sum-val" style={r.c ? { color: r.c } : {}}>{r.v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="section-label" style={{ fontSize: 9, marginBottom: 10 }}>Triggers</div>
                  {[
                    { k: 'Rotate if delta', v: '> 0.5%',       c: 'var(--green)' },
                    { k: 'Exit if APY',     v: `< ${a.floor}`,  c: 'var(--red)' },
                    { k: 'Emergency exit',  v: 'risk > 6/10',   c: 'var(--red)' },
                    { k: 'Model',           v: 'Claude 3.5 + 0G', c: '' },
                    { k: 'Social feeds',    v: 'X, Telegram',   c: '' },
                  ].map(r => (
                    <div key={r.k} className="sum-row">
                      <span className="sum-key">{r.k}</span>
                      <span className="sum-val" style={r.c ? { color: r.c } : {}}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
