import { useApp } from '../context/AppContext'

export default function Landing() {
  const { page, showPage, setWalletModalOpen } = useApp()

  return (
    <div id="landing" className={page === 'landing' ? 'active' : ''}
      style={{ display: page === 'landing' ? 'flex' : 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: 60, overflow: 'hidden', position: 'relative' }}>
      <div className="land-grid" />
      <div className="land-content">
        <div className="land-disc">
          <span className="land-disc-inner">👻</span>
        </div>
        <div className="land-pill">
          <span className="sdot on" style={{ width: 5, height: 5 }} />
          EthGlobal Cannes · 0G · Uniswap · Hedera
        </div>
        <h1 className="land-h1">DeFi agents<br />that <em>never sleep</em></h1>
        <p className="land-p">
          Deploy AI-powered strategy agents that scan pools, rank opportunities, and execute trades on your behalf — verifiably, onchain, around the clock.
        </p>
        <div className="land-actions">
          <button className="btn btn-lg btn-white" onClick={() => setWalletModalOpen(true)}>
            Connect wallet
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <button className="btn btn-lg btn-ghost" onClick={() => showPage('marketplace')}>
            Browse marketplace
          </button>
        </div>
        <div className="land-stats">
          <div className="land-stat">
            <div className="land-stat-val">247</div>
            <div className="land-stat-label">Agents live</div>
          </div>
          <div className="land-stat">
            <div className="land-stat-val">$4.2M</div>
            <div className="land-stat-label">Total TVL</div>
          </div>
          <div className="land-stat">
            <div className="land-stat-val" style={{ color: 'var(--green)' }}>+8.4%</div>
            <div className="land-stat-label">Avg 7d yield</div>
          </div>
        </div>
      </div>
    </div>
  )
}
