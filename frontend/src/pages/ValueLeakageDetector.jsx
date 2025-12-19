import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Warning,
  Psychology,
  Add,
  CheckCircle,
  Error as ErrorIcon,
  Build,
} from '@mui/icons-material';
import {
  getInitiativeLeakages,
  reportValueLeakage,
  updateLeakageStatus,
  detectLeakageAI,
} from '../store/slices/benefitsSlice';
import { getInitiatives } from '../store/slices/initiativesSlice';

const ValueLeakageDetector = () => {
  const dispatch = useDispatch();
  const { leakages, aiInsights, loading, error } = useSelector((state) => state.benefits);
  // initiativesSlice stores list under `items` (legacy pages sometimes read `initiatives`).
  // If we read the wrong key, `initiatives.map(...)` will throw and the page renders blank.
  const initiatives = useSelector((state) => state.initiatives.items) || [];

  const [selectedInitiative, setSelectedInitiative] = useState('');
  const [openLeakageDialog, setOpenLeakageDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedLeakage, setSelectedLeakage] = useState(null);
  const [showAIDetection, setShowAIDetection] = useState(false);

  const [leakageForm, setLeakageForm] = useState({
    leakage_type: 'adoption_gap',
    description: '',
    root_cause_analysis: '',
    estimated_value_at_risk: '',
    severity: 'medium',
  });

  const [updateForm, setUpdateForm] = useState({
    status: 'investigating',
    mitigation_plan: '',
    mitigation_owner: '',
  });

  useEffect(() => {
    dispatch(getInitiatives());
  }, [dispatch]);

  useEffect(() => {
    if (selectedInitiative) {
      dispatch(getInitiativeLeakages(selectedInitiative));
    }
  }, [dispatch, selectedInitiative]);

  const handleReportLeakage = async () => {
    if (!selectedInitiative) return;
    
    await dispatch(reportValueLeakage({
      initiative_id: selectedInitiative,
      ...leakageForm,
      estimated_value_at_risk: parseFloat(leakageForm.estimated_value_at_risk),
    }));
    
    setOpenLeakageDialog(false);
    setLeakageForm({
      leakage_type: 'adoption_gap',
      description: '',
      root_cause_analysis: '',
      estimated_value_at_risk: '',
      severity: 'medium',
    });
  };

  const handleUpdateLeakage = async () => {
    if (!selectedLeakage) return;
    
    await dispatch(updateLeakageStatus({
      leakageId: selectedLeakage.id,
      updateData: updateForm,
    }));
    
    setOpenUpdateDialog(false);
    setUpdateForm({
      status: 'investigating',
      mitigation_plan: '',
      mitigation_owner: '',
    });
  };

  const handleAIDetection = async () => {
    if (!selectedInitiative) return;
    
    await dispatch(detectLeakageAI(selectedInitiative));
    setShowAIDetection(true);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'mitigating': return 'info';
      case 'investigating': return 'warning';
      case 'detected': return 'error';
      case 'accepted': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle />;
      case 'mitigating': return <Build />;
      case 'investigating': return <Warning />;
      case 'detected': return <ErrorIcon />;
      default: return null;
    }
  };

  const getLeakageTypeLabel = (type) => {
    return type.replace(/_/g, ' ').toUpperCase();
  };

  const safeLeakages = Array.isArray(leakages) ? leakages : [];

  const totalValueAtRisk = safeLeakages.reduce(
    (sum, l) => sum + (l?.estimated_value_at_risk || 0),
    0
  );
  const criticalLeakages = safeLeakages.filter((l) => l?.severity === 'critical').length;
  const resolvedLeakages = safeLeakages.filter((l) => l?.status === 'resolved').length;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning /> Value Leakage Detector
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Identify and mitigate instances where expected value isn't materializing
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Initiative Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Select Initiative"
              value={selectedInitiative}
              onChange={(e) => setSelectedInitiative(e.target.value)}
            >
              <MenuItem value="">
                <em>Select an initiative</em>
              </MenuItem>
              {initiatives.map((initiative) => (
                <MenuItem key={initiative.id} value={initiative.id}>
                  {initiative.title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                disabled={!selectedInitiative}
                onClick={() => setOpenLeakageDialog(true)}
                sx={{ flex: 1 }}
              >
                Report Leakage
              </Button>
              <Button
                variant="outlined"
                startIcon={<Psychology />}
                disabled={!selectedInitiative}
                onClick={handleAIDetection}
              >
                AI Detect
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading.leakages && <LinearProgress sx={{ mb: 3 }} />}

      {/* Summary Cards */}
      {selectedInitiative && leakages.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Value at Risk
                </Typography>
                <Typography variant="h3" color="error.main">
                  ${totalValueAtRisk.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Across all leakages
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Critical Leakages
                </Typography>
                <Typography variant="h3" color="error.main">
                  {criticalLeakages}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Require immediate attention
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resolved
                </Typography>
                <Typography variant="h3" color="success.main">
                  {resolvedLeakages}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Successfully mitigated
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Empty State */}
      {selectedInitiative && leakages.length === 0 && !loading.leakages && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Value Leakages Detected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Great! No value leakage has been identified for this initiative.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenLeakageDialog(true)}
            >
              Report Leakage
            </Button>
            <Button
              variant="outlined"
              startIcon={<Psychology />}
              onClick={handleAIDetection}
            >
              Run AI Detection
            </Button>
          </Box>
        </Paper>
      )}

      {/* Leakages List */}
      <Grid container spacing={3}>
        {safeLeakages.map((leakage) => (
          <Grid item xs={12} md={6} key={leakage.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color={getSeverityColor(leakage.severity)} />
                    <Typography variant="h6">
                      {getLeakageTypeLabel(leakage.leakage_type)}
                    </Typography>
                  </Box>
                  <Chip
                    label={leakage.severity}
                    size="small"
                    color={getSeverityColor(leakage.severity)}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {leakage.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Value at Risk */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Value at Risk
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    ${leakage.estimated_value_at_risk?.toLocaleString() || 0}
                  </Typography>
                </Box>

                {/* Root Cause */}
                {leakage.root_cause_analysis && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Root Cause
                    </Typography>
                    <Typography variant="body2">
                      {leakage.root_cause_analysis}
                    </Typography>
                  </Box>
                )}

                {/* Status */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    icon={getStatusIcon(leakage.status)}
                    label={leakage.status?.replace('_', ' ').toUpperCase() || 'DETECTED'}
                    color={getStatusColor(leakage.status)}
                    size="small"
                  />
                </Box>

                {/* Mitigation Plan */}
                {leakage.mitigation_plan && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Mitigation Plan
                    </Typography>
                    <Typography variant="body2">
                      {leakage.mitigation_plan}
                    </Typography>
                    {leakage.mitigation_owner && (
                      <Typography variant="caption" color="text.secondary">
                        Owner: {leakage.mitigation_owner}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Dates */}
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Detected: {new Date(leakage.detection_date || leakage.created_at).toLocaleDateString()}
                  {leakage.resolution_date && ` | Resolved: ${new Date(leakage.resolution_date).toLocaleDateString()}`}
                </Typography>

                {/* Actions */}
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  startIcon={<Build />}
                  onClick={() => {
                    setSelectedLeakage(leakage);
                    setUpdateForm({
                      status: leakage.status || 'investigating',
                      mitigation_plan: leakage.mitigation_plan || '',
                      mitigation_owner: leakage.mitigation_owner || '',
                    });
                    setOpenUpdateDialog(true);
                  }}
                  disabled={leakage.status === 'resolved'}
                >
                  Update Status
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* AI Detection Results */}
      {showAIDetection && aiInsights.leakageDetection && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Psychology />
            <Typography variant="h6">AI Leakage Detection Results</Typography>
            <Button
              size="small"
              onClick={() => setShowAIDetection(false)}
              sx={{ ml: 'auto', color: 'inherit' }}
            >
              Close
            </Button>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(aiInsights.leakageDetection, null, 2)}
          </Typography>
        </Paper>
      )}

      {/* Report Leakage Dialog */}
      <Dialog open={openLeakageDialog} onClose={() => setOpenLeakageDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report Value Leakage</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Leakage Type"
                value={leakageForm.leakage_type}
                onChange={(e) => setLeakageForm({ ...leakageForm, leakage_type: e.target.value })}
              >
                <MenuItem value="adoption_gap">Adoption Gap</MenuItem>
                <MenuItem value="process_gap">Process Gap</MenuItem>
                <MenuItem value="data_quality">Data Quality</MenuItem>
                <MenuItem value="change_resistance">Change Resistance</MenuItem>
                <MenuItem value="technical_debt">Technical Debt</MenuItem>
                <MenuItem value="scope_creep">Scope Creep</MenuItem>
                <MenuItem value="benefit_overestimation">Benefit Overestimation</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Severity"
                value={leakageForm.severity}
                onChange={(e) => setLeakageForm({ ...leakageForm, severity: e.target.value })}
              >
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={leakageForm.description}
                onChange={(e) => setLeakageForm({ ...leakageForm, description: e.target.value })}
                placeholder="Describe the value leakage..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Root Cause Analysis"
                value={leakageForm.root_cause_analysis}
                onChange={(e) => setLeakageForm({ ...leakageForm, root_cause_analysis: e.target.value })}
                placeholder="What's causing this leakage?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Value at Risk ($)"
                value={leakageForm.estimated_value_at_risk}
                onChange={(e) => setLeakageForm({ ...leakageForm, estimated_value_at_risk: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLeakageDialog(false)}>Cancel</Button>
          <Button onClick={handleReportLeakage} variant="contained">
            Report Leakage
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Leakage Dialog */}
      <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Leakage Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Status"
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
              >
                <MenuItem value="detected">Detected</MenuItem>
                <MenuItem value="investigating">Investigating</MenuItem>
                <MenuItem value="mitigating">Mitigating</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mitigation Plan"
                value={updateForm.mitigation_plan}
                onChange={(e) => setUpdateForm({ ...updateForm, mitigation_plan: e.target.value })}
                placeholder="Describe the mitigation plan..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mitigation Owner"
                value={updateForm.mitigation_owner}
                onChange={(e) => setUpdateForm({ ...updateForm, mitigation_owner: e.target.value })}
                placeholder="Who is responsible for mitigation?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateLeakage} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ValueLeakageDetector;
