import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Build as RepairIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  PlayArrow as ExecuteIcon,
  AccountTree as TraceabilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const StrategyIntakeForm = () => {
  const navigate = useNavigate();
  
  // State
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [corporateStrategy, setCorporateStrategy] = useState('');
  const [execution, setExecution] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Theme selection state for Step 1 (single selection with radio button)
  const [selectedTheme, setSelectedTheme] = useState('');
  const [availableThemes, setAvailableThemes] = useState([]);
  const [customThemeName, setCustomThemeName] = useState('');
  const [customThemeDescription, setCustomThemeDescription] = useState('');
  
  // Objective selection state for Step 2 (single selection with radio button)
  const [selectedObjective, setSelectedObjective] = useState('');
  const [availableObjectives, setAvailableObjectives] = useState([]);
  const [customObjectiveName, setCustomObjectiveName] = useState('');
  const [customObjectiveDescription, setCustomObjectiveDescription] = useState('');
  
  // Capability selection state for Step 3 (single selection with radio button)
  const [selectedCapability, setSelectedCapability] = useState('');
  const [availableCapabilities, setAvailableCapabilities] = useState([]);
  const [customCapabilityName, setCustomCapabilityName] = useState('');
  const [customCapabilityDescription, setCustomCapabilityDescription] = useState('');
  
  // Initiative selection state for Step 4 (multiple selection with checkboxes)
  const [selectedInitiatives, setSelectedInitiatives] = useState([]);
  const [availableInitiatives, setAvailableInitiatives] = useState([]);
  
  // Dialog states
  const [viewOutputDialog, setViewOutputDialog] = useState(false);
  const [selectedStepOutput, setSelectedStepOutput] = useState(null);
  const [traceabilityDialog, setTraceabilityDialog] = useState(false);
  const [traceabilityData, setTraceabilityData] = useState(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Initialize capabilities from completed step 3 when execution changes
  useEffect(() => {
    if (execution && execution.step_executions) {
      const step3 = execution.step_executions.find(s => s.step_order === 3);
      if (step3 && step3.status === 'completed' && step3.output_data?.capabilities) {
        const capabilities = step3.output_data.capabilities;
        if (availableCapabilities.length === 0 && capabilities.length > 0) {
          setAvailableCapabilities(capabilities);
          // Auto-select first capability by default
          if (capabilities.length > 0) {
            setSelectedCapability(capabilities[0].id);
          }
        }
      }
    }
  }, [execution]);

  const loadTemplates = async () => {
    try {
      const response = await axios.get('/process-templates/templates');
      setTemplates(response.data);
      
      // Auto-select default template
      const defaultTemplate = response.data.find(t => t.is_default);
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate);
      }
    } catch (err) {
      setError('Failed to load templates');
    }
  };

  const handleStartExecution = async () => {
    if (!selectedTemplate || !corporateStrategy.trim()) {
      setError('Please select a template and enter a corporate strategy');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create execution
      const response = await axios.post('/process-templates/executions', {
        template_id: selectedTemplate.id,
        corporate_strategy_input: corporateStrategy
      });

      const newExecution = response.data;
      setExecution(newExecution);
      setSuccess('Generating Strategic Orientations...');
      
      // Step 2: Auto-execute Step 1 (Strategic Orientation) immediately
      const stepResponse = await axios.post(
        `/process-templates/executions/${newExecution.id}/steps/1/execute`,
        { input_data: null }
      );

      if (stepResponse.data.success) {
        // Refresh execution data
        const execResponse = await axios.get(`/process-templates/executions/${newExecution.id}`);
        setExecution(execResponse.data);
        
        // Extract themes for user selection
        if (stepResponse.data.step_execution?.output_data?.themes) {
          const themes = stepResponse.data.step_execution.output_data.themes;
          setAvailableThemes(themes);
          // Auto-select first theme by default
          if (themes.length > 0) {
            setSelectedTheme(themes[0].id);
          }
        }
        
        setSuccess('Strategic Orientations generated! Please select one to continue.');
      } else {
        setError(stepResponse.data.error || 'Step execution failed');
      }
      
      setActiveStep(0);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start execution');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteStep = async (stepOrder, userInput = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `/process-templates/executions/${execution.id}/steps/${stepOrder}/execute`,
        { input_data: userInput }
      );

      if (response.data.success) {
        // Refresh execution data
        const execResponse = await axios.get(`/process-templates/executions/${execution.id}`);
        setExecution(execResponse.data);
        
        // If this is step 1 (Strategic Orientation), extract themes for user selection
        if (stepOrder === 1 && response.data.step_execution?.output_data?.themes) {
          const themes = response.data.step_execution.output_data.themes;
          setAvailableThemes(themes);
          // Auto-select first theme by default
          if (themes.length > 0) {
            setSelectedTheme(themes[0].id);
          }
        }
        
        // If this is step 2 (Strategic Objectives), extract objectives for user selection
        if (stepOrder === 2 && response.data.step_execution?.output_data?.objectives) {
          const objectives = response.data.step_execution.output_data.objectives;
          setAvailableObjectives(objectives);
          // Auto-select first objective by default
          if (objectives.length > 0) {
            setSelectedObjective(objectives[0].id);
          }
        }
        
        // If this is step 3 (Strategic Capability Needs), extract capabilities for user selection
        if (stepOrder === 3 && response.data.step_execution?.output_data?.capabilities) {
          const capabilities = response.data.step_execution.output_data.capabilities;
          setAvailableCapabilities(capabilities);
          // Auto-select first capability by default
          if (capabilities.length > 0) {
            setSelectedCapability(capabilities[0].id);
          }
        }
        
        // If this is step 4 (Strategic AI Initiative), extract initiatives for user selection
        if (stepOrder === 4 && response.data.step_execution?.output_data?.initiatives) {
          const initiatives = response.data.step_execution.output_data.initiatives;
          setAvailableInitiatives(initiatives);
          // Auto-select all initiatives by default
          setSelectedInitiatives(initiatives.map(i => i.id));
        }
        
        setSuccess(`Step ${stepOrder} completed successfully!`);
        
        // Move to next step if not last
        if (stepOrder < execution.step_executions.length) {
          setActiveStep(stepOrder);
        }
      } else {
        setError(response.data.error || 'Step execution failed');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to execute step');
    } finally {
      setLoading(false);
    }
  };


  const handleCapabilityToggle = (capabilityId) => {
    setSelectedCapabilities(prev => {
      if (prev.includes(capabilityId)) {
        return prev.filter(id => id !== capabilityId);
      } else {
        return [...prev, capabilityId];
      }
    });
  };

  const handleInitiativeToggle = (initiativeId) => {
    setSelectedInitiatives(prev => {
      if (prev.includes(initiativeId)) {
        return prev.filter(id => id !== initiativeId);
      } else {
        return [...prev, initiativeId];
      }
    });
  };

  const handleExecuteStepWithSelection = (stepOrder) => {
    // For step 2, pass selected theme as user input (single selection)
    if (stepOrder === 2 && selectedTheme) {
      let userInput;
      
      // If user-defined theme is selected, send custom theme data
      if (selectedTheme === 'user-defined') {
        userInput = {
          selected_theme_ids: ['user-defined'],
          custom_theme: {
            name: customThemeName,
            description: customThemeDescription
          }
        };
      } else {
        userInput = {
          selected_theme_ids: [selectedTheme]  // Send as array with single item
        };
      }
      handleExecuteStep(stepOrder, userInput);
    }
    // For step 3, pass selected objective as user input (single selection)
    else if (stepOrder === 3 && selectedObjective) {
      let userInput;
      
      // If user-defined objective is selected, send custom objective data
      if (selectedObjective === 'user-defined') {
        userInput = {
          selected_objective_ids: ['user-defined'],
          custom_objective: {
            name: customObjectiveName,
            description: customObjectiveDescription
          }
        };
      } else {
        userInput = {
          selected_objective_ids: [selectedObjective]  // Send as array with single item
        };
      }
      handleExecuteStep(stepOrder, userInput);
    }
    // For step 4, pass selected capability as user input (single selection)
    else if (stepOrder === 4 && selectedCapability) {
      let userInput;
      
      // If user-defined capability is selected, send custom capability data
      if (selectedCapability === 'user-defined') {
        userInput = {
          selected_capability_ids: ['user-defined'],
          custom_capability: {
            name: customCapabilityName,
            description: customCapabilityDescription
          }
        };
      } else {
        userInput = {
          selected_capability_ids: [selectedCapability]  // Send as array with single item
        };
      }
      handleExecuteStep(stepOrder, userInput);
    }
    // For step 5, pass selected initiatives as user input (multiple selection)
    else if (stepOrder === 5 && selectedInitiatives.length > 0) {
      const userInput = {
        selected_initiative_ids: selectedInitiatives
      };
      handleExecuteStep(stepOrder, userInput);
    } else {
      handleExecuteStep(stepOrder);
    }
  };

  const handleRepairStep = async (stepExecutionId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `/process-templates/executions/${execution.id}/steps/${stepExecutionId}/repair`
      );

      if (response.data.success) {
        // Refresh execution data
        const execResponse = await axios.get(`/process-templates/executions/${execution.id}`);
        setExecution(execResponse.data);
        setSuccess('Step output repaired successfully!');
      } else {
        setError(response.data.error || 'Repair failed');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to repair step');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOutput = (stepExecution) => {
    setSelectedStepOutput(stepExecution);
    setViewOutputDialog(true);
  };

  const handleViewTraceability = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/process-templates/executions/${execution.id}/traceability`);
      setTraceabilityData(response.data.traceability);
      setTraceabilityDialog(true);
    } catch (err) {
      setError('Failed to load traceability data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInitiatives = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `/process-templates/executions/${execution.id}/create-initiatives`
      );

      if (response.data.success) {
        setSuccess(`Created ${response.data.initiatives_created} initiatives!`);
        setTimeout(() => {
          navigate('/initiatives');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create initiatives');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`/process-templates/executions/${execution.id}/export`);
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `strategy-execution-${execution.id}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Export downloaded successfully!');
    } catch (err) {
      setError('Failed to export execution');
    }
  };

  const getStepStatus = (stepExecution) => {
    if (!stepExecution) return 'pending';
    return stepExecution.status;
  };

  const getStepStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'failed': return 'error';
      case 'validating': return 'warning';
      default: return 'default';
    }
  };

  const isStepValid = (stepExecution) => {
    return stepExecution?.validation_results?.is_valid === true;
  };

  const canExecuteStep = (stepOrder) => {
    if (!execution) return false;
    
    // First step can always be executed
    if (stepOrder === 1) return true;
    
    // Other steps require previous step to be completed.
    // Some backends/templates may mark a step as "completed" or "validating" while the UI is waiting;
    // treat both as executable-gate satisfied so users don't get stuck with a disabled EXECUTE STEP.
    const prevStep = execution.step_executions.find(s => s.step_order === stepOrder - 1);
    return prevStep && (prevStep.status === 'completed' || prevStep.status === 'validating');
  };

  const isExecutionComplete = () => {
    if (!execution) return false;
    return execution.status === 'completed';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <AIIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4">Strategic AI Intake</Typography>
            <Typography variant="body2" color="text.secondary">
              Transform your corporate strategy into actionable AI initiatives with full traceability
            </Typography>
          </Box>
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

        {!execution ? (
          // Step 1: Select Template and Enter Strategy
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Process Template</InputLabel>
                  <Select
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value);
                      setSelectedTemplate(template);
                    }}
                    label="Process Template"
                  >
                    {templates.map(template => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name} {template.is_default && '(Default)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {selectedTemplate && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Template Steps</Typography>
                      <List dense>
                        {selectedTemplate.steps.map((step, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={`${index + 1}. ${step.name}`}
                              secondary={step.description}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Corporate Strategy Statement"
                  value={corporateStrategy}
                  onChange={(e) => setCorporateStrategy(e.target.value)}
                  placeholder="Enter your corporate strategy statement here. Example: 'Our strategy is to become the leading AI-powered customer service platform by 2026. We will focus on three key areas: 1) Automating 80% of customer inquiries through intelligent chatbots, 2) Providing real-time sentiment analysis to improve customer satisfaction, 3) Reducing operational costs by 40% through AI-driven efficiency...'"
                  helperText="Paste your corporate strategy document, vision statement, or strategic plan. The AI will analyze it and generate structured initiatives."
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <ExecuteIcon />}
                  onClick={handleStartExecution}
                  disabled={loading || !selectedTemplate || !corporateStrategy.trim()}
                  fullWidth
                >
                  {loading ? 'Starting Process...' : 'Start Strategic Intake Process'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : (
          // Step 2: Execute Steps
          <Box>
            {/* Success Alert at the top */}
            {success && (
              <Alert 
                severity="success" 
                sx={{ mb: 3 }}
                icon={<CheckIcon />}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setSuccess(null)}
                  >
                    ×
                  </IconButton>
                }
              >
                {success}
              </Alert>
            )}

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">Execution Progress</Typography>
                <Typography variant="body2" color="text.secondary">
                  Template: {execution.template.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<TraceabilityIcon />}
                  onClick={handleViewTraceability}
                  disabled={!isExecutionComplete()}
                  variant="outlined"
                  size="small"
                >
                  VIEW TRACEABILITY
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  disabled={!isExecutionComplete()}
                  variant="outlined"
                  size="small"
                >
                  EXPORT
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateInitiatives}
                  disabled={!isExecutionComplete() || loading}
                  size="small"
                >
                  CREATE INITIATIVES
                </Button>
              </Box>
            </Box>

            {/* Display Corporate Strategy Statement */}
            <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Corporate Strategy Statement:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {execution.corporate_strategy_input}
                </Typography>
              </CardContent>
            </Card>

            {/* Display Selected Strategic Objective (if Step 3 or later is active) */}
            {selectedObjective && availableObjectives.length > 0 && (
              <Card variant="outlined" sx={{ mb: 3, bgcolor: 'info.50', borderColor: 'info.main' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="info.main">
                    Selected Strategic Objective:
                  </Typography>
                  {availableObjectives.filter(o => o.id === selectedObjective).map(objective => (
                    <Box key={objective.id}>
                      <Typography variant="body2" fontWeight="bold">
                        {objective.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {objective.description}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Display Selected Strategic Capability (if Step 4 or later is active) */}
            {selectedCapability && availableCapabilities.length > 0 && (
              <Card variant="outlined" sx={{ mb: 3, bgcolor: 'secondary.50', borderColor: 'secondary.main' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="secondary">
                    Selected Strategic Capability Need:
                  </Typography>
                  {availableCapabilities.filter(c => c.id === selectedCapability).map(capability => (
                    <Box key={capability.id} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        • {capability.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {capability.description}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            <Box sx={{ mb: 3 }}>
              {execution.step_executions.map((stepExec, index) => {
                const status = getStepStatus(stepExec);
                const isValid = isStepValid(stepExec);
                const canExecute = canExecuteStep(stepExec.step_order);

                return (
                  <Box 
                    key={stepExec.id} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      mb: 2,
                      position: 'relative'
                    }}
                  >
                    {/* Step Number Circle */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: status === 'completed' ? 'primary.main' : 'grey.300',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        mr: 2,
                        flexShrink: 0
                      }}
                    >
                      {index + 1}
                    </Box>

                    {/* Vertical Line Connector */}
                    {index < execution.step_executions.length - 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 19,
                          top: 40,
                          bottom: -16,
                          width: 2,
                          bgcolor: 'grey.300'
                        }}
                      />
                    )}

                    {/* Step Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {stepExec.step_name}
                        </Typography>
                        <Chip
                          label={status}
                          size="small"
                          color={getStepStatusColor(status)}
                          sx={{ textTransform: 'lowercase' }}
                        />
                        {status === 'completed' && !isValid && (
                          <Chip
                            label="Validation Issues"
                            size="small"
                            color="warning"
                            icon={<ErrorIcon />}
                          />
                        )}
                      </Box>

                      {/* Step Actions */}
                      <Box>
                        {/* Show Strategic Orientation selection for Step 1 when completed - RADIO BUTTONS */}
                        {stepExec.step_order === 1 && status === 'completed' && availableThemes.length > 0 && (
                          <Card variant="outlined" sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderColor: 'primary.main' }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                              Strategic Orientation:
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                              Select ONE Strategic Orientation to develop capabilities for:
                            </Typography>
                            <RadioGroup
                              value={selectedTheme}
                              onChange={(e) => setSelectedTheme(e.target.value)}
                            >
                              {availableThemes.map((theme) => (
                                <FormControlLabel
                                  key={theme.id}
                                  value={theme.id}
                                  control={<Radio />}
                                  label={
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">
                                        {theme.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {theme.description}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              ))}
                              <FormControlLabel
                                value="user-defined"
                                control={<Radio />}
                                label={
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      User Defined
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Define your own custom strategic orientation
                                    </Typography>
                                  </Box>
                                }
                              />
                            </RadioGroup>
                            
                            {/* Show custom input fields when "User Defined" is selected */}
                            {selectedTheme === 'user-defined' && (
                              <Box sx={{ mt: 2, pl: 4 }}>
                                <TextField
                                  fullWidth
                                  label="Strategic Orientation Name"
                                  value={customThemeName}
                                  onChange={(e) => setCustomThemeName(e.target.value)}
                                  placeholder="e.g., Innovation-Driven Growth"
                                  sx={{ mb: 2 }}
                                  required
                                />
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={3}
                                  label="Strategic Orientation Description"
                                  value={customThemeDescription}
                                  onChange={(e) => setCustomThemeDescription(e.target.value)}
                                  placeholder="Describe your custom strategic orientation and how it aligns with your corporate strategy..."
                                  required
                                />
                              </Box>
                            )}
                            
                            {/* EXECUTE STEP button inside Strategic Orientation box */}
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={loading ? <CircularProgress size={20} /> : <ExecuteIcon />}
                              onClick={() => handleExecuteStepWithSelection(2)}
                              disabled={
                                loading || 
                                !selectedTheme ||
                                (selectedTheme === 'user-defined' && (!customThemeName.trim() || !customThemeDescription.trim()))
                              }
                              size="medium"
                              sx={{ mt: 2 }}
                              fullWidth
                            >
                              {loading ? 'Executing...' : 'EXECUTE STEP'}
                            </Button>
                          </Card>
                        )}

                        {/* Show objective selection for Step 3 if Step 2 is completed - RADIO BUTTONS */}
                        {stepExec.step_order === 3 && status === 'pending' && availableObjectives.length > 0 && (
                          <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Select ONE Strategic Objective to develop capabilities for:
                            </Typography>
                            <RadioGroup
                              value={selectedObjective}
                              onChange={(e) => setSelectedObjective(e.target.value)}
                            >
                              {availableObjectives.map((objective) => (
                                <FormControlLabel
                                  key={objective.id}
                                  value={objective.id}
                                  control={<Radio />}
                                  label={
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">
                                        {objective.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {objective.description}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              ))}
                              <FormControlLabel
                                value="user-defined"
                                control={<Radio />}
                                label={
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      User Defined
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Define your own custom strategic objective
                                    </Typography>
                                  </Box>
                                }
                              />
                            </RadioGroup>
                            
                            {/* Show custom input fields when "User Defined" is selected */}
                            {selectedObjective === 'user-defined' && (
                              <Box sx={{ mt: 2, pl: 4 }}>
                                <TextField
                                  fullWidth
                                  label="Strategic Objective Name"
                                  value={customObjectiveName}
                                  onChange={(e) => setCustomObjectiveName(e.target.value)}
                                  placeholder="e.g., Achieve 95% Customer Satisfaction Score"
                                  sx={{ mb: 2 }}
                                  required
                                />
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={3}
                                  label="Strategic Objective Description"
                                  value={customObjectiveDescription}
                                  onChange={(e) => setCustomObjectiveDescription(e.target.value)}
                                  placeholder="Describe your custom strategic objective and how it aligns with your strategic orientation..."
                                  required
                                />
                              </Box>
                            )}
                          </Card>
                        )}

                        {/* Show capability selection for Step 4 if Step 3 is completed - RADIO BUTTONS */}
                        {stepExec.step_order === 4 && status === 'pending' && availableCapabilities.length > 0 && (
                          <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Select ONE Strategic Capability Need to generate initiatives for:
                            </Typography>
                            <RadioGroup
                              value={selectedCapability}
                              onChange={(e) => setSelectedCapability(e.target.value)}
                            >
                              {availableCapabilities.map((capability) => (
                                <FormControlLabel
                                  key={capability.id}
                                  value={capability.id}
                                  control={<Radio />}
                                  label={
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">
                                        {capability.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {capability.description}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              ))}
                              <FormControlLabel
                                value="user-defined"
                                control={<Radio />}
                                label={
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      User Defined
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Define your own custom strategic capability
                                    </Typography>
                                  </Box>
                                }
                              />
                            </RadioGroup>
                            
                            {/* Show custom input fields when "User Defined" is selected */}
                            {selectedCapability === 'user-defined' && (
                              <Box sx={{ mt: 2, pl: 4 }}>
                                <TextField
                                  fullWidth
                                  label="Strategic Capability Name"
                                  value={customCapabilityName}
                                  onChange={(e) => setCustomCapabilityName(e.target.value)}
                                  placeholder="e.g., Advanced Data Analytics"
                                  sx={{ mb: 2 }}
                                  required
                                />
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={3}
                                  label="Strategic Capability Description"
                                  value={customCapabilityDescription}
                                  onChange={(e) => setCustomCapabilityDescription(e.target.value)}
                                  placeholder="Describe your custom strategic capability and how it aligns with your strategic objective..."
                                  required
                                />
                              </Box>
                            )}
                          </Card>
                        )}

                        {/* Show initiative selection for Step 5 if Step 4 is completed - CHECKBOXES */}
                        {stepExec.step_order === 5 && status === 'pending' && availableInitiatives.length > 0 && (
                          <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Select Strategic AI Initiatives to generate KPIs for:
                            </Typography>
                            <FormGroup>
                              {availableInitiatives.map((initiative) => (
                                <FormControlLabel
                                  key={initiative.id}
                                  control={
                                    <Checkbox
                                      checked={selectedInitiatives.includes(initiative.id)}
                                      onChange={() => handleInitiativeToggle(initiative.id)}
                                    />
                                  }
                                  label={
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">
                                        {initiative.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {initiative.description}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              ))}
                            </FormGroup>
                          </Card>
                        )}

                        {/* Only show EXECUTE STEP button for steps other than Step 2 (Strategic Orientation is handled inside its box) */}
                        {status === 'pending' && stepExec.step_order !== 2 && (
                          <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <ExecuteIcon />}
                            onClick={() => {
                              // For steps with selection, use the selection handler
                              if (stepExec.step_order === 3 || stepExec.step_order === 4 || stepExec.step_order === 5) {
                                handleExecuteStepWithSelection(stepExec.step_order);
                              } else {
                                // For step 1, execute directly
                                handleExecuteStep(stepExec.step_order);
                              }
                            }}
                            disabled={
                              loading || 
                              !canExecute || 
                              (stepExec.step_order === 3 && availableObjectives.length > 0 && !selectedObjective) ||
                              (stepExec.step_order === 3 && selectedObjective === 'user-defined' && (!customObjectiveName.trim() || !customObjectiveDescription.trim())) ||
                              // Step 4 (Strategic Capability Needs) requires capability selected
                              (stepExec.step_order === 4 && availableCapabilities.length > 0 && !selectedCapability) ||
                              (stepExec.step_order === 4 && selectedCapability === 'user-defined' && (!customCapabilityName.trim() || !customCapabilityDescription.trim())) ||
                              // Step 5 (Strategic AI Initiatives) requires at least one initiative selected
                              (stepExec.step_order === 5 && availableInitiatives.length > 0 && selectedInitiatives.length === 0)
                            }
                            size="medium"
                          >
                            {loading ? 'Executing...' : 'EXECUTE STEP'}
                          </Button>
                        )}

                        {/*
                          Guardrail for the specific UX issue reported:
                          some templates label "Strategic Capability Needs" as step 3, and at that moment we need to
                          allow executing as soon as a Strategic Objective is selected.
                          In those cases `step_order` for capability needs is still 3, and the prerequisites are:
                          - previous step completed (handled by canExecute)
                          - selectedObjective set (handled above)
                        */}

                        {status === 'in_progress' && (
                          <Box>
                            <LinearProgress />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              AI is generating output...
                            </Typography>
                          </Box>
                        )}

                        {status === 'completed' && (
                          <Box>
                            {/* Show capability selection for completed Step 3 (Strategic Capability Needs) - this allows user to change selection */}
                            {stepExec.step_order === 3 && stepExec.output_data?.capabilities && stepExec.output_data.capabilities.length > 0 && (
                              <Box>
                                <Card variant="outlined" sx={{ mb: 2, p: 2, bgcolor: 'warning.50' }}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Select ONE Strategic Capability Need to generate initiatives for:
                                  </Typography>
                                  <RadioGroup
                                    value={selectedCapability}
                                    onChange={(e) => {
                                      // Initialize availableCapabilities if not already set
                                      if (availableCapabilities.length === 0) {
                                        setAvailableCapabilities(stepExec.output_data.capabilities);
                                      }
                                      setSelectedCapability(e.target.value);
                                    }}
                                  >
                                    {stepExec.output_data.capabilities.map((capability) => (
                                      <FormControlLabel
                                        key={capability.id}
                                        value={capability.id}
                                        control={<Radio />}
                                        label={
                                          <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                              {capability.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {capability.description}
                                            </Typography>
                                          </Box>
                                        }
                                      />
                                    ))}
                                    <FormControlLabel
                                      value="user-defined"
                                      control={<Radio />}
                                      label={
                                        <Box>
                                          <Typography variant="body2" fontWeight="bold">
                                            User Defined
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            Define your own custom strategic capability
                                          </Typography>
                                        </Box>
                                      }
                                    />
                                  </RadioGroup>
                                  
                                  {/* Show custom input fields when "User Defined" is selected */}
                                  {selectedCapability === 'user-defined' && (
                                    <Box sx={{ mt: 2, pl: 4 }}>
                                      <TextField
                                        fullWidth
                                        label="Strategic Capability Name"
                                        value={customCapabilityName}
                                        onChange={(e) => setCustomCapabilityName(e.target.value)}
                                        placeholder="e.g., Advanced Data Analytics"
                                        sx={{ mb: 2 }}
                                        required
                                      />
                                      <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Strategic Capability Description"
                                        value={customCapabilityDescription}
                                        onChange={(e) => setCustomCapabilityDescription(e.target.value)}
                                        placeholder="Describe your custom strategic capability and how it aligns with your strategic objective..."
                                        required
                                      />
                                    </Box>
                                  )}
                                </Card>
                                
                                {/* Add EXECUTE STEP button for next step after capability selection */}
                                {execution.step_executions.find(s => s.step_order === 4) && (
                                  <Button
                                    variant="contained"
                                    startIcon={loading ? <CircularProgress size={20} /> : <ExecuteIcon />}
                                    onClick={() => handleExecuteStepWithSelection(4)}
                                    disabled={
                                      loading || 
                                      !selectedCapability ||
                                      (selectedCapability === 'user-defined' && (!customCapabilityName.trim() || !customCapabilityDescription.trim()))
                                    }
                                    size="medium"
                                    sx={{ mb: 2 }}
                                  >
                                    {loading ? 'Executing...' : 'EXECUTE NEXT STEP (Strategic AI Initiative)'}
                                  </Button>
                                )}
                              </Box>
                            )}
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                startIcon={<ViewIcon />}
                                onClick={() => handleViewOutput(stepExec)}
                                size="small"
                              >
                                VIEW OUTPUT
                              </Button>
                              {!isValid && (
                                <Button
                                  startIcon={<RepairIcon />}
                                  onClick={() => handleRepairStep(stepExec.id)}
                                  color="warning"
                                  disabled={loading}
                                >
                                  Repair
                                </Button>
                              )}
                            </Box>
                          </Box>
                        )}

                        {status === 'failed' && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            Step execution failed. Please try again or contact support.
                          </Alert>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Paper>

      {/* View Output Dialog */}
      <Dialog
        open={viewOutputDialog}
        onClose={() => setViewOutputDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Step Output: {selectedStepOutput?.step_name}</DialogTitle>
        <DialogContent>
          {selectedStepOutput && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>Generated Output:</Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                  {JSON.stringify(selectedStepOutput.output_data, null, 2)}
                </pre>
              </Paper>

              {selectedStepOutput.validation_errors && selectedStepOutput.validation_errors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Validation Errors:
                  </Typography>
                  <List dense>
                    {selectedStepOutput.validation_errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={error.message || error.error}
                          secondary={error.path ? `Path: ${error.path.join('.')}` : null}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOutputDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Traceability Dialog */}
      <Dialog
        open={traceabilityDialog}
        onClose={() => setTraceabilityDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Traceability Map</DialogTitle>
        <DialogContent>
          {traceabilityData && (
            <Box>
              <Typography variant="h6" gutterBottom>Corporate Strategy</Typography>
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="body2">{traceabilityData.corporate_strategy}</Typography>
              </Paper>

              <Typography variant="h6" gutterBottom>Initiatives → Capabilities → Objectives → Themes</Typography>
              {traceabilityData.initiatives.map((initiative, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {initiative.content.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {initiative.content.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`Initiative: ${initiative.id}`} size="small" color="primary" />
                      <Chip label={`→ Capability: ${initiative.parent_capability}`} size="small" />
                      {initiative.full_chain && initiative.full_chain.map((item, i) => (
                        <Chip key={i} label={item} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTraceabilityDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StrategyIntakeForm;
