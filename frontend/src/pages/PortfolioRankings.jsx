import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CompareArrows as CompareIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { getPortfolioRankings, calculateAllScores } from '../store/slices/scoringSlice';

const PortfolioRankings = () => {
  const dispatch = useDispatch();
  const { rankings, loading, calculatingAll, error } = useSelector((state) => state.scoring);
  const [selectedForComparison, setSelectedForComparison] = useState([]);

  useEffect(() => {
    dispatch(getPortfolioRankings());
  }, [dispatch]);

  const handleRecalculateAll = () => {
    dispatch(calculateAllScores(true)).then(() => {
      dispatch(getPortfolioRankings());
    });
  };

  const handleSelectForComparison = (initiativeId) => {
    if (selectedForComparison.includes(initiativeId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== initiativeId));
    } else if (selectedForComparison.length < 2) {
      setSelectedForComparison([...selectedForComparison, initiativeId]);
    }
  };

  const handleCompare = () => {
    if (selectedForComparison.length === 2) {
      // Navigate to comparison view or open modal
      window.location.href = `/portfolio/compare?a=${selectedForComparison[0]}&b=${selectedForComparison[1]}`;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'primary';
    if (score >= 4) return 'warning';
    return 'error';
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#E0E0E0'; // Gray
  };

  if (loading && rankings.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Portfolio Rankings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered initiative prioritization based on value, feasibility, and risk
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selectedForComparison.length === 2 && (
            <Button
              variant="contained"
              startIcon={<CompareIcon />}
              onClick={handleCompare}
            >
              Compare Selected
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={calculatingAll ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleRecalculateAll}
            disabled={calculatingAll}
          >
            Recalculate All
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {selectedForComparison.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {selectedForComparison.length === 1
            ? 'Select one more initiative to compare'
            : 'Click "Compare Selected" to see detailed comparison'}
        </Alert>
      )}

      {/* Rankings Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="80px">Rank</TableCell>
              <TableCell>Initiative</TableCell>
              <TableCell align="center">Overall Score</TableCell>
              <TableCell align="center">Value</TableCell>
              <TableCell align="center">Feasibility</TableCell>
              <TableCell align="center">Risk</TableCell>
              <TableCell align="center">AI Type</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rankings.map((initiative) => (
              <TableRow
                key={initiative.initiative_id}
                hover
                selected={selectedForComparison.includes(initiative.initiative_id)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: selectedForComparison.includes(initiative.initiative_id)
                    ? 'action.selected'
                    : 'inherit',
                }}
              >
                <TableCell>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: getRankBadgeColor(initiative.rank),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      color: initiative.rank <= 3 ? '#000' : '#666',
                    }}
                  >
                    #{initiative.rank}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {initiative.title}
                  </Typography>
                  {initiative.justification && (
                    <Tooltip title={initiative.justification} arrow>
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" color={getScoreColor(initiative.overall_score)}>
                      {initiative.overall_score.toFixed(1)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={initiative.overall_score * 10}
                      color={getScoreColor(initiative.overall_score)}
                      sx={{ width: '60px', mt: 0.5 }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={initiative.value_score.toFixed(1)}
                    size="small"
                    color={getScoreColor(initiative.value_score)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={initiative.feasibility_score.toFixed(1)}
                    size="small"
                    color={getScoreColor(initiative.feasibility_score)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={initiative.risk_score.toFixed(1)}
                    size="small"
                    color={getScoreColor(initiative.risk_score)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={initiative.ai_type || 'N/A'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Select for comparison">
                    <IconButton
                      size="small"
                      onClick={() => handleSelectForComparison(initiative.initiative_id)}
                      color={selectedForComparison.includes(initiative.initiative_id) ? 'primary' : 'default'}
                    >
                      <CompareIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View details">
                    <IconButton
                      size="small"
                      onClick={() => window.location.href = `/initiatives/${initiative.initiative_id}`}
                    >
                      <TrendingUpIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {rankings.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No rankings available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Calculate scores for initiatives to see rankings
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRecalculateAll}
          >
            Calculate Scores
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PortfolioRankings;
