import { useApp } from '../context/AppContext'
import logo from '../images/logo.jpg'

export default function Landing() {
  const { page, showPage, setWalletModalOpen } = useApp()

  if (page !== 'landing') return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: 60, overflow: 'hidden', position: 'relative' }}>
      <div className="land-grid" />
      <div className="land-content">
        <div className="land-disc">
          {/* <span className="land-disc-inner">👻</span> */}
          <img src={logo} alt="Logo" style={{ width: 74, height: 74, objectFit: 'contain' }} />          
        </div>

        <div className="land-pill">
          <span className="sdot on" style={{ width: 5, height: 5 }} />
          <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/22163.png" alt="0G" style={{ width:14,height:14,borderRadius:'50%',objectFit:'cover' }} />
          0G &nbsp;·&nbsp;
          <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png" alt="UNI" style={{ width:14,height:14,borderRadius:'50%',objectFit:'cover' }} />
          Uniswap &nbsp;·&nbsp;
          <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/4642.png" alt="HBAR" style={{ width:14,height:14,borderRadius:'50%',objectFit:'cover' }} />
          Hedera &nbsp;·&nbsp;
          <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" alt="ETH" style={{ width:14,height:14,borderRadius:'50%',objectFit:'cover' }} />
          World Chain
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
            <div className="land-stat-val">
              <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png" alt="USDC" style={{ width:18,height:18,borderRadius:'50%',objectFit:'cover' }} />
              <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" alt="ETH" style={{ width:18,height:18,borderRadius:'50%',objectFit:'cover' }} />
              $4.2M
            </div>
            <div className="land-stat-label">Total TVL</div>
          </div>
          <div className="land-stat">
            <div className="land-stat-val">247</div>
            <div className="land-stat-label">Agents live</div>
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
