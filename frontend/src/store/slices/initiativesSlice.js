import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axios'

const API_URL = '/initiatives/'

// Async thunks
export const fetchInitiatives = createAsyncThunk(
  'initiatives/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_URL)
      return response.data
    } catch (error) {
      // Prefer server-provided message; fall back to network error message.
      return rejectWithValue(
        error.response?.data?.detail || error.message || 'Failed to fetch initiatives'
      )
    }
  }
)

export const createInitiative = createAsyncThunk(
  'initiatives/create',
  async (initiativeData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_URL, initiativeData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create initiative')
    }
  }
)

export const updateInitiative = createAsyncThunk(
  'initiatives/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update initiative')
    }
  }
)

export const deleteInitiative = createAsyncThunk(
  'initiatives/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_URL}/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete initiative')
    }
  }
)

export const analyzeRisks = createAsyncThunk(
  'initiatives/analyzeRisks',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/${id}/analyze-risks`, {})
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to analyze risks')
    }
  }
)

const initiativesSlice = createSlice({
  name: 'initiatives',
  initialState: {
    items: [],
    selectedInitiative: null,
    loading: false,
    error: null,
    riskAnalysis: null,
  },
  reducers: {
    selectInitiative: (state, action) => {
      state.selectedInitiative = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch initiatives
      .addCase(fetchInitiatives.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInitiatives.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchInitiatives.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create initiative
      .addCase(createInitiative.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      // Update initiative
      .addCase(updateInitiative.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // Delete initiative
      .addCase(deleteInitiative.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      // Analyze risks
      .addCase(analyzeRisks.fulfilled, (state, action) => {
        state.riskAnalysis = action.payload
      })
  },
})

export const { selectInitiative, clearError } = initiativesSlice.actions

// Export fetchInitiatives as getInitiatives for backward compatibility
export const getInitiatives = fetchInitiatives

export default initiativesSlice.reducer
