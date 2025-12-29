import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from '../api/axios'

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LinkIcon from '@mui/icons-material/Link'

// A dedicated page version of the former "Select a Tactical Use Case" dialog.
// It expects required context passed via navigation state from BusinessUnderstandingNew.

const normalizeUseCases = (payload) => {
  const container = payload?.data?.data ? payload.data : payload

  const raw =
    container?.data?.use_cases ??
    container?.data?.useCases ??
    container?.use_cases ??
    container?.useCases ??
    []
  const list = Array.isArray(raw) ? raw : []

  return list
    .map((uc) => {
      if (!uc || typeof uc !== 'object') return null
      const expectedOutcomes = Array.isArray(uc.expected_outcomes)
        ? uc.expected_outcomes
        : Array.isArray(uc.expectedOutcomes)
          ? uc.expectedOutcomes
          : []
      const successCriteria = Array.isArray(uc.success_criteria)
        ? uc.success_criteria
        : Array.isArray(uc.successCriteria)
          ? uc.successCriteria
          : []

      const alignmentScore = uc.alignment_score ?? uc.alignmentScore

      return {
        title: uc.title ?? 'Untitled use case',
        description: uc.description ?? '',
        expected_outcomes: expectedOutcomes,
        success_criteria: successCriteria,
        timeline: uc.timeline ?? uc.estimated_timeline ?? uc.estimatedTimeline ?? 'TBD',
        implementation_complexity:
          uc.implementation_complexity ?? uc.implementationComplexity ?? uc.complexity ?? 'TBD',
        alignment_score: typeof alignmentScore === 'number' ? alignmentScore : Number(alignmentScore) || null,
      }
    })
    .filter(Boolean)
}

