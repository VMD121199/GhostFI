import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './Nav.css'

const navLinks = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'create', label: 'Create' },
  { id: 'myagents', label: 'My Agents' },
  { id: 'arena', label: 'Arena' },
]

export default function Nav() {
  const { page, showPage, walletConnected, setWalletModalOpen, resetCreate, walletAddress, setWalletConnected } = useApp()
  const [dropdownOpen, setDropdownOpen] = useState(false)

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
        <div style={{ position: 'relative' }}>
          <button className="wallet-btn" onClick={() => setDropdownOpen(o => !o)}>
            <span className="wdot" />
            {walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)}
          </button>
          {dropdownOpen && (
            <div className="wallet-dropdown" onClick={() => setDropdownOpen(false)}>
              <button className="wopt" onClick={() => setWalletModalOpen(true)}>Switch Wallet</button>
              <button className="wopt" onClick={() => {
                setWalletConnected(false)
                showPage('landing')
              }}>Disconnect</button>
            </div>
          )}
        </div>
      ) : (
        <button className="wallet-btn" onClick={() => setWalletModalOpen(true)}>
          Connect wallet
        </button>
      )}
    </nav>
  )
}
