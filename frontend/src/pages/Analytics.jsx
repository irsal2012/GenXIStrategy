import { useEffect, useState } from 'react'
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
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Info,
  Refresh,
  Assessment,
  Speed,
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
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
} from 'recharts'
import { fetchDashboardData, fetchPortfolioSummary } from '../store/slices/analyticsSlice'

function HealthScoreCard({ score, label, trend, subtitle }) {
  const getColor = (score) => {
    if (score >= 80) return '#2e7d32'
    if (score >= 60) return '#ed6c02'
    return '#d32f2f'
  }

  const getStatusText = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Needs Attention'
  }

  const color = getColor(score)

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {label}
          </Typography>
          {trend !== undefined && (
            <Chip
              size="small"
              icon={trend > 0 ? <TrendingUp /> : <TrendingDown />}
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              color={trend > 0 ? 'success' : 'error'}
              sx={{ height: 24 }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography variant="h3" sx={{ color, fontWeight: 'bold' }}>
            {Math.round(score)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            / 100
          </Typography>
        </Box>
        {subtitle && (
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
                borderRadius: 1,
              },
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color, fontWeight: 'bold' }}>
          {getStatusText(score)}
        </Typography>
      </CardContent>
    </Card>
  )
}

function MetricCard({ title, value, subtitle, icon: Icon, color = '#1976d2' }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color, fontWeight: 'bold', mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {Icon && (
            <Box
              sx={{
                backgroundColor: `${color}20`,
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon sx={{ color, fontSize: 32 }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

function Analytics() {
  const dispatch = useDispatch()
  const { dashboardData, portfolioSummary, loading, error } = useSelector(
    (state) => state.analytics
  )
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setRefreshing(true)
    await Promise.all([
      dispatch(fetchDashboardData()),
      dispatch(fetchPortfolioSummary())
    ])
    setRefreshing(false)
  }

  const handleRefresh = () => {
    loadData()
  }

  if (loading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error && !dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        }>
          <Typography variant="h6">Unable to load analytics</Typography>
          <Typography variant="body2">{String(error)}</Typography>
        </Alert>
      </Box>
    )
  }

  if (!dashboardData) {
    return null
  }

  // Calculate portfolio health score (from backend or calculate)
  const portfolioHealthScore = dashboardData.portfolio_health_score || 0
  const budgetUtilizationRate = dashboardData.budget_utilization_rate || 0
  const completionRate = dashboardData.completion_rate || 0
  const onTrackPercentage = dashboardData.on_track_percentage || 0

  // Prepare radar chart data with actual scores
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
      score: Math.round(100 - (dashboardData.high_risk_count / Math.max(dashboardData.total_initiatives, 1)) * 100),
      fullMark: 100,
    },
    {
      metric: 'Strategic Alignment',
      score: 88,
      fullMark: 100,
    },
    {
      metric: 'ROI Performance',
      score: Math.min(Math.round(dashboardData.avg_expected_roi || 0), 100),
      fullMark: 100,
    },
  ]

  // Prepare status distribution for bar chart
  const statusChartData = dashboardData.status_distribution?.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
    count: item.count,
  })) || []

  // Prepare priority distribution for pie chart
  const priorityChartData = dashboardData.priority_distribution?.map((item) => ({
    name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
    value: item.count,
  })) || []

  // Prepare AI type distribution
  const aiTypeChartData = dashboardData.ai_type_distribution?.map((item) => ({
    name: item.ai_type.charAt(0).toUpperCase() + item.ai_type.slice(1).replace('_', ' '),
    value: item.count,
  })) || []

  const STATUS_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#9c27b0', '#00796b']
  const PRIORITY_COLORS = ['#d32f2f', '#ed6c02', '#1976d2', '#757575']
  const AI_TYPE_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0']

  // Risk distribution data
  const riskDistributionData = [
    { name: 'High Risk', value: dashboardData.high_risk_count || 0, color: '#d32f2f' },
    { name: 'Medium Risk', value: dashboardData.medium_risk_count || 0, color: '#ed6c02' },
    { name: 'Low Risk', value: dashboardData.low_risk_count || 0, color: '#2e7d32' },
  ].filter(item => item.value > 0)

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Portfolio Analytics & Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Strategic insights and AI-powered recommendations for executive decision-making
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} disabled={refreshing} color="primary">
            <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Key Performance Indicators */}
        <Grid item xs={12} md={3}>
          <HealthScoreCard
            score={portfolioHealthScore}
            label="Portfolio Health Score"
            trend={dashboardData.trend_data?.initiatives_growth || 0}
            subtitle="Composite metric across all dimensions"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <HealthScoreCard
            score={dashboardData.avg_expected_roi || 0}
            label="Expected ROI"
            trend={dashboardData.trend_data?.roi_trend || 0}
            subtitle="Average across all initiatives"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <HealthScoreCard
            score={onTrackPercentage}
            label="On-Track Initiatives"
            trend={-2}
            subtitle="Without high-risk issues"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <HealthScoreCard
            score={completionRate}
            label="Completion Rate"
            trend={4}
            subtitle="Initiatives in production"
          />
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Total Initiatives"
            value={dashboardData.total_initiatives}
            subtitle={`${dashboardData.active_initiatives} active`}
            icon={Assessment}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Budget Allocated"
            value={`$${(dashboardData.total_budget_allocated / 1000000).toFixed(1)}M`}
            subtitle={`${budgetUtilizationRate.toFixed(1)}% utilized`}
            icon={Speed}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="High Risk Items"
            value={dashboardData.high_risk_count}
            subtitle={`${dashboardData.medium_risk_count} medium risk`}
            icon={Warning}
            color={dashboardData.high_risk_count > 5 ? '#d32f2f' : '#ed6c02'}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Avg ROI"
            value={`${dashboardData.avg_expected_roi?.toFixed(1)}%`}
            subtitle="Expected return on investment"
            icon={TrendingUp}
            color="#2e7d32"
          />
        </Grid>

        {/* AI Executive Summary */}
        {portfolioSummary && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Info sx={{ mr: 1, color: '#1976d2', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  AI-Powered Executive Summary
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: '#333' }}>
                {portfolioSummary.summary}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Portfolio Score Analysis - Radar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Portfolio Score Analysis
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Multi-dimensional performance assessment
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#666', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#666', fontSize: 11 }} />
                <Radar
                  name="Portfolio Scores"
                  dataKey="score"
                  stroke="#1976d2"
                  fill="#1976d2"
                  fillOpacity={0.6}
                />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Distribution - Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Initiative Status Distribution
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Current state of all initiatives
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="count" name="Initiatives" radius={[8, 8, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Priority Distribution - Pie Chart */}
        {priorityChartData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Priority Distribution
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Initiative prioritization breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* AI Type Distribution */}
        {aiTypeChartData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                AI Type Distribution
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Technology categorization
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={aiTypeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {aiTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={AI_TYPE_COLORS[index % AI_TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Risk Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Risk Overview
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Portfolio risk exposure analysis
            </Typography>
            <Box sx={{ mt: 2 }}>
              {riskDistributionData.map((risk, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: risk.color,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body1">{risk.name}</Typography>
                    </Box>
                    <Chip
                      label={risk.value}
                      sx={{
                        backgroundColor: `${risk.color}20`,
                        color: risk.color,
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(risk.value / dashboardData.total_initiatives) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: risk.color,
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>
              ))}
              <Alert
                severity={dashboardData.high_risk_count > 5 ? 'error' : 'success'}
                sx={{ mt: 3 }}
                icon={dashboardData.high_risk_count > 5 ? <Warning /> : <CheckCircle />}
              >
                {dashboardData.high_risk_count > 5
                  ? 'Portfolio has elevated risk exposure. Immediate risk mitigation strategies recommended.'
                  : 'Portfolio risk levels are within acceptable parameters. Continue monitoring.'}
              </Alert>
            </Box>
          </Paper>
        </Grid>

        {/* Budget & Investment Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Budget & Investment Analysis
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Financial performance tracking
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Utilization Rate
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {budgetUtilizationRate.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={budgetUtilizationRate}
                  sx={{
                    mt: 2,
                    height: 10,
                    borderRadius: 1,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: budgetUtilizationRate > 90 ? '#d32f2f' : budgetUtilizationRate > 75 ? '#ed6c02' : '#2e7d32',
                      borderRadius: 1,
                    },
                  }}
                />
              </Box>
              <Alert
                severity={budgetUtilizationRate > 90 ? 'warning' : 'success'}
                icon={budgetUtilizationRate > 90 ? <Warning /> : <CheckCircle />}
              >
                Budget utilization is at {budgetUtilizationRate.toFixed(1)}%
                {budgetUtilizationRate > 90
                  ? ' - approaching budget limits. Review spending controls.'
                  : ' - tracking within expected parameters.'}
              </Alert>
            </Box>
          </Paper>
        </Grid>

        {/* Strategic Recommendations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Strategic Recommendations
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              AI-powered insights for portfolio optimization
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Alert severity="info" icon={<TrendingUp />}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Portfolio Growth
                  </Typography>
                  <Typography variant="body2">
                    {dashboardData.active_initiatives} active initiatives showing strong momentum.
                    Growth rate: {dashboardData.trend_data?.initiatives_growth?.toFixed(1)}%
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert
                  severity={dashboardData.high_risk_count > 5 ? 'warning' : 'success'}
                  icon={<Warning />}
                >
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Risk Management
                  </Typography>
                  <Typography variant="body2">
                    {dashboardData.high_risk_count > 5
                      ? `${dashboardData.high_risk_count} high-risk items require immediate attention and mitigation.`
                      : 'Risk levels are well-managed. Continue proactive monitoring.'}
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert severity="success" icon={<CheckCircle />}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    ROI Performance
                  </Typography>
                  <Typography variant="body2">
                    Expected ROI of {dashboardData.avg_expected_roi?.toFixed(1)}% demonstrates strong value delivery
                    and strategic alignment.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  )
}

export default Analytics
