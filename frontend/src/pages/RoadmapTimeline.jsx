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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoAwesome as AIIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  getRoadmapTimelines,
  createRoadmapTimeline,
  updateRoadmapTimeline,
  deleteRoadmapTimeline,
  getDependencyGraph,
  detectRoadmapBottlenecks,
} from '../store/slices/roadmapSlice';

const RoadmapTimeline = () => {
  const dispatch = useDispatch();
  const { timelines, currentTimeline, aiBottlenecks, loading, error } = useSelector((state) => state.roadmap);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    view_type: 'quarterly',
    is_active: true,
  });

  useEffect(() => {
    dispatch(getRoadmapTimelines());
  }, [dispatch]);

  const handleOpenDialog = (timeline = null) => {
    if (timeline) {
      setEditingTimeline(timeline);
      setFormData({
        name: timeline.name,
        description: timeline.description || '',
        start_date: timeline.start_date?.split('T')[0] || '',
        end_date: timeline.end_date?.split('T')[0] || '',
        view_type: timeline.view_type || 'quarterly',
        is_active: timeline.is_active ?? true,
      });
    } else {
      setEditingTimeline(null);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        view_type: 'quarterly',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTimeline(null);
  };

  const handleSubmit = async () => {
    if (editingTimeline) {
      await dispatch(updateRoadmapTimeline({ roadmapId: editingTimeline.id, roadmapData: formData }));
    } else {
      await dispatch(createRoadmapTimeline(formData));
    }
    handleCloseDialog();
    dispatch(getRoadmapTimelines());
  };

  const handleDelete = async (timelineId) => {
    if (window.confirm('Are you sure you want to delete this roadmap timeline?')) {
      await dispatch(deleteRoadmapTimeline(timelineId));
      dispatch(getRoadmapTimelines());
    }
  };

  const handleDetectBottlenecks = async (roadmapId = null) => {
    await dispatch(detectRoadmapBottlenecks(roadmapId));
  };

  const getViewTypeColor = (viewType) => {
    switch (viewType) {
      case 'quarterly':
        return 'primary';
      case 'now_next_later':
        return 'secondary';
      case 'gantt':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading && timelines.length === 0) {
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
          <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Roadmap Timelines
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and visualize your AI initiative roadmaps
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<AIIcon />}
            onClick={() => handleDetectBottlenecks()}
            disabled={loading}
          >
            Detect Bottlenecks
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Timeline
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* AI Bottlenecks Alert */}
      {aiBottlenecks && aiBottlenecks.bottlenecks && aiBottlenecks.bottlenecks.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.light' }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <WarningIcon color="warning" />
            <Typography variant="h6" fontWeight="bold">
              AI-Detected Bottlenecks
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {aiBottlenecks.bottlenecks.map((bottleneck, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {bottleneck.title}
                      </Typography>
                      <Chip
                        label={bottleneck.severity}
                        color={
                          bottleneck.severity === 'critical' ? 'error' :
                          bottleneck.severity === 'high' ? 'warning' :
                          'info'
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {bottleneck.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Type: {bottleneck.type}
                    </Typography>
                    {bottleneck.recommendations && bottleneck.recommendations.length > 0 && (
                      <Box mt={1}>
                        <Typography variant="caption" fontWeight="bold">
                          Recommendations:
                        </Typography>
                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                          {bottleneck.recommendations.slice(0, 2).map((rec, i) => (
                            <li key={i}>
                              <Typography variant="caption">{rec}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Timelines Grid */}
      {timelines.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <TimelineIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Roadmap Timelines Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first roadmap timeline to start planning your AI initiatives
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Timeline
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {timelines.map((timeline) => (
            <Grid item xs={12} md={6} lg={4} key={timeline.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {timeline.name}
                      </Typography>
                      <Box display="flex" gap={1} mb={1}>
                        <Chip
                          label={timeline.view_type}
                          color={getViewTypeColor(timeline.view_type)}
                          size="small"
                        />
                        {timeline.is_active && (
                          <Chip
                            label="Active"
                            color="success"
                            size="small"
                            icon={<CheckCircleIcon />}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(timeline)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(timeline.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {timeline.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {timeline.description}
                    </Typography>
                  )}

                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Start: {new Date(timeline.start_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      End: {new Date(timeline.end_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTimeline ? 'Edit Roadmap Timeline' : 'Create Roadmap Timeline'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
            <TextField
              label="View Type"
              select
              fullWidth
              value={formData.view_type}
              onChange={(e) => setFormData({ ...formData, view_type: e.target.value })}
            >
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="now_next_later">Now-Next-Later</MenuItem>
              <MenuItem value="gantt">Gantt</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.start_date || !formData.end_date}
          >
            {editingTimeline ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoadmapTimeline;
