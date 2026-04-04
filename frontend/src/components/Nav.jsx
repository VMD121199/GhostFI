import { useApp } from '../context/AppContext'
import './Nav.css'

const navLinks = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'create', label: 'Create' },
  { id: 'myagents', label: 'My Agents' },
  { id: 'arena', label: 'Arena' },
]

export default function Nav() {
  const { page, showPage, walletConnected, setWalletModalOpen, resetCreate } = useApp()

  return (
    <nav>
      <div className="nav-logo" onClick={() => showPage(walletConnected ? 'marketplace' : 'landing')}>
        <div className="nav-logo-wrap">
          <span style={{ fontSize: 18 }}>👻</span>
        </div>
        <span className="nav-logo-text">GhostFi</span>
      </div>

      {walletConnected && (
        <div className="nav-links">
          {navLinks.map(link => (
            <div
              key={link.id}
              className={`nav-link ${page === link.id ? 'active' : ''}`}
              onClick={() => {
                if (link.id === 'create') resetCreate()
                showPage(link.id)
              }}
            >
              {link.label}
            </div>
          ))}
        </div>
      )}

      {walletConnected ? (
        <div className="wallet-btn">
          <span className="wdot" />
          0xGhost.eth
        </div>
      ) : (
        <button className="wallet-btn" onClick={() => setWalletModalOpen(true)}>
          Connect wallet
        </button>
      )}
    </nav>
  )
}
