import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Async thunks for roadmap timeline operations
export const getRoadmapTimelines = createAsyncThunk(
  'roadmap/getRoadmapTimelines',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/roadmap/timelines');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch roadmap timelines');
    }
  }
);

export const getRoadmapTimeline = createAsyncThunk(
  'roadmap/getRoadmapTimeline',
  async (roadmapId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/roadmap/timelines/${roadmapId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch roadmap timeline');
    }
  }
);

export const createRoadmapTimeline = createAsyncThunk(
  'roadmap/createRoadmapTimeline',
  async (roadmapData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/roadmap/timelines', roadmapData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create roadmap timeline');
    }
  }
);

export const updateRoadmapTimeline = createAsyncThunk(
  'roadmap/updateRoadmapTimeline',
  async ({ roadmapId, roadmapData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/roadmap/timelines/${roadmapId}`, roadmapData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update roadmap timeline');
    }
  }
);

export const deleteRoadmapTimeline = createAsyncThunk(
  'roadmap/deleteRoadmapTimeline',
  async (roadmapId, { rejectWithValue }) => {
    try {
      await axios.delete(`/roadmap/timelines/${roadmapId}`);
      return roadmapId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete roadmap timeline');
    }
  }
);

// Async thunks for dependency operations
export const getDependencyGraph = createAsyncThunk(
  'roadmap/getDependencyGraph',
  async (roadmapId = null, { rejectWithValue }) => {
    try {
      const url = roadmapId ? `/roadmap/dependencies/graph?roadmap_id=${roadmapId}` : '/roadmap/dependencies/graph';
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch dependency graph');
    }
  }
);

export const createDependency = createAsyncThunk(
  'roadmap/createDependency',
  async (dependencyData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/roadmap/dependencies', dependencyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create dependency');
    }
  }
);

export const updateDependency = createAsyncThunk(
  'roadmap/updateDependency',
  async ({ dependencyId, dependencyData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/roadmap/dependencies/${dependencyId}`, dependencyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update dependency');
    }
  }
);

export const deleteDependency = createAsyncThunk(
  'roadmap/deleteDependency',
  async (dependencyId, { rejectWithValue }) => {
    try {
      await axios.delete(`/roadmap/dependencies/${dependencyId}`);
      return dependencyId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete dependency');
    }
  }
);

// Async thunks for resource allocation operations
export const getResourceAllocations = createAsyncThunk(
  'roadmap/getResourceAllocations',
  async (initiativeId = null, { rejectWithValue }) => {
    try {
      const url = initiativeId ? `/roadmap/resources?initiative_id=${initiativeId}` : '/roadmap/resources';
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch resource allocations');
    }
  }
);

export const getCapacityOverview = createAsyncThunk(
  'roadmap/getCapacityOverview',
  async (resourceType = null, { rejectWithValue }) => {
    try {
      const url = resourceType ? `/roadmap/resources/capacity?resource_type=${resourceType}` : '/roadmap/resources/capacity';
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch capacity overview');
    }
  }
);

export const createResourceAllocation = createAsyncThunk(
  'roadmap/createResourceAllocation',
  async (allocationData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/roadmap/resources', allocationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create resource allocation');
    }
  }
);

export const updateResourceAllocation = createAsyncThunk(
  'roadmap/updateResourceAllocation',
  async ({ allocationId, allocationData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/roadmap/resources/${allocationId}`, allocationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update resource allocation');
    }
  }
);

export const deleteResourceAllocation = createAsyncThunk(
  'roadmap/deleteResourceAllocation',
  async (allocationId, { rejectWithValue }) => {
    try {
      await axios.delete(`/roadmap/resources/${allocationId}`);
      return allocationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete resource allocation');
    }
  }
);

// Async thunks for stage gate operations
export const getInitiativeStageGates = createAsyncThunk(
  'roadmap/getInitiativeStageGates',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/roadmap/stage-gates/initiative/${initiativeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch stage gates');
    }
  }
);

export const updateStageGate = createAsyncThunk(
  'roadmap/updateStageGate',
  async ({ stageGateId, stageGateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/roadmap/stage-gates/${stageGateId}`, stageGateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update stage gate');
    }
  }
);

export const initializeStageGates = createAsyncThunk(
  'roadmap/initializeStageGates',
  async (initiativeId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/roadmap/stage-gates/initialize/${initiativeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to initialize stage gates');
    }
  }
);

// Async thunks for AI Roadmap Co-Pilot operations
export const suggestInitiativeSequencing = createAsyncThunk(
  'roadmap/suggestInitiativeSequencing',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/roadmap/ai/suggest-sequencing', requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to suggest initiative sequencing');
    }
  }
);

