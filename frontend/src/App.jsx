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
        </Route>
      </Routes>
    </Box>
  )
}

export default App
