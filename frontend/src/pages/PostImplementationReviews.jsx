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
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Assessment,
  Psychology,
  Add,
  CheckCircle,
  ThumbUp,
  ThumbDown,
  Lightbulb,
  Edit,
} from '@mui/icons-material';
import {
  getInitiativePIRs,
  createPIR,
  updatePIR,
  submitPIR,
  generatePIRInsights,
} from '../store/slices/benefitsSlice';
import { getInitiatives } from '../store/slices/initiativesSlice';

const PostImplementationReviews = () => {
  const dispatch = useDispatch();
  const { pirs, aiInsights, loading, error } = useSelector((state) => state.benefits);
  const { initiatives } = useSelector((state) => state.initiatives);

  const [selectedInitiative, setSelectedInitiative] = useState('');
  const [openPIRDialog, setOpenPIRDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedPIR, setSelectedPIR] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);

  const [pirForm, setPirForm] = useState({
    review_type: '30_day',
    overall_success_rating: 3,
    benefits_realized_rating: 3,
    technical_performance_rating: 3,
    user_adoption_rating: 3,
    what_went_well: '',
    what_went_wrong: '',
    recommendations: '',
    would_do_again: true,
  });

  useEffect(() => {
    dispatch(getInitiatives());
  }, [dispatch]);

  useEffect(() => {
    if (selectedInitiative) {
      dispatch(getInitiativePIRs(selectedInitiative));
    }
  }, [dispatch, selectedInitiative]);

  const handleCreatePIR = async () => {
    if (!selectedInitiative) return;
    
    const lessonsLearned = {
      what_went_well: pirForm.what_went_well.split('\n').filter(l => l.trim()),
      what_went_wrong: pirForm.what_went_wrong.split('\n').filter(l => l.trim()),
      recommendations: pirForm.recommendations.split('\n').filter(l => l.trim()),
    };
    
    await dispatch(createPIR({
      initiative_id: selectedInitiative,
      review_type: pirForm.review_type,
      overall_success_rating: pirForm.overall_success_rating,
      benefits_realized_rating: pirForm.benefits_realized_rating,
      technical_performance_rating: pirForm.technical_performance_rating,
      user_adoption_rating: pirForm.user_adoption_rating,
      lessons_learned: lessonsLearned,
      would_do_again: pirForm.would_do_again,
      review_status: 'draft',
    }));
    
    setOpenPIRDialog(false);
    resetForm();
  };

  const handleUpdatePIR = async () => {
    if (!selectedPIR) return;
    
    const lessonsLearned = {
      what_went_well: pirForm.what_went_well.split('\n').filter(l => l.trim()),
      what_went_wrong: pirForm.what_went_wrong.split('\n').filter(l => l.trim()),
      recommendations: pirForm.recommendations.split('\n').filter(l => l.trim()),
    };
    
    await dispatch(updatePIR({
      pirId: selectedPIR.id,
      updateData: {
        overall_success_rating: pirForm.overall_success_rating,
        benefits_realized_rating: pirForm.benefits_realized_rating,
        technical_performance_rating: pirForm.technical_performance_rating,
        user_adoption_rating: pirForm.user_adoption_rating,
        lessons_learned: lessonsLearned,
        would_do_again: pirForm.would_do_again,
      },
    }));
    
    setOpenEditDialog(false);
    resetForm();
  };

  const handleSubmitPIR = async (pirId) => {
    await dispatch(submitPIR(pirId));
  };

  const handleGenerateInsights = async () => {
    if (!selectedInitiative) return;
    
    const initiative = initiatives.find(i => i.id === parseInt(selectedInitiative));
    if (!initiative) return;
    
    await dispatch(generatePIRInsights({
      initiative_id: selectedInitiative,
      initiative_title: initiative.title,
      pirs: pirs,
    }));
    setShowAIInsights(true);
  };

  const resetForm = () => {
    setPirForm({
      review_type: '30_day',
      overall_success_rating: 3,
      benefits_realized_rating: 3,
      technical_performance_rating: 3,
      user_adoption_rating: 3,
      what_went_well: '',
      what_went_wrong: '',
      recommendations: '',
      would_do_again: true,
    });
  };

  const getReviewTypeLabel = (type) => {
    const labels = {
      '30_day': '30-Day Review',
      '90_day': '90-Day Review',
      '6_month': '6-Month Review',
      '1_year': '1-Year Review',
      'final': 'Final Review',
    };
    return labels[type] || type;
  };

  const getReviewTypeColor = (type) => {
    const colors = {
      '30_day': 'info',
      '90_day': 'primary',
      '6_month': 'secondary',
      '1_year': 'warning',
      'final': 'success',
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'submitted': return 'info';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success.main';
    if (rating >= 3) return 'warning.main';
    return 'error.main';
  };

  const averageRating = pirs.length > 0
    ? pirs.reduce((sum, p) => sum + (p.overall_success_rating || 0), 0) / pirs.length
    : 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment /> Post-Implementation Reviews
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Capture lessons learned and track initiative success over time
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
                onClick={() => setOpenPIRDialog(true)}
                sx={{ flex: 1 }}
              >
                Create Review
              </Button>
              <Button
                variant="outlined"
                startIcon={<Psychology />}
                disabled={!selectedInitiative || pirs.length === 0}
                onClick={handleGenerateInsights}
              >
                AI Insights
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading.pirs && <LinearProgress sx={{ mb: 3 }} />}

      {/* Summary Cards */}
      {selectedInitiative && pirs.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Reviews
                </Typography>
                <Typography variant="h3" color="primary">
                  {pirs.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed reviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average Rating
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h3" color={getRatingColor(averageRating)}>
                    {averageRating.toFixed(1)}
                  </Typography>
                  <Rating value={averageRating} readOnly precision={0.1} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Overall success
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Would Do Again
                </Typography>
                <Typography variant="h3" color="success.main">
                  {pirs.filter(p => p.would_do_again).length}/{pirs.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Positive recommendations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Empty State */}
      {selectedInitiative && pirs.length === 0 && !loading.pirs && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Reviews Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first post-implementation review to capture lessons learned
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenPIRDialog(true)}
          >
            Create First Review
          </Button>
        </Paper>
      )}

      {/* PIRs List */}
      <Grid container spacing={3}>
        {pirs.map((pir) => (
          <Grid item xs={12} key={pir.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Assessment />
                      <Typography variant="h6">
                        {getReviewTypeLabel(pir.review_type)}
                      </Typography>
                      <Chip
                        label={pir.review_type}
                        size="small"
                        color={getReviewTypeColor(pir.review_type)}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Reviewed: {new Date(pir.review_date || pir.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={pir.review_status || 'draft'}
                    size="small"
                    color={getStatusColor(pir.review_status)}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Ratings */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Overall Success
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={pir.overall_success_rating} readOnly size="small" />
                      <Typography variant="body2">
                        {pir.overall_success_rating}/5
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Benefits Realized
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={pir.benefits_realized_rating} readOnly size="small" />
                      <Typography variant="body2">
                        {pir.benefits_realized_rating}/5
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Technical Performance
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={pir.technical_performance_rating} readOnly size="small" />
                      <Typography variant="body2">
                        {pir.technical_performance_rating}/5
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      User Adoption
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={pir.user_adoption_rating} readOnly size="small" />
                      <Typography variant="body2">
                        {pir.user_adoption_rating}/5
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Lessons Learned */}
                {pir.lessons_learned && (
                  <Grid container spacing={2}>
                    {pir.lessons_learned.what_went_well && pir.lessons_learned.what_went_well.length > 0 && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ThumbUp color="success" fontSize="small" />
                          What Went Well
                        </Typography>
                        <List dense>
                          {pir.lessons_learned.what_went_well.map((item, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircle fontSize="small" color="success" />
                              </ListItemIcon>
                              <ListItemText primary={item} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                    {pir.lessons_learned.what_went_wrong && pir.lessons_learned.what_went_wrong.length > 0 && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ThumbDown color="error" fontSize="small" />
                          What Went Wrong
                        </Typography>
                        <List dense>
                          {pir.lessons_learned.what_went_wrong.map((item, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircle fontSize="small" color="error" />
                              </ListItemIcon>
                              <ListItemText primary={item} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                    {pir.lessons_learned.recommendations && pir.lessons_learned.recommendations.length > 0 && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Lightbulb color="warning" fontSize="small" />
                          Recommendations
                        </Typography>
                        <List dense>
                          {pir.lessons_learned.recommendations.map((item, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircle fontSize="small" color="warning" />
                              </ListItemIcon>
                              <ListItemText primary={item} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                  </Grid>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Would Do Again */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Would do this initiative again?
                  </Typography>
                  <Chip
                    label={pir.would_do_again ? 'Yes' : 'No'}
                    size="small"
                    color={pir.would_do_again ? 'success' : 'error'}
                  />
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => {
                      setSelectedPIR(pir);
                      setPirForm({
                        review_type: pir.review_type,
                        overall_success_rating: pir.overall_success_rating,
                        benefits_realized_rating: pir.benefits_realized_rating,
                        technical_performance_rating: pir.technical_performance_rating,
                        user_adoption_rating: pir.user_adoption_rating,
                        what_went_well: pir.lessons_learned?.what_went_well?.join('\n') || '',
                        what_went_wrong: pir.lessons_learned?.what_went_wrong?.join('\n') || '',
                        recommendations: pir.lessons_learned?.recommendations?.join('\n') || '',
                        would_do_again: pir.would_do_again,
                      });
                      setOpenEditDialog(true);
                    }}
                    disabled={pir.review_status === 'approved'}
                  >
                    Edit
                  </Button>
                  {pir.review_status === 'draft' && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleSubmitPIR(pir.id)}
                    >
                      Submit for Approval
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* AI Insights */}
      {showAIInsights && aiInsights.pirInsights && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Psychology />
            <Typography variant="h6">AI-Generated PIR Insights</Typography>
            <Button
              size="small"
              onClick={() => setShowAIInsights(false)}
              sx={{ ml: 'auto', color: 'inherit' }}
            >
              Close
            </Button>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(aiInsights.pirInsights, null, 2)}
          </Typography>
        </Paper>
      )}

      {/* Create PIR Dialog */}
      <Dialog open={openPIRDialog} onClose={() => setOpenPIRDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Post-Implementation Review</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Review Type"
                value={pirForm.review_type}
                onChange={(e) => setPirForm({ ...pirForm, review_type: e.target.value })}
              >
                <MenuItem value="30_day">30-Day Review</MenuItem>
                <MenuItem value="90_day">90-Day Review</MenuItem>
                <MenuItem value="6_month">6-Month Review</MenuItem>
                <MenuItem value="1_year">1-Year Review</MenuItem>
                <MenuItem value="final">Final Review</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="caption" gutterBottom>
                Overall Success Rating
              </Typography>
              <Rating
                value={pirForm.overall_success_rating}
                onChange={(e, newValue) => setPirForm({ ...pirForm, overall_success_rating: newValue })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" gutterBottom>
                Benefits Realized Rating
              </Typography>
              <Rating
                value={pirForm.benefits_realized_rating}
                onChange={(e, newValue) => setPirForm({ ...pirForm, benefits_realized_rating: newValue })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" gutterBottom>
                Technical Performance Rating
              </Typography>
              <Rating
                value={pirForm.technical_performance_rating}
                onChange={(e, newValue) => setPirForm({ ...pirForm, technical_performance_rating: newValue })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" gutterBottom>
                User Adoption Rating
              </Typography>
              <Rating
                value={pirForm.user_adoption_rating}
                onChange={(e, newValue) => setPirForm({ ...pirForm, user_adoption_rating: newValue })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="What Went Well"
                value={pirForm.what_went_well}
                onChange={(e) => setPirForm({ ...pirForm, what_went_well: e.target.value })}
                placeholder="One item per line..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="What Went Wrong"
                value={pirForm.what_went_wrong}
                onChange={(e) => setPirForm({ ...pirForm, what_went_wrong: e.target.value })}
                placeholder="One item per line..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Recommendations"
                value={pirForm.recommendations}
                onChange={(e) => setPirForm({ ...pirForm, recommendations: e.target.value })}
                placeholder="One item per line..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Would Do Again?"
                value={pirForm.would_do_again}
                onChange={(e) => setPirForm({ ...pirForm, would_do_again: e.target.value === 'true' })}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPIRDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePIR} variant="contained">
            Create Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit PIR Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Post-Implementation Review</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" gutterBottom>
                Overall Success Rating
              </Typography>
              <Rating
                value={pirForm.overall_success_rating}
                onChange={(e, newValue) => setPirForm({ ...pirForm, overall_success_rating: newValue })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" gutterBottom>
                Benefits Realized Rating
              </Typography>
              <Rating
                value={pirForm.benefits_realized_rating}
                onChange={(e, newValue) => setPirForm({ ...pirForm, benefits_realized_rating: newValue })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" gutterBottom>
                Technical Performance Rating
              </Typography>
              <Rating
                value={pirForm.technical_performance_rating}
                onChange={(e, newValue) => setPirForm({ ...pirForm, technical_performance_rating: newValue })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" gutterBottom>
                User Adoption Rating
              </Typography>
              <Rating
                value={pirForm.user_adoption_rating}
                onChange={(e, newValue) => setPirForm({ ...pirForm, user_adoption_rating: newValue })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="What Went Well"
                value={pirForm.what_went_well}
                onChange={(e) => setPirForm({ ...pirForm, what_went_well: e.target.value })}
                placeholder="One item per line..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="What Went Wrong"
                value={pirForm.what_went_wrong}
                onChange={(e) => setPirForm({ ...pirForm, what_went_wrong: e.target.value })}
                placeholder="One item per line..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Recommendations"
                value={pirForm.recommendations}
                onChange={(e) => setPirForm({ ...pirForm, recommendations: e.target.value })}
                placeholder="One item per line..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Would Do Again?"
                value={pirForm.would_do_again}
                onChange={(e) => setPirForm({ ...pirForm, would_do_again: e.target.value === 'true' })}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdatePIR} variant="contained">
            Update Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostImplementationReviews;
