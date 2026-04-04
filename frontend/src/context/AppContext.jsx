import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [page, setPage] = useState('landing')
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [inftAgent, setInftAgent] = useState(null)
  const [prevPage, setPrevPage] = useState('marketplace')

  // Create agent state
  const [createStep, setCreateStep] = useState(1)
  const [agentSector, setAgentSector] = useState('Stablecoin')
  const [agentEmoji, setAgentEmoji] = useState('🌊')
  const [agentName, setAgentName] = useState('')
  const [agentDesc, setAgentDesc] = useState('')
  const [agentCapital, setAgentCapital] = useState('')
  const [agentRisk, setAgentRisk] = useState('low')
  const [agentInterval, setAgentInterval] = useState('5m')
  const [agentKits, setAgentKits] = useState(['0G Compute', 'Uniswap API'])

  const showPage = (id) => {
    setPrevPage(page)
    setPage(id)
    window.scrollTo(0, 0)
  }

  const openInft = (agent) => {
    setPrevPage(page)
    setInftAgent(agent)
    setPage('inft-detail')
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    setPage(prevPage || 'marketplace')
    window.scrollTo(0, 0)
  }

  const connectWallet = async (walletName) => {
    try {
      let address = null

      if (walletName === 'MetaMask') {
        if (!window.ethereum?.isMetaMask) {
          window.open('https://metamask.io/download/', '_blank')
          return
        }
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        address = accounts[0]

      } else if (walletName === 'Coinbase Wallet') {
        if (!window.ethereum) {
          window.open('https://www.coinbase.com/wallet', '_blank')
          return
        }
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        address = accounts[0]

      } else if (walletName === 'WalletConnect') {
        // Placeholder: integrate @walletconnect/web3-provider for full support
        alert('WalletConnect coming soon')
        return
      }

      if (address) {
        setWalletAddress(address)
        setWalletConnected(true)
        setWalletModalOpen(false)
        showPage('marketplace')
      }
    } catch (err) {
      console.error('Wallet connection failed:', err)
    }
  }

  const resetCreate = () => {
    setCreateStep(1)
    setAgentSector('Stablecoin')
    setAgentEmoji('🌊')
    setAgentName('')
    setAgentDesc('')
    setAgentCapital('')
    setAgentRisk('low')
    setAgentKits(['0G Compute', 'Uniswap API'])
  }

  const forkAgent = (name, sector, emoji) => {
    resetCreate()
    setAgentSector(sector)
    setAgentEmoji(emoji || '🌊')
    setAgentName('My ' + name + ' fork')
    setCreateStep(2)
    showPage('create')
  }

  const toggleKit = (kitName) => {
    setAgentKits(prev =>
      prev.includes(kitName) ? prev.filter(k => k !== kitName) : [...prev, kitName]
    )
  }

  return (
    <AppContext.Provider value={{
      page, showPage, goBack,
      walletConnected, setWalletConnected, walletAddress, walletModalOpen,
      setWalletModalOpen, connectWallet,
      inftAgent, openInft,
      createStep, setCreateStep,
      agentSector, setAgentSector,
      agentEmoji, setAgentEmoji,
      agentName, setAgentName,
      agentDesc, setAgentDesc,
      agentCapital, setAgentCapital,
      agentRisk, setAgentRisk,
      agentInterval, setAgentInterval,
      agentKits, toggleKit,
      resetCreate, forkAgent,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
