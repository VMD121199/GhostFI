import { createContext, useContext, useState, useEffect, useRef } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [page, setPage] = useState('landing')
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [inftAgent, setInftAgent] = useState(null)
  const [poolDetail, setPoolDetail] = useState(null)
  const [prevPage, setPrevPage] = useState('marketplace')
  const [prevCreateStep, setPrevCreateStep] = useState(1)

  // Create agent state
  const [createStep, setCreateStep] = useState(1)
  const [agentSector, setAgentSector] = useState('Stablecoin')
  const [agentEmoji, setAgentEmoji] = useState('🌊')
  const [agentName, setAgentName] = useState('')
  const [agentMinYield, setAgentMinYield] = useState('5')
  const [agentTargetYield, setAgentTargetYield] = useState('8')
  const [agentMaxDD, setAgentMaxDD] = useState('2')
  const [agentModel, setAgentModel] = useState('Claude 3.5')
  const [agentSocials, setAgentSocials] = useState(['X', 'Telegram'])
  const [agentPoolSources, setAgentPoolSources] = useState(['Uniswap v3', 'Curve Finance', 'Aave v3'])
  const [agentInterval, setAgentInterval] = useState('5m')
  const [agentDuration, setAgentDuration] = useState('7d')
  const [agentCapital, setAgentCapital] = useState('')
  const [agentRisk, setAgentRisk] = useState('low')
  const [agentRoyalty, setAgentRoyalty] = useState('5%')
  const [agentListingPrice, setAgentListingPrice] = useState('Free to copy')

  // Minted agents list — persists across navigation
  const [myAgents, setMyAgents] = useState([])

  // Track the active provider so we can remove the listener on cleanup
  const activeProviderRef = useRef(null)

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0 || accounts[0].toLowerCase() !== walletAddress?.toLowerCase()) {
        setWalletConnected(false)
        setWalletAddress(null)
        setPage('landing')
        window.scrollTo(0, 0)
      }
    }

    const provider = activeProviderRef.current
    if (walletConnected && provider) {
      provider.on('accountsChanged', handleAccountsChanged)
    }

    return () => {
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [walletConnected, walletAddress])

  const addMyAgent = (agent) => {
    setMyAgents(prev => [agent, ...prev])
  }

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

  const openPool = (pool) => {
    setPrevCreateStep(createStep)
    setPrevPage(page)
    setPoolDetail(pool)
    setPage('pool-detail')
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
        // Support multiple wallet extensions: find MetaMask's provider specifically
        let provider = window.ethereum
        if (window.ethereum?.providers?.length) {
          provider = window.ethereum.providers.find(p => p.isMetaMask) || null
        }
        if (!provider?.isMetaMask) {
          window.open('https://metamask.io/download/', '_blank')
          return
        }
        // Revoke old permissions so MetaMask treats this as a fresh connection
        try {
          await provider.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }],
          })
        } catch (_) {
          // wallet_revokePermissions not supported on older MetaMask — continue anyway
        }
        const accounts = await provider.request({ method: 'eth_requestAccounts' })
        address = accounts[0]
        activeProviderRef.current = provider
      } else if (walletName === 'Coinbase Wallet') {
        let provider = window.ethereum
        if (window.ethereum?.providers?.length) {
          provider = window.ethereum.providers.find(p => p.isCoinbaseWallet) || null
        }
        if (!provider?.isCoinbaseWallet) {
          window.open('https://www.coinbase.com/wallet', '_blank')
          return
        }
        const accounts = await provider.request({ method: 'eth_requestAccounts' })
        address = accounts[0]
        activeProviderRef.current = provider
      } else if (walletName === 'WalletConnect') {
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
    setAgentMinYield('5')
    setAgentTargetYield('8')
    setAgentMaxDD('2')
    setAgentModel('Claude 3.5')
    setAgentSocials(['X', 'Telegram'])
    setAgentPoolSources(['Uniswap v3', 'Curve Finance', 'Aave v3'])
    setAgentInterval('5m')
    setAgentDuration('7d')
    setAgentCapital('')
    setAgentRisk('low')
    setAgentRoyalty('5%')
    setAgentListingPrice('Free to copy')
  }

  const forkAgent = (name, sector, emoji) => {
    resetCreate()
    setAgentSector(sector)
    setAgentEmoji(emoji || '🌊')
    setAgentName('My ' + name + ' fork')
    setCreateStep(2)
    showPage('create')
  }

  const createFromPool = (pool) => {
    if (!pool) { showPage('create'); return }
    resetCreate()
    // Map protocol → sector
    const protocolSectorMap = {
      'Uniswap v3':    'Liquidity',
      'Curve Finance': 'Stablecoin',
      'Aave v3':       'Lending',
      'Morpho Blue':   'Lending',
    }
    const sector = protocolSectorMap[pool.protocol] || 'Stablecoin'
    setAgentSector(sector)
    // Pre-select only this pool's source
    setAgentPoolSources(pool.protocol ? [pool.protocol] : ['Uniswap v3'])
    // Pre-fill yield target from AI expected return (strip "+" and "%")
    if (pool.apy) {
      const numeric = parseFloat(pool.apy.replace(/[^0-9.]/g, ''))
      if (!isNaN(numeric)) setAgentTargetYield(String(numeric))
    }
    setCreateStep(2)
    showPage('create')
  }

  const toggleSocial = (s) => {
    setAgentSocials(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const togglePoolSource = (s) => {
    setAgentPoolSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  return (
    <AppContext.Provider value={{
      page, showPage, goBack,
      walletConnected, setWalletConnected, walletAddress, walletModalOpen,
      setWalletModalOpen, connectWallet,
      inftAgent, openInft,
      poolDetail, openPool,
      createStep, setCreateStep,
      agentSector, setAgentSector,
      agentEmoji, setAgentEmoji,
      agentName, setAgentName,
      agentMinYield, setAgentMinYield,
      agentTargetYield, setAgentTargetYield,
      agentMaxDD, setAgentMaxDD,
      agentModel, setAgentModel,
      agentSocials, toggleSocial,
      agentPoolSources, togglePoolSource,
      agentInterval, setAgentInterval,
      agentDuration, setAgentDuration,
      agentCapital, setAgentCapital,
      agentRisk, setAgentRisk,
      agentRoyalty, setAgentRoyalty,
      agentListingPrice, setAgentListingPrice,
      resetCreate, forkAgent, createFromPool,
      prevCreateStep,
      myAgents, addMyAgent,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
