import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logoutFromAuthEvent } from './store/slices/authSlice'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import InitiativesList from './pages/InitiativesList'
import InitiativeDetail from './pages/InitiativeDetail'
import InitiativeForm from './pages/InitiativeForm'
import IntakeForm from './pages/IntakeForm'
import PortfolioRankings from './pages/PortfolioRankings'
import PortfolioBalance from './pages/PortfolioBalance'
import RoadmapTimeline from './pages/RoadmapTimeline'
import DependencyGraph from './pages/DependencyGraph'
import GovernanceWorkflow from './pages/GovernanceWorkflow'
import PolicyLibrary from './pages/PolicyLibrary'
import EvidenceVault from './pages/EvidenceVault'
import KPITracking from './pages/KPITracking'
import BenefitsDashboard from './pages/BenefitsDashboard'
import ValueLeakageDetector from './pages/ValueLeakageDetector'
import PostImplementationReviews from './pages/PostImplementationReviews'
import ExecutiveReporting from './pages/ExecutiveReporting'
import Analytics from './pages/Analytics'
import AIProjectDashboard from './pages/AIProjectDashboard'
import BusinessUnderstanding from './pages/BusinessUnderstanding'
import BusinessUnderstandingNew from './pages/BusinessUnderstandingNew'
import TacticalUseCaseSelection from './pages/TacticalUseCaseSelection'
import DataUnderstanding from './pages/DataUnderstanding'
import DataPreparation from './pages/DataPreparation'
import ModelDevelopment from './pages/ModelDevelopment'
import ModelEvaluation from './pages/ModelEvaluation'
import ModelDeployment from './pages/ModelDeployment'
import ModelMonitoring from './pages/ModelMonitoring'

function PrivateRoute({ children }) {
  // Prefer persisted token so refresh/navigation doesn't incorrectly bounce users to /login.
  // Redux state is initialized from localStorage, but this makes the guard more robust.
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const token = useSelector((state) => state.auth.token)
  const hasToken = !!token || !!localStorage.getItem('token')
  return isAuthenticated || hasToken ? children : <Navigate to="/login" />
}

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const handler = () => dispatch(logoutFromAuthEvent())
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [dispatch])

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
          <Route path="initiatives/new" element={<InitiativeForm />} />
          <Route path="initiatives/:id" element={<InitiativeDetail />} />
          <Route path="portfolio/rankings" element={<PortfolioRankings />} />
          <Route path="portfolio/balance" element={<PortfolioBalance />} />
          <Route path="roadmap/timeline" element={<RoadmapTimeline />} />
          <Route path="roadmap/dependencies" element={<DependencyGraph />} />
          <Route path="governance" element={<GovernanceWorkflow />} />
          <Route path="governance/workflows" element={<GovernanceWorkflow />} />
          <Route path="governance/policies" element={<PolicyLibrary />} />
          <Route path="governance/evidence" element={<EvidenceVault />} />
          <Route path="benefits/kpis" element={<KPITracking />} />
          <Route path="benefits/dashboard" element={<BenefitsDashboard />} />
          <Route path="benefits/leakage" element={<ValueLeakageDetector />} />
          <Route path="benefits/reviews" element={<PostImplementationReviews />} />
          <Route path="reporting" element={<ExecutiveReporting />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="pmi-cpmai/business-understanding" element={<BusinessUnderstandingNew />} />
          <Route path="pmi-cpmai/initiatives/:initiativeId/tactical-use-cases" element={<TacticalUseCaseSelection />} />
          <Route path="ai-projects/:initiativeId" element={<AIProjectDashboard />} />
          <Route path="ai-projects/:initiativeId/business-understanding" element={<BusinessUnderstanding />} />
          <Route path="ai-projects/:initiativeId/data-understanding" element={<DataUnderstanding />} />
          <Route path="ai-projects/:initiativeId/data-preparation" element={<DataPreparation />} />
          <Route path="ai-projects/:initiativeId/model-development" element={<ModelDevelopment />} />
          <Route path="ai-projects/:initiativeId/model-evaluation" element={<ModelEvaluation />} />
          <Route path="ai-projects/:initiativeId/model-deployment" element={<ModelDeployment />} />
          <Route path="ai-projects/:initiativeId/model-monitoring" element={<ModelMonitoring />} />
        </Route>
      </Routes>
    </Box>
  )
}

export default App
