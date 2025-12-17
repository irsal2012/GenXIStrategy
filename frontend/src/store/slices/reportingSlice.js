import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// ============================================================================
// Async Thunks - Dashboard Data
// ============================================================================

export const fetchValuePipeline = createAsyncThunk(
  'reporting/fetchValuePipeline',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/reporting/dashboards/value-pipeline');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch value pipeline');
    }
  }
);

export const fetchDeliveredValue = createAsyncThunk(
  'reporting/fetchDeliveredValue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/reporting/dashboards/delivered-value');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch delivered value');
    }
  }
);

export const fetchRiskExposure = createAsyncThunk(
  'reporting/fetchRiskExposure',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/reporting/dashboards/risk-exposure');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch risk exposure');
    }
  }
);

export const fetchStageDistribution = createAsyncThunk(
  'reporting/fetchStageDistribution',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/reporting/dashboards/stage-distribution');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch stage distribution');
    }
  }
);

export const fetchBottlenecks = createAsyncThunk(
  'reporting/fetchBottlenecks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/reporting/dashboards/bottlenecks');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch bottlenecks');
    }
  }
);

export const fetchPortfolioHealth = createAsyncThunk(
  'reporting/fetchPortfolioHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/reporting/dashboards/portfolio-health');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch portfolio health');
    }
  }
);

// ============================================================================
// Async Thunks - Report Generation
// ============================================================================

export const generateBoardSlides = createAsyncThunk(
  'reporting/generateBoardSlides',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/reporting/reports/board-slides', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate board slides');
    }
  }
);

export const generateStrategyBrief = createAsyncThunk(
  'reporting/generateStrategyBrief',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/reporting/reports/strategy-brief', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate strategy brief');
    }
  }
);

export const generateQuarterlyReport = createAsyncThunk(
  'reporting/generateQuarterlyReport',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/reporting/reports/quarterly-report', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate quarterly report');
    }
  }
);

