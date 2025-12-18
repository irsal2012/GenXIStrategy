import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { fetchInitiatives } from '../store/slices/initiativesSlice'

function InitiativesList() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, loading, error } = useSelector((state) => state.initiatives)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    // Prefer persisted token as well so refreshes don't prevent data loads.
    const hasToken = !!localStorage.getItem('token')
    if (isAuthenticated || hasToken) {
      dispatch(fetchInitiatives())
    }
  }, [dispatch, isAuthenticated])

  const getStatusColor = (status) => {
    const colors = {
      ideation: 'default',
      planning: 'info',
      pilot: 'warning',
      production: 'success',
      retired: 'error',
      on_hold: 'default',
    }
    return colors[status] || 'default'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success',
    }
    return colors[priority] || 'default'
  }

  // Use Redux flag + persisted token so refreshes don't incorrectly show the logged-out UI.
  const hasToken = !!localStorage.getItem('token')
  if (!isAuthenticated && !hasToken) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              AI Initiatives
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your AI portfolio
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Please log in to view initiatives.
          </Typography>
        </Paper>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            AI Initiatives
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your AI portfolio
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/initiatives/new')}
        >
          New Initiative
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell align="right">Budget</TableCell>
              <TableCell align="right">Expected ROI</TableCell>
              <TableCell align="right">Business Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="error" sx={{ py: 3 }}>
                    {typeof error === 'string' ? error : 'Failed to load initiatives'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No initiatives found. Create your first initiative to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((initiative) => (
                <TableRow
                  key={initiative.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/initiatives/${initiative.id}`)}
                >
                  <TableCell>
                    <Typography variant="body1">{initiative.title}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {initiative.description?.substring(0, 60)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={initiative.status}
                      color={getStatusColor(initiative.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={initiative.priority}
                      color={getPriorityColor(initiative.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${(initiative.budget_allocated / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell align="right">
                    {initiative.expected_roi ? `${initiative.expected_roi}%` : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={initiative.business_value_score}
                      color={initiative.business_value_score >= 7 ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default InitiativesList
