import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import SearchIcon from '@mui/icons-material/Search'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LinkIcon from '@mui/icons-material/Link'

// PMI-CPMAI Seven Patterns
const PMI_PATTERNS = [
  {
    name: "Hyperpersonalization",
    description: "Uses machine learning to build and continually refine unique profiles for individuals so systems can tailor experiences, recommendations, or interactions specifically to each person.",
    icon: "👤",
    examples: ["Personalized product recommendations", "Customized content feeds", "Individual treatment plans"]
  },
  {
    name: "Conversational & Human Interaction",
    description: "Enables natural communication between humans and machines (voice, text, etc.), including chatbots, assistants, translation, summarization, and generative content creation.",
    icon: "💬",
    examples: ["Customer service chatbots", "Virtual assistants", "Language translation", "Content generation"]
  },
  {
    name: "Recognition",
    description: "Lets AI perceive and interpret unstructured sensory data — e.g., images, audio, handwriting, text — and convert it into structured information for action or analysis.",
    icon: "👁️",
    examples: ["Image recognition", "Speech-to-text", "OCR", "Facial recognition"]
  },
  {
    name: "Pattern & Anomaly Detection",
    description: "Learns what 'normal' looks like in data and identifies structure, outliers, correlations, or unusual behavior — widely used in fraud detection, quality control, and risk monitoring.",
    icon: "🔍",
    examples: ["Fraud detection", "Quality control", "Network intrusion detection", "Equipment failure prediction"]
  },
  {
    name: "Predictive Analytics & Decision Support",
    description: "Forecasts future outcomes, trends, or risks based on historical and real-time data to inform human decision-making.",
    icon: "📈",
    examples: ["Sales forecasting", "Churn prediction", "Demand planning", "Risk assessment"]
  },
  {
    name: "Goal-Driven Systems",
    description: "Uses feedback and optimization (e.g., reinforcement learning) to pursue defined goals by learning strategies that maximize reward through trial and error.",
    icon: "🎯",
    examples: ["Game AI", "Resource optimization", "Dynamic pricing", "Route optimization"]
  },
  {
    name: "Autonomous Systems",
    description: "AI agents that perceive, decide, and act toward goals with minimal human intervention — from self-driving vehicles to autonomous robots or intelligent software agents.",
    icon: "🤖",
    examples: ["Self-driving vehicles", "Autonomous drones", "Robotic process automation", "Smart manufacturing"]
  }
]

const WORKFLOW_STEPS = {
  DEFINE_PROBLEM: 1,
  CLASSIFY_PATTERN: 2,
  FIND_INITIATIVES: 3,
  SELECT_INITIATIVE: 4
}

