import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  CheckCircle,
  Error as ErrorIcon,
  Psychology,
  Timeline as TimelineIcon,
  TrendingDown,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import {
  createKPIBaseline,
  explainVariance,
  getInitiativeKPIs,
  getKPIMeasurements,
  recordKPIMeasurement,
} from '../store/slices/benefitsSlice';
import { getInitiatives } from '../store/slices/initiativesSlice';

// Backend KPI contract uses: name/category/unit and measurement actual_value.
// Normalize fields here so the UI never renders blank due to shape mismatches.
const normalizeKpi = (kpi) => ({
  ...kpi,
  displayName: kpi?.name ?? kpi?.kpi_name ?? 'Unnamed KPI',
  displayCategory: kpi?.category ?? kpi?.kpi_category ?? 'financial',
  displayUnit: kpi?.unit ?? kpi?.unit_of_measure ?? '',
});

const normalizeMeasurement = (m) => ({
  ...m,
  displayValue: m?.actual_value ?? m?.measured_value,
});

const KPITracking = () => {
  const dispatch = useDispatch();

  const { kpis, kpiMeasurements, aiInsights, loading, error } = useSelector((state) => state.benefits);
  // initiativesSlice stores the list at `items`.
  const initiatives = useSelector((state) => state.initiatives.items) || [];

  const [selectedInitiative, setSelectedInitiative] = useState('');
  const [openKPIDialog, setOpenKPIDialog] = useState(false);
  const [openMeasurementDialog, setOpenMeasurementDialog] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showVarianceExplanation, setShowVarianceExplanation] = useState(false);

  // Backend expects: name, category, unit, baseline_date, target_date, measurement_frequency
  const [kpiForm, setKpiForm] = useState({
    name: '',
    category: 'financial',
    baseline_value: '',
    target_value: '',
    unit: '',
    measurement_frequency: 'monthly',
    baseline_date: new Date().toISOString().slice(0, 10),
    target_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().slice(0, 10),
    description: '',
    owner: '',
  });

  // Backend expects: measurement_date, actual_value, notes, recorded_by
  const [measurementForm, setMeasurementForm] = useState({
    actual_value: '',
    measurement_date: new Date().toISOString().slice(0, 10),
    notes: '',
    recorded_by: '',
  });

  useEffect(() => {
    dispatch(getInitiatives());
  }, [dispatch]);

  useEffect(() => {
    if (selectedInitiative) {
      dispatch(getInitiativeKPIs(selectedInitiative));
    }
  }, [dispatch, selectedInitiative]);

  const selectedInitiativeObj = useMemo(
    () => initiatives.find((i) => String(i.id) === String(selectedInitiative)) || null,
    [initiatives, selectedInitiative]
  );

  const handleCreateKPI = async () => {
    if (!selectedInitiative) return;

    await dispatch(
      createKPIBaseline({
        initiative_id: Number(selectedInitiative),
        ...kpiForm,
        baseline_value: parseFloat(kpiForm.baseline_value),
        target_value: parseFloat(kpiForm.target_value),
        baseline_date: new Date(kpiForm.baseline_date).toISOString(),
        target_date: new Date(kpiForm.target_date).toISOString(),
      })
    );

    setOpenKPIDialog(false);
    setKpiForm({
      name: '',
      category: 'financial',
      baseline_value: '',
      target_value: '',
      unit: '',
      measurement_frequency: 'monthly',
      baseline_date: new Date().toISOString().slice(0, 10),
      target_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().slice(0, 10),
      description: '',
      owner: '',
    });
  };

  const handleRecordMeasurement = async () => {
    if (!selectedKPI) return;

    await dispatch(
      recordKPIMeasurement({
        kpiId: selectedKPI.id,
        measurementData: {
          kpi_baseline_id: selectedKPI.id,
          measurement_date: new Date(measurementForm.measurement_date).toISOString(),
          actual_value: parseFloat(measurementForm.actual_value),
          notes: measurementForm.notes,
          recorded_by: measurementForm.recorded_by || undefined,
        },
      })
    );

    setOpenMeasurementDialog(false);
    setMeasurementForm({
      actual_value: '',
      measurement_date: new Date().toISOString().slice(0, 10),
      notes: '',
      recorded_by: '',
    });

    dispatch(getKPIMeasurements(selectedKPI.id));
  };

  const handleExplainVariance = async (kpiRaw) => {
    const kpi = normalizeKpi(kpiRaw);
    const measurements = (kpiMeasurements[kpi.id] || []).map(normalizeMeasurement);

    const latest = measurements.length ? measurements[0] : null;
    await dispatch(
      explainVariance({
        kpi_id: kpi.id,
        expected_value: kpi.target_value,
        actual_value: latest?.displayValue ?? kpi.baseline_value,
        context: `Initiative ${selectedInitiativeObj?.title || selectedInitiative}. Measurements: ${measurements.length}`,
      })
    );
    setShowVarianceExplanation(true);
  };

  const calculateVariance = (kpiRaw) => {
    const kpi = normalizeKpi(kpiRaw);
    const measurements = (kpiMeasurements[kpi.id] || []).map(normalizeMeasurement);
    if (measurements.length === 0) return null;

    const latestMeasurement = measurements[0];
    const latestValue = latestMeasurement.displayValue;
    if (typeof latestValue !== 'number' || !isFinite(latestValue) || kpi.target_value === 0) return null;
    return ((latestValue - kpi.target_value) / kpi.target_value) * 100;
  };

  const getVarianceStatus = (variance) => {
    if (variance === null) return 'no_data';
    if (Math.abs(variance) <= 5) return 'on_track';
    if (Math.abs(variance) <= 15) return 'at_risk';
    return 'off_track';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_track':
        return 'success';
      case 'at_risk':
        return 'warning';
      case 'off_track':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'on_track':
        return <CheckCircle />;
      case 'at_risk':
        return <Warning />;
      case 'off_track':
        return <ErrorIcon />;
      default:
        return null;
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
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
      )}

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

      {selectedInitiative && kpis.length === 0 && !loading.kpis && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <TrendingUp sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No KPIs Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start tracking value by adding your first KPI
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenKPIDialog(true)}>
            Add First KPI
          </Button>
        </Paper>
      )}

      {!selectedInitiative && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Select an Initiative
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose an initiative above to view and manage its KPI baselines and measurements.
          </Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {kpis.map((kpiRaw) => {
          const kpi = normalizeKpi(kpiRaw);
          const variance = calculateVariance(kpi);
          const status = getVarianceStatus(variance);
          const measurements = (kpiMeasurements[kpi.id] || []).map(normalizeMeasurement);
          const latestMeasurement = measurements.length > 0 ? measurements[0] : null;

          return (
            <Grid item xs={12} md={6} lg={4} key={kpi.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {kpi.displayName}
                    </Typography>
                    <Chip label={kpi.displayCategory} size="small" color="primary" variant="outlined" />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Baseline
                        </Typography>
                        <Typography variant="h6">
                          {kpi.baseline_value} {kpi.displayUnit}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Target
                        </Typography>
                        <Typography variant="h6">
                          {kpi.target_value} {kpi.displayUnit}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Actual
                        </Typography>
                        <Typography variant="h6">
                          {latestMeasurement ? `${latestMeasurement.displayValue} ${kpi.displayUnit}` : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {variance !== null && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {variance >= 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                        <Typography variant="body2">Variance: {variance.toFixed(1)}%</Typography>
                      </Box>
                      <Chip
                        icon={getStatusIcon(status)}
                        label={status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(status)}
                        size="small"
                      />
                    </Box>
                  )}

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Frequency: {kpi.measurement_frequency} | Measurements: {measurements.length}
                  </Typography>

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

      {showVarianceExplanation && aiInsights.varianceExplanation && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Psychology />
            <Typography variant="h6">AI Variance Explanation</Typography>
            <Button size="small" onClick={() => setShowVarianceExplanation(false)} sx={{ ml: 'auto', color: 'inherit' }}>
              Close
            </Button>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(aiInsights.varianceExplanation, null, 2)}
          </Typography>
        </Paper>
      )}

      {selectedKPI && kpiMeasurements[selectedKPI.id] && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Measurements for {normalizeKpi(selectedKPI).displayName}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Variance</TableCell>
                  <TableCell>Recorded By</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kpiMeasurements[selectedKPI.id].map((mRaw) => {
                  const m = normalizeMeasurement(mRaw);
                  const kpi = normalizeKpi(selectedKPI);
                  const variancePct =
                    kpi.target_value && typeof m.displayValue === 'number'
                      ? ((m.displayValue - kpi.target_value) / kpi.target_value) * 100
                      : null;

                  return (
                    <TableRow key={m.id}>
                      <TableCell>{new Date(m.measurement_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {m.displayValue} {kpi.displayUnit}
                      </TableCell>
                      <TableCell>
                        {variancePct === null ? (
                          '—'
                        ) : (
                          <Chip
                            label={`${variancePct.toFixed(1)}%`}
                            size="small"
                            color={Math.abs(variancePct) <= 5 ? 'success' : 'warning'}
                          />
                        )}
                      </TableCell>
                      <TableCell>{m.recorded_by || '—'}</TableCell>
                      <TableCell>{m.notes || '—'}</TableCell>
                    </TableRow>
                  );
                })}
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
                value={kpiForm.name}
                onChange={(e) => setKpiForm({ ...kpiForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={kpiForm.category}
                onChange={(e) => setKpiForm({ ...kpiForm, category: e.target.value })}
              >
                <MenuItem value="financial">Financial</MenuItem>
                <MenuItem value="operational">Operational</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="strategic">Strategic</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit of Measure"
                value={kpiForm.unit}
                onChange={(e) => setKpiForm({ ...kpiForm, unit: e.target.value })}
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
                label="Owner (optional)"
                value={kpiForm.owner}
                onChange={(e) => setKpiForm({ ...kpiForm, owner: e.target.value })}
                placeholder="Who owns this KPI?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description (optional)"
                value={kpiForm.description}
                onChange={(e) => setKpiForm({ ...kpiForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Baseline Date"
                value={kpiForm.baseline_date}
                onChange={(e) => setKpiForm({ ...kpiForm, baseline_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Target Date"
                value={kpiForm.target_date}
                onChange={(e) => setKpiForm({ ...kpiForm, target_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
                <MenuItem value="annually">Annually</MenuItem>
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
                label="Actual Value"
                value={measurementForm.actual_value}
                onChange={(e) => setMeasurementForm({ ...measurementForm, actual_value: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Measurement Date"
                value={measurementForm.measurement_date}
                onChange={(e) => setMeasurementForm({ ...measurementForm, measurement_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recorded By (optional)"
                value={measurementForm.recorded_by}
                onChange={(e) => setMeasurementForm({ ...measurementForm, recorded_by: e.target.value })}
              />
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
