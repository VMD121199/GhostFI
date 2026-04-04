import { useApp } from '../context/AppContext'

const wallets = [
  { icon: '🦊', name: 'MetaMask', sub: 'Browser extension' },
  { icon: '🔵', name: 'Coinbase Wallet', sub: 'Mobile & extension' },
  { icon: '🌐', name: 'WalletConnect', sub: 'Any mobile wallet' },
]

export default function WalletModal() {
  const { walletModalOpen, setWalletModalOpen, connectWallet } = useApp()

  if (!walletModalOpen) return null

  return (
    <div className="modal-overlay active" onClick={() => setWalletModalOpen(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Connect wallet</div>
        <div className="modal-sub">Choose your wallet to access GhostFi</div>
        {wallets.map(w => (
          <div key={w.name} className="wallet-opt" onClick={() => connectWallet(w.name)}>
            <div className="w-icon">{w.icon}</div>
            <div>
              <div className="w-name">{w.name}</div>
              <div className="w-sub">{w.sub}</div>
            </div>
          </div>
        ))}
        <button className="btn btn-ghost btn-md" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          onClick={() => setWalletModalOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  )
}
