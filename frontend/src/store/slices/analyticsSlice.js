import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../api/axios'

const API_URL = '/analytics'

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'analytics/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/dashboard`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch dashboard data')
    }
  }
)

export const fetchPortfolioSummary = createAsyncThunk(
  'analytics/fetchPortfolioSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/portfolio-summary`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch portfolio summary')
    }
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    dashboardData: null,
    portfolioSummary: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardData = action.payload
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Portfolio summary
      .addCase(fetchPortfolioSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPortfolioSummary.fulfilled, (state, action) => {
        state.loading = false
        state.portfolioSummary = action.payload
      })
      .addCase(fetchPortfolioSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = analyticsSlice.actions
export default analyticsSlice.reducer
