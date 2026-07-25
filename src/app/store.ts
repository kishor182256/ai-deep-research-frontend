import { configureStore } from "@reduxjs/toolkit"
import researchReducer from "../features/research/researchSlice"

export const store = configureStore({
  reducer: {
    research: researchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["research/jobEventReceived"],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
