import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
} from '@mui/icons-material'
import {
  initializeWorkflow,
  getWorkflowByInitiative,
  getWorkflowStages,
  advanceWorkflow,
  createApproval,
  submitApproval,
  getStageApprovals,
  checkCompliance,
  mapRegulations,
} from '../store/slices/governanceSlice'
import { fetchInitiatives } from '../store/slices/initiativesSlice'

function GovernanceWorkflow() {
  const dispatch = useDispatch()
  const { 
    currentWorkflow, 
    workflowStages, 
    approvals, 
    workflowLoading, 
    stagesLoading, 
    approvalsLoading,
    aiLoading,
    workflowError, 
    stagesError, 
    approvalsError,
    aiError,
    complianceCheck,
    regulationMapping
  } = useSelector((state) => state.governance)
  
  const { items: initiatives, loading: initiativesLoading } = useSelector(
    (state) => state.initiatives
  )

  const [selectedInitiativeId, setSelectedInitiativeId] = useState('')
  const [initDialogOpen, setInitDialogOpen] = useState(false)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState(null)
  const [newWorkflow, setNewWorkflow] = useState({
    initiativeId: '',
    riskTier: 'medium',
  })
  const [approvalData, setApprovalData] = useState({
    decision: 'approved',
    comments: '',
  })

  // Fetch initiatives on mount
  useEffect(() => {
    dispatch(fetchInitiatives())
  }, [dispatch])

  useEffect(() => {
    if (selectedInitiativeId) {
      dispatch(getWorkflowByInitiative(selectedInitiativeId)).catch(() => {
        // Workflow not found is expected for initiatives without workflows
        // The error will be displayed in the UI via workflowError state
      })
    }
  }, [selectedInitiativeId, dispatch])

  useEffect(() => {
    if (currentWorkflow) {
      dispatch(getWorkflowStages(currentWorkflow.id))
    }
  }, [currentWorkflow, dispatch])

  const handleInitializeWorkflow = async () => {
    const result = await dispatch(initializeWorkflow(newWorkflow))
    if (result.type.endsWith('/fulfilled')) {
      setInitDialogOpen(false)
      setNewWorkflow({ initiativeId: '', riskTier: 'medium' })
      // Refresh workflow data
      if (newWorkflow.initiativeId) {
        dispatch(getWorkflowByInitiative(newWorkflow.initiativeId))
      }
    }
  }

  const handleAdvanceWorkflow = async (workflowId) => {
    const result = await dispatch(advanceWorkflow(workflowId))
    if (result.type.endsWith('/fulfilled')) {
      // Refresh workflow and stages
      dispatch(getWorkflowByInitiative(selectedInitiativeId))
    }
  }

  const handleOpenApprovalDialog = (stage) => {
    setSelectedStage(stage)
    dispatch(getStageApprovals(stage.id))
    setApprovalDialogOpen(true)
  }

  const handleSubmitApproval = async () => {
    if (selectedStage) {
      // First create approval
      const approval = await dispatch(
        createApproval({
          stage_id: selectedStage.id,
          approver_role: 'admin', // In production, get from user context
        })
      )
      
      // Then submit decision
      if (approval.payload?.id) {
        const result = await dispatch(
          submitApproval({
            approvalId: approval.payload.id,
            decision: approvalData.decision,
            comments: approvalData.comments,
          })
        )
        
        if (result.type.endsWith('/fulfilled')) {
          setApprovalDialogOpen(false)
          setApprovalData({ decision: 'approved', comments: '' })
          // Refresh workflow and stages
          dispatch(getWorkflowByInitiative(selectedInitiativeId))
        }
      }
    }
  }

  const handleCheckCompliance = async () => {
    if (selectedInitiativeId) {
      const result = await dispatch(
        checkCompliance({
          initiativeId: parseInt(selectedInitiativeId),
          checkType: 'completeness',
        })
      )
      if (result.type.endsWith('/fulfilled')) {
        setAiDialogOpen(true)
      }
    }
  }

  const handleMapRegulations = async () => {
    if (selectedInitiativeId) {
      const result = await dispatch(mapRegulations(parseInt(selectedInitiativeId)))
      if (result.type.endsWith('/fulfilled')) {
        setAiDialogOpen(true)
      }
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      not_started: 'default',
      in_progress: 'info',
      pending_approval: 'warning',
      approved: 'success',
      rejected: 'error',
      completed: 'success',
    }
    return colors[status] || 'default'
  }

  const getStatusIcon = (status) => {
    const icons = {
      not_started: <PendingIcon />,
      in_progress: <CircularProgress size={20} />,
      pending_approval: <WarningIcon />,
      approved: <CheckCircleIcon />,
      rejected: <ErrorIcon />,
      completed: <CheckCircleIcon />,
    }
    return icons[status] || <PendingIcon />
  }

  const getActiveStep = () => {
    if (!workflowStages || !workflowStages.length) return 0
    const currentStage = workflowStages.find((s) => s.status === 'in_progress')
    return currentStage ? workflowStages.indexOf(currentStage) : 0
  }

  const displayError = workflowError || stagesError || approvalsError || aiError

  // Format error message properly
  const formatError = (error) => {
    if (typeof error === 'string') return error
    if (error && typeof error === 'object') {
      // Handle validation errors from backend
      if (Array.isArray(error)) {
        return error.map(e => e.msg || JSON.stringify(e)).join(', ')
      }
      return JSON.stringify(error)
    }
    return 'An error occurred'
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Governance Workflows</Typography>
        <Button variant="contained" onClick={() => setInitDialogOpen(true)}>
          Initialize New Workflow
        </Button>
      </Box>

      {displayError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formatError(displayError)}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Initiative
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Initiative</InputLabel>
                <Select
                  value={selectedInitiativeId}
                  onChange={(e) => setSelectedInitiativeId(e.target.value)}
                  label="Initiative"
                  disabled={initiativesLoading}
                >
                  {initiatives.map((init) => (
                    <MenuItem key={init.id} value={init.id}>
                      {init.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {initiatives.length === 0 && !initiativesLoading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No initiatives found. Create an initiative first.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {currentWorkflow && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Workflow Status</Typography>
                  <Chip
                    label={currentWorkflow.status}
                    color={getStatusColor(currentWorkflow.status)}
                    icon={getStatusIcon(currentWorkflow.status)}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Risk Tier: <strong>{currentWorkflow.risk_tier}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Stage: <strong>{currentWorkflow.current_stage_name || 'N/A'}</strong>
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCheckCompliance}
                    sx={{ mr: 1 }}
                    disabled={aiLoading}
                  >
                    {aiLoading ? <CircularProgress size={20} /> : 'Check Compliance'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleMapRegulations}
                    disabled={aiLoading}
                  >
                    {aiLoading ? <CircularProgress size={20} /> : 'Map Regulations'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {workflowStages && workflowStages.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Workflow Stages
                </Typography>
                <Stepper activeStep={getActiveStep()} alternativeLabel sx={{ mb: 3 }}>
                  {workflowStages.map((stage) => (
                    <Step key={stage.id}>
                      <StepLabel
                        error={stage.status === 'rejected'}
                        completed={stage.status === 'completed'}
                      >
                        {stage.stage_name}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Divider sx={{ my: 2 }} />

                {workflowStages.map((stage) => (
                  <Accordion key={stage.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ flexGrow: 1 }}>{stage.stage_name}</Typography>
                        <Chip
                          label={stage.status}
                          color={getStatusColor(stage.status)}
                          size="small"
                          sx={{ mr: 2 }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Order: {stage.stage_order}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Required Roles: {stage.required_roles?.join(', ') || 'N/A'}
                      </Typography>
                      {stage.gate_criteria && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Gate Criteria: {JSON.stringify(stage.gate_criteria)}
                        </Typography>
                      )}
                      <Box sx={{ mt: 2 }}>
                        {stage.status === 'in_progress' && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenApprovalDialog(stage)}
                          >
                            Submit for Approval
                          </Button>
                        )}
                        {stage.status === 'pending_approval' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenApprovalDialog(stage)}
                          >
                            View Approvals
                          </Button>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}

                {currentWorkflow?.status === 'in_progress' && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAdvanceWorkflow(currentWorkflow.id)}
                      disabled={workflowLoading}
                    >
                      {workflowLoading ? <CircularProgress size={20} /> : 'Advance Workflow'}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Initialize Workflow Dialog */}
      <Dialog open={initDialogOpen} onClose={() => setInitDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Initialize Governance Workflow</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Initiative</InputLabel>
            <Select
              value={newWorkflow.initiativeId}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, initiativeId: e.target.value })}
              label="Initiative"
            >
              {initiatives.map((init) => (
                <MenuItem key={init.id} value={init.id}>
                  {init.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Risk Tier</InputLabel>
            <Select
              value={newWorkflow.riskTier}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, riskTier: e.target.value })}
              label="Risk Tier"
            >
              <MenuItem value="low">Low (3 stages)</MenuItem>
              <MenuItem value="medium">Medium (5 stages)</MenuItem>
              <MenuItem value="high">High (7 stages)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInitDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleInitializeWorkflow} 
            variant="contained" 
            disabled={workflowLoading || !newWorkflow.initiativeId}
          >
            {workflowLoading ? <CircularProgress size={20} /> : 'Initialize'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Stage Approval</DialogTitle>
        <DialogContent>
          {selectedStage && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedStage.stage_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status: {selectedStage.status}
              </Typography>

              {approvals && approvals.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Previous Approvals:
                  </Typography>
                  <List>
                    {approvals.map((approval) => (
                      <ListItem key={approval.id}>
                        <ListItemText
                          primary={`Decision: ${approval.decision}`}
                          secondary={`By: ${approval.approver_role} | ${approval.comments || 'No comments'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Decision</InputLabel>
                <Select
                  value={approvalData.decision}
                  onChange={(e) => setApprovalData({ ...approvalData, decision: e.target.value })}
                  label="Decision"
                >
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="approved_with_conditions">Approved with Conditions</MenuItem>
                  <MenuItem value="request_changes">Request Changes</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comments"
                value={approvalData.comments}
                onChange={(e) => setApprovalData({ ...approvalData, comments: e.target.value })}
                sx={{ mt: 2 }}
              />
              <Alert severity="warning" sx={{ mt: 2 }}>
                <strong>Human Approval Required:</strong> All approval decisions must be made by authorized personnel. AI recommendations are advisory only.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitApproval} variant="contained" disabled={approvalsLoading}>
            {approvalsLoading ? <CircularProgress size={20} /> : 'Submit Approval'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Results Dialog */}
      <Dialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Analysis Results</DialogTitle>
        <DialogContent>
          {complianceCheck && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Compliance Check</Typography>
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {JSON.stringify(complianceCheck, null, 2)}
                </Typography>
              </Card>
            </Box>
          )}
          {regulationMapping && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Regulation Mapping</Typography>
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {JSON.stringify(regulationMapping, null, 2)}
                </Typography>
              </Card>
            </Box>
          )}
          {!complianceCheck && !regulationMapping && (
            <Alert severity="info">
              No AI analysis results available yet.
            </Alert>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Important:</strong> These are AI-generated recommendations only. Human review and approval is required for all governance decisions.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GovernanceWorkflow
