import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import initiativesReducer from './slices/initiativesSlice'
import analyticsReducer from './slices/analyticsSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    initiatives: initiativesReducer,
    analytics: analyticsReducer,
  },
})

export default store
