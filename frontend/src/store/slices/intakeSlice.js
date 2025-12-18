import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Async thunks for intake operations
export const parseUnstructuredText = createAsyncThunk(
  'intake/parseText',
  async (text, { rejectWithValue }) => {
    try {
      const response = await axios.post('/intake/parse-text', { text });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to parse text');
    }
  }
);

export const validateIntakeData = createAsyncThunk(
  'intake/validate',
  async (initiativeData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/intake/validate', { initiative_data: initiativeData });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to validate data');
    }
  }
);

export const classifyUseCase = createAsyncThunk(
  'intake/classify',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/intake/classify', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to classify use case');
    }
  }
);

export const findSimilarInitiatives = createAsyncThunk(
  'intake/findSimilar',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/intake/similar', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to find similar initiatives');
    }
  }
);

export const getIntakeTemplates = createAsyncThunk(
  'intake/getTemplates',
  async ({ businessUnit, aiType } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (businessUnit) params.append('business_unit', businessUnit);
      if (aiType) params.append('ai_type', aiType);
      
      const response = await axios.get(`/intake/templates?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch templates');
    }
  }
);

export const createIntakeTemplate = createAsyncThunk(
  'intake/createTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/intake/templates', templateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create template');
    }
  }
);

export const updateIntakeTemplate = createAsyncThunk(
  'intake/updateTemplate',
  async ({ templateId, templateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/intake/templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update template');
    }
  }
);

export const deleteIntakeTemplate = createAsyncThunk(
  'intake/deleteTemplate',
  async (templateId, { rejectWithValue }) => {
    try {
      await axios.delete(`/intake/templates/${templateId}`);
      return templateId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete template');
    }
  }
);

const initialState = {
  templates: [],
  currentTemplate: null,
  parsedData: null,
  validationResults: null,
  classificationResults: null,
  similarInitiatives: [],
  loading: false,
  error: null,
  success: null
};

const intakeSlice = createSlice({
  name: 'intake',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearParsedData: (state) => {
      state.parsedData = null;
    },
    clearValidationResults: (state) => {
      state.validationResults = null;
    },
    clearClassificationResults: (state) => {
      state.classificationResults = null;
    },
    clearSimilarInitiatives: (state) => {
      state.similarInitiatives = [];
    },
    setCurrentTemplate: (state, action) => {
      state.currentTemplate = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Parse text
      .addCase(parseUnstructuredText.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(parseUnstructuredText.fulfilled, (state, action) => {
        state.loading = false;
        state.parsedData = action.payload.data;
        state.success = 'Text parsed successfully';
      })
      .addCase(parseUnstructuredText.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Validate data
      .addCase(validateIntakeData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateIntakeData.fulfilled, (state, action) => {
        state.loading = false;
        state.validationResults = action.payload;
        state.success = 'Validation completed';
      })
      .addCase(validateIntakeData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Classify use case
      .addCase(classifyUseCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(classifyUseCase.fulfilled, (state, action) => {
        state.loading = false;
        state.classificationResults = action.payload;
        state.success = 'Classification completed';
      })
      .addCase(classifyUseCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Find similar initiatives
      .addCase(findSimilarInitiatives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(findSimilarInitiatives.fulfilled, (state, action) => {
        state.loading = false;
        state.similarInitiatives = action.payload.similar_initiatives || [];
        state.success = action.payload.similar_initiatives?.length > 0 
          ? 'Similar initiatives found' 
          : 'No similar initiatives found';
      })
      .addCase(findSimilarInitiatives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get templates
      .addCase(getIntakeTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIntakeTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(getIntakeTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create template
      .addCase(createIntakeTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIntakeTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates.push(action.payload);
        state.success = 'Template created successfully';
      })
      .addCase(createIntakeTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update template
      .addCase(updateIntakeTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIntakeTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        state.success = 'Template updated successfully';
      })
      .addCase(updateIntakeTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete template
      .addCase(deleteIntakeTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIntakeTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = state.templates.filter(t => t.id !== action.payload);
        state.success = 'Template deleted successfully';
      })
      .addCase(deleteIntakeTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearSuccess,
  clearParsedData,
  clearValidationResults,
  clearClassificationResults,
  clearSimilarInitiatives,
  setCurrentTemplate
} = intakeSlice.actions;

export default intakeSlice.reducer;
