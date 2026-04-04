import { useState } from 'react'
import { useApp } from '../context/AppContext'

const YIELD_TABLE = [
  { rank: 1, emoji: '🌊', name: 'StableMax v2', creator: '0xGhost.eth', sector: 'Stablecoin', inft: true, yield: '+14.2%', tvl: '$820K', copies: 312, pos: true },
  { rank: 2, emoji: '🏦', name: 'LendLoop Alpha', creator: '0xGhost.eth', sector: 'Lending', inft: true, yield: '+11.8%', tvl: '$1.1M', copies: 198, pos: true },
  { rank: 3, emoji: '🔄', name: 'ReStake Pro', creator: 'alphavault.eth', sector: 'Restaking', yield: '+9.3%', tvl: '$540K', copies: 87, pos: true },
  { rank: 4, emoji: '👻', name: 'GhostStake v1', creator: '0xGhost.eth', sector: 'Restaking', yield: '+8.1%', tvl: '$720K', copies: 'new', pos: true },
  { rank: 5, emoji: '🏠', name: 'RWA Harvester', creator: 'defi_monk.eth', sector: 'RWA', yield: '+7.6%', tvl: '$290K', copies: 54, pos: true },
  { rank: 6, emoji: '📉', name: 'BearGuard', creator: 'stablesurfer.eth', sector: 'Stablecoin', yield: '−1.2%', tvl: '$88K', copies: 12, pos: false },
]

const TVL_TABLE = [
  { rank: 1, emoji: '🏦', name: 'LendLoop Alpha', creator: '0xGhost.eth', sector: 'Lending', tvl: '$1.1M', yield: '+11.8%', delta: '+$42K', pos: true },
  { rank: 2, emoji: '🌊', name: 'StableMax v2', creator: '0xGhost.eth', sector: 'Stablecoin', tvl: '$820K', yield: '+14.2%', delta: '+$18K', pos: true },
  { rank: 3, emoji: '👻', name: 'GhostStake v1', creator: '0xGhost.eth', sector: 'Restaking', tvl: '$720K', yield: '+8.1%', delta: '+$9K', pos: true },
  { rank: 4, emoji: '🔄', name: 'ReStake Pro', creator: 'alphavault.eth', sector: 'Restaking', tvl: '$540K', yield: '+9.3%', delta: '−$7K', pos: false },
  { rank: 5, emoji: '📉', name: 'BearGuard', creator: 'stablesurfer.eth', sector: 'Stablecoin', tvl: '$88K', yield: '−1.2%', delta: '−$12K', pos: false },
]

const CREATORS_TABLE = [
  { rank: 1, name: '0xGhost.eth', sub: '3 agents · joined Mar 2025', agents: 3, tvl: '$1.64M', copies: 510 },
  { rank: 2, name: 'alphavault.eth', sub: '2 agents', agents: 2, tvl: '$830K', copies: 285 },
  { rank: 3, name: 'yieldmaxi.eth', sub: '5 agents', agents: 5, tvl: '$620K', copies: 201 },
  { rank: 4, name: 'defi_monk.eth', sub: '1 agent', agents: 1, tvl: '$290K', copies: 54 },
]

const SPONSORS = [
  { name: '0G Network', prize: '$50K', track: 'Full stack AI · best use of 0G Compute + Storage + Chain', color: 'var(--blue)' },
  { name: 'Hedera', prize: '$40K', track: 'AI + Agents track · Hedera Agent Kit + EVM deployment', color: 'var(--pink)' },
  { name: 'Uniswap', prize: '$30K', track: 'Core integration · routing, liquidity, onchain finance', color: 'var(--purple)' },
  { name: 'World Chain', prize: '$20K', track: 'Identity + proof of human agent interactions', color: 'var(--amber)' },
]

const rankClass = (r) => r === 1 ? 'rank-1' : r === 2 ? 'rank-2' : r === 3 ? 'rank-3' : ''
const rnumClass = (r) => r === 1 ? 'r1' : r === 2 ? 'r2' : r === 3 ? 'r3' : ''
const pad = (n) => String(n).padStart(2, '0')

