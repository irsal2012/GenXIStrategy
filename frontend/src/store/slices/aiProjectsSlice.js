import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axios'

const API_URL = '/ai-projects'

// ============================================================================
// ASYNC THUNKS - Business Understanding
// ============================================================================

export const createBusinessUnderstanding = createAsyncThunk(
  'aiProjects/createBusinessUnderstanding',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/business-understanding`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create business understanding')
    }
  }
)

export const fetchBusinessUnderstanding = createAsyncThunk(
  'aiProjects/fetchBusinessUnderstanding',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/business-understanding/initiative/${initiativeId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch business understanding')
    }
  }
)

export const updateBusinessUnderstanding = createAsyncThunk(
  'aiProjects/updateBusinessUnderstanding',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/business-understanding/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update business understanding')
    }
  }
)

export const recordGoNoGoDecision = createAsyncThunk(
  'aiProjects/recordGoNoGoDecision',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/business-understanding/${id}/go-no-go`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to record Go/No-Go decision')
    }
  }
)

// ============================================================================
// ASYNC THUNKS - Data Understanding
// ============================================================================

export const createDataUnderstanding = createAsyncThunk(
  'aiProjects/createDataUnderstanding',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/data-understanding`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create data understanding')
    }
  }
)

export const fetchDataUnderstanding = createAsyncThunk(
  'aiProjects/fetchDataUnderstanding',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/data-understanding/initiative/${initiativeId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch data understanding')
    }
  }
)

export const updateDataUnderstanding = createAsyncThunk(
  'aiProjects/updateDataUnderstanding',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/data-understanding/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update data understanding')
    }
  }
)

// ============================================================================
// ASYNC THUNKS - Data Preparation
// ============================================================================

export const createDataPreparation = createAsyncThunk(
  'aiProjects/createDataPreparation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/data-preparation`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create data preparation')
    }
  }
)

export const fetchDataPreparation = createAsyncThunk(
  'aiProjects/fetchDataPreparation',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/data-preparation/initiative/${initiativeId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch data preparation')
    }
  }
)

export const updateDataPreparation = createAsyncThunk(
  'aiProjects/updateDataPreparation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/data-preparation/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update data preparation')
    }
  }
)

// ============================================================================
// ASYNC THUNKS - Model Development
// ============================================================================

export const createModel = createAsyncThunk(
  'aiProjects/createModel',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/models`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create model')
    }
  }
)

export const fetchModels = createAsyncThunk(
  'aiProjects/fetchModels',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/models/initiative/${initiativeId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch models')
    }
  }
)

export const updateModel = createAsyncThunk(
  'aiProjects/updateModel',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/models/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update model')
    }
  }
)

export const startTraining = createAsyncThunk(
  'aiProjects/startTraining',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/models/${id}/start-training`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to start training')
    }
  }
)

export const completeTraining = createAsyncThunk(
  'aiProjects/completeTraining',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/models/${id}/complete-training`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to complete training')
    }
  }
)

// ============================================================================
// ASYNC THUNKS - Model Evaluation
// ============================================================================

export const createEvaluation = createAsyncThunk(
  'aiProjects/createEvaluation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/evaluations`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create evaluation')
    }
  }
)

export const fetchEvaluations = createAsyncThunk(
  'aiProjects/fetchEvaluations',
  async (modelId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/evaluations/model/${modelId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch evaluations')
    }
  }
)

export const updateEvaluation = createAsyncThunk(
  'aiProjects/updateEvaluation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/evaluations/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update evaluation')
    }
  }
)

export const approveForDeployment = createAsyncThunk(
  'aiProjects/approveForDeployment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/evaluations/${id}/approve`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to approve for deployment')
    }
  }
)

// ============================================================================
// ASYNC THUNKS - Model Deployment
// ============================================================================

export const createDeployment = createAsyncThunk(
  'aiProjects/createDeployment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/deployments`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create deployment')
    }
  }
)

export const fetchDeployments = createAsyncThunk(
  'aiProjects/fetchDeployments',
  async (modelId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/deployments/model/${modelId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch deployments')
    }
  }
)