const BusinessUnderstandingNew = () => {
  const navigate = useNavigate()

  // Workflow state
  const [currentStep, setCurrentStep] = useState(WORKFLOW_STEPS.DEFINE_PROBLEM)
  const [businessProblem, setBusinessProblem] = useState('')
  const [classifiedPattern, setClassifiedPattern] = useState(null)
  const [selectedPattern, setSelectedPattern] = useState(null)
  const [similarInitiatives, setSimilarInitiatives] = useState([])
  const [aiRecommendation, setAiRecommendation] = useState(null)
  const [selectedInitiative, setSelectedInitiative] = useState(null)
  const [showNoMatchModal, setShowNoMatchModal] = useState(false)
  const [noMatchFeedback, setNoMatchFeedback] = useState('')

  // Loading states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const minChars = 100
  const isProblemValid = businessProblem.trim().length >= minChars

  const steps = useMemo(
    () => [
      'Describe business problem',
      'Confirm AI pattern',
      'Review initiatives',
      'Link & continue',
    ],
    []
  )

  const stepIndex = useMemo(() => {
    switch (currentStep) {
      case WORKFLOW_STEPS.DEFINE_PROBLEM:
        return 0
      case WORKFLOW_STEPS.CLASSIFY_PATTERN:
        return 1
      case WORKFLOW_STEPS.FIND_INITIATIVES:
        return 2
      case WORKFLOW_STEPS.SELECT_INITIATIVE:
        return 3
      default:
        return 0
    }
  }, [currentStep])

  const patternMeta = useMemo(() => {
    if (!selectedPattern) return null
    return PMI_PATTERNS.find((p) => p.name === selectedPattern) || null
  }, [selectedPattern])

  // Step 1: Define Business Problem
  const handleAnalyzeProblem = async () => {
    if (businessProblem.length < 100) {
      setError('Please provide at least 100 characters to describe your business problem.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 2: Classify AI Pattern
      const patternResponse = await axios.post('/ai-projects/pmi-cpmai/classify-pattern', null, {
        params: { business_problem: businessProblem }
      })

      if (patternResponse.data.success) {
        const patternData = patternResponse.data.data
        setClassifiedPattern(patternData)
        setSelectedPattern(patternData.primary_pattern)
        setCurrentStep(WORKFLOW_STEPS.CLASSIFY_PATTERN)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error analyzing business problem')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Find Similar Initiatives
  const handleConfirmPattern = async () => {
    setLoading(true)
    setError(null)

    try {
      const searchResponse = await axios.post('/ai-projects/pmi-cpmai/find-similar-initiatives', null, {
        params: {
          business_problem: businessProblem,
          ai_pattern: selectedPattern,
          top_k: 10
        }
      })

      if (searchResponse.data.success) {
        const initiatives = searchResponse.data.data.initiatives
        setSimilarInitiatives(initiatives)

        if (initiatives.length > 0) {
          // Get AI recommendation
          const recommendResponse = await axios.post('/ai-projects/pmi-cpmai/recommend-initiative', {
            business_problem: businessProblem,
            ai_pattern: selectedPattern,
            similar_initiatives: initiatives
          })

          if (recommendResponse.data.success) {
            setAiRecommendation(recommendResponse.data.data)
          }
        }

        setCurrentStep(WORKFLOW_STEPS.FIND_INITIATIVES)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error finding similar initiatives')
    } finally {
      setLoading(false)
    }
  }

  // Search initiatives by pattern only (without business problem text)
  const handleSearchByPattern = async () => {
    if (!selectedPattern) {
      setError('Please select an AI pattern first.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create a generic search query based on the pattern
      const patternInfo = PMI_PATTERNS.find(p => p.name === selectedPattern)
      const searchQuery = patternInfo ? patternInfo.description : selectedPattern

      const searchResponse = await axios.post('/ai-projects/pmi-cpmai/find-similar-initiatives', null, {
        params: {
          business_problem: searchQuery,
          ai_pattern: selectedPattern,
          top_k: 10
        }
      })

      if (searchResponse.data.success) {
        const initiatives = searchResponse.data.data.initiatives
        setSimilarInitiatives(initiatives)
        setAiRecommendation(null) // Clear AI recommendation for pattern-only search
        setCurrentStep(WORKFLOW_STEPS.FIND_INITIATIVES)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error finding similar initiatives')
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Link to Initiative
  const handleSelectInitiative = async (initiativeId) => {
    setLoading(true)
    setError(null)

    try {
      await axios.post('/ai-projects/pmi-cpmai/link-business-understanding', null, {
        params: {
          initiative_id: initiativeId,
          business_problem_text: businessProblem,
          ai_pattern: selectedPattern,
          ai_pattern_confidence: classifiedPattern.confidence,
          ai_pattern_reasoning: classifiedPattern.reasoning,
          pattern_override: selectedPattern !== classifiedPattern.primary_pattern,
          similar_initiatives_found: similarInitiatives.map(i => ({ id: i.initiative_id, score: i.similarity_score })),
          ai_recommended_initiative_id: aiRecommendation?.recommended_initiative_id,
          ai_recommendation_reasoning: aiRecommendation?.reasoning
        }
      })

      // Navigate to the initiative's business understanding page
      navigate(`/ai-projects/${initiativeId}/business-understanding`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error linking business understanding')
    } finally {
      setLoading(false)
    }
  }

  // Submit no-match feedback
  const handleSubmitNoMatchFeedback = async () => {
    try {
      await axios.post('/ai-projects/pmi-cpmai/submit-no-match-feedback', null, {
        params: {
          business_problem_text: businessProblem,
          ai_pattern: selectedPattern,
          feedback_text: noMatchFeedback
        }
      })
      setShowNoMatchModal(false)
      setNoMatchFeedback('')
      alert('Thank you for your feedback! An administrator will review your request.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error submitting feedback')
    }
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
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Business Understanding
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Define your business problem, classify it into a PMI-CPMAI AI pattern, then match it to an existing initiative.
              </Typography>
            </Box>
            <Chip
              icon={<InfoOutlinedIcon />}
              label="PMI-CPMAI guided workflow"
              color="primary"
              variant="outlined"
              sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
            />
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Stepper activeStep={stepIndex} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {/* Error */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Step 1 */}
        {currentStep === WORKFLOW_STEPS.DEFINE_PROBLEM && (
          <Paper elevation={0} sx={(t) => ({ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${t.palette.divider}` })}>
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={800}>
                Step 1 — Describe the business problem
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be specific about the challenge, who it impacts, the desired outcome, and any constraints.
              </Typography>

              <TextField
                value={businessProblem}
                onChange={(e) => setBusinessProblem(e.target.value)}
                multiline
                minRows={6}
                placeholder="Example: We need to reduce customer churn by predicting which customers are likely to leave and proactively engaging them with personalized offers..."
                fullWidth
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
                <Typography variant="caption" color={isProblemValid ? 'success.main' : 'text.secondary'}>
                  {businessProblem.trim().length} / {minChars} characters minimum
                </Typography>
                <Button
                  onClick={handleAnalyzeProblem}
                  variant="contained"
                  size="large"
                  startIcon={<AutoAwesomeIcon />}
                  disabled={loading || !isProblemValid}
                >
                  {loading ? 'Analyzing…' : 'Analyze & classify'}
                </Button>
              </Stack>

              <Divider />

              <Typography variant="subtitle2" color="text.secondary">
                Tip: Include the current baseline (e.g., 15% churn), target improvement, timeline, and what actions will be taken based on the model.
              </Typography>
            </Stack>
          </Paper>
        )}

        {/* Step 2 */}
        {currentStep === WORKFLOW_STEPS.CLASSIFY_PATTERN && classifiedPattern && (
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={5}>
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
                      <Typography variant="h6" fontWeight={800}>
                        AI Pattern Classification
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Review the model’s suggestion and adjust if needed.
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack spacing={1}>
                    <Typography variant="overline" color="text.secondary">
                      Suggested pattern
                    </Typography>
                    <Typography variant="h5" fontWeight={900}>
                      {classifiedPattern.primary_pattern}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={`${Math.round(classifiedPattern.confidence * 100)}% confidence`}
                        color={classifiedPattern.confidence >= 0.75 ? 'success' : classifiedPattern.confidence >= 0.5 ? 'warning' : 'default'}
                        variant="outlined"
                      />
                      {selectedPattern !== classifiedPattern.primary_pattern && (
                        <Chip label="Overridden" color="warning" size="small" />
                      )}
                    </Stack>
                  </Stack>

                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                      Reasoning
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {classifiedPattern.reasoning}
                    </Typography>
                  </Box>

                  {classifiedPattern.key_indicators?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                        Key indicators
                      </Typography>
                      <Stack spacing={0.75}>
                        {classifiedPattern.key_indicators.map((indicator, idx) => (
                          <Typography key={idx} variant="body2" color="text.secondary">
                            • {indicator}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={(t) => ({ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${t.palette.divider}` })}>
                <Stack spacing={2}>
                  <Typography variant="h5" fontWeight={800}>
                    Step 2 — Confirm or change the AI pattern
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose the AI pattern that best matches the problem statement. You can also search initiatives using just the pattern.
                  </Typography>

                  <TextField
                    select
                    label="AI Pattern"
                    value={selectedPattern || ''}
                    onChange={(e) => setSelectedPattern(e.target.value)}
                    SelectProps={{ native: true }}
                    fullWidth
                  >
                    <option value="">Select a pattern…</option>
                    {PMI_PATTERNS.map((pattern) => (
                      <option key={pattern.name} value={pattern.name}>
                        {pattern.icon} {pattern.name}
                      </option>
                    ))}
                  </TextField>

                  {patternMeta && (
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            <Typography component="span" fontSize={18}>
                              {patternMeta.icon}
                            </Typography>
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={900}>
                              {patternMeta.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                              {patternMeta.description}
                            </Typography>
                            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              Examples
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                              {patternMeta.examples.map((ex) => (
                                <Chip key={ex} label={ex} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  )}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button
                      onClick={handleSearchByPattern}
                      variant="outlined"
                      size="large"
                      startIcon={<SearchIcon />}
                      disabled={loading || !selectedPattern}
                      fullWidth
                    >
                      Search by pattern
                    </Button>
                    <Button
                      onClick={handleConfirmPattern}
                      variant="contained"
                      size="large"
                      startIcon={<SearchIcon />}
                      disabled={loading || !selectedPattern}
                      fullWidth
                    >
                      Find similar initiatives
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Step 3 */}
        {currentStep >= WORKFLOW_STEPS.FIND_INITIATIVES && (
          <Stack spacing={2.5}>
            {aiRecommendation?.recommended_initiative_id && (
              <Paper
                elevation={0}
                sx={(t) => ({
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 3,
                  border: `1px solid ${t.palette.divider}`,
                  bgcolor: 'rgba(34, 197, 94, 0.08)',
                })}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={900}>
                        AI Recommendation
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Best match based on your problem statement + similar initiatives.
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Chip
                      label={`Initiative #${aiRecommendation.recommended_initiative_id}`}
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      label={`${Math.round(aiRecommendation.confidence * 100)}% confidence`}
                      color={aiRecommendation.confidence >= 0.75 ? 'success' : aiRecommendation.confidence >= 0.5 ? 'warning' : 'default'}
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {aiRecommendation.reasoning}
                  </Typography>
                </Stack>
              </Paper>
            )}

            <Paper elevation={0} sx={(t) => ({ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${t.palette.divider}` })}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                  <Box>
                    <Typography variant="h5" fontWeight={900}>
                      Step 3 — Select an initiative
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {similarInitiatives.length} match{similarInitiatives.length === 1 ? '' : 'es'} found
                    </Typography>
                  </Box>
                  <Button variant="text" onClick={() => setShowNoMatchModal(true)} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                    None of these match?
                  </Button>
                </Stack>

                {similarInitiatives.length === 0 ? (
                  <Alert severity="info">No similar initiatives were found. You can provide feedback so an administrator can review your request.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {similarInitiatives.map((initiative) => {
                      const isSelected = selectedInitiative === initiative.initiative_id
                      const isRecommended = aiRecommendation?.recommended_initiative_id === initiative.initiative_id

                      return (
                        <Grid item xs={12} md={6} key={initiative.initiative_id}>
                          <Card
                            variant="outlined"
                            sx={(t) => ({
                              borderRadius: 3,
                              borderColor: isSelected ? t.palette.primary.main : t.palette.divider,
                              boxShadow: isSelected ? `0 0 0 2px ${t.palette.primary.main}22` : 'none',
                              position: 'relative',
                              overflow: 'hidden',
                            })}
                          >
                            {isRecommended && (
                              <Chip
                                label="AI recommended"
                                color="success"
                                size="small"
                                variant="filled"
                                sx={{ position: 'absolute', top: 12, right: 12 }}
                              />
                            )}

                            <CardActionArea onClick={() => setSelectedInitiative(initiative.initiative_id)}>
                              <CardContent>
                                <Stack spacing={1.25}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography variant="subtitle1" fontWeight={900} noWrap>
                                        {initiative.title}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                        {initiative.description}
                                      </Typography>
                                    </Box>

                                    <Stack alignItems="flex-end" spacing={0.5}>
                                      <Typography variant="h5" fontWeight={900} color="primary.main">
                                        {initiative.similarity_percentage}%
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        match
                                      </Typography>
                                    </Stack>
                                  </Stack>

                                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip size="small" label={`Status: ${initiative.status}`} variant="outlined" />
                                    {initiative.ai_pattern && (
                                      <Chip size="small" label={`Pattern: ${initiative.ai_pattern}`} variant="outlined" />
                                    )}
                                  </Stack>

                                  {initiative.business_objective && (
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Objective:</strong> {initiative.business_objective}
                                    </Typography>
                                  )}

                                  {isSelected && (
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 0.5 }}>
                                      <CheckCircleIcon fontSize="small" color="primary" />
                                      <Typography variant="body2" color="primary.main" fontWeight={700}>
                                        Selected
                                      </Typography>
                                    </Stack>
                                  )}
                                </Stack>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      )
                    })}
                  </Grid>
                )}

                <Divider />

                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" spacing={1.5}>
                  <Button variant="outlined" startIcon={<LinkIcon />} onClick={() => setShowNoMatchModal(true)}>
                    Provide feedback
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<LinkIcon />}
                    onClick={() => handleSelectInitiative(selectedInitiative)}
                    disabled={loading || !selectedInitiative}
                  >
                    {loading ? 'Linking…' : 'Confirm selection & continue'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        )}

        {/* Feedback dialog */}
        <Dialog open={showNoMatchModal} onClose={() => setShowNoMatchModal(false)} fullWidth maxWidth="sm">
          <DialogTitle>No good match found?</DialogTitle>
          <DialogContent>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tell us what’s missing. An administrator will review your request and may create a new initiative.
              </Typography>
              <TextField
                value={noMatchFeedback}
                onChange={(e) => setNoMatchFeedback(e.target.value)}
                multiline
                minRows={4}
                placeholder="Describe what’s missing or different about your needs…"
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNoMatchModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitNoMatchFeedback} variant="contained" disabled={!noMatchFeedback.trim()}>
              Submit feedback
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  )
}

export default BusinessUnderstandingNew
