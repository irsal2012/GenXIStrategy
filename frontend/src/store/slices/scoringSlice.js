import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Async thunks for scoring operations

// Get all scoring models
export const getScoringModels = createAsyncThunk(
  'scoring/getScoringModels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/scoring/models');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch scoring models');
    }
  }
);

// Get active scoring model
export const getActiveScoringModel = createAsyncThunk(
  'scoring/getActiveScoringModel',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/scoring/models/active');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch active scoring model');
    }
  }
);

// Create scoring model
export const createScoringModel = createAsyncThunk(
  'scoring/createScoringModel',
  async (modelData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/scoring/models', modelData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create scoring model');
    }
  }
);

// Activate scoring model
export const activateScoringModel = createAsyncThunk(
  'scoring/activateScoringModel',
  async (modelId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/scoring/models/${modelId}/activate`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to activate scoring model');
    }
  }
);

// Calculate initiative score
export const calculateInitiativeScore = createAsyncThunk(
  'scoring/calculateInitiativeScore',
  async ({ initiativeId, useAI = true, manualScores = null }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/scoring/calculate/${initiativeId}`, {
        use_ai: useAI,
        manual_scores: manualScores
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to calculate score');
    }
  }
);

// Calculate all scores
export const calculateAllScores = createAsyncThunk(
  'scoring/calculateAllScores',
  async (useAI = true, { rejectWithValue }) => {
    try {
      const response = await axios.post('/scoring/calculate-all', null, {
        params: { use_ai: useAI }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to calculate all scores');
    }
  }
);

// Get initiative score history
export const getInitiativeScoreHistory = createAsyncThunk(
  'scoring/getInitiativeScoreHistory',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/scoring/initiative/${initiativeId}/history`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch score history');
    }
  }
);

// Get current initiative score
export const getCurrentInitiativeScore = createAsyncThunk(
  'scoring/getCurrentInitiativeScore',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/scoring/initiative/${initiativeId}/current`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch current score');
    }
  }
);

// Get portfolio rankings
export const getPortfolioRankings = createAsyncThunk(
  'scoring/getPortfolioRankings',
  async (limit = null, { rejectWithValue }) => {
    try {
      const params = limit ? { limit } : {};
      const response = await axios.get('/scoring/rankings', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch rankings');
    }
  }
);

// Get scoring dimensions
export const getScoringDimensions = createAsyncThunk(
  'scoring/getScoringDimensions',
  async (modelVersionId = null, { rejectWithValue }) => {
    try {
      const params = modelVersionId ? { model_version_id: modelVersionId } : {};
      const response = await axios.get('/scoring/dimensions', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch dimensions');
    }
  }
);

const initialState = {
  models: [],
  activeModel: null,
  dimensions: [],
  currentScore: null,
  scoreHistory: [],
  rankings: [],
  loading: false,
  error: null,
  calculatingScore: false,
  calculatingAll: false,
};

const scoringSlice = createSlice({
  name: 'scoring',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentScore: (state) => {
      state.currentScore = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get scoring models
      .addCase(getScoringModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScoringModels.fulfilled, (state, action) => {
        state.loading = false;
        state.models = action.payload;
      })
      .addCase(getScoringModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get active scoring model
      .addCase(getActiveScoringModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveScoringModel.fulfilled, (state, action) => {
        state.loading = false;
        state.activeModel = action.payload;
      })
      .addCase(getActiveScoringModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create scoring model
      .addCase(createScoringModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createScoringModel.fulfilled, (state, action) => {
        state.loading = false;
        state.models.push(action.payload);
      })
      .addCase(createScoringModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Activate scoring model
      .addCase(activateScoringModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateScoringModel.fulfilled, (state, action) => {
        state.loading = false;
        state.activeModel = action.payload;
        // Update models list
        state.models = state.models.map(model => ({
          ...model,
          is_active: model.id === action.payload.id
        }));
      })
      .addCase(activateScoringModel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Calculate initiative score
      .addCase(calculateInitiativeScore.pending, (state) => {
        state.calculatingScore = true;
        state.error = null;
      })
      .addCase(calculateInitiativeScore.fulfilled, (state, action) => {
        state.calculatingScore = false;
        state.currentScore = action.payload.score;
      })
      .addCase(calculateInitiativeScore.rejected, (state, action) => {
        state.calculatingScore = false;
        state.error = action.payload;
      })
      
      // Calculate all scores
      .addCase(calculateAllScores.pending, (state) => {
        state.calculatingAll = true;
        state.error = null;
      })
      .addCase(calculateAllScores.fulfilled, (state) => {
        state.calculatingAll = false;
      })
      .addCase(calculateAllScores.rejected, (state, action) => {
        state.calculatingAll = false;
        state.error = action.payload;
      })
      
      // Get initiative score history
      .addCase(getInitiativeScoreHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInitiativeScoreHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.scoreHistory = action.payload;
      })
      .addCase(getInitiativeScoreHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get current initiative score
      .addCase(getCurrentInitiativeScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentInitiativeScore.fulfilled, (state, action) => {
        state.loading = false;
        state.currentScore = action.payload;
      })
      .addCase(getCurrentInitiativeScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get portfolio rankings
      .addCase(getPortfolioRankings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPortfolioRankings.fulfilled, (state, action) => {
        state.loading = false;
        state.rankings = action.payload;
      })
      .addCase(getPortfolioRankings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get scoring dimensions
      .addCase(getScoringDimensions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScoringDimensions.fulfilled, (state, action) => {
        state.loading = false;
        state.dimensions = action.payload;
      })
      .addCase(getScoringDimensions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentScore } = scoringSlice.actions;
export default scoringSlice.reducer;
