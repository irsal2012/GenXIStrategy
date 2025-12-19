import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Info,
} from '@mui/icons-material'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import { fetchDashboardData, fetchPortfolioSummary } from '../store/slices/analyticsSlice'

function HealthScoreCard({ score, label, trend }) {
  const getColor = (score) => {
    if (score >= 80) return '#2e7d32'
    if (score >= 60) return '#ed6c02'
    return '#d32f2f'
  }

  const color = getColor(score)

  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h3" sx={{ color }}>
            {score}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend > 0 ? (
              <TrendingUp sx={{ color: '#2e7d32' }} />
            ) : (
              <TrendingDown sx={{ color: '#d32f2f' }} />
            )}
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {Math.abs(trend)}%
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={score}
          sx={{
            height: 8,
            borderRadius: 1,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
            },
          }}
        />
      </CardContent>
    </Card>
  )
}

function Analytics() {
  const dispatch = useDispatch()
  const { dashboardData, portfolioSummary, loading, error } = useSelector(
    (state) => state.analytics
  )

  useEffect(() => {
    dispatch(fetchDashboardData())
    dispatch(fetchPortfolioSummary())
  }, [dispatch])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Unable to load analytics</Typography>
          <Typography variant="body2">{String(error)}</Typography>
        </Alert>
      </Box>
    )
  }

  if (!dashboardData) {
    return null
  }

  // Calculate portfolio health score
  const calculateHealthScore = () => {
    const activeRatio = (dashboardData.active_initiatives / dashboardData.total_initiatives) * 100
    const budgetUtilization = (dashboardData.total_budget_spent / dashboardData.total_budget_allocated) * 100
    const riskFactor = 100 - (dashboardData.high_risk_count / dashboardData.total_initiatives) * 100
    const roiScore = Math.min(dashboardData.avg_expected_roi || 0, 100)
    
    return Math.round((activeRatio * 0.3 + riskFactor * 0.3 + roiScore * 0.2 + (100 - budgetUtilization) * 0.2))
  }

  const healthScore = calculateHealthScore()

  // Prepare radar chart data
  const radarData = [
    {
      metric: 'Business Value',
      score: 75,
      fullMark: 100,
    },
    {
      metric: 'Technical Feasibility',
      score: 82,
      fullMark: 100,
    },
    {
      metric: 'Risk Management',
      score: 100 - (dashboardData.high_risk_count / dashboardData.total_initiatives) * 100,
      fullMark: 100,
    },
    {
      metric: 'Strategic Alignment',
      score: 88,
      fullMark: 100,
    },
    {
      metric: 'ROI Performance',
      score: Math.min(dashboardData.avg_expected_roi || 0, 100),
      fullMark: 100,
    },
  ]

  // Prepare status distribution for bar chart
  const statusChartData = dashboardData.status_distribution?.map((item) => ({
    name: item.status,
    count: item.count,
  })) || []

  const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#9c27b0']

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Portfolio Analytics & Intelligence
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Strategic insights and AI-powered recommendations for executive decision-making
      </Typography>

      <Grid container spacing={3}>
        {/* Portfolio Health Score */}
        <Grid item xs={12} md={4}>
          <HealthScoreCard score={healthScore} label="Portfolio Health Score" trend={5} />
        </Grid>
        <Grid item xs={12} md={4}>
          <HealthScoreCard
            score={Math.round(dashboardData.avg_expected_roi || 0)}
            label="Expected ROI"
            trend={3}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <HealthScoreCard
            score={Math.round((dashboardData.active_initiatives / dashboardData.total_initiatives) * 100)}
            label="Active Initiatives %"
            trend={-2}
          />
        </Grid>

        {/* AI Executive Summary */}
        {portfolioSummary && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Info sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6">AI-Powered Executive Summary</Typography>
              </Box>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {portfolioSummary.summary}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Score Comparison Radar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Portfolio Score Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Portfolio Scores"
                  dataKey="score"
                  stroke="#1976d2"
                  fill="#1976d2"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Distribution Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Initiative Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1976d2">
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Risk Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Risk Overview
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Warning sx={{ color: '#d32f2f', mr: 1 }} />
                  <Typography variant="body1">High Risk Initiatives</Typography>
                </Box>
                <Chip
                  label={dashboardData.high_risk_count}
                  color={dashboardData.high_risk_count > 5 ? 'error' : 'warning'}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ color: '#2e7d32', mr: 1 }} />
                  <Typography variant="body1">Low Risk Initiatives</Typography>
                </Box>
                <Chip
                  label={dashboardData.total_initiatives - dashboardData.high_risk_count}
                  color="success"
                />
              </Box>
              <Alert severity={dashboardData.high_risk_count > 5 ? 'error' : 'info'} sx={{ mt: 2 }}>
                {dashboardData.high_risk_count > 5
                  ? 'Portfolio has elevated risk exposure. Consider risk mitigation strategies.'
                  : 'Portfolio risk levels are within acceptable parameters.'}
              </Alert>
            </Box>
          </Paper>
        </Grid>

        {/* Budget & Investment Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget & Investment Analysis
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Budget Allocated
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${(dashboardData.total_budget_allocated / 1000000).toFixed(2)}M
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Budget Spent
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${(dashboardData.total_budget_spent / 1000000).toFixed(2)}M
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Remaining Budget
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    ${((dashboardData.total_budget_allocated - dashboardData.total_budget_spent) / 1000000).toFixed(2)}M
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(dashboardData.total_budget_spent / dashboardData.total_budget_allocated) * 100}
                  sx={{ mt: 2, height: 10, borderRadius: 1 }}
                />
              </Box>
              <Alert severity="success">
                Budget utilization is at{' '}
                {((dashboardData.total_budget_spent / dashboardData.total_budget_allocated) * 100).toFixed(1)}%
                - tracking within expected parameters.
              </Alert>
            </Box>
          </Paper>
        </Grid>

        {/* Key Insights */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Strategic Recommendations
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Alert severity="info" icon={<TrendingUp />}>
                  <Typography variant="body2" fontWeight="bold">
                    Portfolio Growth
                  </Typography>
                  <Typography variant="body2">
                    {dashboardData.active_initiatives} active initiatives showing strong momentum
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert severity={dashboardData.high_risk_count > 5 ? 'warning' : 'success'} icon={<Warning />}>
                  <Typography variant="body2" fontWeight="bold">
                    Risk Management
                  </Typography>
                  <Typography variant="body2">
                    {dashboardData.high_risk_count > 5
                      ? 'Elevated risk levels require attention'
                      : 'Risk levels are well-managed'}
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert severity="success" icon={<CheckCircle />}>
                  <Typography variant="body2" fontWeight="bold">
                    ROI Performance
                  </Typography>
                  <Typography variant="body2">
                    Expected ROI of {dashboardData.avg_expected_roi?.toFixed(1)}% exceeds targets
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Analytics
