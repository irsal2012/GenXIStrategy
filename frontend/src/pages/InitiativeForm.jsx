import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { createInitiative } from '../store/slices/initiativesSlice'

const statusOptions = [
  { value: 'ideation', label: 'Ideation' },
  { value: 'planning', label: 'Planning' },
  { value: 'pilot', label: 'Pilot' },
  { value: 'production', label: 'Production' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'retired', label: 'Retired' },
]

const priorityOptions = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const aiTypeOptions = [
  { value: 'genai', label: 'Generative AI' },
  { value: 'predictive', label: 'Predictive Analytics' },
  { value: 'optimization', label: 'Optimization' },
  { value: 'automation', label: 'Automation' },
  { value: 'computer_vision', label: 'Computer Vision' },
  { value: 'nlp', label: 'Natural Language Processing' },
]

function InitiativeForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    business_objective: '',
    status: 'ideation',
    priority: 'medium',
    ai_type: '',
    strategic_domain: '',
    business_function: '',
    budget_allocated: '',
    budget_spent: '0',
    expected_roi: '',
    start_date: '',
    target_completion_date: '',
    business_value_score: '50',
    technical_feasibility_score: '50',
    risk_score: '50',
    technologies: [],
    data_sources: [],
    stakeholders: '',
  })

  const [techInput, setTechInput] = useState('')
  const [dataSourceInput, setDataSourceInput] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }))
      setTechInput('')
    }
  }

  const handleRemoveTechnology = (tech) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }))
  }

  const handleAddDataSource = () => {
    if (dataSourceInput.trim() && !formData.data_sources.includes(dataSourceInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        data_sources: [...prev.data_sources, dataSourceInput.trim()],
      }))
      setDataSourceInput('')
    }
  }

  const handleRemoveDataSource = (source) => {
    setFormData((prev) => ({
      ...prev,
      data_sources: prev.data_sources.filter((s) => s !== source),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare data for submission
      const initiativeData = {
        ...formData,
        stakeholders: formData.stakeholders
          ? formData.stakeholders.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        expected_roi:
          formData.expected_roi === '' || formData.expected_roi === null
            ? null
            : Number(formData.expected_roi),
        budget_allocated:
          formData.budget_allocated === '' || formData.budget_allocated === null
            ? 0
            : Number(formData.budget_allocated),
        budget_spent:
          formData.budget_spent === '' || formData.budget_spent === null
            ? 0
            : Number(formData.budget_spent),
        business_value_score: Number(formData.business_value_score),
        technical_feasibility_score: Number(formData.technical_feasibility_score),
        risk_score: Number(formData.risk_score),
        start_date: formData.start_date || null,
        target_completion_date: formData.target_completion_date || null,
      }

      const result = await dispatch(createInitiative(initiativeData)).unwrap()
      
      setSuccess('Initiative created successfully!')
      setTimeout(() => {
        navigate(`/initiatives/${result.id}`)
      }, 1500)
    } catch (err) {
      setError(err || 'Failed to create initiative')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/initiatives')}
        >
          Back to Initiatives
        </Button>
        <Typography variant="h4">Create New Initiative</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Initiative Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Customer Support AI Chatbot"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the AI initiative, what it does, and how it works..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Business Objective"
                name="business_objective"
                value={formData.business_objective}
                onChange={handleInputChange}
                placeholder="What business problem does this solve? What value will it deliver?"
              />
            </Grid>

            {/* Status and Priority */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
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
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Classification */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Classification
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>AI Type</InputLabel>
                <Select
                  name="ai_type"
                  value={formData.ai_type}
                  onChange={handleInputChange}
                  label="AI Type"
                >
                  {aiTypeOptions.map((option) => (
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
                label="Strategic Domain"
                name="strategic_domain"
                value={formData.strategic_domain}
                onChange={handleInputChange}
                placeholder="e.g., Customer Experience, Operations"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Function"
                name="business_function"
                value={formData.business_function}
                onChange={handleInputChange}
                placeholder="e.g., Marketing, Finance, IT"
              />
            </Grid>

            {/* Technologies */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Technology"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTechnology()
                  }
                }}
                placeholder="e.g., GPT-4, TensorFlow, Python"
                helperText="Press Enter to add"
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.technologies.map((tech, index) => (
                  <Chip
                    key={index}
                    label={tech}
                    onDelete={() => handleRemoveTechnology(tech)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Data Sources */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Data Source"
                value={dataSourceInput}
                onChange={(e) => setDataSourceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddDataSource()
                  }
                }}
                placeholder="e.g., Customer Database, CRM System"
                helperText="Press Enter to add"
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.data_sources.map((source, index) => (
                  <Chip
                    key={index}
                    label={source}
                    onDelete={() => handleRemoveDataSource(source)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Financial Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Financial Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Budget Allocated ($)"
                name="budget_allocated"
                value={formData.budget_allocated}
                onChange={handleInputChange}
                placeholder="e.g., 100000"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Expected ROI (%)"
                name="expected_roi"
                value={formData.expected_roi}
                onChange={handleInputChange}
                placeholder="e.g., 25"
              />
            </Grid>

            {/* Timeline */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Timeline
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Target Completion Date"
                name="target_completion_date"
                value={formData.target_completion_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Scores */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Scoring (0-100)
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Business Value Score"
                name="business_value_score"
                value={formData.business_value_score}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Technical Feasibility Score"
                name="technical_feasibility_score"
                value={formData.technical_feasibility_score}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Risk Score"
                name="risk_score"
                value={formData.risk_score}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>

            {/* Stakeholders */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stakeholders"
                name="stakeholders"
                value={formData.stakeholders}
                onChange={handleInputChange}
                placeholder="List key stakeholders (comma-separated)"
                helperText="e.g., John Smith (Product), Jane Doe (Engineering)"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/initiatives')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Initiative'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  )
}

export default InitiativeForm