export const fetchReports = createAsyncThunk(
  'reporting/fetchReports',
  async ({ reportType, skip = 0, limit = 100 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (reportType) params.append('report_type', reportType);
      params.append('skip', skip);
      params.append('limit', limit);
      
      const response = await axios.get(`/reporting/reports?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch reports');
    }
  }
);

export const fetchReport = createAsyncThunk(
  'reporting/fetchReport',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/reporting/reports/${reportId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch report');
    }
  }
);

// ============================================================================
// Async Thunks - AI Agent
// ============================================================================

export const generateNarrative = createAsyncThunk(
  'reporting/generateNarrative',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/reporting/ai/generate-narrative', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate narrative');
    }
  }
);

export const explainTradeoffs = createAsyncThunk(
  'reporting/explainTradeoffs',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/reporting/ai/explain-tradeoffs', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to explain tradeoffs');
    }
  }
);

export const generateTalkingPoints = createAsyncThunk(
  'reporting/generateTalkingPoints',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/reporting/ai/talking-points', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate talking points');
    }
  }
);

export const generateBoardSummary = createAsyncThunk(
  'reporting/generateBoardSummary',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/reporting/ai/board-summary', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate board summary');
    }
  }
);

export const generateRecommendations = createAsyncThunk(
  'reporting/generateRecommendations',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/reporting/ai/recommendations', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate recommendations');
    }
  }
);

// ============================================================================
// Async Thunks - Metrics
// ============================================================================

export const fetchPortfolioMetrics = createAsyncThunk(
  'reporting/fetchPortfolioMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/reporting/metrics/portfolio');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch portfolio metrics');
    }
  }
);

export const fetchMetricsTrends = createAsyncThunk(
  'reporting/fetchMetricsTrends',
  async (periodDays = 90, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/reporting/metrics/trends?period_days=${periodDays}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch metrics trends');
    }
  }
);

export const fetchMetricsBenchmarks = createAsyncThunk(
  'reporting/fetchMetricsBenchmarks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/reporting/metrics/benchmarks');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch metrics benchmarks');
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const reportingSlice = createSlice({
  name: 'reporting',
  initialState: {
    // Dashboard data
    dashboards: {
      valuePipeline: null,
      deliveredValue: null,
      riskExposure: null,
      stageDistribution: null,
      bottlenecks: null,
      portfolioHealth: null,
    },
    
    // Reports
    reports: [],
    currentReport: null,
    
    // Metrics
    portfolioMetrics: null,
    metricsTrends: null,
    metricsBenchmarks: null,
    
    // AI Results
    aiResults: {
      narrative: null,
      tradeoffs: null,
      talkingPoints: null,
      boardSummary: null,
      recommendations: null,
    },
    
    // Loading states
    loading: {
      valuePipeline: false,
      deliveredValue: false,
      riskExposure: false,
      stageDistribution: false,
      bottlenecks: false,
      portfolioHealth: false,
      reports: false,
      reportGeneration: false,
      aiNarrative: false,
      aiTradeoffs: false,
      aiTalkingPoints: false,
      aiBoardSummary: false,
      aiRecommendations: false,
      metrics: false,
    },
    
    // Error states
    error: {
      valuePipeline: null,
      deliveredValue: null,
      riskExposure: null,
      stageDistribution: null,
      bottlenecks: null,
      portfolioHealth: null,
      reports: null,
      reportGeneration: null,
      aiNarrative: null,
      aiTradeoffs: null,
      aiTalkingPoints: null,
      aiBoardSummary: null,
      aiRecommendations: null,
      metrics: null,
    },
  },
  reducers: {
    clearAiResults: (state) => {
      state.aiResults = {
        narrative: null,
        tradeoffs: null,
        talkingPoints: null,
        boardSummary: null,
        recommendations: null,
      };
    },
    clearErrors: (state) => {
      state.error = {
        valuePipeline: null,
        deliveredValue: null,
        riskExposure: null,
        stageDistribution: null,
        bottlenecks: null,
        portfolioHealth: null,
        reports: null,
        reportGeneration: null,
        aiNarrative: null,
        aiTradeoffs: null,
        aiTalkingPoints: null,
        aiBoardSummary: null,
        aiRecommendations: null,
        metrics: null,
      };
    },
  },
  extraReducers: (builder) => {
    // Value Pipeline
    builder
      .addCase(fetchValuePipeline.pending, (state) => {
        state.loading.valuePipeline = true;
        state.error.valuePipeline = null;
      })
      .addCase(fetchValuePipeline.fulfilled, (state, action) => {
        state.loading.valuePipeline = false;
        state.dashboards.valuePipeline = action.payload;
      })
      .addCase(fetchValuePipeline.rejected, (state, action) => {
        state.loading.valuePipeline = false;
        state.error.valuePipeline = action.payload;
      });
    
    // Delivered Value
    builder
      .addCase(fetchDeliveredValue.pending, (state) => {
        state.loading.deliveredValue = true;
        state.error.deliveredValue = null;
      })
      .addCase(fetchDeliveredValue.fulfilled, (state, action) => {
        state.loading.deliveredValue = false;
        state.dashboards.deliveredValue = action.payload;
      })
      .addCase(fetchDeliveredValue.rejected, (state, action) => {
        state.loading.deliveredValue = false;
        state.error.deliveredValue = action.payload;
      });
    
    // Risk Exposure
    builder
      .addCase(fetchRiskExposure.pending, (state) => {
        state.loading.riskExposure = true;
        state.error.riskExposure = null;
      })
      .addCase(fetchRiskExposure.fulfilled, (state, action) => {
        state.loading.riskExposure = false;
        state.dashboards.riskExposure = action.payload;
      })
      .addCase(fetchRiskExposure.rejected, (state, action) => {
        state.loading.riskExposure = false;
        state.error.riskExposure = action.payload;
      });
    
    // Stage Distribution
    builder
      .addCase(fetchStageDistribution.pending, (state) => {
        state.loading.stageDistribution = true;
        state.error.stageDistribution = null;
      })
      .addCase(fetchStageDistribution.fulfilled, (state, action) => {
        state.loading.stageDistribution = false;
        state.dashboards.stageDistribution = action.payload;
      })
      .addCase(fetchStageDistribution.rejected, (state, action) => {
        state.loading.stageDistribution = false;
        state.error.stageDistribution = action.payload;
      });
    
    // Bottlenecks
    builder
      .addCase(fetchBottlenecks.pending, (state) => {
        state.loading.bottlenecks = true;
        state.error.bottlenecks = null;
      })
      .addCase(fetchBottlenecks.fulfilled, (state, action) => {
        state.loading.bottlenecks = false;
        state.dashboards.bottlenecks = action.payload;
      })
      .addCase(fetchBottlenecks.rejected, (state, action) => {
        state.loading.bottlenecks = false;
        state.error.bottlenecks = action.payload;
      });
    
    // Portfolio Health
    builder
      .addCase(fetchPortfolioHealth.pending, (state) => {
        state.loading.portfolioHealth = true;
        state.error.portfolioHealth = null;
      })
      .addCase(fetchPortfolioHealth.fulfilled, (state, action) => {
        state.loading.portfolioHealth = false;
        state.dashboards.portfolioHealth = action.payload;
      })
      .addCase(fetchPortfolioHealth.rejected, (state, action) => {
        state.loading.portfolioHealth = false;
        state.error.portfolioHealth = action.payload;
      });
    
    // Reports
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading.reports = true;
        state.error.reports = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading.reports = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading.reports = false;
        state.error.reports = action.payload;
      });
    
    builder
      .addCase(fetchReport.pending, (state) => {
        state.loading.reports = true;
        state.error.reports = null;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading.reports = false;
        state.currentReport = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading.reports = false;
        state.error.reports = action.payload;
      });
    
    // Report Generation
    builder
      .addCase(generateBoardSlides.pending, (state) => {
        state.loading.reportGeneration = true;
        state.error.reportGeneration = null;
      })
      .addCase(generateBoardSlides.fulfilled, (state, action) => {
        state.loading.reportGeneration = false;
        state.currentReport = action.payload;
      })
      .addCase(generateBoardSlides.rejected, (state, action) => {
        state.loading.reportGeneration = false;
        state.error.reportGeneration = action.payload;
      });
    
    builder
      .addCase(generateStrategyBrief.pending, (state) => {
        state.loading.reportGeneration = true;
        state.error.reportGeneration = null;
      })
      .addCase(generateStrategyBrief.fulfilled, (state, action) => {
        state.loading.reportGeneration = false;
        state.currentReport = action.payload;
      })
      .addCase(generateStrategyBrief.rejected, (state, action) => {
        state.loading.reportGeneration = false;
        state.error.reportGeneration = action.payload;
      });
    
    builder
      .addCase(generateQuarterlyReport.pending, (state) => {
        state.loading.reportGeneration = true;
        state.error.reportGeneration = null;
      })
      .addCase(generateQuarterlyReport.fulfilled, (state, action) => {
        state.loading.reportGeneration = false;
        state.currentReport = action.payload;
      })
      .addCase(generateQuarterlyReport.rejected, (state, action) => {
        state.loading.reportGeneration = false;
        state.error.reportGeneration = action.payload;
      });
    
    // AI Narrative
    builder
      .addCase(generateNarrative.pending, (state) => {
        state.loading.aiNarrative = true;
        state.error.aiNarrative = null;
      })
      .addCase(generateNarrative.fulfilled, (state, action) => {
        state.loading.aiNarrative = false;
        state.aiResults.narrative = action.payload;
      })
      .addCase(generateNarrative.rejected, (state, action) => {
        state.loading.aiNarrative = false;
        state.error.aiNarrative = action.payload;
      });
    
    // AI Tradeoffs
    builder
      .addCase(explainTradeoffs.pending, (state) => {
        state.loading.aiTradeoffs = true;
        state.error.aiTradeoffs = null;
      })
      .addCase(explainTradeoffs.fulfilled, (state, action) => {
        state.loading.aiTradeoffs = false;
        state.aiResults.tradeoffs = action.payload;
      })
      .addCase(explainTradeoffs.rejected, (state, action) => {
        state.loading.aiTradeoffs = false;
        state.error.aiTradeoffs = action.payload;
      });
    
    // AI Talking Points
    builder
      .addCase(generateTalkingPoints.pending, (state) => {
        state.loading.aiTalkingPoints = true;
        state.error.aiTalkingPoints = null;
      })
      .addCase(generateTalkingPoints.fulfilled, (state, action) => {
        state.loading.aiTalkingPoints = false;
        state.aiResults.talkingPoints = action.payload;
      })
      .addCase(generateTalkingPoints.rejected, (state, action) => {
        state.loading.aiTalkingPoints = false;
        state.error.aiTalkingPoints = action.payload;
      });
    
    // AI Board Summary
    builder
      .addCase(generateBoardSummary.pending, (state) => {
        state.loading.aiBoardSummary = true;
        state.error.aiBoardSummary = null;
      })
      .addCase(generateBoardSummary.fulfilled, (state, action) => {
        state.loading.aiBoardSummary = false;
        state.aiResults.boardSummary = action.payload;
      })
      .addCase(generateBoardSummary.rejected, (state, action) => {
        state.loading.aiBoardSummary = false;
        state.error.aiBoardSummary = action.payload;
      });
    
    // AI Recommendations
    builder
      .addCase(generateRecommendations.pending, (state) => {
        state.loading.aiRecommendations = true;
        state.error.aiRecommendations = null;
      })
      .addCase(generateRecommendations.fulfilled, (state, action) => {
        state.loading.aiRecommendations = false;
        state.aiResults.recommendations = action.payload;
      })
      .addCase(generateRecommendations.rejected, (state, action) => {
        state.loading.aiRecommendations = false;
        state.error.aiRecommendations = action.payload;
      });
    
    // Portfolio Metrics
    builder
      .addCase(fetchPortfolioMetrics.pending, (state) => {
        state.loading.metrics = true;
        state.error.metrics = null;
      })
      .addCase(fetchPortfolioMetrics.fulfilled, (state, action) => {
        state.loading.metrics = false;
        state.portfolioMetrics = action.payload;
      })
      .addCase(fetchPortfolioMetrics.rejected, (state, action) => {
        state.loading.metrics = false;
        state.error.metrics = action.payload;
      });
    
    // Metrics Trends
    builder
      .addCase(fetchMetricsTrends.pending, (state) => {
        state.loading.metrics = true;
        state.error.metrics = null;
      })
      .addCase(fetchMetricsTrends.fulfilled, (state, action) => {
        state.loading.metrics = false;
        state.metricsTrends = action.payload;
      })
      .addCase(fetchMetricsTrends.rejected, (state, action) => {
        state.loading.metrics = false;
        state.error.metrics = action.payload;
      });
    
    // Metrics Benchmarks
    builder
      .addCase(fetchMetricsBenchmarks.pending, (state) => {
        state.loading.metrics = true;
        state.error.metrics = null;
      })
      .addCase(fetchMetricsBenchmarks.fulfilled, (state, action) => {
        state.loading.metrics = false;
        state.metricsBenchmarks = action.payload;
      })
      .addCase(fetchMetricsBenchmarks.rejected, (state, action) => {
        state.loading.metrics = false;
        state.error.metrics = action.payload;
      });
  },
});

export const { clearAiResults, clearErrors } = reportingSlice.actions;
export default reportingSlice.reducer;
