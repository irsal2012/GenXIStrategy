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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material'
import {
  getInitiativeEvidence,
  createEvidence,
  updateEvidence,
  deleteEvidence,
  generateModelCard,
} from '../store/slices/governanceSlice'

function EvidenceVault() {
  const dispatch = useDispatch()
  const { evidence, loading, error, aiResults } = useSelector((state) => state.governance)

  const [selectedInitiativeId, setSelectedInitiativeId] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [modelCardDialogOpen, setModelCardDialogOpen] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState(null)
  const [newEvidence, setNewEvidence] = useState({
    initiative_id: '',
    evidence_type: 'model_card',
    title: '',
    description: '',
    file_path: '',
    version: '1.0',
    uploaded_by: 'admin',
  })

  // Mock initiatives for demo
  const mockInitiatives = [
    { id: 1, name: 'Customer Churn Prediction Model' },
    { id: 2, name: 'Fraud Detection System' },
    { id: 3, name: 'Recommendation Engine' },
  ]

  useEffect(() => {
    if (selectedInitiativeId) {
      dispatch(getInitiativeEvidence(selectedInitiativeId))
    }
  }, [selectedInitiativeId, dispatch])

  const handleCreateEvidence = async () => {
    await dispatch(createEvidence({ ...newEvidence, initiative_id: parseInt(selectedInitiativeId) }))
    setCreateDialogOpen(false)
    setNewEvidence({
      initiative_id: '',
      evidence_type: 'model_card',
      title: '',
      description: '',
      file_path: '',
      version: '1.0',
      uploaded_by: 'admin',
    })
    if (selectedInitiativeId) {
      dispatch(getInitiativeEvidence(selectedInitiativeId))
    }
  }

  const handleEditEvidence = async () => {
    if (selectedEvidence) {
      await dispatch(
        updateEvidence({
          evidenceId: selectedEvidence.id,
          data: selectedEvidence,
        })
      )
      setEditDialogOpen(false)
      setSelectedEvidence(null)
      if (selectedInitiativeId) {
        dispatch(getInitiativeEvidence(selectedInitiativeId))
      }
    }
  }

  const handleDeleteEvidence = async (evidenceId) => {
    if (window.confirm('Are you sure you want to delete this evidence?')) {
      await dispatch(deleteEvidence(evidenceId))
      if (selectedInitiativeId) {
        dispatch(getInitiativeEvidence(selectedInitiativeId))
      }
    }
  }

  const handleViewEvidence = (evidenceItem) => {
    setSelectedEvidence(evidenceItem)
    setViewDialogOpen(true)
  }

  const handleOpenEditDialog = (evidenceItem) => {
    setSelectedEvidence(evidenceItem)
    setEditDialogOpen(true)
  }

  const handleGenerateModelCard = async () => {
    if (selectedInitiativeId) {
      await dispatch(
        generateModelCard({
          initiative_id: parseInt(selectedInitiativeId),
        })
      )
      setModelCardDialogOpen(true)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending_approval: 'warning',
      approved: 'success',
      rejected: 'error',
    }
    return colors[status] || 'default'
  }

  const evidenceTypeOptions = [
    { value: 'model_card', label: 'Model Card' },
    { value: 'dpia', label: 'Data Privacy Impact Assessment (DPIA)' },
    { value: 'bias_testing', label: 'Bias Testing' },
    { value: 'monitoring_plan', label: 'Monitoring Plan' },
    { value: 'fairness_report', label: 'Fairness Report' },
    { value: 'explainability_doc', label: 'Explainability Documentation' },
    { value: 'audit_report', label: 'Audit Report' },
    { value: 'compliance_checklist', label: 'Compliance Checklist' },
    { value: 'business_case', label: 'Business Case' },
    { value: 'data_inventory', label: 'Data Inventory' },
    { value: 'incident_response', label: 'Incident Response Plan' },
    { value: 'other', label: 'Other' },
  ]

  const currentEvidence = selectedInitiativeId && evidence[selectedInitiativeId] ? evidence[selectedInitiativeId] : []

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Evidence Vault</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={handleGenerateModelCard}
            sx={{ mr: 1 }}
            disabled={!selectedInitiativeId || loading.ai}
          >
            Generate Model Card
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={!selectedInitiativeId}
          >
            Upload Evidence
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
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
              <MenuItem value="">Select an initiative</MenuItem>
              {mockInitiatives.map((init) => (
                <MenuItem key={init.id} value={init.id}>
                  {init.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedInitiativeId && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading.evidence ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : currentEvidence.length > 0 ? (
                currentEvidence.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      {evidenceTypeOptions.find((t) => t.value === item.evidence_type)?.label ||
                        item.evidence_type}
                    </TableCell>
                    <TableCell>{item.version}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.approval_status || 'draft'}
                        color={getStatusColor(item.approval_status || 'draft')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{item.uploaded_by || 'N/A'}</TableCell>
                    <TableCell>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => handleViewEvidence(item)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEditDialog(item)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteEvidence(item.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No evidence documents found for this initiative
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Evidence Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Evidence Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newEvidence.title}
                onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Evidence Type</InputLabel>
                <Select
                  value={newEvidence.evidence_type}
                  onChange={(e) =>
                    setNewEvidence({ ...newEvidence, evidence_type: e.target.value })
                  }
                  label="Evidence Type"
                >
                  {evidenceTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newEvidence.description}
                onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="File Path / URL"
                value={newEvidence.file_path}
                onChange={(e) => setNewEvidence({ ...newEvidence, file_path: e.target.value })}
                placeholder="/uploads/evidence/..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Version"
                value={newEvidence.version}
                onChange={(e) => setNewEvidence({ ...newEvidence, version: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                In production, this would include file upload functionality. For now, provide a file path or URL.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateEvidence} variant="contained" disabled={loading.evidence}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Evidence Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Evidence Document</DialogTitle>
        <DialogContent>
          {selectedEvidence && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={selectedEvidence.title}
                  onChange={(e) =>
                    setSelectedEvidence({ ...selectedEvidence, title: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Evidence Type</InputLabel>
                  <Select
                    value={selectedEvidence.evidence_type}
                    onChange={(e) =>
                      setSelectedEvidence({ ...selectedEvidence, evidence_type: e.target.value })
                    }
                    label="Evidence Type"
                  >
                    {evidenceTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={selectedEvidence.description || ''}
                  onChange={(e) =>
                    setSelectedEvidence({ ...selectedEvidence, description: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="File Path / URL"
                  value={selectedEvidence.file_path || ''}
                  onChange={(e) =>
                    setSelectedEvidence({ ...selectedEvidence, file_path: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Version"
                  value={selectedEvidence.version}
                  onChange={(e) =>
                    setSelectedEvidence({ ...selectedEvidence, version: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditEvidence} variant="contained" disabled={loading.evidence}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Evidence Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Evidence Document Details</DialogTitle>
        <DialogContent>
          {selectedEvidence && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedEvidence.title}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type:{' '}
                    <strong>
                      {evidenceTypeOptions.find((t) => t.value === selectedEvidence.evidence_type)
                        ?.label || selectedEvidence.evidence_type}
                    </strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Version: <strong>{selectedEvidence.version}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status:{' '}
                    <Chip
                      label={selectedEvidence.approval_status || 'draft'}
                      color={getStatusColor(selectedEvidence.approval_status || 'draft')}
                      size="small"
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded By: <strong>{selectedEvidence.uploaded_by || 'N/A'}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Upload Date:{' '}
                    <strong>
                      {selectedEvidence.created_at
                        ? new Date(selectedEvidence.created_at).toLocaleDateString()
                        : 'N/A'}
                    </strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    File Path: <strong>{selectedEvidence.file_path || 'N/A'}</strong>
                  </Typography>
                </Grid>
              </Grid>
              <Typography variant="subtitle1" gutterBottom>
                Description:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2">
                  {selectedEvidence.description || 'No description provided'}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Model Card Generation Dialog */}
      <Dialog
        open={modelCardDialogOpen}
        onClose={() => setModelCardDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>AI-Generated Model Card</DialogTitle>
        <DialogContent>
          {aiResults.modelCard ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                This is an AI-generated Model Card template. Please review and customize as needed.
              </Alert>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(aiResults.modelCard, null, 2)}
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Typography>Generating model card...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModelCardDialogOpen(false)}>Close</Button>
          {aiResults.modelCard && (
            <Button
              variant="contained"
              onClick={() => {
                setNewEvidence({
                  ...newEvidence,
                  evidence_type: 'model_card',
                  title: 'AI-Generated Model Card',
                  description: 'Model card generated by AI assistant',
                })
                setModelCardDialogOpen(false)
                setCreateDialogOpen(true)
              }}
            >
              Save as Evidence
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EvidenceVault
