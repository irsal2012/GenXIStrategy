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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Psychology,
  Add,
  AttachMoney,
  Speed,
  Star,
  Security,
  SentimentSatisfied,
} from '@mui/icons-material';
import {
  getInitiativeBenefits,
  createBenefit,
  updateBenefitRealization,
  getBenefitsSummary,
  forecastRealization,
  benchmarkPerformance,
} from '../store/slices/benefitsSlice';
import { getInitiatives } from '../store/slices/initiativesSlice';

const BenefitsDashboard = () => {
  const dispatch = useDispatch();
  const { benefits, benefitsSummary, aiInsights, loading, error } = useSelector((state) => state.benefits);
  // initiativesSlice stores the list under `items`
  const { items: initiativesItems = [] } = useSelector((state) => state.initiatives || {});

  // Defensive defaults so the page never crashes during initial load or on bad API payloads.
  const benefitsList = Array.isArray(benefits) ? benefits : [];
  const initiativesList = Array.isArray(initiativesItems) ? initiativesItems : [];
  const safeAIInsights = aiInsights || {};
  const safeLoading = loading || {};

  const [selectedInitiative, setSelectedInitiative] = useState('');
  const [openBenefitDialog, setOpenBenefitDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [showForecast, setShowForecast] = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(false);

  const [benefitForm, setBenefitForm] = useState({
    benefit_category: 'cost_savings',
    benefit_description: '',
    expected_value: '',
    expected_value_currency: 'USD',
    confidence_score: 70,
    confidence_rationale: '',
  });

  const [updateForm, setUpdateForm] = useState({
    realized_value: '',
    confidence_score: '',
  });

  useEffect(() => {
    dispatch(getInitiatives());
  }, [dispatch]);

  useEffect(() => {
    if (selectedInitiative) {
      dispatch(getInitiativeBenefits(selectedInitiative));
      dispatch(getBenefitsSummary(selectedInitiative));
    }
  }, [dispatch, selectedInitiative]);

  const handleCreateBenefit = async () => {
    if (!selectedInitiative) return;
    
    await dispatch(createBenefit({
      initiative_id: selectedInitiative,
      ...benefitForm,
      expected_value: parseFloat(benefitForm.expected_value),
      confidence_score: parseInt(benefitForm.confidence_score),
    }));
    
    setOpenBenefitDialog(false);
    setBenefitForm({
      benefit_category: 'cost_savings',
      benefit_description: '',
      expected_value: '',
      expected_value_currency: 'USD',
      confidence_score: 70,
      confidence_rationale: '',
    });
  };

  const handleUpdateRealization = async () => {
    if (!selectedBenefit) return;
    
    await dispatch(updateBenefitRealization({
      benefitId: selectedBenefit.id,
      updateData: {
        realized_value: parseFloat(updateForm.realized_value),
        confidence_score: parseInt(updateForm.confidence_score),
      },
    }));
    
    setOpenUpdateDialog(false);
    setUpdateForm({
      realized_value: '',
      confidence_score: '',
    });
  };

  const handleForecast = async () => {
    if (!selectedInitiative) return;

    await dispatch(
      forecastRealization({
        initiative_id: selectedInitiative,
        benefits: benefitsList,
      })
    );
    setShowForecast(true);
  };

  const handleBenchmark = async () => {
    if (!selectedInitiative) return;

    const initiative = initiativesList.find((i) => i.id === parseInt(selectedInitiative));
    if (!initiative) return;

    await dispatch(
      benchmarkPerformance({
        initiative_id: selectedInitiative,
        ai_type: initiative.ai_type,
        industry: initiative.strategic_domain,
        benefits: benefitsList,
      })
    );
    setShowBenchmark(true);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cost_savings': return <AttachMoney />;
      case 'revenue_increase': return <TrendingUp />;
      case 'efficiency_gain': return <Speed />;
      case 'quality_improvement': return <Star />;
      case 'risk_reduction': return <Security />;
      case 'customer_satisfaction': return <SentimentSatisfied />;
      default: return <AccountBalance />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'cost_savings': return 'success';
      case 'revenue_increase': return 'primary';
      case 'efficiency_gain': return 'info';
      case 'quality_improvement': return 'warning';
      case 'risk_reduction': return 'error';
      case 'customer_satisfaction': return 'secondary';
      default: return 'default';
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const getTrackingStatusColor = (status) => {
    switch (status) {
      case 'realized': return 'success';
      case 'tracking': return 'info';
      case 'at_risk': return 'warning';
      case 'not_realized': return 'error';
      default: return 'default';
    }
  };

  const calculateRealizationPercentage = (benefit) => {
    if (!benefit.realized_value || !benefit.expected_value) return 0;
    return (benefit.realized_value / benefit.expected_value) * 100;
  };

  const totalExpectedValue = benefitsList.reduce((sum, b) => sum + (b.expected_value || 0), 0);
  const totalRealizedValue = benefitsList.reduce((sum, b) => sum + (b.realized_value || 0), 0);
  const overallRealization = totalExpectedValue > 0 ? (totalRealizedValue / totalExpectedValue) * 100 : 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance /> Benefits Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track expected vs. realized benefits with confidence scoring
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
              {initiativesList.map((initiative) => (
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
                onClick={() => setOpenBenefitDialog(true)}
                sx={{ flex: 1 }}
              >
                Add Benefit
              </Button>
              <Button
                variant="outlined"
                startIcon={<Psychology />}
                disabled={!selectedInitiative || benefitsList.length === 0}
                onClick={handleForecast}
              >
                Forecast
              </Button>
              <Button
                variant="outlined"
                startIcon={<Psychology />}
                disabled={!selectedInitiative || benefitsList.length === 0}
                onClick={handleBenchmark}
              >
                Benchmark
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {safeLoading.benefits && <LinearProgress sx={{ mb: 3 }} />}

      {/* Summary Cards */}
      {selectedInitiative && benefitsList.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expected Value
                </Typography>
                <Typography variant="h3" color="primary">
                  ${totalExpectedValue.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total expected benefits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Realized Value
                </Typography>
                <Typography variant="h3" color="success.main">
                  ${totalRealizedValue.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total realized benefits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Realization Rate
                </Typography>
                <Typography variant="h3" color={overallRealization >= 80 ? 'success.main' : 'warning.main'}>
                  {overallRealization.toFixed(0)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Overall benefit realization
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Empty State */}
      {selectedInitiative && benefitsList.length === 0 && !safeLoading.benefits && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Benefits Defined
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start tracking value by defining expected benefits
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenBenefitDialog(true)}
          >
            Add First Benefit
          </Button>
        </Paper>
      )}

      {/* Benefits List */}
      <Grid container spacing={3}>
        {benefitsList.map((benefit) => {
          const realizationPercentage = calculateRealizationPercentage(benefit);
          
          return (
            <Grid item xs={12} md={6} key={benefit.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getCategoryIcon(benefit.benefit_category)}
                      <Typography variant="h6">
                        {benefit.benefit_category.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Box>
                    <Chip
                      label={benefit.tracking_status || 'not_started'}
                      size="small"
                      color={getTrackingStatusColor(benefit.tracking_status)}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {benefit.benefit_description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Expected vs Realized */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Expected
                      </Typography>
                      <Typography variant="h6">
                        ${benefit.expected_value?.toLocaleString() || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Realized
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        ${benefit.realized_value?.toLocaleString() || 0}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Realization Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Realization</Typography>
                      <Typography variant="caption">{realizationPercentage.toFixed(0)}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(realizationPercentage, 100)}
                      color={realizationPercentage >= 80 ? 'success' : realizationPercentage >= 50 ? 'warning' : 'error'}
                    />
                  </Box>

                  {/* Confidence Score */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Confidence Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={benefit.confidence_score || 0}
                        color={getConfidenceColor(benefit.confidence_score)}
                        sx={{ flex: 1 }}
                      />
                      <Typography variant="body2">
                        {benefit.confidence_score || 0}%
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setSelectedBenefit(benefit);
                      setUpdateForm({
                        realized_value: benefit.realized_value || '',
                        confidence_score: benefit.confidence_score || '',
                      });
                      setOpenUpdateDialog(true);
                    }}
                  >
                    Update Realization
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* AI Forecast */}
      {showForecast && safeAIInsights.forecastRealization && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Psychology />
            <Typography variant="h6">AI Benefit Forecast</Typography>
            <Button
              size="small"
              onClick={() => setShowForecast(false)}
              sx={{ ml: 'auto', color: 'inherit' }}
            >
              Close
            </Button>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(safeAIInsights.forecastRealization, null, 2)}
          </Typography>
        </Paper>
      )}

      {/* AI Benchmark */}
      {showBenchmark && safeAIInsights.benchmark && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Psychology />
            <Typography variant="h6">AI Benchmark Analysis</Typography>
            <Button
              size="small"
              onClick={() => setShowBenchmark(false)}
              sx={{ ml: 'auto', color: 'inherit' }}
            >
              Close
            </Button>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(safeAIInsights.benchmark, null, 2)}
          </Typography>
        </Paper>
      )}

      {/* Add Benefit Dialog */}
      <Dialog open={openBenefitDialog} onClose={() => setOpenBenefitDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Benefit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Benefit Category"
                value={benefitForm.benefit_category}
                onChange={(e) => setBenefitForm({ ...benefitForm, benefit_category: e.target.value })}
              >
                <MenuItem value="cost_savings">Cost Savings</MenuItem>
                <MenuItem value="revenue_increase">Revenue Increase</MenuItem>
                <MenuItem value="efficiency_gain">Efficiency Gain</MenuItem>
                <MenuItem value="quality_improvement">Quality Improvement</MenuItem>
                <MenuItem value="risk_reduction">Risk Reduction</MenuItem>
                <MenuItem value="customer_satisfaction">Customer Satisfaction</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Benefit Description"
                value={benefitForm.benefit_description}
                onChange={(e) => setBenefitForm({ ...benefitForm, benefit_description: e.target.value })}
                placeholder="Describe the expected benefit..."
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                type="number"
                label="Expected Value"
                value={benefitForm.expected_value}
                onChange={(e) => setBenefitForm({ ...benefitForm, expected_value: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Currency"
                value={benefitForm.expected_value_currency}
                onChange={(e) => setBenefitForm({ ...benefitForm, expected_value_currency: e.target.value })}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" gutterBottom>
                Confidence Score: {benefitForm.confidence_score}%
              </Typography>
              <TextField
                fullWidth
                type="range"
                min="0"
                max="100"
                value={benefitForm.confidence_score}
                onChange={(e) => setBenefitForm({ ...benefitForm, confidence_score: e.target.value })}
                inputProps={{ style: { width: '100%' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Confidence Rationale"
                value={benefitForm.confidence_rationale}
                onChange={(e) => setBenefitForm({ ...benefitForm, confidence_rationale: e.target.value })}
                placeholder="Why this confidence level?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBenefitDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateBenefit} variant="contained">
            Create Benefit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Realization Dialog */}
      <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Benefit Realization</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Realized Value"
                value={updateForm.realized_value}
                onChange={(e) => setUpdateForm({ ...updateForm, realized_value: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" gutterBottom>
                Confidence Score: {updateForm.confidence_score}%
              </Typography>
              <TextField
                fullWidth
                type="range"
                min="0"
                max="100"
                value={updateForm.confidence_score}
                onChange={(e) => setUpdateForm({ ...updateForm, confidence_score: e.target.value })}
                inputProps={{ style: { width: '100%' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateRealization} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BenefitsDashboard;
