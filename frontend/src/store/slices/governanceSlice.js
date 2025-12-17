import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// ============================================================================
// Async Thunks - Governance Workflows
// ============================================================================

export const initializeWorkflow = createAsyncThunk(
  'governance/initializeWorkflow',
  async ({ initiativeId, riskTier }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/governance/workflows/initialize', {
        initiative_id: initiativeId,
        risk_tier: riskTier
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to initialize workflow');
    }
  }
);

export const getWorkflowByInitiative = createAsyncThunk(
  'governance/getWorkflowByInitiative',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/governance/workflows/initiative/${initiativeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch workflow');
    }
  }
);

export const getWorkflow = createAsyncThunk(
  'governance/getWorkflow',
  async (workflowId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/governance/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch workflow');
    }
  }
);

export const updateWorkflow = createAsyncThunk(
  'governance/updateWorkflow',
  async ({ workflowId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/governance/workflows/${workflowId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update workflow');
    }
  }
);

export const advanceWorkflow = createAsyncThunk(
  'governance/advanceWorkflow',
  async (workflowId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/governance/workflows/${workflowId}/advance`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to advance workflow');
    }
  }
);

// ============================================================================
// Async Thunks - Workflow Stages
// ============================================================================

export const getWorkflowStages = createAsyncThunk(
  'governance/getWorkflowStages',
  async (workflowId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/governance/workflows/${workflowId}/stages`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch stages');
    }
  }
);

export const updateStage = createAsyncThunk(
  'governance/updateStage',
  async ({ stageId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/governance/stages/${stageId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update stage');
    }
  }
);

// ============================================================================
// Async Thunks - Approvals
// ============================================================================

export const createApproval = createAsyncThunk(
  'governance/createApproval',
  async (approvalData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/governance/approvals', approvalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create approval');
    }
  }
);

export const submitApproval = createAsyncThunk(
  'governance/submitApproval',
  async ({ approvalId, decision, comments, conditions, requestedChanges }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/governance/approvals/${approvalId}/submit`, null, {
        params: {
          decision,
          comments,
          conditions,
          requested_changes: requestedChanges
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to submit approval');
    }
  }
);

export const getStageApprovals = createAsyncThunk(
  'governance/getStageApprovals',
  async (stageId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/governance/stages/${stageId}/approvals`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch approvals');
    }
  }
);

// ============================================================================
// Async Thunks - Evidence Documents
// ============================================================================

export const createEvidence = createAsyncThunk(
  'governance/createEvidence',
  async (evidenceData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/governance/evidence', evidenceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create evidence');
    }
  }
);

export const getInitiativeEvidence = createAsyncThunk(
  'governance/getInitiativeEvidence',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/governance/evidence/initiative/${initiativeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch evidence');
    }
  }
);

export const updateEvidence = createAsyncThunk(
  'governance/updateEvidence',
  async ({ evidenceId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/governance/evidence/${evidenceId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update evidence');
    }
  }
);

export const deleteEvidence = createAsyncThunk(
  'governance/deleteEvidence',
  async (evidenceId, { rejectWithValue }) => {
    try {
      await axios.delete(`/governance/evidence/${evidenceId}`);
      return evidenceId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete evidence');
    }
  }
);

// ============================================================================
// Async Thunks - Risk Mitigations
// ============================================================================

export const createMitigation = createAsyncThunk(
  'governance/createMitigation',
  async ({ riskId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/governance/risks/${riskId}/mitigations`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create mitigation');
    }
  }
);

export const getRiskMitigations = createAsyncThunk(
  'governance/getRiskMitigations',
  async (riskId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/governance/risks/${riskId}/mitigations`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch mitigations');
    }
  }
);

export const updateMitigation = createAsyncThunk(
  'governance/updateMitigation',
  async ({ mitigationId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/governance/mitigations/${mitigationId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update mitigation');
    }
  }
);

// ============================================================================
// Async Thunks - Policies
// ============================================================================

export const createPolicy = createAsyncThunk(
  'governance/createPolicy',
  async (policyData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/governance/policies', policyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create policy');
    }
  }
);

export const getPolicies = createAsyncThunk(
  'governance/getPolicies',
  async ({ policyType, status } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (policyType) params.policy_type = policyType;
      if (status) params.status = status;
      const response = await axios.get('/governance/policies', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch policies');
    }
  }
);

export const getPolicy = createAsyncThunk(
  'governance/getPolicy',
  async (policyId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/governance/policies/${policyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch policy');
    }
  }
);

