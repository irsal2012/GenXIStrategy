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
} from '@mui/icons-material'
import {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from '../store/slices/governanceSlice'

function PolicyLibrary() {
  const dispatch = useDispatch()
  const { policies, loading, error } = useSelector((state) => state.governance)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    status: '',
  })
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    category: 'data_governance',
    version: '1.0',
    status: 'draft',
    content: '',
    owner: '',
    approval_date: '',
    review_date: '',
  })

  useEffect(() => {
    dispatch(getPolicies(filters))
  }, [dispatch, filters])

  const handleCreatePolicy = async () => {
    await dispatch(createPolicy(newPolicy))
    setCreateDialogOpen(false)
    setNewPolicy({
      name: '',
      description: '',
      category: 'data_governance',
      version: '1.0',
      status: 'draft',
      content: '',
      owner: '',
      approval_date: '',
      review_date: '',
    })
    dispatch(getPolicies(filters))
  }

  const handleEditPolicy = async () => {
    if (selectedPolicy) {
      await dispatch(
        updatePolicy({
          policyId: selectedPolicy.id,
          data: selectedPolicy,
        })
      )
      setEditDialogOpen(false)
      setSelectedPolicy(null)
      dispatch(getPolicies(filters))
    }
  }

  const handleDeletePolicy = async (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      await dispatch(deletePolicy(policyId))
      dispatch(getPolicies(filters))
    }
  }

  const handleViewPolicy = async (policyId) => {
    const result = await dispatch(getPolicy(policyId))
    if (result.payload) {
      setSelectedPolicy(result.payload)
      setViewDialogOpen(true)
    }
  }

  const handleOpenEditDialog = async (policyId) => {
    const result = await dispatch(getPolicy(policyId))
    if (result.payload) {
      setSelectedPolicy(result.payload)
      setEditDialogOpen(true)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      active: 'success',
      under_review: 'warning',
      archived: 'error',
    }
    return colors[status] || 'default'
  }

  const categoryOptions = [
    { value: 'data_governance', label: 'Data Governance' },
    { value: 'model_risk', label: 'Model Risk' },
    { value: 'ai_ethics', label: 'AI Ethics' },
    { value: 'privacy', label: 'Privacy' },
    { value: 'security', label: 'Security' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'other', label: 'Other' },
  ]

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'archived', label: 'Archived' },
  ]

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Policy Library</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Policy
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categoryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Review Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading.policies ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : policies.list && policies.list.length > 0 ? (
              policies.list.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>{policy.name}</TableCell>
                  <TableCell>
                    {categoryOptions.find((c) => c.value === policy.category)?.label || policy.category}
                  </TableCell>
                  <TableCell>{policy.version}</TableCell>
                  <TableCell>
                    <Chip label={policy.status} color={getStatusColor(policy.status)} size="small" />
                  </TableCell>
                  <TableCell>{policy.owner || 'N/A'}</TableCell>
                  <TableCell>
                    {policy.review_date
                      ? new Date(policy.review_date).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => handleViewPolicy(policy.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenEditDialog(policy.id)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePolicy(policy.id)}
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
                  No policies found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Policy Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Policy</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Policy Name"
                value={newPolicy.name}
                onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={newPolicy.description}
                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newPolicy.category}
                  onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                  label="Category"
                >
                  {categoryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Version"
                value={newPolicy.version}
                onChange={(e) => setNewPolicy({ ...newPolicy, version: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newPolicy.status}
                  onChange={(e) => setNewPolicy({ ...newPolicy, status: e.target.value })}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Owner"
                value={newPolicy.owner}
                onChange={(e) => setNewPolicy({ ...newPolicy, owner: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Approval Date"
                value={newPolicy.approval_date}
                onChange={(e) => setNewPolicy({ ...newPolicy, approval_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Review Date"
                value={newPolicy.review_date}
                onChange={(e) => setNewPolicy({ ...newPolicy, review_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Policy Content"
                value={newPolicy.content}
                onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
                placeholder="Enter the full policy text here..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreatePolicy} variant="contained" disabled={loading.policies}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Policy</DialogTitle>
        <DialogContent>
          {selectedPolicy && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Policy Name"
                  value={selectedPolicy.name}
                  onChange={(e) =>
                    setSelectedPolicy({ ...selectedPolicy, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={selectedPolicy.description}
                  onChange={(e) =>
                    setSelectedPolicy({ ...selectedPolicy, description: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedPolicy.category}
                    onChange={(e) =>
                      setSelectedPolicy({ ...selectedPolicy, category: e.target.value })
                    }
                    label="Category"
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Version"
                  value={selectedPolicy.version}
                  onChange={(e) =>
                    setSelectedPolicy({ ...selectedPolicy, version: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedPolicy.status}
                    onChange={(e) =>
                      setSelectedPolicy({ ...selectedPolicy, status: e.target.value })
                    }
                    label="Status"
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Owner"
                  value={selectedPolicy.owner || ''}
                  onChange={(e) =>
                    setSelectedPolicy({ ...selectedPolicy, owner: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Approval Date"
                  value={selectedPolicy.approval_date || ''}
                  onChange={(e) =>
                    setSelectedPolicy({ ...selectedPolicy, approval_date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Review Date"
                  value={selectedPolicy.review_date || ''}
                  onChange={(e) =>
                    setSelectedPolicy({ ...selectedPolicy, review_date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Policy Content"
                  value={selectedPolicy.content || ''}
                  onChange={(e) =>
                    setSelectedPolicy({ ...selectedPolicy, content: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditPolicy} variant="contained" disabled={loading.policies}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Policy Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Policy Details</DialogTitle>
        <DialogContent>
          {selectedPolicy && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPolicy.name}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Category: <strong>{categoryOptions.find((c) => c.value === selectedPolicy.category)?.label}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Version: <strong>{selectedPolicy.version}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status:{' '}
                    <Chip
                      label={selectedPolicy.status}
                      color={getStatusColor(selectedPolicy.status)}
                      size="small"
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Owner: <strong>{selectedPolicy.owner || 'N/A'}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Approval Date:{' '}
                    <strong>
                      {selectedPolicy.approval_date
                        ? new Date(selectedPolicy.approval_date).toLocaleDateString()
                        : 'N/A'}
                    </strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Review Date:{' '}
                    <strong>
                      {selectedPolicy.review_date
                        ? new Date(selectedPolicy.review_date).toLocaleDateString()
                        : 'N/A'}
                    </strong>
                  </Typography>
                </Grid>
              </Grid>
              <Typography variant="subtitle1" gutterBottom>
                Description:
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedPolicy.description || 'No description provided'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Policy Content:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedPolicy.content || 'No content provided'}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PolicyLibrary