export const detectRoadmapBottlenecks = createAsyncThunk(
  'roadmap/detectRoadmapBottlenecks',
  async (roadmapId = null, { rejectWithValue }) => {
    try {
      const url = roadmapId ? `/roadmap/ai/detect-bottlenecks?roadmap_id=${roadmapId}` : '/roadmap/ai/detect-bottlenecks';
      const response = await axios.post(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to detect bottlenecks');
    }
  }
);

export const validateTimelineFeasibility = createAsyncThunk(
  'roadmap/validateTimelineFeasibility',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/roadmap/ai/validate-timeline', requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to validate timeline feasibility');
    }
  }
);

export const recommendDependencyResolution = createAsyncThunk(
  'roadmap/recommendDependencyResolution',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/roadmap/ai/resolve-dependency', requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to recommend dependency resolution');
    }
  }
);

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState: {
    timelines: [],
    currentTimeline: null,
    dependencyGraph: null,
    resourceAllocations: [],
    capacityOverview: [],
    stageGates: [],
    aiSequencing: null,
    aiBottlenecks: null,
    aiTimelineFeasibility: null,
    aiDependencyResolution: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAiResults: (state) => {
      state.aiSequencing = null;
      state.aiBottlenecks = null;
      state.aiTimelineFeasibility = null;
      state.aiDependencyResolution = null;
    },
  },
  extraReducers: (builder) => {
    // Roadmap timeline reducers
    builder
      .addCase(getRoadmapTimelines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoadmapTimelines.fulfilled, (state, action) => {
        state.loading = false;
        state.timelines = action.payload;
      })
      .addCase(getRoadmapTimelines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRoadmapTimeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoadmapTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTimeline = action.payload;
      })
      .addCase(getRoadmapTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRoadmapTimeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoadmapTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.timelines.push(action.payload);
        state.currentTimeline = action.payload;
      })
      .addCase(createRoadmapTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateRoadmapTimeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoadmapTimeline.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.timelines.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.timelines[index] = action.payload;
        }
        if (state.currentTimeline?.id === action.payload.id) {
          state.currentTimeline = action.payload;
        }
      })
      .addCase(updateRoadmapTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteRoadmapTimeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoadmapTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.timelines = state.timelines.filter(t => t.id !== action.payload);
        if (state.currentTimeline?.id === action.payload) {
          state.currentTimeline = null;
        }
      })
      .addCase(deleteRoadmapTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Dependency graph reducers
    builder
      .addCase(getDependencyGraph.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDependencyGraph.fulfilled, (state, action) => {
        state.loading = false;
        state.dependencyGraph = action.payload;
      })
      .addCase(getDependencyGraph.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDependency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDependency.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createDependency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDependency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDependency.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateDependency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDependency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDependency.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteDependency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Resource allocation reducers
    builder
      .addCase(getResourceAllocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getResourceAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.resourceAllocations = action.payload;
      })
      .addCase(getResourceAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCapacityOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCapacityOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.capacityOverview = action.payload;
      })
      .addCase(getCapacityOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createResourceAllocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResourceAllocation.fulfilled, (state, action) => {
        state.loading = false;
        state.resourceAllocations.push(action.payload);
      })
      .addCase(createResourceAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateResourceAllocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResourceAllocation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.resourceAllocations.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.resourceAllocations[index] = action.payload;
        }
      })
      .addCase(updateResourceAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteResourceAllocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResourceAllocation.fulfilled, (state, action) => {
        state.loading = false;
        state.resourceAllocations = state.resourceAllocations.filter(r => r.id !== action.payload);
      })
      .addCase(deleteResourceAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Stage gate reducers
    builder
      .addCase(getInitiativeStageGates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInitiativeStageGates.fulfilled, (state, action) => {
        state.loading = false;
        state.stageGates = action.payload;
      })
      .addCase(getInitiativeStageGates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStageGate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStageGate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stageGates.findIndex(sg => sg.id === action.payload.id);
        if (index !== -1) {
          state.stageGates[index] = action.payload;
        }
      })
      .addCase(updateStageGate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(initializeStageGates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeStageGates.fulfilled, (state, action) => {
        state.loading = false;
        state.stageGates = action.payload;
      })
      .addCase(initializeStageGates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // AI Roadmap Co-Pilot reducers
    builder
      .addCase(suggestInitiativeSequencing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(suggestInitiativeSequencing.fulfilled, (state, action) => {
        state.loading = false;
        state.aiSequencing = action.payload;
      })
      .addCase(suggestInitiativeSequencing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(detectRoadmapBottlenecks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(detectRoadmapBottlenecks.fulfilled, (state, action) => {
        state.loading = false;
        state.aiBottlenecks = action.payload;
      })
      .addCase(detectRoadmapBottlenecks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(validateTimelineFeasibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateTimelineFeasibility.fulfilled, (state, action) => {
        state.loading = false;
        state.aiTimelineFeasibility = action.payload;
      })
      .addCase(validateTimelineFeasibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(recommendDependencyResolution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recommendDependencyResolution.fulfilled, (state, action) => {
        state.loading = false;
        state.aiDependencyResolution = action.payload;
      })
      .addCase(recommendDependencyResolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAiResults } = roadmapSlice.actions;
export default roadmapSlice.reducer;
