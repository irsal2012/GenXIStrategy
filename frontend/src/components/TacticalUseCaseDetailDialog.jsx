import React, { useMemo } from 'react'
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
  Button,
} from '@mui/material'

const normalizeArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return []
}

const asString = (value) => {
  if (value == null) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const titleCase = (key) =>
  String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())

const TacticalUseCaseDetailDialog = ({ open, onClose, useCase }) => {
  const parsedUseCase = useMemo(() => {
    if (!useCase) return null
    if (typeof useCase === 'string') {
      try {
        return JSON.parse(useCase)
      } catch {
        return null
      }
    }
    return typeof useCase === 'object' ? useCase : null
  }, [useCase])

  const known = useMemo(() => {
    const uc = parsedUseCase
    if (!uc) return null

    const expectedOutcomes =
      normalizeArray(uc.expected_outcomes) || normalizeArray(uc.expectedOutcomes)
    const successCriteria = normalizeArray(uc.success_criteria) || normalizeArray(uc.successCriteria)

    const alignment = uc.alignment_score ?? uc.alignmentScore
    const alignmentScore =
      typeof alignment === 'number' ? alignment : alignment != null ? Number(alignment) : null

    return {
      title: uc.title || 'Untitled use case',
      description: uc.description || '',
      timeline: uc.timeline || uc.estimated_timeline || uc.estimatedTimeline || '',
      implementation_complexity:
        uc.implementation_complexity ||
        uc.implementationComplexity ||
        uc.complexity ||
        '',
      alignment_score: Number.isFinite(alignmentScore) ? alignmentScore : null,
      expected_outcomes: expectedOutcomes,
      success_criteria: successCriteria,
    }
  }, [parsedUseCase])

  const extraEntries = useMemo(() => {
    const uc = parsedUseCase
    if (!uc) return []
    const omit = new Set([
      'title',
      'description',
      'timeline',
      'estimated_timeline',
      'estimatedTimeline',
      'implementation_complexity',
      'implementationComplexity',
      'complexity',
      'alignment_score',
      'alignmentScore',
      'expected_outcomes',
      'expectedOutcomes',
      'success_criteria',
      'successCriteria',
    ])

    return Object.entries(uc)
      .filter(([k]) => !omit.has(k))
      .sort(([a], [b]) => a.localeCompare(b))
  }, [parsedUseCase])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>Tactical use case</DialogTitle>
      <DialogContent dividers>
        {!known ? (
          <Typography color="text.secondary">No use case selected.</Typography>
        ) : (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900} gutterBottom>
                {known.title}
              </Typography>
              {known.description && (
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {known.description}
                </Typography>
              )}
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {known.alignment_score != null && (
                <Chip
                  label={`${Math.round(known.alignment_score)}% match`}
                  color={known.alignment_score >= 80 ? 'success' : 'primary'}
                  variant="filled"
                  size="small"
                />
              )}
              {known.timeline && <Chip label={`Timeline: ${known.timeline}`} variant="outlined" size="small" />}
              {known.implementation_complexity && (
                <Chip
                  label={`Complexity: ${known.implementation_complexity}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>

            {known.expected_outcomes?.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                  Expected outcomes
                </Typography>
                <Stack spacing={0.5}>
                  {known.expected_outcomes.map((item, idx) => (
                    <Typography key={idx} variant="body2" color="text.secondary">
                      • {asString(item)}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}

            {known.success_criteria?.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                  Success criteria
                </Typography>
                <Stack spacing={0.5}>
                  {known.success_criteria.map((item, idx) => (
                    <Typography key={idx} variant="body2" color="text.secondary">
                      • {asString(item)}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}

            {extraEntries.length > 0 && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" fontWeight={900} gutterBottom>
                  Additional details
                </Typography>
                <Stack spacing={1}>
                  {extraEntries.map(([key, value]) => (
                    <Box key={key}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        {titleCase(key)}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {asString(value) || '—'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TacticalUseCaseDetailDialog