export const updateDeployment = createAsyncThunk(
  'aiProjects/updateDeployment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/deployments/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update deployment')
    }
  }
)

export const deployModel = createAsyncThunk(
  'aiProjects/deployModel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/deployments/${id}/deploy`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to deploy model')
    }
  }
)

export const completeDeployment = createAsyncThunk(
  'aiProjects/completeDeployment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/deployments/${id}/complete`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to complete deployment')
    }
  }
)

export const rollbackDeployment = createAsyncThunk(
  'aiProjects/rollbackDeployment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/deployments/${id}/rollback`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to rollback deployment')
    }
  }
)

// ============================================================================
// ASYNC THUNKS - Model Monitoring
// ============================================================================

export const recordMonitoring = createAsyncThunk(
  'aiProjects/recordMonitoring',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/monitoring`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to record monitoring')
    }
  }
)

export const fetchMonitoring = createAsyncThunk(
  'aiProjects/fetchMonitoring',
  async (deploymentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/monitoring/deployment/${deploymentId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch monitoring')
    }
  }
)

export const fetchLatestMonitoring = createAsyncThunk(
  'aiProjects/fetchLatestMonitoring',
  async (deploymentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/monitoring/deployment/${deploymentId}/latest`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch latest monitoring')
    }
  }
)

// ============================================================================
// ASYNC THUNKS - AI Agent Capabilities
// ============================================================================

export const analyzeFeasibility = createAsyncThunk(
  'aiProjects/analyzeFeasibility',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/ai/analyze-feasibility`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to analyze feasibility')
    }
  }
)

export const assessQuality = createAsyncThunk(
  'aiProjects/assessQuality',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/ai/assess-quality`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to assess quality')
    }
  }
)

export const suggestHyperparameters = createAsyncThunk(
  'aiProjects/suggestHyperparameters',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/ai/suggest-hyperparameters`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to suggest hyperparameters')
    }
  }
)

export const interpretResults = createAsyncThunk(
  'aiProjects/interpretResults',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/ai/interpret-results`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to interpret results')
    }
  }
)

export const detectDrift = createAsyncThunk(
  'aiProjects/detectDrift',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/ai/detect-drift`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to detect drift')
    }
  }
)

export const recommendNextSteps = createAsyncThunk(
  'aiProjects/recommendNextSteps',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/ai/recommend-next-steps`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to recommend next steps')
    }
  }
)

