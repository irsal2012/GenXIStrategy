import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccountTree as GraphIcon,
  AutoAwesome as AIIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import {
  getDependencyGraph,
  suggestInitiativeSequencing,
} from '../store/slices/roadmapSlice';
import { getInitiatives } from '../store/slices/initiativesSlice';

const DependencyGraph = () => {
  const dispatch = useDispatch();
  const { dependencyGraph, aiSequencing, loading, error } = useSelector((state) => state.roadmap);
  const { initiatives } = useSelector((state) => state.initiatives);

  useEffect(() => {
    dispatch(getDependencyGraph());
    dispatch(getInitiatives());
  }, [dispatch]);

  const handleSuggestSequencing = async () => {
    if (!dependencyGraph || !initiatives) return;

    const initiativesData = initiatives.map(init => ({
      id: init.id,
      title: init.title,
      description: init.description,
      status: init.status,
      ai_type: init.ai_type,
    }));

    const dependenciesData = dependencyGraph.edges?.map(edge => ({
      initiative_id: edge.from_initiative_id,
      depends_on_id: edge.to_initiative_id,
      dependency_type: edge.dependency_type,
      is_blocking: edge.is_blocking,
    })) || [];

    await dispatch(suggestInitiativeSequencing({
      initiatives: initiativesData,
      dependencies: dependenciesData,
      constraints: null,
    }));
  };

  const getDependencyTypeColor = (type) => {
    const colors = {
      data_platform: 'primary',
      shared_model: 'secondary',
      vendor: 'warning',
      team: 'info',
      technical: 'error',
      business: 'success',
    };
    return colors[type] || 'default';
  };

  const getInitiativeById = (id) => {
    return dependencyGraph?.nodes?.find(node => node.initiative_id === id);
  };

  if (loading && !dependencyGraph) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <GraphIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Dependency Graph
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualize and manage initiative dependencies
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AIIcon />}
          onClick={handleSuggestSequencing}
          disabled={loading || !dependencyGraph}
        >
          Suggest Sequencing
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* AI Sequencing Recommendations */}
      {aiSequencing && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light' }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <AIIcon color="success" />
            <Typography variant="h6" fontWeight="bold">
              AI-Recommended Sequencing
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Recommended Sequence:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {aiSequencing.recommended_sequence?.map((id, index) => {
                  const initiative = getInitiativeById(id);
                  return (
                    <Chip
                      key={id}
                      label={`${index + 1}. ${initiative?.title || `Initiative ${id}`}`}
                      color="primary"
                      variant="outlined"
                    />
                  );
                })}
              </Box>
              
              {aiSequencing.reasoning && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Reasoning:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {aiSequencing.reasoning}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {aiSequencing.parallel_groups && aiSequencing.parallel_groups.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Parallel Execution Opportunities:
                  </Typography>
                  {aiSequencing.parallel_groups.map((group, index) => (
                    <Box key={index} display="flex" gap={1} mb={1}>
                      {group.map(id => {
                        const initiative = getInitiativeById(id);
                        return (
                          <Chip
                            key={id}
                            label={initiative?.title || `Initiative ${id}`}
                            size="small"
                            color="secondary"
                          />
                        );
                      })}
                    </Box>
                  ))}
                </Box>
              )}

              {aiSequencing.risks && aiSequencing.risks.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Risks to Consider:
                  </Typography>
                  <List dense>
                    {aiSequencing.risks.map((risk, index) => (
                      <ListItem key={index}>
                        <WarningIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                        <ListItemText primary={risk} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Graph Overview */}
      {dependencyGraph && (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {dependencyGraph.nodes?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Initiatives
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {dependencyGraph.edges?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dependencies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {dependencyGraph.circular_dependencies?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Circular Dependencies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {dependencyGraph.critical_path?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Critical Path Length
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Circular Dependencies Warning */}
          {dependencyGraph.circular_dependencies && dependencyGraph.circular_dependencies.length > 0 && (
            <Grid item xs={12}>
              <Alert severity="error">
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Circular Dependencies Detected!
                </Typography>
                <Typography variant="body2">
                  {dependencyGraph.circular_dependencies.length} circular dependency chain(s) found. 
                  These need to be resolved to prevent blocking issues.
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Initiative Nodes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Initiatives
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {dependencyGraph.nodes?.map((node) => (
                  <ListItem key={node.initiative_id}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="bold">
                            {node.title}
                          </Typography>
                          <Chip label={node.status} size="small" />
                        </Box>
                      }
                      secondary={
                        <Box display="flex" gap={2} mt={0.5}>
                          <Typography variant="caption">
                            Dependencies: {node.dependencies_count}
                          </Typography>
                          <Typography variant="caption">
                            Dependents: {node.dependents_count}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Dependency Edges */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Dependencies
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {dependencyGraph.edges?.map((edge, index) => {
                  const fromInit = getInitiativeById(edge.from_initiative_id);
                  const toInit = getInitiativeById(edge.to_initiative_id);
                  
                  return (
                    <ListItem key={index}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {fromInit?.title || `Initiative ${edge.from_initiative_id}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              →
                            </Typography>
                            <Typography variant="body2">
                              {toInit?.title || `Initiative ${edge.to_initiative_id}`}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box display="flex" gap={1} mt={0.5}>
                            <Chip
                              label={edge.dependency_type}
                              size="small"
                              color={getDependencyTypeColor(edge.dependency_type)}
                            />
                            {edge.is_blocking && (
                              <Chip
                                label="Blocking"
                                size="small"
                                color="error"
                                icon={<BlockIcon />}
                              />
                            )}
                            {edge.is_resolved && (
                              <Chip
                                label="Resolved"
                                size="small"
                                color="success"
                                icon={<CheckCircleIcon />}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          {/* Critical Path */}
          {dependencyGraph.critical_path && dependencyGraph.critical_path.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: 'info.light' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Critical Path
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  The longest dependency chain that determines the minimum project duration
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {dependencyGraph.critical_path.map((id, index) => {
                    const initiative = getInitiativeById(id);
                    return (
                      <React.Fragment key={id}>
                        <Chip
                          label={initiative?.title || `Initiative ${id}`}
                          color="info"
                        />
                        {index < dependencyGraph.critical_path.length - 1 && (
                          <Typography variant="h6" color="text.secondary">
                            →
                          </Typography>
                        )}
                      </React.Fragment>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {!dependencyGraph && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <GraphIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Dependency Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create initiatives and dependencies to visualize the dependency graph
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DependencyGraph;
