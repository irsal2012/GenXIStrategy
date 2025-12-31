import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Snackbar,
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import DescriptionIcon from '@mui/icons-material/Description'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import FlagIcon from '@mui/icons-material/Flag'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import NumbersIcon from '@mui/icons-material/Numbers'
import VisibilityIcon from '@mui/icons-material/Visibility'
import axiosInstance from '../api/axios'
import TacticalUseCaseDetailDialog from '../components/TacticalUseCaseDetailDialog'
import {
  fetchBusinessUnderstanding,
  createBusinessUnderstanding,
  updateBusinessUnderstanding,
  recordGoNoGoDecision,
  analyzeFeasibility,
  prefillAiGoNoGo,
  saveAiGoNoGoAssessment,
  clearError,
} from '../store/slices/aiProjectsSlice'

const GO_NO_GO_COLORS = {
  go: 'success',
  cautious: 'warning',
  risk: 'error',
}

const prettyGoNoGo = (value) => {
  const v = String(value || '').toLowerCase()
  if (v === 'go') return 'Go'
  if (v === 'cautious') return 'Cautious'
  if (v === 'risk') return 'Risk'
  return value ? String(value) : '—'
}

const formatPriority = (priority) => {
  if (!priority) return '—'
  const p = String(priority).toLowerCase()
  return p.charAt(0).toUpperCase() + p.slice(1)
}

