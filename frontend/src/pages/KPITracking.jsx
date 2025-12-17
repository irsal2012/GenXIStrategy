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
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Add,
  Psychology,
  Timeline as TimelineIcon,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  getInitiativeKPIs,
  createKPIBaseline,
  recordKPIMeasurement,
  getKPIMeasurements,
  explainVariance,
} from '../store/slices/benefitsSlice';
import { getInitiatives } from '../store/slices/initiativesSlice';

const KPITracking = () => {
  const dispatch = useDispatch();
  const { kpis, kpiMeasurements, aiInsights, loading, error } = useSelector((state) => state.benefits);
  const { initiatives } = useSelector((state) => state.initiatives);

  const [selectedInitiative, setSelectedInitiative] = useState('');
  const [openKPIDialog, setOpenKPIDialog] = useState(false);
  const [openMeasurementDialog, setOpenMeasurementDialog] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showVarianceExplanation, setShowVarianceExplanation] = useState(false);

  const [kpiForm, setKpiForm] = useState({
    kpi_name: '',
    kpi_category: 'financial',
    baseline_value: '',
    target_value: '',
    unit_of_measure: '',
    measurement_frequency: 'monthly',
    baseline_source: '',
    target_rationale: '',
  });

  const [measurementForm, setMeasurementForm] = useState({
    measured_value: '',
    data_source: '',
    measurement_method: '',
    confidence_level: 'high',
    notes: '',
  });

  useEffect(() => {
    dispatch(getInitiatives());
  }, [dispatch]);

  useEffect(() => {
    if (selectedInitiative) {
      dispatch(getInitiativeKPIs(selectedInitiative));
    }
  }, [dispatch, selectedInitiative]);

  const handleCreateKPI = async () => {
    if (!selectedInitiative) return;
    
    await dispatch(createKPIBaseline({
      initiative_id: selectedInitiative,
      ...kpiForm,
      baseline_value: parseFloat(kpiForm.baseline_value),
      target_value: parseFloat(kpiForm.target_value),
    }));
    
    setOpenKPIDialog(false);
    setKpiForm({
      kpi_name: '',
      kpi_category: 'financial',
      baseline_value: '',
      target_value: '',
      unit_of_measure: '',
      measurement_frequency: 'monthly',
      baseline_source: '',
      target_rationale: '',
    });
  };

  const handleRecordMeasurement = async () => {
    if (!selectedKPI) return;
    
    await dispatch(recordKPIMeasurement({
      kpiId: selectedKPI.id,
      measurementData: {
        ...measurementForm,
        measured_value: parseFloat(measurementForm.measured_value),
      },
    }));
    
    setOpenMeasurementDialog(false);
    setMeasurementForm({
      measured_value: '',
      data_source: '',
      measurement_method: '',
      confidence_level: 'high',
      notes: '',
    });
    
    // Refresh measurements
    dispatch(getKPIMeasurements(selectedKPI.id));
  };

  const handleExplainVariance = async (kpi) => {
    const measurements = kpiMeasurements[kpi.id] || [];
    await dispatch(explainVariance({
      kpi_baseline_id: kpi.id,
      kpi_name: kpi.kpi_name,
      baseline_value: kpi.baseline_value,
      target_value: kpi.target_value,
      measurements: measurements,
    }));
    setShowVarianceExplanation(true);
  };

  const calculateVariance = (kpi) => {
    const measurements = kpiMeasurements[kpi.id] || [];
    if (measurements.length === 0) return null;
    
    const latestMeasurement = measurements[measurements.length - 1];
    const variance = ((latestMeasurement.measured_value - kpi.target_value) / kpi.target_value) * 100;
    return variance;
  };

  const getVarianceStatus = (variance) => {
    if (variance === null) return 'no_data';
    if (Math.abs(variance) <= 5) return 'on_track';
    if (Math.abs(variance) <= 15) return 'at_risk';
    return 'off_track';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_track': return 'success';
      case 'at_risk': return 'warning';
      case 'off_track': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'on_track': return <CheckCircle />;
      case 'at_risk': return <Warning />;
      case 'off_track': return <ErrorIcon />;
      default: return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp /> KPI Tracking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track baseline → target → actual KPI progression
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
          <Grid item xs={12} md={8}>
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
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              startIcon={<Add />}
              fullWidth
              disabled={!selectedInitiative}
              onClick={() => setOpenKPIDialog(true)}
            >
              Add KPI
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading.kpis && <LinearProgress sx={{ mb: 3 }} />}

      {/* KPI Cards */}
      {selectedInitiative && kpis.length === 0 && !loading.kpis && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <TrendingUp sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No KPIs Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start tracking value by adding your first KPI
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenKPIDialog(true)}
          >
            Add First KPI
          </Button>
        </Paper>
      )}

      <Grid container spacing={3}>
        {kpis.map((kpi) => {
          const variance = calculateVariance(kpi);
          const status = getVarianceStatus(variance);
          const measurements = kpiMeasurements[kpi.id] || [];
          const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

          return (
            <Grid item xs={12} md={6} lg={4} key={kpi.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {kpi.kpi_name}
                    </Typography>
                    <Chip
                      label={kpi.kpi_category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Baseline → Target → Actual */}
                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Baseline
                        </Typography>
                        <Typography variant="h6">
                          {kpi.baseline_value} {kpi.unit_of_measure}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Target
                        </Typography>
                        <Typography variant="h6">
                          {kpi.target_value} {kpi.unit_of_measure}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Actual
                        </Typography>
                        <Typography variant="h6">
                          {latestMeasurement ? `${latestMeasurement.measured_value} ${kpi.unit_of_measure}` : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Variance */}
                  {variance !== null && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {variance >= 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                        <Typography variant="body2">
                          Variance: {variance.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Chip
                        icon={getStatusIcon(status)}
                        label={status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(status)}
                        size="small"
                      />
                    </Box>
                  )}

                  {/* Measurement Info */}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Frequency: {kpi.measurement_frequency} | Measurements: {measurements.length}
                  </Typography>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => {
                        setSelectedKPI(kpi);
                        setOpenMeasurementDialog(true);
                      }}
                    >
                      Record
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Psychology />}
                      onClick={() => handleExplainVariance(kpi)}
                      disabled={measurements.length === 0}
                    >
                      Explain
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedKPI(kpi);
                        dispatch(getKPIMeasurements(kpi.id));
                      }}
                    >
                      <TimelineIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* AI Variance Explanation */}
      {showVarianceExplanation && aiInsights.varianceExplanation && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Psychology />
            <Typography variant="h6">AI Variance Explanation</Typography>
            <Button
              size="small"
              onClick={() => setShowVarianceExplanation(false)}
              sx={{ ml: 'auto', color: 'inherit' }}
            >
              Close
            </Button>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(aiInsights.varianceExplanation, null, 2)}
          </Typography>
        </Paper>
      )}

      {/* Measurements Table for Selected KPI */}
      {selectedKPI && kpiMeasurements[selectedKPI.id] && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Measurements for {selectedKPI.kpi_name}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Variance</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Source</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kpiMeasurements[selectedKPI.id].map((measurement) => (
                  <TableRow key={measurement.id}>
                    <TableCell>
                      {new Date(measurement.measurement_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {measurement.measured_value} {selectedKPI.unit_of_measure}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${measurement.variance_percentage?.toFixed(1)}%`}
                        size="small"
                        color={Math.abs(measurement.variance_percentage) <= 5 ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={measurement.confidence_level} size="small" />
                    </TableCell>
                    <TableCell>{measurement.data_source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Add KPI Dialog */}
      <Dialog open={openKPIDialog} onClose={() => setOpenKPIDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New KPI</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="KPI Name"
                value={kpiForm.kpi_name}
                onChange={(e) => setKpiForm({ ...kpiForm, kpi_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={kpiForm.kpi_category}
                onChange={(e) => setKpiForm({ ...kpiForm, kpi_category: e.target.value })}
              >
                <MenuItem value="financial">Financial</MenuItem>
                <MenuItem value="operational">Operational</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="quality">Quality</MenuItem>
                <MenuItem value="efficiency">Efficiency</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit of Measure"
                value={kpiForm.unit_of_measure}
                onChange={(e) => setKpiForm({ ...kpiForm, unit_of_measure: e.target.value })}
                placeholder="e.g., USD, hours, %"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Baseline Value"
                value={kpiForm.baseline_value}
                onChange={(e) => setKpiForm({ ...kpiForm, baseline_value: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Target Value"
                value={kpiForm.target_value}
                onChange={(e) => setKpiForm({ ...kpiForm, target_value: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Baseline Source"
                value={kpiForm.baseline_source}
                onChange={(e) => setKpiForm({ ...kpiForm, baseline_source: e.target.value })}
                placeholder="Where did the baseline come from?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Target Rationale"
                value={kpiForm.target_rationale}
                onChange={(e) => setKpiForm({ ...kpiForm, target_rationale: e.target.value })}
                placeholder="Why this target?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Measurement Frequency"
                value={kpiForm.measurement_frequency}
                onChange={(e) => setKpiForm({ ...kpiForm, measurement_frequency: e.target.value })}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenKPIDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateKPI} variant="contained">
            Create KPI
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Measurement Dialog */}
      <Dialog open={openMeasurementDialog} onClose={() => setOpenMeasurementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Measurement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Measured Value"
                value={measurementForm.measured_value}
                onChange={(e) => setMeasurementForm({ ...measurementForm, measured_value: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Data Source"
                value={measurementForm.data_source}
                onChange={(e) => setMeasurementForm({ ...measurementForm, data_source: e.target.value })}
                placeholder="Where did this data come from?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Measurement Method"
                value={measurementForm.measurement_method}
                onChange={(e) => setMeasurementForm({ ...measurementForm, measurement_method: e.target.value })}
                placeholder="How was this measured?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Confidence Level"
                value={measurementForm.confidence_level}
                onChange={(e) => setMeasurementForm({ ...measurementForm, confidence_level: e.target.value })}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes"
                value={measurementForm.notes}
                onChange={(e) => setMeasurementForm({ ...measurementForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMeasurementDialog(false)}>Cancel</Button>
          <Button onClick={handleRecordMeasurement} variant="contained">
            Record
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default KPITracking;
