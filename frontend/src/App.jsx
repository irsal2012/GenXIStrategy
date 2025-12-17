import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import InitiativesList from './pages/InitiativesList'
import InitiativeDetail from './pages/InitiativeDetail'
import IntakeForm from './pages/IntakeForm'
import PortfolioRankings from './pages/PortfolioRankings'
import PortfolioBalance from './pages/PortfolioBalance'
import RoadmapTimeline from './pages/RoadmapTimeline'
import DependencyGraph from './pages/DependencyGraph'
import GovernanceWorkflow from './pages/GovernanceWorkflow'
import PolicyLibrary from './pages/PolicyLibrary'
import EvidenceVault from './pages/EvidenceVault'

function PrivateRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="intake" element={<IntakeForm />} />
          <Route path="initiatives" element={<InitiativesList />} />
          <Route path="initiatives/:id" element={<InitiativeDetail />} />
          <Route path="portfolio/rankings" element={<PortfolioRankings />} />
          <Route path="portfolio/balance" element={<PortfolioBalance />} />
          <Route path="roadmap/timeline" element={<RoadmapTimeline />} />
          <Route path="roadmap/dependencies" element={<DependencyGraph />} />
          <Route path="governance/workflows" element={<GovernanceWorkflow />} />
          <Route path="governance/policies" element={<PolicyLibrary />} />
          <Route path="governance/evidence" element={<EvidenceVault />} />
        </Route>
      </Routes>
    </Box>
  )
}

export default App