export const updatePolicy = createAsyncThunk(
  'governance/updatePolicy',
  async ({ policyId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/governance/policies/${policyId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update policy');
    }
  }
);

export const deletePolicy = createAsyncThunk(
  'governance/deletePolicy',
  async (policyId, { rejectWithValue }) => {
    try {
      await axios.delete(`/governance/policies/${policyId}`);
      return policyId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete policy');
    }
  }
);

// ============================================================================
// Async Thunks - Compliance Requirements
// ============================================================================

export const createComplianceRequirement = createAsyncThunk(
  'governance/createComplianceRequirement',
  async (requirementData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/governance/compliance', requirementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create requirement');
    }
  }
);

export const getComplianceRequirements = createAsyncThunk(
  'governance/getComplianceRequirements',
  async (regulation, { rejectWithValue }) => {
    try {
      const params = regulation ? { regulation } : {};
      const response = await axios.get('/governance/compliance', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch requirements');
    }
  }
);

export const updateComplianceRequirement = createAsyncThunk(
  'governance/updateComplianceRequirement',
  async ({ requirementId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/governance/compliance/${requirementId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update requirement');
    }
  }
);

// ============================================================================
// Async Thunks - AI Agents
// ============================================================================

export const checkCompliance = createAsyncThunk(
  'governance/checkCompliance',
  async ({ initiativeId, checkType }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/governance/ai/compliance/check', {
        initiative_id: initiativeId,
        check_type: checkType || 'completeness'
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to check compliance');
    }
  }
);

export const mapRegulations = createAsyncThunk(
  'governance/mapRegulations',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/governance/ai/compliance/map-regulations', null, {
        params: { initiative_id: initiativeId }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to map regulations');
    }
  }
);

export const draftRiskStatement = createAsyncThunk(
  'governance/draftRiskStatement',
  async ({ initiativeId, initiativeDescription, aiType, dataSources }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/governance/ai/risk/draft-statement', {
        initiative_id: initiativeId,
        initiative_description: initiativeDescription,
        ai_type: aiType,
        data_sources: dataSources
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to draft risk statement');
    }
  }
);

export const recommendRiskControls = createAsyncThunk(
  'governance/recommendRiskControls',
  async (riskId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/governance/ai/risk/recommend-controls', null, {
        params: { risk_id: riskId }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to recommend controls');
    }
  }
);