const TacticalUseCaseSelection = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { initiativeId } = useParams()

  const state = location.state || {}
  const {
    from = '/pmi-cpmai/business-understanding',
    businessProblem,
    selectedPattern,
    classifiedPattern,
    similarInitiatives = [],
    aiRecommendation,
  } = state

  const [loadingUseCases, setLoadingUseCases] = useState(false)
  const [useCaseError, setUseCaseError] = useState(null)
  const [generatedUseCases, setGeneratedUseCases] = useState([])
  const [selectedUseCase, setSelectedUseCase] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const minChars = 30

  const missingContext = useMemo(() => {
    const missing = []
    if (!initiativeId) missing.push('initiativeId')
    if (!businessProblem || String(businessProblem).trim().length < minChars) missing.push('businessProblem')
    if (!selectedPattern) missing.push('selectedPattern')
    if (!classifiedPattern) missing.push('classifiedPattern')
    return missing
  }, [initiativeId, businessProblem, selectedPattern, classifiedPattern])

  useEffect(() => {
    const run = async () => {
      if (missingContext.length > 0) return

      setLoadingUseCases(true)
      setUseCaseError(null)
      setGeneratedUseCases([])
      setSelectedUseCase(null)

      try {
        const response = await axios.post('/ai-projects/pmi-cpmai/generate-tactical-use-cases', null, {
          params: {
            business_problem: businessProblem,
            ai_pattern: selectedPattern,
            initiative_id: initiativeId,
          },
        })

        const body = response?.data
        if (body?.success === false) {
          const msg = body?.error || body?.message || 'Failed to generate use cases'
          setUseCaseError(msg)
          return
        }

        const normalized = normalizeUseCases(response)
        if (normalized.length === 0) {
          setUseCaseError('Use cases were generated but returned empty. Please go back and try again.')
          return
        }

        setGeneratedUseCases(normalized)
      } catch (err) {
        const status = err?.response?.status
        const serverMsg = err?.response?.data?.detail || err?.response?.data?.message || err?.response?.data?.error
        const msg =
          serverMsg ||
          `Error generating use cases${status ? ` (HTTP ${status})` : ''}${err?.message ? `: ${err.message}` : ''}`
        setUseCaseError(msg)
      } finally {
        setLoadingUseCases(false)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initiativeId])

  const handleBack = () => {
    navigate(from, {
      replace: true,
      state,
    })
  }

  const linkBusinessUnderstanding = async (useCaseOrNull) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const query = {
        initiative_id: Number(initiativeId),
        business_problem_text: businessProblem,
        ai_pattern: selectedPattern,
        ai_pattern_confidence: classifiedPattern?.confidence ?? 0,
        ai_pattern_reasoning: classifiedPattern?.reasoning ?? '',
        pattern_override: selectedPattern !== classifiedPattern?.primary_pattern,
        similar_initiatives_found: (similarInitiatives || []).map((i) => ({
          id: i.initiative_id,
          score: i.similarity_score,
        })),
        ai_recommended_initiative_id: aiRecommendation?.recommended_initiative_id,
        ai_recommendation_reasoning: aiRecommendation?.reasoning,
      }

      await axios.post('/ai-projects/pmi-cpmai/link-business-understanding', useCaseOrNull || null, {
        params: query,
      })

      navigate(`/ai-projects/${initiativeId}/business-understanding`, {
        state: { selected_use_case: useCaseOrNull || null },
      })
    } catch (err) {
      setSubmitError(err?.response?.data?.detail || err?.message || 'Error linking business understanding')
    } finally {
      setSubmitting(false)
    }
  }

  if (missingContext.length > 0) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={900}>
              Select a Tactical Use Case
            </Typography>
            <Alert severity="warning">
              This page needs context from the guided workflow. Missing: {missingContext.join(', ')}.
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/pmi-cpmai/business-understanding')}>
                Go to workflow
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={2.5}>
        <Paper
          elevation={0}
          sx={(theme) => ({
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          })}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }}>
            <Avatar sx={(t) => ({ width: 52, height: 52, bgcolor: t.palette.primary.main })}>
              <AutoAwesomeIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Select a Tactical Use Case
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Choose the specific implementation that best matches your needs
              </Typography>
            </Box>
            <Button variant="text" onClick={handleBack}>
              Back
            </Button>
          </Stack>
          {(loadingUseCases || submitting) && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {useCaseError && <Alert severity="error">{useCaseError}</Alert>}
        {submitError && <Alert severity="error">{submitError}</Alert>}

        {!useCaseError && generatedUseCases.length === 0 && !loadingUseCases && (
          <Alert severity="info">No use cases to display yet.</Alert>
        )}

        <Stack spacing={2}>
          {generatedUseCases.map((useCase, index) => {
            const isSelected = selectedUseCase?.title === useCase.title
            return (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  boxShadow: isSelected ? '0 0 0 2px rgba(99,102,241,0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedUseCase(useCase)}
              >
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" fontWeight={800}>
                        {useCase.title}
                      </Typography>
                      <Chip
                        label={useCase.alignment_score != null ? `${useCase.alignment_score}% match` : 'Match'}
                        color={useCase.alignment_score != null && useCase.alignment_score >= 80 ? 'success' : 'primary'}
                        size="small"
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {useCase.description}
                    </Typography>

                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        Expected Outcomes
                      </Typography>
                      <Stack spacing={0.5}>
                        {(useCase.expected_outcomes || []).map((outcome, idx) => (
                          <Typography key={idx} variant="body2" color="text.secondary">
                            • {outcome}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>

                    {useCase.success_criteria && useCase.success_criteria.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                          Success Criteria
                        </Typography>
                        <Stack spacing={0.5}>
                          {useCase.success_criteria.map((criterion, idx) => (
                            <Typography key={idx} variant="body2" color="text.secondary">
                              • {criterion}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip size="small" label={`Timeline: ${useCase.timeline}`} variant="outlined" />
                      <Chip
                        size="small"
                        label={`Complexity: ${useCase.implementation_complexity}`}
                        variant="outlined"
                      />
                    </Stack>

                    {isSelected && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon fontSize="small" color="primary" />
                        <Typography variant="body2" color="primary.main" fontWeight={700}>
                          Selected
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
            <Button onClick={handleBack} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="outlined" onClick={() => linkBusinessUnderstanding(null)} disabled={submitting}>
              Skip this step
            </Button>
            <Button
              variant="contained"
              startIcon={<LinkIcon />}
              onClick={() => linkBusinessUnderstanding(selectedUseCase)}
              disabled={!selectedUseCase || submitting}
            >
              Confirm & Continue
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}

export default TacticalUseCaseSelection

