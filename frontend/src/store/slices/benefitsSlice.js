import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// KPI Actions
export const createKPIBaseline = createAsyncThunk(
  'benefits/createKPIBaseline',
  async (kpiData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/benefits/kpis', kpiData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create KPI baseline');
    }
  }
);

export const getInitiativeKPIs = createAsyncThunk(
  'benefits/getInitiativeKPIs',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/benefits/kpis/initiative/${initiativeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch KPIs');
    }
  }
);

export const recordKPIMeasurement = createAsyncThunk(
  'benefits/recordKPIMeasurement',
  async ({ kpiId, measurementData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/benefits/kpis/${kpiId}/measurements`, measurementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to record measurement');
    }
  }
);

export const getKPIMeasurements = createAsyncThunk(
  'benefits/getKPIMeasurements',
  async (kpiId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/benefits/kpis/${kpiId}/measurements`);
      return { kpiId, measurements: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch measurements');
    }
  }
);

export const getKPITrend = createAsyncThunk(
  'benefits/getKPITrend',
  async (kpiId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/benefits/kpis/${kpiId}/trend`);
      return { kpiId, trend: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch KPI trend');
    }
  }
);

// Benefit Realization Actions
export const createBenefit = createAsyncThunk(
  'benefits/createBenefit',
  async (benefitData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/benefits/realizations', benefitData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create benefit');
    }
  }
);

export const getInitiativeBenefits = createAsyncThunk(
  'benefits/getInitiativeBenefits',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/benefits/realizations/initiative/${initiativeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch benefits');
    }
  }
);

export const updateBenefitRealization = createAsyncThunk(
  'benefits/updateBenefitRealization',
  async ({ benefitId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/benefits/realizations/${benefitId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update benefit');
    }
  }
);

export const getBenefitsSummary = createAsyncThunk(
  'benefits/getBenefitsSummary',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/benefits/realizations/initiative/${initiativeId}/summary`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch benefits summary');
    }
  }
);

// Confidence Scoring Actions
export const scoreBenefitConfidence = createAsyncThunk(
  'benefits/scoreBenefitConfidence',
  async (confidenceData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/benefits/confidence', confidenceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to score confidence');
    }
  }
);

export const getConfidenceScores = createAsyncThunk(
  'benefits/getConfidenceScores',
  async (benefitId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/benefits/confidence/benefit/${benefitId}`);
      return { benefitId, scores: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch confidence scores');
    }
  }
);

// Value Leakage Actions
export const reportValueLeakage = createAsyncThunk(
  'benefits/reportValueLeakage',
  async (leakageData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/benefits/leakages', leakageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to report leakage');
    }
  }
);

export const getInitiativeLeakages = createAsyncThunk(
  'benefits/getInitiativeLeakages',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/benefits/leakages/initiative/${initiativeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch leakages');
    }
  }
);

export const updateLeakageStatus = createAsyncThunk(
  'benefits/updateLeakageStatus',
  async ({ leakageId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/benefits/leakages/${leakageId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update leakage');
    }
  }
);

// Post-Implementation Review Actions
export const createPIR = createAsyncThunk(
  'benefits/createPIR',
  async (pirData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/benefits/pirs', pirData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create PIR');
    }
  }
);

export const getInitiativePIRs = createAsyncThunk(
  'benefits/getInitiativePIRs',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/benefits/pirs/initiative/${initiativeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch PIRs');
    }
  }
);

export const updatePIR = createAsyncThunk(
  'benefits/updatePIR',
  async ({ pirId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/benefits/pirs/${pirId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update PIR');
    }
  }
);

export const submitPIR = createAsyncThunk(
  'benefits/submitPIR',
  async (pirId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/benefits/pirs/${pirId}/submit`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to submit PIR');
    }
  }
);

// AI Agent Actions
export const explainVariance = createAsyncThunk(
  'benefits/explainVariance',
  async (varianceData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/benefits/ai/explain-variance', varianceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to explain variance');
    }
  }
);

export const detectLeakageAI = createAsyncThunk(
  'benefits/detectLeakageAI',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/benefits/ai/detect-leakage', { initiative_id: initiativeId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to detect leakage');
    }
  }
);

export const generatePIRInsights = createAsyncThunk(
  'benefits/generatePIRInsights',
  async (pirData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/benefits/ai/generate-pir-insights', pirData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to generate PIR insights');
    }
  }
);

export const forecastRealization = createAsyncThunk(
  'benefits/forecastRealization',
  async (forecastData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/benefits/ai/forecast-realization', forecastData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to forecast realization');
    }
  }
);

export const benchmarkPerformance = createAsyncThunk(
  'benefits/benchmarkPerformance',
  async (benchmarkData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/benefits/ai/benchmark', benchmarkData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to benchmark performance');
    }
  }
);

// Dashboard Actions
export const getInitiativeDashboard = createAsyncThunk(
  'benefits/getInitiativeDashboard',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/benefits/dashboard/initiative/${initiativeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch dashboard');
    }
  }
);

