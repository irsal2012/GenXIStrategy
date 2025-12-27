import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { getPortfolioBalance, analyzePortfolioBalance } from '../store/slices/portfolioSlice';

const COLORS = {
  genai: '#4CAF50',
  predictive: '#2196F3',
  optimization: '#FF9800',
  automation: '#9C27B0',
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};

const PortfolioBalance = () => {
  const dispatch = useDispatch();
  const { balance, balanceAnalysis, loading, analyzing, error } = useSelector((state) => state.portfolio);

  useEffect(() => {
    dispatch(getPortfolioBalance());
  }, [dispatch]);

  const handleAnalyze = () => {
    dispatch(analyzePortfolioBalance());
  };

  if (loading && !balance) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Prepare chart data
  const aiTypeData = balance ? Object.entries(balance.by_ai_type).map(([key, value]) => ({
    name: key.toUpperCase(),
    value,
  })) : [];

  const riskTierData = balance ? Object.entries(balance.by_risk_tier).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  })) : [];

  const domainData = balance ? Object.entries(balance.by_strategic_domain).map(([key, value]) => ({
    name: key,
    value,
  })) : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Portfolio Balance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze portfolio composition and get AI-powered recommendations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={analyzing ? <CircularProgress size={20} /> : <PsychologyIcon />}
          onClick={handleAnalyze}
          disabled={analyzing}
        >
          AI Analysis
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Initiatives
              </Typography>
              <Typography variant="h4">
                {balance?.total_initiatives || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h4">
                ${(balance?.total_budget || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Expected ROI
              </Typography>
              <Typography variant="h4" color="success.main">
                {(balance?.total_expected_roi || 0).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Portfolio Health
              </Typography>
              <Typography variant="h4" color="primary">
                {balanceAnalysis?.health_score || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* AI Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={aiTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {aiTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()] || '#999'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Risk Tier Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Risk Tier Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskTierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {riskTierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()] || '#999'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Strategic Domain Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Strategic Domain Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={domainData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* AI Analysis Results */}
      {balanceAnalysis && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Health Assessment
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                {balanceAnalysis.health_assessment}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Balance Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>AI Type Balance:</strong> {balanceAnalysis.balance_analysis?.ai_type_balance}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Risk Balance:</strong> {balanceAnalysis.balance_analysis?.risk_balance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Domain Balance:</strong> {balanceAnalysis.balance_analysis?.domain_balance}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Concerns & Recommendations
                </Typography>
              </Box>
              
              {balanceAnalysis.concerns && balanceAnalysis.concerns.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Concerns
                  </Typography>
                  <List dense>
                    {balanceAnalysis.concerns.map((concern, index) => (
                      <ListItem key={index}>
                        <Chip
                          label={concern}
                          size="small"
                          color="warning"
                          sx={{ mr: 1 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              {balanceAnalysis.recommendations && balanceAnalysis.recommendations.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommendations
                  </Typography>
                  <List dense>
                    {balanceAnalysis.recommendations.map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={rec}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {balanceAnalysis.strategic_gaps && balanceAnalysis.strategic_gaps.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Strategic Gaps
                  </Typography>
                  <List dense>
                    {balanceAnalysis.strategic_gaps.map((gap, index) => (
                      <ListItem key={index}>
                        <Chip
                          label={gap}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default PortfolioBalance;
