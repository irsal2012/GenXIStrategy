import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AutoAwesome as AIIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const steps = ['Basic Information', 'Details & Classification', 'Review & Submit'];

const aiTypes = [
  { value: 'genai', label: 'Generative AI' },
  { value: 'predictive', label: 'Predictive Analytics' },
  { value: 'optimization', label: 'Optimization' },
  { value: 'automation', label: 'Automation' }
];

const riskTiers = [
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' }
];

const IntakeForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    business_objective: '',
    ai_type: '',
    strategic_domain: '',
    business_function: '',
    risk_tier: 'medium',
    technologies: [],
    data_sources: [],
    stakeholders: '',
    expected_roi: '',
    budget_allocated: '',
    regulatory_exposure: ''
  });

  // AI assistance states
  const [unstructuredText, setUnstructuredText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [similarInitiatives, setSimilarInitiatives] = useState([]);
  const [showSimilarDialog, setShowSimilarDialog] = useState(false);
  
  // Attachments
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Technology input
  const [techInput, setTechInput] = useState('');
  const [dataSourceInput, setDataSourceInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleAddDataSource = () => {
    if (dataSourceInput.trim() && !formData.data_sources.includes(dataSourceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        data_sources: [...prev.data_sources, dataSourceInput.trim()]
      }));
      setDataSourceInput('');
    }
  };

  const handleRemoveDataSource = (source) => {
    setFormData(prev => ({
      ...prev,
      data_sources: prev.data_sources.filter(s => s !== source)
    }));
  };

  // AI-powered text parsing
  const handleParseText = async () => {
    if (!unstructuredText.trim()) {
      setError('Please enter some text to parse');
      return;
    }

    setParsing(true);
    setError(null);

    try {
      const response = await axios.post('/intake/parse-text', {
        text: unstructuredText
      });

      if (response.data.success && response.data.data) {
        const parsed = response.data.data;
        setFormData(prev => ({
          ...prev,
          title: parsed.title || prev.title,
          description: parsed.description || prev.description,
          business_objective: parsed.business_objective || prev.business_objective,
          ai_type: parsed.ai_type || prev.ai_type,
          strategic_domain: parsed.strategic_domain || prev.strategic_domain,
          business_function: parsed.business_function || prev.business_function,
          technologies: parsed.technologies || prev.technologies,
          data_sources: parsed.data_sources || prev.data_sources,
          stakeholders: parsed.stakeholders?.join(', ') || prev.stakeholders,
          expected_roi: parsed.expected_roi || prev.expected_roi,
          budget_allocated: parsed.budget_allocated || prev.budget_allocated
        }));
        setSuccess('Text parsed successfully! Review and edit the extracted information.');
        setUnstructuredText('');
      } else {
        setError('Failed to parse text. Please try again.');
      }
    } catch (err) {
      // Backend returns { success: false, error: "..." } for AI failures (e.g., OpenAI quota)
      const backendMessage = err.response?.data?.detail || err.response?.data?.error;
      setError(backendMessage || 'Failed to parse text');
    } finally {
      setParsing(false);
    }
  };

  // AI-powered classification
  const handleAutoClassify = async () => {
    if (!formData.title || !formData.description) {
      setError('Please provide at least a title and description for classification');
      return;
    }

    setClassifying(true);
    setError(null);

    try {
      const response = await axios.post('/intake/classify', {
        title: formData.title,
        description: formData.description,
        business_objective: formData.business_objective,
        technologies: formData.technologies
      });

      if (response.data.success) {
        const classification = response.data;
        setFormData(prev => ({
          ...prev,
          ai_type: classification.ai_type?.value || prev.ai_type,
          strategic_domain: classification.strategic_domain?.value || prev.strategic_domain,
          business_function: classification.business_function?.value || prev.business_function,
          risk_tier: classification.risk_tier?.value || prev.risk_tier
        }));
        setSuccess('Initiative classified successfully!');
      }
    } catch (err) {
      const backendMessage = err.response?.data?.detail || err.response?.data?.error;
      setError(backendMessage || 'Failed to classify initiative');
    } finally {
      setClassifying(false);
    }
  };

  // Validate and detect missing fields
  const handleValidate = async () => {
    setValidating(true);
    setError(null);

    try {
      const response = await axios.post('/intake/validate', {
        initiative_data: formData
      });

      if (response.data.success) {
        setValidationResults(response.data);
        if (response.data.completeness_score === 100) {
          setSuccess('All required fields are complete!');
        }
      }
    } catch (err) {
      const backendMessage = err.response?.data?.detail || err.response?.data?.error;
      setError(backendMessage || 'Failed to validate form');
    } finally {
      setValidating(false);
    }
  };

  // Find similar initiatives
  const handleFindSimilar = async () => {
    if (!formData.title || !formData.description) {
      setError('Please provide at least a title and description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/intake/similar', {
        title: formData.title,
        description: formData.description,
        business_objective: formData.business_objective,
        ai_type: formData.ai_type,
        technologies: formData.technologies
      });

      if (response.data.success) {
        setSimilarInitiatives(response.data.similar_initiatives || []);
        if (response.data.similar_initiatives?.length > 0) {
          setShowSimilarDialog(true);
        } else {
          setSuccess('No similar initiatives found. This appears to be unique!');
        }
      }
    } catch (err) {
      const backendMessage = err.response?.data?.detail || err.response?.data?.error;
      setError(backendMessage || 'Failed to find similar initiatives');
    } finally {
      setLoading(false);
    }
  };

  // File upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    setError(null);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('attachment_type', 'document');
    formDataUpload.append('description', `Uploaded during intake: ${file.name}`);

    try {
      // Note: We'll need to save the initiative first to get an ID
      // For now, we'll store files locally and upload after creation
      setAttachments(prev => [...prev, {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }]);
      setSuccess('File added successfully');
    } catch (err) {
      setError('Failed to add file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create the initiative
      const initiativeData = {
        ...formData,
        status: 'intake',
        priority: 'medium'
      };

      const response = await axios.post('/initiatives/', initiativeData);
      
      if (response.data) {
        const initiativeId = response.data.id;

        // Upload attachments if any
        for (const attachment of attachments) {
          const formDataUpload = new FormData();
          formDataUpload.append('file', attachment.file);
          formDataUpload.append('initiative_id', initiativeId);
          formDataUpload.append('attachment_type', 'document');
          
          await axios.post('/attachments/upload', formDataUpload, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }

        setSuccess('Initiative submitted successfully!');
        setTimeout(() => {
          navigate(`/initiatives/${initiativeId}`);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit initiative');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {/* AI-Powered Text Parser */}
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AIIcon color="primary" />
                  <Typography variant="h6">AI-Powered Quick Start</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Paste any unstructured text (email, document, notes) and let AI extract the structured information.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={unstructuredText}
                  onChange={(e) => setUnstructuredText(e.target.value)}
                  placeholder="Example: We need to build a chatbot for customer support that uses GPT-4 to answer common questions. Expected to reduce support tickets by 30% and save $200k annually..."
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={parsing ? <CircularProgress size={20} /> : <AIIcon />}
                  onClick={handleParseText}
                  disabled={parsing || !unstructuredText.trim()}
                >
                  {parsing ? 'Parsing...' : 'Parse with AI'}
                </Button>
              </AccordionDetails>
            </Accordion>

            <Grid container spacing={3}>
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
                  required
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
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            {/* Auto-Classification */}
            <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AIIcon color="primary" />
                  <Typography variant="h6">AI Classification Assistant</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Let AI automatically classify your initiative based on the information provided.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={classifying ? <CircularProgress size={20} /> : <AIIcon />}
                  onClick={handleAutoClassify}
                  disabled={classifying || !formData.title || !formData.description}
                >
                  {classifying ? 'Classifying...' : 'Auto-Classify with AI'}
                </Button>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>AI Type</InputLabel>
                  <Select
                    name="ai_type"
                    value={formData.ai_type}
                    onChange={handleInputChange}
                    label="AI Type"
                  >
                    {aiTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Risk Tier</InputLabel>
                  <Select
                    name="risk_tier"
                    value={formData.risk_tier}
                    onChange={handleInputChange}
                    label="Risk Tier"
                  >
                    {riskTiers.map(tier => (
                      <MenuItem key={tier.value} value={tier.value}>
                        {tier.label}
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Add Technology"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTechnology()}
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Add Data Source"
                  value={dataSourceInput}
                  onChange={(e) => setDataSourceInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDataSource()}
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Regulatory Exposure"
                  name="regulatory_exposure"
                  value={formData.regulatory_exposure}
                  onChange={handleInputChange}
                  placeholder="e.g., GDPR, HIPAA, SOC 2"
                  helperText="List any relevant regulations or compliance requirements"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            {/* Validation Results */}
            {validationResults && (
              <Card sx={{ mb: 3, bgcolor: validationResults.completeness_score === 100 ? 'success.50' : 'warning.50' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {validationResults.completeness_score === 100 ? (
                      <CheckIcon color="success" />
                    ) : (
                      <WarningIcon color="warning" />
                    )}
                    <Typography variant="h6">
                      Form Completeness: {validationResults.completeness_score}%
                    </Typography>
                  </Box>
                  {validationResults.missing_fields?.length > 0 && (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>Missing or incomplete fields:</Typography>
                      <List dense>
                        {validationResults.missing_fields.map((field, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={field.field}
                              secondary={field.question}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Similar Initiatives Check */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Deduplication Check</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Check if similar initiatives already exist to avoid duplication or identify collaboration opportunities.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
                  onClick={handleFindSimilar}
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Find Similar Initiatives'}
                </Button>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Attachments</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  disabled={uploadingFile}
                >
                  Upload Document
                  <input
                    type="file"
                    hidden
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv"
                  />
                </Button>
                {attachments.length > 0 && (
                  <List sx={{ mt: 2 }}>
                    {attachments.map((file, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleRemoveAttachment(index)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <LinkIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(2)} KB`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Review Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Review Your Submission</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                    <Typography variant="body1">{formData.title || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{formData.description || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">AI Type</Typography>
                    <Typography variant="body1">{formData.ai_type || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Risk Tier</Typography>
                    <Typography variant="body1">{formData.risk_tier || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Technologies</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {formData.technologies.map((tech, index) => (
                        <Chip key={index} label={tech} size="small" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleValidate}
                disabled={validating}
                startIcon={validating ? <CircularProgress size={20} /> : <AIIcon />}
              >
                {validating ? 'Validating...' : 'Validate Form'}
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          AI Initiative Intake Form
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Submit a new AI initiative for review and governance. Use AI-powered features to streamline the process.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

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

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Initiative'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Similar Initiatives Dialog */}
      <Dialog
        open={showSimilarDialog}
        onClose={() => setShowSimilarDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            <Typography variant="h6">Similar Initiatives Found</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We found {similarInitiatives.length} similar initiative(s). Review them to avoid duplication or identify collaboration opportunities.
          </Typography>
          <List>
            {similarInitiatives.map((initiative, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{initiative.title}</Typography>
                        <Chip
                          label={`${initiative.similarity_score}% similar`}
                          size="small"
                          color={initiative.similarity_score > 80 ? 'error' : 'warning'}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Similarity reasons:
                        </Typography>
                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                          {initiative.similarity_reasons?.map((reason, idx) => (
                            <li key={idx}>
                              <Typography variant="body2">{reason}</Typography>
                            </li>
                          ))}
                        </ul>
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                          Recommendation: {initiative.recommendation}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < similarInitiatives.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSimilarDialog(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={() => setShowSimilarDialog(false)}>
            Continue Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IntakeForm;
