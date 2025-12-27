import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Delete,
  Assessment,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  AttachMoney,
  People,
  Business,
  Code,
  Analytics,
} from '@mui/icons-material'
import axiosInstance from '../api/axios'

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`initiative-tabpanel-${index}`}
      aria-labelledby={`initiative-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function InitiativeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [initiative, setInitiative] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [benefits, setBenefits] = useState([])
  const [risks, setRisks] = useState([])
  const [milestones, setMilestones] = useState([])

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitiativeDetails()
    } else {
      setLoading(false)
    }
  }, [id, isAuthenticated])

  const fetchInitiativeDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch initiative details
      const response = await axiosInstance.get(`/initiatives/${id}`)
      setInitiative(response.data)
      
      // Fetch related data
      await Promise.all([
        fetchBenefits(),
        fetchRisks(),
        fetchMilestones(),
      ])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load initiative details')
    } finally {
      setLoading(false)
    }
  }

  const fetchBenefits = async () => {
    try {
      // Backend route is: /benefits/realizations/initiative/{initiative_id}
      const response = await axiosInstance.get(`/benefits/realizations/initiative/${id}`)
      setBenefits(response.data)
    } catch (err) {
      console.error('Failed to fetch benefits:', err)
    }
  }

  const fetchRisks = async () => {
    try {
      // NOTE: there is no backend endpoint for listing risks by initiative yet.
      // Avoid calling a non-existent route that could trigger auth handling.
      setRisks([])
    } catch (err) {
      console.error('Failed to fetch risks:', err)
    }
  }

  const fetchMilestones = async () => {
    try {
      // Backend route for initiative milestones is stage-gates:
      // /roadmap/stage-gates/initiative/{initiative_id}
      const response = await axiosInstance.get(`/roadmap/stage-gates/initiative/${id}`)
      // Map to the UI table expectations
      const rows = (response.data || []).map((sg) => ({
        id: sg.id,
        title: sg.stage_name,
        description: sg.description,
        target_date: sg.target_date,
        status: sg.status,
        progress_percentage: sg.progress_percentage ?? 0,
      }))
      setMilestones(rows)
    } catch (err) {
      console.error('Failed to fetch milestones:', err)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this initiative?')) {
      try {
        await axiosInstance.delete(`/initiatives/${id}`)
        navigate('/initiatives')
      } catch (err) {
        setError('Failed to delete initiative')
      }
    }
  }

  const getPriorityColor = (priority) => {
    const colors = {
      CRITICAL: 'error',
      HIGH: 'warning',
      MEDIUM: 'info',
      LOW: 'default',
    }
    return colors[priority] || 'default'
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const calculateBudgetProgress = () => {
    if (!initiative?.budget_allocated || initiative.budget_allocated === 0) return 0
    return (initiative.budget_spent / initiative.budget_allocated) * 100
  }

  if (!isAuthenticated) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please log in to view initiative details.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/initiatives')}>
          Back to Initiatives
        </Button>
      </Box>
    )
  }

  if (!initiative) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Initiative not found
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/initiatives')}>
          Back to Initiatives
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/initiatives')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">{initiative.title}</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Priority Chip */}
      <Box display="flex" gap={1} mb={3}>
        <Chip
          label={`Priority: ${initiative.priority}`}
          color={getPriorityColor(initiative.priority)}
          icon={<Warning />}
        />
        {initiative.ai_type && (
          <Chip label={`AI Type: ${initiative.ai_type}`} icon={<Analytics />} />
        )}
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AttachMoney color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  Budget
                </Typography>
              </Box>
              <Typography variant="h5">{formatCurrency(initiative.budget_allocated)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Spent: {formatCurrency(initiative.budget_spent)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(calculateBudgetProgress(), 100)}
                sx={{ mt: 1 }}
                color={calculateBudgetProgress() > 100 ? 'error' : 'primary'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUp color="success" />
                <Typography variant="subtitle2" color="text.secondary">
                  Expected ROI
                </Typography>
              </Box>
              <Typography variant="h5">
                {initiative.expected_roi ? `${initiative.expected_roi}%` : 'N/A'}
              </Typography>
              {initiative.actual_roi && (
                <Typography variant="body2" color="text.secondary">
                  Actual: {initiative.actual_roi}%
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Schedule color="info" />
                <Typography variant="subtitle2" color="text.secondary">
                  Timeline
                </Typography>
              </Box>
              <Typography variant="body2">
                Start: {formatDate(initiative.start_date)}
              </Typography>
              <Typography variant="body2">
                Target: {formatDate(initiative.target_completion_date)}
              </Typography>
              {initiative.actual_completion_date && (
                <Typography variant="body2" color="success.main">
                  Completed: {formatDate(initiative.actual_completion_date)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Assessment color="warning" />
                <Typography variant="subtitle2" color="text.secondary">
                  Scores
                </Typography>
              </Box>
              <Typography variant="body2">
                Business Value: {initiative.business_value_score}/100
              </Typography>
              <Typography variant="body2">
                Technical: {initiative.technical_feasibility_score}/100
              </Typography>
              <Typography variant="body2">
                Risk: {initiative.risk_score}/100
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="Benefits" />
          <Tab label="Risks" />
          <Tab label="Milestones" />
          <Tab label="Team & Stakeholders" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {initiative.description || 'No description provided'}
              </Typography>
            </Grid>

            {initiative.business_objective && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Business Objective
                </Typography>
                <Typography variant="body1" paragraph>
                  {initiative.business_objective}
                </Typography>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Classification
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {initiative.strategic_domain && (
                  <Typography variant="body2">
                    <strong>Strategic Domain:</strong> {initiative.strategic_domain}
                  </Typography>
                )}
                {initiative.business_function && (
                  <Typography variant="body2">
                    <strong>Business Function:</strong> {initiative.business_function}
                  </Typography>
                )}
                {initiative.ai_type && (
                  <Typography variant="body2">
                    <strong>AI Type:</strong> {initiative.ai_type}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Technologies
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {initiative.technologies && initiative.technologies.length > 0 ? (
                  initiative.technologies.map((tech, index) => (
                    <Chip key={index} label={tech} size="small" icon={<Code />} />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No technologies specified
                  </Typography>
                )}
              </Box>
            </Grid>

            {initiative.data_sources && initiative.data_sources.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Data Sources
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {initiative.data_sources.map((source, index) => (
                    <Chip key={index} label={source} size="small" />
                  ))}
                </Box>
              </Grid>
            )}

            {initiative.tags && initiative.tags.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {initiative.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Benefits Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Benefits Tracking</Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`/benefits?initiative_id=${id}`)}
            >
              Manage Benefits
            </Button>
          </Box>
          {benefits.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Target Value</TableCell>
                    <TableCell align="right">Actual Value</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {benefits.map((benefit) => (
                    <TableRow key={benefit.id}>
                      <TableCell>{benefit.category}</TableCell>
                      <TableCell>{benefit.description}</TableCell>
                      <TableCell align="right">{benefit.target_value}</TableCell>
                      <TableCell align="right">{benefit.actual_value || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={benefit.status}
                          size="small"
                          color={benefit.status === 'REALIZED' ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No benefits tracked yet</Alert>
          )}
        </TabPanel>

        {/* Risks Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Risk Management</Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`/governance?initiative_id=${id}`)}
            >
              Manage Risks
            </Button>
          </Box>
          {risks.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Risk</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Probability</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Mitigation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {risks.map((risk) => (
                    <TableRow key={risk.id}>
                      <TableCell>{risk.description}</TableCell>
                      <TableCell>{risk.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={risk.severity}
                          size="small"
                          color={
                            risk.severity === 'CRITICAL'
                              ? 'error'
                              : risk.severity === 'HIGH'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>{risk.probability}</TableCell>
                      <TableCell>
                        <Chip label={risk.status} size="small" />
                      </TableCell>
                      <TableCell>{risk.mitigation_plan || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No risks identified yet</Alert>
          )}
        </TabPanel>

        {/* Milestones Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Project Milestones</Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`/roadmap?initiative_id=${id}`)}
            >
              View Roadmap
            </Button>
          </Box>
          {milestones.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Milestone</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Target Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {milestones.map((milestone) => (
                    <TableRow key={milestone.id}>
                      <TableCell>{milestone.title}</TableCell>
                      <TableCell>{milestone.description}</TableCell>
                      <TableCell>{formatDate(milestone.target_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={milestone.status}
                          size="small"
                          color={milestone.status === 'COMPLETED' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">{milestone.progress_percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No milestones defined yet</Alert>
          )}
        </TabPanel>

        {/* Team & Stakeholders Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>
              {initiative.team_members && initiative.team_members.length > 0 ? (
                <Box display="flex" flexDirection="column" gap={1}>
                  {initiative.team_members.map((memberId, index) => (
                    <Chip
                      key={index}
                      label={`Team Member ID: ${memberId}`}
                      icon={<People />}
                    />
                  ))}
                </Box>
              ) : (
                <Alert severity="info">No team members assigned</Alert>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Stakeholders
              </Typography>
              {initiative.stakeholders && initiative.stakeholders.length > 0 ? (
                <Box display="flex" flexDirection="column" gap={1}>
                  {initiative.stakeholders.map((stakeholder, index) => (
                    <Chip key={index} label={stakeholder} icon={<Business />} />
                  ))}
                </Box>
              ) : (
                <Alert severity="info">No stakeholders identified</Alert>
              )}
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  )
}

export default InitiativeDetail
