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
} from '@mui/material'
import {
  TrendingUp,
  Assignment,
  AttachMoney,
  Warning,
} from '@mui/icons-material'
import { fetchDashboardData } from '../store/slices/analyticsSlice'

function StatCard({ title, value, icon, color }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function Dashboard() {
  const dispatch = useDispatch()
  const { dashboardData, loading } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchDashboardData())
  }, [dispatch])

  if (loading || !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Executive Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        AI Portfolio Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Initiatives"
            value={dashboardData.total_initiatives}
            icon={<Assignment sx={{ color: 'white' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Initiatives"
            value={dashboardData.active_initiatives}
            icon={<TrendingUp sx={{ color: 'white' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Budget"
            value={`$${(dashboardData.total_budget_allocated / 1000000).toFixed(1)}M`}
            icon={<AttachMoney sx={{ color: 'white' }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="High Risk Items"
            value={dashboardData.high_risk_count}
            icon={<Warning sx={{ color: 'white' }} />}
            color="#d32f2f"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status Distribution
            </Typography>
            {dashboardData.status_distribution?.map((item) => (
              <Box key={item.status} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{item.status}</Typography>
                  <Typography variant="body2">{item.count}</Typography>
                </Box>
                <Box
                  sx={{
                    height: 8,
                    backgroundColor: '#e0e0e0',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(item.count / dashboardData.total_initiatives) * 100}%`,
                      backgroundColor: '#1976d2',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Priority Distribution
            </Typography>
            {dashboardData.priority_distribution?.map((item) => (
              <Box key={item.priority} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{item.priority}</Typography>
                  <Typography variant="body2">{item.count}</Typography>
                </Box>
                <Box
                  sx={{
                    height: 8,
                    backgroundColor: '#e0e0e0',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(item.count / dashboardData.total_initiatives) * 100}%`,
                      backgroundColor: '#2e7d32',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ROI Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Average Expected ROI
                </Typography>
                <Typography variant="h5">
                  {dashboardData.avg_expected_roi?.toFixed(1)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Average Actual ROI
                </Typography>
                <Typography variant="h5">
                  {dashboardData.avg_actual_roi?.toFixed(1)}%
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
