import { AppProvider } from './context/AppContext'
import Nav from './components/Nav'
import WalletModal from './components/WalletModal'
import Landing from './pages/Landing'
import Marketplace from './pages/Marketplace'
import CreateAgent from './pages/CreateAgent'
import MyAgents from './pages/MyAgents'
import Arena from './pages/Arena'
import InftDetail from './pages/InftDetail'
import PoolDetail from './pages/PoolDetail'

export default function App() {
  return (
    <AppProvider>
      <Nav />
      <WalletModal />
      <Landing />
      <Marketplace />
      <CreateAgent />
      <MyAgents />
      <Arena />
      <InftDetail />
      <PoolDetail />
    </AppProvider>
  )
}