export const analyzeDeploymentReadiness = createAsyncThunk(
  'aiProjects/analyzeDeploymentReadiness',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/ai/analyze-deployment-readiness`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to analyze deployment readiness')
    }
  }
)

// ============================================================================
// ASYNC THUNKS - Dashboard
// ============================================================================

export const fetchProjectOverview = createAsyncThunk(
  'aiProjects/fetchProjectOverview',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/dashboard/overview/${initiativeId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch project overview')
    }
  }
)

// ============================================================================
// SLICE
// ============================================================================

const aiProjectsSlice = createSlice({
  name: 'aiProjects',
  initialState: {
    // Business Understanding
    businessUnderstanding: null,
    
    // Data Understanding
    dataUnderstanding: [],
    
    // Data Preparation
    dataPreparation: [],
    
    // Model Development
    models: [],
    currentModel: null,
    
    // Model Evaluation
    evaluations: [],
    
    // Model Deployment
    deployments: [],
    
    // Model Monitoring
    monitoring: [],
    latestMonitoring: null,
    
    // AI Agent Results
    aiResults: {
      feasibility: null,
      quality: null,
      hyperparameters: null,
      interpretation: null,
      drift: null,
      nextSteps: null,
      deploymentReadiness: null,
    },
    
    // Dashboard
    projectOverview: null,
    
    // Loading states
    loading: false,
    aiLoading: false,
    
    // Error handling
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearAiResults: (state) => {
      state.aiResults = {
        feasibility: null,
        quality: null,
        hyperparameters: null,
        interpretation: null,
        drift: null,
        nextSteps: null,
        deploymentReadiness: null,
      }
    },
    setCurrentModel: (state, action) => {
      state.currentModel = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Business Understanding
      .addCase(createBusinessUnderstanding.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBusinessUnderstanding.fulfilled, (state, action) => {
        state.loading = false
        state.businessUnderstanding = action.payload
      })
      .addCase(createBusinessUnderstanding.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchBusinessUnderstanding.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchBusinessUnderstanding.fulfilled, (state, action) => {
        state.loading = false
        state.businessUnderstanding = action.payload
      })
      .addCase(fetchBusinessUnderstanding.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateBusinessUnderstanding.fulfilled, (state, action) => {
        state.businessUnderstanding = action.payload
      })
      .addCase(recordGoNoGoDecision.fulfilled, (state, action) => {
        state.businessUnderstanding = action.payload
      })
      
      // Data Understanding
      .addCase(createDataUnderstanding.fulfilled, (state, action) => {
        state.dataUnderstanding.push(action.payload)
      })
      .addCase(fetchDataUnderstanding.fulfilled, (state, action) => {
        state.dataUnderstanding = action.payload
      })
      .addCase(updateDataUnderstanding.fulfilled, (state, action) => {
        const index = state.dataUnderstanding.findIndex(d => d.id === action.payload.id)
        if (index !== -1) {
          state.dataUnderstanding[index] = action.payload
        }
      })
      
      // Data Preparation
      .addCase(createDataPreparation.fulfilled, (state, action) => {
        state.dataPreparation.push(action.payload)
      })
      .addCase(fetchDataPreparation.fulfilled, (state, action) => {
        state.dataPreparation = action.payload
      })
      .addCase(updateDataPreparation.fulfilled, (state, action) => {
        const index = state.dataPreparation.findIndex(d => d.id === action.payload.id)
        if (index !== -1) {
          state.dataPreparation[index] = action.payload
        }
      })
      
      // Model Development
      .addCase(createModel.fulfilled, (state, action) => {
        state.models.push(action.payload)
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.models = action.payload
      })
      .addCase(updateModel.fulfilled, (state, action) => {
        const index = state.models.findIndex(m => m.id === action.payload.id)
        if (index !== -1) {
          state.models[index] = action.payload
        }
        if (state.currentModel?.id === action.payload.id) {
          state.currentModel = action.payload
        }
      })
      .addCase(startTraining.fulfilled, (state, action) => {
        const index = state.models.findIndex(m => m.id === action.payload.id)
        if (index !== -1) {
          state.models[index] = action.payload
        }
      })
      .addCase(completeTraining.fulfilled, (state, action) => {
        const index = state.models.findIndex(m => m.id === action.payload.id)
        if (index !== -1) {
          state.models[index] = action.payload
        }
      })
      
      // Model Evaluation
      .addCase(createEvaluation.fulfilled, (state, action) => {
        state.evaluations.push(action.payload)
      })
      .addCase(fetchEvaluations.fulfilled, (state, action) => {
        state.evaluations = action.payload
      })
      .addCase(updateEvaluation.fulfilled, (state, action) => {
        const index = state.evaluations.findIndex(e => e.id === action.payload.id)
        if (index !== -1) {
          state.evaluations[index] = action.payload
        }
      })
      .addCase(approveForDeployment.fulfilled, (state, action) => {
        const index = state.evaluations.findIndex(e => e.id === action.payload.id)
        if (index !== -1) {
          state.evaluations[index] = action.payload
        }
      })
      
      // Model Deployment
      .addCase(createDeployment.fulfilled, (state, action) => {
        state.deployments.push(action.payload)
      })
      .addCase(fetchDeployments.fulfilled, (state, action) => {
        state.deployments = action.payload
      })
      .addCase(updateDeployment.fulfilled, (state, action) => {
        const index = state.deployments.findIndex(d => d.id === action.payload.id)
        if (index !== -1) {
          state.deployments[index] = action.payload
        }
      })
      .addCase(deployModel.fulfilled, (state, action) => {
        const index = state.deployments.findIndex(d => d.id === action.payload.id)
        if (index !== -1) {
          state.deployments[index] = action.payload
        }
      })
      .addCase(completeDeployment.fulfilled, (state, action) => {
        const index = state.deployments.findIndex(d => d.id === action.payload.id)
        if (index !== -1) {
          state.deployments[index] = action.payload
        }
      })
      .addCase(rollbackDeployment.fulfilled, (state, action) => {
        const index = state.deployments.findIndex(d => d.id === action.payload.id)
        if (index !== -1) {
          state.deployments[index] = action.payload
        }
      })
      
      // Model Monitoring
      .addCase(recordMonitoring.fulfilled, (state, action) => {
        state.monitoring.push(action.payload)
        state.latestMonitoring = action.payload
      })
      .addCase(fetchMonitoring.fulfilled, (state, action) => {
        state.monitoring = action.payload
      })
      .addCase(fetchLatestMonitoring.fulfilled, (state, action) => {
        state.latestMonitoring = action.payload
      })
      
      // AI Agent Capabilities
      .addCase(analyzeFeasibility.pending, (state) => {
        state.aiLoading = true
      })
      .addCase(analyzeFeasibility.fulfilled, (state, action) => {
        state.aiLoading = false
        state.aiResults.feasibility = action.payload
      })
      .addCase(analyzeFeasibility.rejected, (state, action) => {
        state.aiLoading = false
        state.error = action.payload
      })
      .addCase(assessQuality.pending, (state) => {
        state.aiLoading = true
      })
      .addCase(assessQuality.fulfilled, (state, action) => {
        state.aiLoading = false
        state.aiResults.quality = action.payload
      })
      .addCase(assessQuality.rejected, (state, action) => {
        state.aiLoading = false
        state.error = action.payload
      })
      .addCase(suggestHyperparameters.pending, (state) => {
        state.aiLoading = true
      })
      .addCase(suggestHyperparameters.fulfilled, (state, action) => {
        state.aiLoading = false
        state.aiResults.hyperparameters = action.payload
      })
      .addCase(suggestHyperparameters.rejected, (state, action) => {
        state.aiLoading = false
        state.error = action.payload
      })
      .addCase(interpretResults.pending, (state) => {
        state.aiLoading = true
      })
      .addCase(interpretResults.fulfilled, (state, action) => {
        state.aiLoading = false
        state.aiResults.interpretation = action.payload
      })
      .addCase(interpretResults.rejected, (state, action) => {
        state.aiLoading = false
        state.error = action.payload
      })
      .addCase(detectDrift.pending, (state) => {
        state.aiLoading = true
      })
      .addCase(detectDrift.fulfilled, (state, action) => {
        state.aiLoading = false
        state.aiResults.drift = action.payload
      })
      .addCase(detectDrift.rejected, (state, action) => {
        state.aiLoading = false
        state.error = action.payload
      })
      .addCase(recommendNextSteps.pending, (state) => {
        state.aiLoading = true
      })
      .addCase(recommendNextSteps.fulfilled, (state, action) => {
        state.aiLoading = false
        state.aiResults.nextSteps = action.payload
      })
      .addCase(recommendNextSteps.rejected, (state, action) => {
        state.aiLoading = false
        state.error = action.payload
      })
      .addCase(analyzeDeploymentReadiness.pending, (state) => {
        state.aiLoading = true
      })
      .addCase(analyzeDeploymentReadiness.fulfilled, (state, action) => {
        state.aiLoading = false
        state.aiResults.deploymentReadiness = action.payload
      })
      .addCase(analyzeDeploymentReadiness.rejected, (state, action) => {
        state.aiLoading = false
        state.error = action.payload
      })
      
      // Dashboard
      .addCase(fetchProjectOverview.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProjectOverview.fulfilled, (state, action) => {
        state.loading = false
        state.projectOverview = action.payload
      })
      .addCase(fetchProjectOverview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearAiResults, setCurrentModel } = aiProjectsSlice.actions
export default aiProjectsSlice.reducer