const formatCurrencyK = (value) => {
  if (value == null || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return `$${Math.round(num)}K`
}

const formatPercent = (value) => {
  if (value == null || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return `${Math.round(num)}%`
}

const truncate = (text, max = 220) => {
  if (!text) return ''
  const str = String(text)
  if (str.length <= max) return str
  return `${str.slice(0, max)}…`
}

const BusinessUnderstanding = () => {
  const { initiativeId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { businessUnderstanding, aiResults, loading, aiLoading, error } = useSelector((state) => state.aiProjects)

  // If we just came from the guided PMI-CPMAI flow, the selected use case is passed
  // via navigation state. Persist it immediately so the continuation context is never blank
  // (e.g. if the link-business-understanding call succeeded but fetching is delayed,
  // or if a user refreshes right after navigating).
  const navigationSelectedUseCase = useMemo(() => {
    const nav = window?.history?.state?.usr
    const candidate = nav?.selected_use_case
    return candidate && typeof candidate === 'object' ? candidate : null
  }, [])

  const continuationContext = useMemo(() => {
    const problem = businessUnderstanding?.business_problem_text || ''
    let useCase = businessUnderstanding?.selected_use_case || null

    // Handle case where selected_use_case might be a JSON string
    if (typeof useCase === 'string') {
      try {
        useCase = JSON.parse(useCase)
      } catch (e) {
        console.error('Failed to parse selected_use_case:', e)
        useCase = null
      }
    }

    return {
      businessProblem: String(problem || '').trim(),
      selectedUseCase:
        (useCase && typeof useCase === 'object' ? useCase : null) || navigationSelectedUseCase,
      selectedInitiativeId: initiativeId ? Number(initiativeId) : null,
    }
  }, [
    businessUnderstanding?.business_problem_text,
    businessUnderstanding?.selected_use_case,
    navigationSelectedUseCase,
    initiativeId,
  ])

  const [formData, setFormData] = useState({
    success_criteria: [],
    stakeholder_requirements: {},
    data_sources_identified: [],
    compliance_requirements: []
  })

  const [newCriterion, setNewCriterion] = useState({ metric: '', target: '' })
  const [newDataSource, setNewDataSource] = useState({ name: '', description: '', available: false })
  const [newCompliance, setNewCompliance] = useState('')
  const [showFeasibility, setShowFeasibility] = useState(false)
  const [showUseCaseDialog, setShowUseCaseDialog] = useState(false)

  // Selected initiative details for the continuation context.
  // We fetch minimal details from /initiatives/:id.
  const [selectedInitiative, setSelectedInitiative] = useState(null)
  const [selectedInitiativeLoading, setSelectedInitiativeLoading] = useState(false)

  const feasibility = aiResults?.feasibility
  const aiGoNoGo = aiResults?.goNoGo

  const [goNoGoAssessment, setGoNoGoAssessment] = useState(null)

  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  const goNoGo = useMemo(() => {
    const value = businessUnderstanding?.go_no_go_decision
    if (!value) return { label: 'PENDING', color: 'default' }
    if (value === 'go') return { label: 'GO', color: 'success' }
    if (value === 'no_go') return { label: 'NO GO', color: 'error' }
    return { label: String(value).toUpperCase(), color: 'default' }
  }, [businessUnderstanding?.go_no_go_decision])

  useEffect(() => {
    if (initiativeId) {
      dispatch(fetchBusinessUnderstanding(initiativeId))
    }
  }, [dispatch, initiativeId])

  useEffect(() => {
    const run = async () => {
      if (!initiativeId) return
      try {
        setSelectedInitiativeLoading(true)
        const res = await axiosInstance.get(`/initiatives/${initiativeId}`)
        setSelectedInitiative(res.data)
      } catch (e) {
        // Non-fatal; we can still render the id-based card.
        setSelectedInitiative(null)
      } finally {
        setSelectedInitiativeLoading(false)
      }
    }

    run()
  }, [initiativeId])

  useEffect(() => {
    if (businessUnderstanding) {
      setFormData({
        success_criteria: businessUnderstanding.success_criteria || [],
        stakeholder_requirements: businessUnderstanding.stakeholder_requirements || {},
        data_sources_identified: businessUnderstanding.data_sources_identified || [],
        compliance_requirements: businessUnderstanding.compliance_requirements || []
      })

      // hydrate go/no-go assessment from DB if present
      if (businessUnderstanding.ai_go_no_go_assessment) {
        setGoNoGoAssessment(businessUnderstanding.ai_go_no_go_assessment)
      }
    }
  }, [businessUnderstanding])

  useEffect(() => {
    if (aiGoNoGo?.success && aiGoNoGo?.data) {
      setGoNoGoAssessment(aiGoNoGo.data)
      setToast({ open: true, message: 'AI Go/No-Go assessment generated.', severity: 'success' })
    }
  }, [aiGoNoGo])

  useEffect(() => {
    if (aiGoNoGo && aiGoNoGo.success === false) {
      setToast({ open: true, message: aiGoNoGo.error || 'Failed to generate AI Go/No-Go assessment.', severity: 'error' })
    }
  }, [aiGoNoGo])

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      initiative_id: parseInt(initiativeId),
      ...formData
    }

    if (businessUnderstanding) {
      dispatch(updateBusinessUnderstanding({ id: businessUnderstanding.id, data }))
    } else {
      dispatch(createBusinessUnderstanding(data))
    }
  }

  const handleAnalyzeFeasibility = () => {
    dispatch(analyzeFeasibility({
      initiative_id: parseInt(initiativeId),
      data_sources: formData.data_sources_identified,
      compliance_requirements: formData.compliance_requirements
    }))
    setShowFeasibility(true)
  }

  const handlePrefillGoNoGo = () => {
    if (!initiativeId) return
    // Clear any previous banner error so users can see fresh state.
    dispatch(clearError())
    dispatch(
      prefillAiGoNoGo({
        initiative_id: parseInt(initiativeId),
        continuation_context: continuationContext,
        data_sources: formData.data_sources_identified,
        compliance_requirements: formData.compliance_requirements,
      })
    )
  }

  const handleUpdateFactor = (factorId, updates) => {
    setGoNoGoAssessment((prev) => {
      if (!prev || !Array.isArray(prev.factors)) return prev
      const next = {
        ...prev,
        factors: prev.factors.map((f) =>
          f?.id === factorId
            ? {
                ...f,
                ...updates,
                user_override: true,
              }
            : f
        ),
      }
      return next
    })
  }

  const handleSaveGoNoGoAssessment = () => {
    if (!businessUnderstanding?.id || !goNoGoAssessment) return
    dispatch(
      saveAiGoNoGoAssessment({
        businessUnderstandingId: businessUnderstanding.id,
        ai_go_no_go_assessment: goNoGoAssessment,
      })
    )
  }

  const handleGoNoGoDecision = (decision) => {
    if (businessUnderstanding) {
      dispatch(recordGoNoGoDecision({
        id: businessUnderstanding.id,
        data: {
          decision,
          decision_rationale: aiResults.feasibility?.recommendation || 'Manual decision'
        }
      }))
    }
  }

  const addCriterion = () => {
    if (newCriterion.metric && newCriterion.target) {
      setFormData({
        ...formData,
        success_criteria: [...formData.success_criteria, newCriterion]
      })
      setNewCriterion({ metric: '', target: '' })
    }
  }

  const addDataSource = () => {
    if (newDataSource.name) {
      setFormData({
        ...formData,
        data_sources_identified: [...formData.data_sources_identified, newDataSource]
      })
      setNewDataSource({ name: '', description: '', available: false })
    }
  }

  const addCompliance = () => {
    if (newCompliance) {
      setFormData({
        ...formData,
        compliance_requirements: [...formData.compliance_requirements, newCompliance]
      })
      setNewCompliance('')
    }
  }

  const removeCriterion = (index) => {
    setFormData({
      ...formData,
      success_criteria: formData.success_criteria.filter((_, i) => i !== index)
    })
  }

  const removeDataSource = (index) => {
    setFormData({
      ...formData,
      data_sources_identified: formData.data_sources_identified.filter((_, i) => i !== index)
    })
  }

  const removeCompliance = (index) => {
    setFormData({
      ...formData,
      compliance_requirements: formData.compliance_requirements.filter((_, i) => i !== index)
    })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Hero header */}
        <Paper
          elevation={0}
          sx={(theme) => ({
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(236,72,153,0.10) 45%, rgba(14,165,233,0.10) 100%)'
                : 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(236,72,153,0.08) 45%, rgba(14,165,233,0.08) 100%)',
          })}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }}>
            <Avatar
              sx={(theme) => ({
                width: 52,
                height: 52,
                bgcolor: theme.palette.primary.main,
              })}
            >
              <AutoAwesomeIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={900} gutterBottom>
                Phase 1: Business Understanding
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Define business objectives, identify data sources, and assess feasibility.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              <Chip
                icon={<InfoOutlinedIcon />}
                label={`Initiative #${initiativeId}`}
                variant="outlined"
                color="primary"
                sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
              />
              <Button
                onClick={() => navigate(`/ai-projects/${initiativeId}`)}
                variant="outlined"
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
            </Stack>
          </Stack>
          {(loading || aiLoading) && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {/* Continuation from previous steps */}
        {(continuationContext.businessProblem || continuationContext.selectedUseCase) && (
          <Paper
            elevation={0}
            sx={(t) => ({
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              border: `1px solid ${t.palette.divider}`,
              bgcolor: 'rgba(14, 165, 233, 0.06)',
            })}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <InfoOutlinedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Continuation context
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Carry-forward details from the guided Business Understanding workflow.
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Grid container spacing={2}>
                {continuationContext.businessProblem && (
                  <Grid
                    item
                    xs={12}
                    md={continuationContext.selectedUseCase ? 4 : 6}
                  >
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, height: '100%' }}>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <DescriptionIcon fontSize="small" color="info" />
                          <Typography variant="subtitle2" fontWeight={900}>
                            Defined business problem
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {continuationContext.businessProblem}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                )}

                {continuationContext.selectedInitiativeId != null && (
                  <Grid item xs={12} md={continuationContext.selectedUseCase ? 4 : 6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, height: '100%' }}>
                      <Stack spacing={1.25}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FlagIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle2" fontWeight={900}>
                            Selected initiative
                          </Typography>
                        </Stack>

                        {selectedInitiative ? (
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle1" fontWeight={900}>
                              {selectedInitiative.title || `Initiative #${continuationContext.selectedInitiativeId}`}
                            </Typography>
                            {selectedInitiative.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                {selectedInitiative.description}
                              </Typography>
                            )}

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Chip
                                size="small"
                                icon={<NumbersIcon />}
                                label={`ID: ${continuationContext.selectedInitiativeId}`}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={`Priority: ${formatPriority(selectedInitiative.priority)}`}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                icon={<AttachMoneyIcon />}
                                label={`Budget: ${formatCurrencyK(selectedInitiative.budget_allocated)}`}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                icon={<TrendingUpIcon />}
                                label={`Expected ROI: ${formatPercent(selectedInitiative.expected_roi)}`}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={`Business Value: ${selectedInitiative.business_value_score ?? '—'}/10`}
                                variant="outlined"
                              />
                            </Stack>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {selectedInitiativeLoading
                              ? 'Loading initiative details…'
                              : `Initiative #${continuationContext.selectedInitiativeId}`}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            size="small"
                            label="View initiative"
                            variant="outlined"
                            clickable
                            onClick={() => navigate(`/ai-projects/${continuationContext.selectedInitiativeId}`)}
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                )}

                {continuationContext.selectedUseCase ? (
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, height: '100%' }}>
                      <Stack spacing={1.25}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TaskAltIcon fontSize="small" color="success" />
                          <Typography variant="subtitle2" fontWeight={900}>
                            Selected tactical use case
                          </Typography>
                        </Stack>

                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1" fontWeight={900}>
                            {continuationContext.selectedUseCase.title || 'Untitled use case'}
                          </Typography>
                          {continuationContext.selectedUseCase.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                              {continuationContext.selectedUseCase.description}
                            </Typography>
                          )}
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {continuationContext.selectedUseCase.timeline && (
                            <Chip size="small" label={`Timeline: ${continuationContext.selectedUseCase.timeline}`} variant="outlined" />
                          )}
                          {continuationContext.selectedUseCase.implementation_complexity && (
                            <Chip size="small" label={`Complexity: ${continuationContext.selectedUseCase.implementation_complexity}`} variant="outlined" />
                          )}
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            size="small"
                            icon={<VisibilityIcon />}
                            label="View use case"
                            variant="outlined"
                            clickable
                            onClick={() => setShowUseCaseDialog(true)}
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                ) : (
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, height: '100%' }}>
                      <Stack spacing={1.25}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TaskAltIcon fontSize="small" color="disabled" />
                          <Typography variant="subtitle2" fontWeight={900}>
                            Selected tactical use case
                          </Typography>
                        </Stack>

                        <Alert severity="info" sx={{ mb: 0 }}>
                          No tactical use case has been selected for this initiative yet.
                        </Alert>

                        <Typography variant="caption" color="text.secondary">
                          To select one, go to the guided workflow and click “Confirm & Continue” on a tactical use case.
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Stack>
          </Paper>
        )}

        {/* AI Feasibility Analysis */}
        {showFeasibility && feasibility && (
          <Paper
            elevation={0}
            sx={(t) => ({
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              border: `1px solid ${t.palette.divider}`,
              bgcolor: 'rgba(124, 58, 237, 0.06)',
            })}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <AutoAwesomeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    AI Feasibility Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    A quick, AI-assisted feasibility signal based on your inputs.
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                    <Typography variant="overline" color="text.secondary">
                      Feasibility score
                    </Typography>
                    <Typography variant="h4" fontWeight={900}>
                      {feasibility.feasibility_score}/100
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                    <Typography variant="overline" color="text.secondary">
                      Recommendation
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Chip
                        label={feasibility.recommendation}
                        color={
                          feasibility.recommendation === 'GO'
                            ? 'success'
                            : feasibility.recommendation === 'NO_GO'
                              ? 'error'
                              : 'warning'
                        }
                        variant="filled"
                      />
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              {feasibility.data_availability_assessment && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                    Data availability
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feasibility.data_availability_assessment}
                  </Typography>
                </Box>
              )}

              {Array.isArray(feasibility.compliance_risks) && feasibility.compliance_risks.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                    Compliance risks
                  </Typography>
                  <Stack spacing={0.75}>
                    {feasibility.compliance_risks.map((risk, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary">
                        • {risk}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}

              {feasibility.estimated_timeline && (
                <Alert severity="info">Estimated timeline: {feasibility.estimated_timeline}</Alert>
              )}
            </Stack>
          </Paper>
        )}

        {/* AI Go/No-Go (9-factor) */}
        <Paper
          elevation={0}
          sx={(t) => ({
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            border: `1px solid ${t.palette.divider}`,
            bgcolor: 'rgba(234, 179, 8, 0.06)',
          })}
        >
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
              <Box>
                <Typography variant="h5" fontWeight={900}>
                  AI Go/No-Go (9-factor gate)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI-prefilled, editable signal based on the CPMAI Go/No-Go rubric.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                <Button
                  type="button"
                  onClick={handlePrefillGoNoGo}
                  disabled={aiLoading || !businessUnderstanding}
                  variant="contained"
                  color="warning"
                >
                  Generate AI Go/No-Go
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveGoNoGoAssessment}
                  disabled={loading || !businessUnderstanding?.id || !goNoGoAssessment}
                  variant="outlined"
                >
                  Save assessment
                </Button>
              </Stack>
            </Stack>

            {!!error && (
              <Alert
                severity="error"
                onClose={() => dispatch(clearError())}
                sx={{ mb: 0 }}
              >
                {String(error)}
              </Alert>
            )}

            {goNoGoAssessment?.overall ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                    <Typography variant="overline" color="text.secondary">
                      Overall status
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Chip
                        label={prettyGoNoGo(goNoGoAssessment.overall.status)}
                        color={GO_NO_GO_COLORS[String(goNoGoAssessment.overall.status || '').toLowerCase()] || 'default'}
                        variant="filled"
                      />
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                    <Typography variant="overline" color="text.secondary">
                      Overall score
                    </Typography>
                    <Typography variant="h4" fontWeight={900}>
                      {goNoGoAssessment.overall.score ?? '—'}/100
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                No AI Go/No-Go assessment yet. Click “Generate AI Go/No-Go”.
              </Alert>
            )}

            {Array.isArray(goNoGoAssessment?.factors) && goNoGoAssessment.factors.length > 0 && (
              <Stack spacing={2}>
                {['Business Feasibility', 'Data Feasibility', 'Technology/Execution Feasibility'].map((category) => {
                  const items = goNoGoAssessment.factors.filter((f) => f?.category === category)
                  if (!items.length) return null
                  return (
                    <Paper key={category} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                      <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                        {category}
                      </Typography>
                      <Stack spacing={1.25}>
                        {items.map((f) => (
                          <Paper key={f.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                            <Stack spacing={1}>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body1" fontWeight={800}>
                                    {f.question}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip
                                    label={prettyGoNoGo(f.status)}
                                    color={GO_NO_GO_COLORS[String(f.status || '').toLowerCase()] || 'default'}
                                    variant={f.user_override ? 'filled' : 'outlined'}
                                  />
                                  <TextField
                                    select
                                    size="small"
                                    label="Override"
                                    value={String(f.status || 'cautious').toLowerCase()}
                                    onChange={(e) => handleUpdateFactor(f.id, { status: e.target.value })}
                                    SelectProps={{ native: true }}
                                    sx={{ minWidth: 140 }}
                                  >
                                    <option value="go">Go</option>
                                    <option value="cautious">Cautious</option>
                                    <option value="risk">Risk</option>
                                  </TextField>
                                </Stack>
                              </Stack>

                              {(f.rationale || (Array.isArray(f.evidence) && f.evidence.length > 0)) && (
                                <Box>
                                  {f.rationale && (
                                    <Typography variant="body2" color="text.secondary">
                                      {f.rationale}
                                    </Typography>
                                  )}
                                  {Array.isArray(f.evidence) && f.evidence.length > 0 && (
                                    <Box sx={{ mt: 0.75 }}>
                                      {f.evidence.slice(0, 3).map((ev, idx) => (
                                        <Typography key={idx} variant="caption" color="text.secondary" display="block">
                                          • {String(ev)}
                                        </Typography>
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Paper>
                  )
                })}
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Go/No-Go Decision */}
        {/* Hide this legacy/manual decision card when a decision already exists.
            The CPMAI flow already captures Go/No-Go as part of the AI Go/No-Go gate. */}
        {businessUnderstanding && !businessUnderstanding?.go_no_go_decision && (
          <Paper elevation={0} sx={(t) => ({ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${t.palette.divider}` })}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                <Box>
                  <Typography variant="h5" fontWeight={900}>
                    Go/No-Go Decision
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Record the governance decision for this phase.
                  </Typography>
                </Box>
                <Chip
                  label={`Status: ${goNoGo.label}`}
                  color={goNoGo.color}
                  variant={goNoGo.color === 'default' ? 'outlined' : 'filled'}
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  onClick={() => handleGoNoGoDecision('go')}
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  disabled={loading}
                >
                  GO
                </Button>
                <Button
                  onClick={() => handleGoNoGoDecision('no_go')}
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  disabled={loading}
                >
                  NO GO
                </Button>
              </Stack>

              {businessUnderstanding.go_no_go_rationale && (
                <Alert severity="info">
                  <strong>Rationale:</strong> {businessUnderstanding.go_no_go_rationale}
                </Alert>
              )}
            </Stack>
          </Paper>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Paper elevation={0} sx={(t) => ({ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${t.palette.divider}` })}>
              <Stack spacing={2}>
                <Typography variant="h5" fontWeight={900}>
                  Success Criteria
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add measurable outcomes (metric + target).
                </Typography>

                {formData.success_criteria.length === 0 ? (
                  <Alert severity="info">No success criteria added yet.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {formData.success_criteria.map((criterion, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined" sx={{ borderRadius: 3 }}>
                          <CardContent>
                            <Stack spacing={1.25}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="subtitle1" fontWeight={900} noWrap>
                                    {criterion.metric}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Target: {criterion.target}
                                  </Typography>
                                </Box>
                                <Button color="error" onClick={() => removeCriterion(index)}>
                                  Remove
                                </Button>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                <Divider />

                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Metric"
                      value={newCriterion.metric}
                      onChange={(e) => setNewCriterion({ ...newCriterion, metric: e.target.value })}
                      placeholder="e.g., Accuracy"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Target"
                      value={newCriterion.target}
                      onChange={(e) => setNewCriterion({ ...newCriterion, target: e.target.value })}
                      placeholder="e.g., > 95%"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      type="button"
                      onClick={addCriterion}
                      variant="contained"
                      fullWidth
                      disabled={!newCriterion.metric || !newCriterion.target}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={(t) => ({ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${t.palette.divider}` })}>
              <Stack spacing={2}>
                <Typography variant="h5" fontWeight={900}>
                  Data Sources
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Identify where training/serving data will come from and whether it’s available.
                </Typography>

                {formData.data_sources_identified.length === 0 ? (
                  <Alert severity="info">No data sources added yet.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {formData.data_sources_identified.map((source, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined" sx={{ borderRadius: 3 }}>
                          <CardContent>
                            <Stack spacing={1.25}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="subtitle1" fontWeight={900} noWrap>
                                    {source.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                    {source.description || '—'}
                                  </Typography>
                                </Box>
                                <Button color="error" onClick={() => removeDataSource(index)}>
                                  Remove
                                </Button>
                              </Stack>

                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip
                                  size="small"
                                  label={source.available ? 'Available' : 'Not available'}
                                  color={source.available ? 'success' : 'warning'}
                                  variant="outlined"
                                />
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                <Divider />

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Data source name"
                      value={newDataSource.name}
                      onChange={(e) => setNewDataSource({ ...newDataSource, name: e.target.value })}
                      placeholder="e.g., CRM database"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Description"
                      value={newDataSource.description}
                      onChange={(e) => setNewDataSource({ ...newDataSource, description: e.target.value })}
                      placeholder="What fields, frequency, owner, constraints…"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
                      <Button
                        type="button"
                        variant={newDataSource.available ? 'contained' : 'outlined'}
                        color={newDataSource.available ? 'success' : 'inherit'}
                        onClick={() => setNewDataSource({ ...newDataSource, available: !newDataSource.available })}
                      >
                        {newDataSource.available ? 'Data is available' : 'Mark as available'}
                      </Button>
                      <Button
                        type="button"
                        onClick={addDataSource}
                        variant="contained"
                        disabled={!newDataSource.name}
                      >
                        Add data source
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={(t) => ({ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${t.palette.divider}` })}>
              <Stack spacing={2}>
                <Typography variant="h5" fontWeight={900}>
                  Compliance Requirements
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Capture regulatory, security, privacy, and policy obligations.
                </Typography>

                {formData.compliance_requirements.length === 0 ? (
                  <Alert severity="info">No compliance requirements added yet.</Alert>
                ) : (
                  <Stack spacing={1}>
                    {formData.compliance_requirements.map((req, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                          <Typography variant="body2">{req}</Typography>
                          <Button color="error" onClick={() => removeCompliance(index)}>
                            Remove
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}

                <Divider />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Add requirement"
                    value={newCompliance}
                    onChange={(e) => setNewCompliance(e.target.value)}
                    placeholder="e.g., GDPR, HIPAA, SOC2, retention policy"
                    fullWidth
                  />
                  <Button type="button" onClick={addCompliance} variant="contained" disabled={!newCompliance.trim()}>
                    Add
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={(t) => ({ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${t.palette.divider}` })}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                <Button
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  size="large"
                >
                  {loading ? 'Saving…' : businessUnderstanding ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  onClick={handleAnalyzeFeasibility}
                  disabled={aiLoading}
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<AutoAwesomeIcon />}
                >
                  {aiLoading ? 'Analyzing…' : 'Analyze Feasibility'}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Stack>

      <TacticalUseCaseDetailDialog
        open={showUseCaseDialog}
        onClose={() => setShowUseCaseDialog(false)}
        useCase={continuationContext.selectedUseCase}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default BusinessUnderstanding
