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

function GovernanceWorkflow() {
  const dispatch = useDispatch()
  const { workflows, stages, approvals, loading, error, aiResults } = useSelector(
    (state) => state.governance
  )

  const [selectedInitiativeId, setSelectedInitiativeId] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [workflowStages, setWorkflowStages] = useState([])
  const [initDialogOpen, setInitDialogOpen] = useState(false)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState(null)
  const [newWorkflow, setNewWorkflow] = useState({
    initiative_id: '',
    risk_tier: 'medium',
  })
  const [approvalData, setApprovalData] = useState({
    decision: 'pending',
    comments: '',
  })

  // Mock initiatives for demo - in production, fetch from initiatives slice
  const mockInitiatives = [
    { id: 1, name: 'Customer Churn Prediction Model' },
    { id: 2, name: 'Fraud Detection System' },
    { id: 3, name: 'Recommendation Engine' },
  ]

  useEffect(() => {
    if (selectedInitiativeId) {
      dispatch(getWorkflowByInitiative(selectedInitiativeId))
    }
  }, [selectedInitiativeId, dispatch])

  useEffect(() => {
    if (workflows[selectedInitiativeId]) {
      const workflow = workflows[selectedInitiativeId]
      setSelectedWorkflow(workflow)
      dispatch(getWorkflowStages(workflow.id))
    }
  }, [workflows, selectedInitiativeId, dispatch])

  useEffect(() => {
    if (selectedWorkflow && stages[selectedWorkflow.id]) {
      setWorkflowStages(stages[selectedWorkflow.id])
    }
  }, [selectedWorkflow, stages])

  const handleInitializeWorkflow = async () => {
    await dispatch(initializeWorkflow(newWorkflow))
    setInitDialogOpen(false)
    setNewWorkflow({ initiative_id: '', risk_tier: 'medium' })
  }

  const handleAdvanceWorkflow = async (workflowId) => {
    await dispatch(advanceWorkflow(workflowId))
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
        await dispatch(
          submitApproval({
            approvalId: approval.payload.id,
            decision: approvalData.decision,
            comments: approvalData.comments,
          })
        )
      }
      
      setApprovalDialogOpen(false)
      setApprovalData({ decision: 'pending', comments: '' })
    }
  }

  const handleCheckCompliance = async () => {
    if (selectedInitiativeId) {
      await dispatch(
        checkCompliance({
          initiative_id: parseInt(selectedInitiativeId),
          check_type: 'completeness',
        })
      )
      setAiDialogOpen(true)
    }
  }

  const handleMapRegulations = async () => {
    if (selectedInitiativeId) {
      await dispatch(
        mapRegulations({
          initiative_id: parseInt(selectedInitiativeId),
        })
      )
      setAiDialogOpen(true)
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
    if (!workflowStages.length) return 0
    const currentStage = workflowStages.find((s) => s.status === 'in_progress')
    return currentStage ? workflowStages.indexOf(currentStage) : 0
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Governance Workflows</Typography>
        <Button variant="contained" onClick={() => setInitDialogOpen(true)}>
          Initialize New Workflow
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
                >
                  {mockInitiatives.map((init) => (
                    <MenuItem key={init.id} value={init.id}>
                      {init.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {selectedWorkflow && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Workflow Status</Typography>
                  <Chip
                    label={selectedWorkflow.status}
                    color={getStatusColor(selectedWorkflow.status)}
                    icon={getStatusIcon(selectedWorkflow.status)}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Risk Tier: <strong>{selectedWorkflow.risk_tier}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Stage: <strong>{selectedWorkflow.current_stage_name || 'N/A'}</strong>
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCheckCompliance}
                    sx={{ mr: 1 }}
                    disabled={loading.ai}
                  >
                    Check Compliance
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleMapRegulations}
                    disabled={loading.ai}
                  >
                    Map Regulations
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {workflowStages.length > 0 && (
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

                {selectedWorkflow?.status === 'in_progress' && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAdvanceWorkflow(selectedWorkflow.id)}
                      disabled={loading.workflows}
                    >
                      Advance Workflow
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
              value={newWorkflow.initiative_id}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, initiative_id: e.target.value })}
              label="Initiative"
            >
              {mockInitiatives.map((init) => (
                <MenuItem key={init.id} value={init.id}>
                  {init.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Risk Tier</InputLabel>
            <Select
              value={newWorkflow.risk_tier}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, risk_tier: e.target.value })}
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
          <Button onClick={handleInitializeWorkflow} variant="contained" disabled={loading.workflows}>
            Initialize
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

              {approvals[selectedStage.id] && approvals[selectedStage.id].length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Previous Approvals:
                  </Typography>
                  <List>
                    {approvals[selectedStage.id].map((approval) => (
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
          <Button onClick={handleSubmitApproval} variant="contained" disabled={loading.approvals}>
            Submit Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Results Dialog */}
      <Dialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Analysis Results</DialogTitle>
        <DialogContent>
          {aiResults.complianceCheck && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">Compliance Check</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(aiResults.complianceCheck, null, 2)}
              </Typography>
            </Box>
          )}
          {aiResults.regulationMapping && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">Regulation Mapping</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(aiResults.regulationMapping, null, 2)}
              </Typography>
            </Box>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            These are AI-generated recommendations only. Human review and approval is required.
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
