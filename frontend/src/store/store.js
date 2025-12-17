import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import initiativesReducer from './slices/initiativesSlice'
import analyticsReducer from './slices/analyticsSlice'
import intakeReducer from './slices/intakeSlice'
import scoringReducer from './slices/scoringSlice'
import portfolioReducer from './slices/portfolioSlice'
import roadmapReducer from './slices/roadmapSlice'
import governanceReducer from './slices/governanceSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    initiatives: initiativesReducer,
    analytics: analyticsReducer,
    intake: intakeReducer,
    scoring: scoringReducer,
    portfolio: portfolioReducer,
    roadmap: roadmapReducer,
    governance: governanceReducer,
  },
})

export default store