export const generateModelCard = createAsyncThunk(
  'governance/generateModelCard',
  async ({ initiativeId, modelName, modelType }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/governance/ai/model-card/generate', {
        initiative_id: initiativeId,
        model_name: modelName,
        model_type: modelType
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate model card');
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const governanceSlice = createSlice({
  name: 'governance',
  initialState: {
    // Workflows
    currentWorkflow: null,
    workflows: [],
    workflowStages: [],
    
    // Approvals
    approvals: [],
    
    // Evidence
    evidenceDocuments: [],
    
    // Risk Mitigations
    mitigations: [],
    
    // Policies
    policies: [],
    currentPolicy: null,
    
    // Compliance
    complianceRequirements: [],
    
    // AI Agent Results
    complianceCheck: null,
    regulationMapping: null,
    riskStatement: null,
    riskControls: null,
    modelCard: null,
    
    // Loading states
    loading: false,
    workflowLoading: false,
    stagesLoading: false,
    approvalsLoading: false,
    evidenceLoading: false,
    mitigationsLoading: false,
    policiesLoading: false,
    complianceLoading: false,
    aiLoading: false,
    
    // Error states
    error: null,
    workflowError: null,
    stagesError: null,
    approvalsError: null,
    evidenceError: null,
    mitigationsError: null,
    policiesError: null,
    complianceError: null,
    aiError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.workflowError = null;
      state.stagesError = null;
      state.approvalsError = null;
      state.evidenceError = null;
      state.mitigationsError = null;
      state.policiesError = null;
      state.complianceError = null;
      state.aiError = null;
    },
    clearAIResults: (state) => {
      state.complianceCheck = null;
      state.regulationMapping = null;
      state.riskStatement = null;
      state.riskControls = null;
      state.modelCard = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize Workflow
    builder
      .addCase(initializeWorkflow.pending, (state) => {
        state.workflowLoading = true;
        state.workflowError = null;
      })
      .addCase(initializeWorkflow.fulfilled, (state, action) => {
        state.workflowLoading = false;
        state.currentWorkflow = action.payload;
      })
      .addCase(initializeWorkflow.rejected, (state, action) => {
        state.workflowLoading = false;
        state.workflowError = action.payload;
      });

    // Get Workflow by Initiative
    builder
      .addCase(getWorkflowByInitiative.pending, (state) => {
        state.workflowLoading = true;
        state.workflowError = null;
      })
      .addCase(getWorkflowByInitiative.fulfilled, (state, action) => {
        state.workflowLoading = false;
        state.currentWorkflow = action.payload;
      })
      .addCase(getWorkflowByInitiative.rejected, (state, action) => {
        state.workflowLoading = false;
        state.workflowError = action.payload;
      });

    // Get Workflow
    builder
      .addCase(getWorkflow.pending, (state) => {
        state.workflowLoading = true;
        state.workflowError = null;
      })
      .addCase(getWorkflow.fulfilled, (state, action) => {
        state.workflowLoading = false;
        state.currentWorkflow = action.payload;
      })
      .addCase(getWorkflow.rejected, (state, action) => {
        state.workflowLoading = false;
        state.workflowError = action.payload;
      });

    // Update Workflow
    builder
      .addCase(updateWorkflow.pending, (state) => {
        state.workflowLoading = true;
        state.workflowError = null;
      })
      .addCase(updateWorkflow.fulfilled, (state, action) => {
        state.workflowLoading = false;
        state.currentWorkflow = action.payload;
      })
      .addCase(updateWorkflow.rejected, (state, action) => {
        state.workflowLoading = false;
        state.workflowError = action.payload;
      });

    // Advance Workflow
    builder
      .addCase(advanceWorkflow.pending, (state) => {
        state.workflowLoading = true;
        state.workflowError = null;
      })
      .addCase(advanceWorkflow.fulfilled, (state, action) => {
        state.workflowLoading = false;
        state.currentWorkflow = action.payload;
      })
      .addCase(advanceWorkflow.rejected, (state, action) => {
        state.workflowLoading = false;
        state.workflowError = action.payload;
      });

    // Get Workflow Stages
    builder
      .addCase(getWorkflowStages.pending, (state) => {
        state.stagesLoading = true;
        state.stagesError = null;
      })
      .addCase(getWorkflowStages.fulfilled, (state, action) => {
        state.stagesLoading = false;
        state.workflowStages = action.payload;
      })
      .addCase(getWorkflowStages.rejected, (state, action) => {
        state.stagesLoading = false;
        state.stagesError = action.payload;
      });

    // Update Stage
    builder
      .addCase(updateStage.pending, (state) => {
        state.stagesLoading = true;
        state.stagesError = null;
      })
      .addCase(updateStage.fulfilled, (state, action) => {
        state.stagesLoading = false;
        const index = state.workflowStages.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.workflowStages[index] = action.payload;
        }
      })
      .addCase(updateStage.rejected, (state, action) => {
        state.stagesLoading = false;
        state.stagesError = action.payload;
      });

    // Create Approval
    builder
      .addCase(createApproval.pending, (state) => {
        state.approvalsLoading = true;
        state.approvalsError = null;
      })
      .addCase(createApproval.fulfilled, (state, action) => {
        state.approvalsLoading = false;
        state.approvals.push(action.payload);
      })
      .addCase(createApproval.rejected, (state, action) => {
        state.approvalsLoading = false;
        state.approvalsError = action.payload;
      });

    // Submit Approval
    builder
      .addCase(submitApproval.pending, (state) => {
        state.approvalsLoading = true;
        state.approvalsError = null;
      })
      .addCase(submitApproval.fulfilled, (state, action) => {
        state.approvalsLoading = false;
        const index = state.approvals.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.approvals[index] = action.payload;
        }
      })
      .addCase(submitApproval.rejected, (state, action) => {
        state.approvalsLoading = false;
        state.approvalsError = action.payload;
      });

    // Get Stage Approvals
    builder
      .addCase(getStageApprovals.pending, (state) => {
        state.approvalsLoading = true;
        state.approvalsError = null;
      })
      .addCase(getStageApprovals.fulfilled, (state, action) => {
        state.approvalsLoading = false;
        state.approvals = action.payload;
      })
      .addCase(getStageApprovals.rejected, (state, action) => {
        state.approvalsLoading = false;
        state.approvalsError = action.payload;
      });

    // Evidence Documents
    builder
      .addCase(createEvidence.fulfilled, (state, action) => {
        state.evidenceDocuments.push(action.payload);
      })
      .addCase(getInitiativeEvidence.pending, (state) => {
        state.evidenceLoading = true;
      })
      .addCase(getInitiativeEvidence.fulfilled, (state, action) => {
        state.evidenceLoading = false;
        state.evidenceDocuments = action.payload;
      })
      .addCase(getInitiativeEvidence.rejected, (state, action) => {
        state.evidenceLoading = false;
        state.evidenceError = action.payload;
      })
      .addCase(updateEvidence.fulfilled, (state, action) => {
        const index = state.evidenceDocuments.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.evidenceDocuments[index] = action.payload;
        }
      })
      .addCase(deleteEvidence.fulfilled, (state, action) => {
        state.evidenceDocuments = state.evidenceDocuments.filter(e => e.id !== action.payload);
      });

    // Risk Mitigations
    builder
      .addCase(createMitigation.fulfilled, (state, action) => {
        state.mitigations.push(action.payload);
      })
      .addCase(getRiskMitigations.pending, (state) => {
        state.mitigationsLoading = true;
      })
      .addCase(getRiskMitigations.fulfilled, (state, action) => {
        state.mitigationsLoading = false;
        state.mitigations = action.payload;
      })
      .addCase(getRiskMitigations.rejected, (state, action) => {
        state.mitigationsLoading = false;
        state.mitigationsError = action.payload;
      })
      .addCase(updateMitigation.fulfilled, (state, action) => {
        const index = state.mitigations.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.mitigations[index] = action.payload;
        }
      });

    // Policies
    builder
      .addCase(createPolicy.fulfilled, (state, action) => {
        state.policies.push(action.payload);
      })
      .addCase(getPolicies.pending, (state) => {
        state.policiesLoading = true;
      })
      .addCase(getPolicies.fulfilled, (state, action) => {
        state.policiesLoading = false;
        state.policies = action.payload;
      })
      .addCase(getPolicies.rejected, (state, action) => {
        state.policiesLoading = false;
        state.policiesError = action.payload;
      })
      .addCase(getPolicy.fulfilled, (state, action) => {
        state.currentPolicy = action.payload;
      })
      .addCase(updatePolicy.fulfilled, (state, action) => {
        const index = state.policies.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.policies[index] = action.payload;
        }
        if (state.currentPolicy?.id === action.payload.id) {
          state.currentPolicy = action.payload;
        }
      })
      .addCase(deletePolicy.fulfilled, (state, action) => {
        state.policies = state.policies.filter(p => p.id !== action.payload);
      });

    // Compliance Requirements
    builder
      .addCase(createComplianceRequirement.fulfilled, (state, action) => {
        state.complianceRequirements.push(action.payload);
      })
      .addCase(getComplianceRequirements.pending, (state) => {
        state.complianceLoading = true;
      })
      .addCase(getComplianceRequirements.fulfilled, (state, action) => {
        state.complianceLoading = false;
        state.complianceRequirements = action.payload;
      })
      .addCase(getComplianceRequirements.rejected, (state, action) => {
        state.complianceLoading = false;
        state.complianceError = action.payload;
      })
      .addCase(updateComplianceRequirement.fulfilled, (state, action) => {
        const index = state.complianceRequirements.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.complianceRequirements[index] = action.payload;
        }
      });

    // AI Agents
    builder
      .addCase(checkCompliance.pending, (state) => {
        state.aiLoading = true;
        state.aiError = null;
      })
      .addCase(checkCompliance.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.complianceCheck = action.payload;
      })
      .addCase(checkCompliance.rejected, (state, action) => {
        state.aiLoading = false;
        state.aiError = action.payload;
      })
      .addCase(mapRegulations.pending, (state) => {
        state.aiLoading = true;
        state.aiError = null;
      })
      .addCase(mapRegulations.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.regulationMapping = action.payload;
      })
      .addCase(mapRegulations.rejected, (state, action) => {
        state.aiLoading = false;
        state.aiError = action.payload;
      })
      .addCase(draftRiskStatement.pending, (state) => {
        state.aiLoading = true;
        state.aiError = null;
      })
      .addCase(draftRiskStatement.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.riskStatement = action.payload;
      })
      .addCase(draftRiskStatement.rejected, (state, action) => {
        state.aiLoading = false;
        state.aiError = action.payload;
      })
      .addCase(recommendRiskControls.pending, (state) => {
        state.aiLoading = true;
        state.aiError = null;
      })
      .addCase(recommendRiskControls.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.riskControls = action.payload;
      })
      .addCase(recommendRiskControls.rejected, (state, action) => {
        state.aiLoading = false;
        state.aiError = action.payload;
      })
      .addCase(generateModelCard.pending, (state) => {
        state.aiLoading = true;
        state.aiError = null;
      })
      .addCase(generateModelCard.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.modelCard = action.payload;
      })
      .addCase(generateModelCard.rejected, (state, action) => {
        state.aiLoading = false;
        state.aiError = action.payload;
      });
  },
});

export const { clearError, clearAIResults } = governanceSlice.actions;
export default governanceSlice.reducer;
