import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [page, setPage] = useState('landing')
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)

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
    setPage(id)
    window.scrollTo(0, 0)
  }

  const connectWallet = () => {
    setWalletModalOpen(false)
    setWalletConnected(true)
    showPage('marketplace')
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
      page, showPage,
      walletConnected, walletModalOpen,
      setWalletModalOpen, connectWallet,
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