export const getPortfolioDashboard = createAsyncThunk(
  'benefits/getPortfolioDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/benefits/dashboard/portfolio');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch portfolio dashboard');
    }
  }
);

const benefitsSlice = createSlice({
  name: 'benefits',
  initialState: {
    kpis: [],
    kpiMeasurements: {},
    kpiTrends: {},
    benefits: [],
    benefitsSummary: null,
    confidenceScores: {},
    leakages: [],
    pirs: [],
    aiInsights: {
      varianceExplanation: null,
      leakageDetection: null,
      pirInsights: null,
      forecastRealization: null,
      benchmark: null,
    },
    dashboards: {
      initiative: null,
      portfolio: null,
    },
    loading: {
      kpis: false,
      benefits: false,
      confidence: false,
      leakages: false,
      pirs: false,
      ai: false,
      dashboard: false,
    },
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAIInsights: (state) => {
      state.aiInsights = {
        varianceExplanation: null,
        leakageDetection: null,
        pirInsights: null,
        forecastRealization: null,
        benchmark: null,
      };
    },
  },
  extraReducers: (builder) => {
    // KPI Actions
    builder
      .addCase(createKPIBaseline.pending, (state) => {
        state.loading.kpis = true;
        state.error = null;
      })
      .addCase(createKPIBaseline.fulfilled, (state, action) => {
        state.loading.kpis = false;
        state.kpis.push(action.payload);
      })
      .addCase(createKPIBaseline.rejected, (state, action) => {
        state.loading.kpis = false;
        state.error = action.payload;
      })
      .addCase(getInitiativeKPIs.pending, (state) => {
        state.loading.kpis = true;
        state.error = null;
      })
      .addCase(getInitiativeKPIs.fulfilled, (state, action) => {
        state.loading.kpis = false;
        state.kpis = action.payload;
      })
      .addCase(getInitiativeKPIs.rejected, (state, action) => {
        state.loading.kpis = false;
        state.error = action.payload;
      })
      .addCase(recordKPIMeasurement.pending, (state) => {
        state.loading.kpis = true;
        state.error = null;
      })
      .addCase(recordKPIMeasurement.fulfilled, (state, action) => {
        state.loading.kpis = false;
        // Add measurement to the appropriate KPI's measurements
        const kpiId = action.payload.kpi_baseline_id;
        if (!state.kpiMeasurements[kpiId]) {
          state.kpiMeasurements[kpiId] = [];
        }
        state.kpiMeasurements[kpiId].push(action.payload);
      })
      .addCase(recordKPIMeasurement.rejected, (state, action) => {
        state.loading.kpis = false;
        state.error = action.payload;
      })
      .addCase(getKPIMeasurements.fulfilled, (state, action) => {
        state.kpiMeasurements[action.payload.kpiId] = action.payload.measurements;
      })
      .addCase(getKPITrend.fulfilled, (state, action) => {
        state.kpiTrends[action.payload.kpiId] = action.payload.trend;
      });

    // Benefit Realization Actions
    builder
      .addCase(createBenefit.pending, (state) => {
        state.loading.benefits = true;
        state.error = null;
      })
      .addCase(createBenefit.fulfilled, (state, action) => {
        state.loading.benefits = false;
        state.benefits.push(action.payload);
      })
      .addCase(createBenefit.rejected, (state, action) => {
        state.loading.benefits = false;
        state.error = action.payload;
      })
      .addCase(getInitiativeBenefits.pending, (state) => {
        state.loading.benefits = true;
        state.error = null;
      })
      .addCase(getInitiativeBenefits.fulfilled, (state, action) => {
        state.loading.benefits = false;
        state.benefits = action.payload;
      })
      .addCase(getInitiativeBenefits.rejected, (state, action) => {
        state.loading.benefits = false;
        state.error = action.payload;
      })
      .addCase(updateBenefitRealization.fulfilled, (state, action) => {
        const index = state.benefits.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.benefits[index] = action.payload;
        }
      })
      .addCase(getBenefitsSummary.fulfilled, (state, action) => {
        state.benefitsSummary = action.payload;
      });

    // Confidence Scoring Actions
    builder
      .addCase(scoreBenefitConfidence.pending, (state) => {
        state.loading.confidence = true;
        state.error = null;
      })
      .addCase(scoreBenefitConfidence.fulfilled, (state, action) => {
        state.loading.confidence = false;
        const benefitId = action.payload.benefit_realization_id;
        if (!state.confidenceScores[benefitId]) {
          state.confidenceScores[benefitId] = [];
        }
        state.confidenceScores[benefitId].push(action.payload);
      })
      .addCase(scoreBenefitConfidence.rejected, (state, action) => {
        state.loading.confidence = false;
        state.error = action.payload;
      })
      .addCase(getConfidenceScores.fulfilled, (state, action) => {
        state.confidenceScores[action.payload.benefitId] = action.payload.scores;
      });

    // Value Leakage Actions
    builder
      .addCase(reportValueLeakage.pending, (state) => {
        state.loading.leakages = true;
        state.error = null;
      })
      .addCase(reportValueLeakage.fulfilled, (state, action) => {
        state.loading.leakages = false;
        state.leakages.push(action.payload);
      })
      .addCase(reportValueLeakage.rejected, (state, action) => {
        state.loading.leakages = false;
        state.error = action.payload;
      })
      .addCase(getInitiativeLeakages.pending, (state) => {
        state.loading.leakages = true;
        state.error = null;
      })
      .addCase(getInitiativeLeakages.fulfilled, (state, action) => {
        state.loading.leakages = false;
        state.leakages = action.payload;
      })
      .addCase(getInitiativeLeakages.rejected, (state, action) => {
        state.loading.leakages = false;
        state.error = action.payload;
      })
      .addCase(updateLeakageStatus.fulfilled, (state, action) => {
        const index = state.leakages.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.leakages[index] = action.payload;
        }
      });

    // Post-Implementation Review Actions
    builder
      .addCase(createPIR.pending, (state) => {
        state.loading.pirs = true;
        state.error = null;
      })
      .addCase(createPIR.fulfilled, (state, action) => {
        state.loading.pirs = false;
        state.pirs.push(action.payload);
      })
      .addCase(createPIR.rejected, (state, action) => {
        state.loading.pirs = false;
        state.error = action.payload;
      })
      .addCase(getInitiativePIRs.pending, (state) => {
        state.loading.pirs = true;
        state.error = null;
      })
      .addCase(getInitiativePIRs.fulfilled, (state, action) => {
        state.loading.pirs = false;
        state.pirs = action.payload;
      })
      .addCase(getInitiativePIRs.rejected, (state, action) => {
        state.loading.pirs = false;
        state.error = action.payload;
      })
      .addCase(updatePIR.fulfilled, (state, action) => {
        const index = state.pirs.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pirs[index] = action.payload;
        }
      })
      .addCase(submitPIR.fulfilled, (state, action) => {
        const index = state.pirs.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pirs[index] = action.payload;
        }
      });

    // AI Agent Actions
    builder
      .addCase(explainVariance.pending, (state) => {
        state.loading.ai = true;
        state.error = null;
      })
      .addCase(explainVariance.fulfilled, (state, action) => {
        state.loading.ai = false;
        state.aiInsights.varianceExplanation = action.payload;
      })
      .addCase(explainVariance.rejected, (state, action) => {
        state.loading.ai = false;
        state.error = action.payload;
      })
      .addCase(detectLeakageAI.pending, (state) => {
        state.loading.ai = true;
        state.error = null;
      })
      .addCase(detectLeakageAI.fulfilled, (state, action) => {
        state.loading.ai = false;
        state.aiInsights.leakageDetection = action.payload;
      })
      .addCase(detectLeakageAI.rejected, (state, action) => {
        state.loading.ai = false;
        state.error = action.payload;
      })
      .addCase(generatePIRInsights.pending, (state) => {
        state.loading.ai = true;
        state.error = null;
      })
      .addCase(generatePIRInsights.fulfilled, (state, action) => {
        state.loading.ai = false;
        state.aiInsights.pirInsights = action.payload;
      })
      .addCase(generatePIRInsights.rejected, (state, action) => {
        state.loading.ai = false;
        state.error = action.payload;
      })
      .addCase(forecastRealization.pending, (state) => {
        state.loading.ai = true;
        state.error = null;
      })
      .addCase(forecastRealization.fulfilled, (state, action) => {
        state.loading.ai = false;
        state.aiInsights.forecastRealization = action.payload;
      })
      .addCase(forecastRealization.rejected, (state, action) => {
        state.loading.ai = false;
        state.error = action.payload;
      })
      .addCase(benchmarkPerformance.pending, (state) => {
        state.loading.ai = true;
        state.error = null;
      })
      .addCase(benchmarkPerformance.fulfilled, (state, action) => {
        state.loading.ai = false;
        state.aiInsights.benchmark = action.payload;
      })
      .addCase(benchmarkPerformance.rejected, (state, action) => {
        state.loading.ai = false;
        state.error = action.payload;
      });

    // Dashboard Actions
    builder
      .addCase(getInitiativeDashboard.pending, (state) => {
        state.loading.dashboard = true;
        state.error = null;
      })
      .addCase(getInitiativeDashboard.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboards.initiative = action.payload;
      })
      .addCase(getInitiativeDashboard.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.error = action.payload;
      })
      .addCase(getPortfolioDashboard.pending, (state) => {
        state.loading.dashboard = true;
        state.error = null;
      })
      .addCase(getPortfolioDashboard.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboards.portfolio = action.payload;
      })
      .addCase(getPortfolioDashboard.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAIInsights } = benefitsSlice.actions;
export default benefitsSlice.reducer;