export default function Arena() {
  const { page, forkAgent } = useApp()
  const [tab, setTab] = useState('yield')

  if (page !== 'arena') return null

  return (
    <div className="page active" style={{ paddingTop: 60 }}>
      <div className="page-inner">
        <div className="arena-meta">
          <div>
            <div className="page-title">Arena</div>
            <div className="page-sub">Live agent performance · verified on 0G Chain</div>
          </div>
          <div className="live-pill">
            <span className="sdot on" style={{ width: 5, height: 5 }} />
            Live
          </div>
        </div>

        {/* Prize banner */}
        <div className="prize-banner">
          <div className="prize-top">
            <div>
              <div className="section-label">Total prize pool — EthGlobal Cannes</div>
              <div className="prize-total">$140,000</div>
              <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)', marginTop: 3 }}>
                Across 4 sponsor tracks · distributed by arena performance
              </div>
            </div>
            <span className="badge badge-green" style={{ padding: '5px 14px', fontSize: 10 }}>Active</span>
          </div>
          <div className="prize-sponsors">
            {SPONSORS.map(s => (
              <div key={s.name} className="sponsor-card">
                <div className="sponsor-logo" style={{ color: s.color }}>{s.name}</div>
                <div className="sponsor-prize" style={{ color: s.color }}>{s.prize}</div>
                <div className="sponsor-track">{s.track}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-row" style={{ marginBottom: 26 }}>
          <div className="stat-card"><div className="sc-label">Total agents</div><div className="sc-val">247</div><div className="sc-sub">+12 this week</div></div>
          <div className="stat-card"><div className="sc-label">Total TVL</div><div className="sc-val">$4.2M</div><div className="sc-sub">Updated 2 min ago</div></div>
          <div className="stat-card"><div className="sc-label">Avg 7d yield</div><div className="sc-val green">+8.4%</div><div className="sc-sub green">vs +2.1% manual</div></div>
        </div>

        <div className="atabs">
          {[['yield','Top yield'],['tvl','Top TVL'],['creators','Top creators']].map(([id, label]) => (
            <button key={id} className={`atab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* Yield table */}
        {tab === 'yield' && (
          <div className="arena-table">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 42 }}>#</th>
                  <th>Agent</th>
                  <th style={{ width: 100, textAlign: 'right' }}>7d yield</th>
                  <th style={{ width: 100, textAlign: 'right' }}>TVL</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Copies</th>
                  <th style={{ width: 88, textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {YIELD_TABLE.map(a => (
                  <tr key={a.name} className={rankClass(a.rank)}>
                    <td><span className={`rnum ${rnumClass(a.rank)}`}>{pad(a.rank)}</span></td>
                    <td>
                      <div className="ar-name" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 16 }}>{a.emoji}</span>{a.name}
                      </div>
                      <div className="ar-creator">
                        {a.creator} · {a.sector}
                        {a.inft && <> · <span className="badge badge-pink" style={{ fontSize: 8 }}>iNFT</span></>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }} className={a.pos ? 'yield-pos' : 'yield-neg'}>{a.yield}</td>
                    <td style={{ textAlign: 'right' }} className="tvl-val">{a.tvl}</td>
                    <td style={{ textAlign: 'right' }} className="cp-val">{a.copies}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className={`btn btn-sm ${a.rank === 1 ? 'btn-white' : 'btn-ghost'}`}
                        onClick={() => a.emoji && forkAgent(a.name, a.sector, a.emoji)}>Fork →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TVL table */}
        {tab === 'tvl' && (
          <div className="arena-table">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 42 }}>#</th>
                  <th>Agent</th>
                  <th style={{ width: 100, textAlign: 'right' }}>TVL</th>
                  <th style={{ width: 100, textAlign: 'right' }}>7d yield</th>
                  <th style={{ width: 100, textAlign: 'right' }}>24h Δ</th>
                  <th style={{ width: 88, textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {TVL_TABLE.map(a => (
                  <tr key={a.name} className={rankClass(a.rank)}>
                    <td><span className={`rnum ${rnumClass(a.rank)}`}>{pad(a.rank)}</span></td>
                    <td>
                      <div className="ar-name" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 16 }}>{a.emoji}</span>{a.name}
                      </div>
                      <div className="ar-creator">{a.creator} · {a.sector}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700 }}>{a.tvl}</td>
                    <td style={{ textAlign: 'right' }} className="yield-pos">{a.yield}</td>
                    <td style={{ textAlign: 'right' }} className={a.pos ? 'delta-pos' : 'delta-neg'}>{a.delta}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className={`btn btn-sm ${a.rank === 1 ? 'btn-white' : 'btn-ghost'}`}>Fork →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Creators table */}
        {tab === 'creators' && (
          <div className="arena-table">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 42 }}>#</th>
                  <th>Creator</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Agents</th>
                  <th style={{ width: 100, textAlign: 'right' }}>TVL</th>
                  <th style={{ width: 100, textAlign: 'right' }}>Copies</th>
                  <th style={{ width: 88, textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {CREATORS_TABLE.map(c => (
                  <tr key={c.name} className={rankClass(c.rank)}>
                    <td><span className={`rnum ${rnumClass(c.rank)}`}>{pad(c.rank)}</span></td>
                    <td>
                      <div className="ar-name">{c.name}</div>
                      <div className="ar-creator">{c.sub}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{c.agents}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700 }}>{c.tvl}</td>
                    <td style={{ textAlign: 'right' }} className="yield-pos">{c.copies}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className={`btn btn-sm ${c.rank === 1 ? 'btn-white' : 'btn-ghost'}`}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)', letterSpacing: '.05em' }}>
            PINK = TOP RANKED · GREEN = POSITIVE YIELD · RED = NEGATIVE · iNFT = TRADEABLE AGENT
          </div>
        </div>
      </div>
    </div>
  )
}
