import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Async thunks for portfolio operations

// Get portfolio balance
export const getPortfolioBalance = createAsyncThunk(
  'portfolio/getPortfolioBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/portfolio/balance');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch portfolio balance');
    }
  }
);

// Analyze portfolio balance with AI
export const analyzePortfolioBalance = createAsyncThunk(
  'portfolio/analyzePortfolioBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/portfolio/balance/analyze');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to analyze portfolio balance');
    }
  }
);

// Compare two initiatives
export const compareInitiatives = createAsyncThunk(
  'portfolio/compareInitiatives',
  async ({ initiativeAId, initiativeBId }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/portfolio/compare', {
        initiative_a_id: initiativeAId,
        initiative_b_id: initiativeBId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to compare initiatives');
    }
  }
);

// Simulate portfolio scenario
export const simulatePortfolioScenario = createAsyncThunk(
  'portfolio/simulatePortfolioScenario',
  async ({ scenario, initiativeIds = null }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/portfolio/simulate', {
        scenario,
        initiative_ids: initiativeIds
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to simulate portfolio scenario');
    }
  }
);

// Get all scenario simulations
export const getScenarioSimulations = createAsyncThunk(
  'portfolio/getScenarioSimulations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/portfolio/simulations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch scenario simulations');
    }
  }
);

// Get specific scenario simulation
export const getScenarioSimulation = createAsyncThunk(
  'portfolio/getScenarioSimulation',
  async (simulationId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/portfolio/simulations/${simulationId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch scenario simulation');
    }
  }
);

// Update scenario simulation
export const updateScenarioSimulation = createAsyncThunk(
  'portfolio/updateScenarioSimulation',
  async ({ simulationId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/portfolio/simulations/${simulationId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update scenario simulation');
    }
  }
);

// Delete scenario simulation
export const deleteScenarioSimulation = createAsyncThunk(
  'portfolio/deleteScenarioSimulation',
  async (simulationId, { rejectWithValue }) => {
    try {
      await axios.delete(`/portfolio/simulations/${simulationId}`);
      return simulationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete scenario simulation');
    }
  }
);

const initialState = {
  balance: null,
  balanceAnalysis: null,
  comparison: null,
  simulations: [],
  currentSimulation: null,
  loading: false,
  error: null,
  analyzing: false,
  comparing: false,
  simulating: false,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearComparison: (state) => {
      state.comparison = null;
    },
    clearCurrentSimulation: (state) => {
      state.currentSimulation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get portfolio balance
      .addCase(getPortfolioBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPortfolioBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(getPortfolioBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Analyze portfolio balance
      .addCase(analyzePortfolioBalance.pending, (state) => {
        state.analyzing = true;
        state.error = null;
      })
      .addCase(analyzePortfolioBalance.fulfilled, (state, action) => {
        state.analyzing = false;
        state.balance = action.payload.portfolio_balance;
        state.balanceAnalysis = action.payload.ai_analysis;
      })
      .addCase(analyzePortfolioBalance.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload;
      })
      
      // Compare initiatives
      .addCase(compareInitiatives.pending, (state) => {
        state.comparing = true;
        state.error = null;
      })
      .addCase(compareInitiatives.fulfilled, (state, action) => {
        state.comparing = false;
        state.comparison = action.payload;
      })
      .addCase(compareInitiatives.rejected, (state, action) => {
        state.comparing = false;
        state.error = action.payload;
      })
      
      // Simulate portfolio scenario
      .addCase(simulatePortfolioScenario.pending, (state) => {
        state.simulating = true;
        state.error = null;
      })
      .addCase(simulatePortfolioScenario.fulfilled, (state, action) => {
        state.simulating = false;
        state.currentSimulation = action.payload;
        state.simulations.unshift(action.payload);
      })
      .addCase(simulatePortfolioScenario.rejected, (state, action) => {
        state.simulating = false;
        state.error = action.payload;
      })
      
      // Get scenario simulations
      .addCase(getScenarioSimulations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScenarioSimulations.fulfilled, (state, action) => {
        state.loading = false;
        state.simulations = action.payload;
      })
      .addCase(getScenarioSimulations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get scenario simulation
      .addCase(getScenarioSimulation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScenarioSimulation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSimulation = action.payload;
      })
      .addCase(getScenarioSimulation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update scenario simulation
      .addCase(updateScenarioSimulation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateScenarioSimulation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSimulation = action.payload;
        state.simulations = state.simulations.map(sim =>
          sim.id === action.payload.id ? action.payload : sim
        );
      })
      .addCase(updateScenarioSimulation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete scenario simulation
      .addCase(deleteScenarioSimulation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteScenarioSimulation.fulfilled, (state, action) => {
        state.loading = false;
        state.simulations = state.simulations.filter(sim => sim.id !== action.payload);
        if (state.currentSimulation?.id === action.payload) {
          state.currentSimulation = null;
        }
      })
      .addCase(deleteScenarioSimulation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearComparison, clearCurrentSimulation } = portfolioSlice.actions;
export default portfolioSlice.reducer;
