import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  createResearchJobFromSuggestion,
  fetchResearchSuggestions,
} from "./researchApi"
import type {
  CreateResearchJobFromSuggestionRequest,
  ResearchJob,
  ResearchJobEvent,
  ResearchSuggestion,
  ResearchSuggestionRequest,
} from "./types"

type RequestStatus = "idle" | "loading" | "succeeded" | "failed"

type ResearchState = {
  topic: string
  suggestionBatchId: string | null
  suggestions: ResearchSuggestion[]
  selectedSuggestion: ResearchSuggestion | null
  suggestionsStatus: RequestStatus
  jobStatus: RequestStatus
  job: ResearchJob | null
  events: ResearchJobEvent[]
  error: string | null
}

const initialState: ResearchState = {
  topic: "",
  suggestionBatchId: null,
  suggestions: [],
  selectedSuggestion: null,
  suggestionsStatus: "idle",
  jobStatus: "idle",
  job: null,
  events: [],
  error: null,
}

export const requestResearchSuggestions = createAsyncThunk(
  "research/requestSuggestions",
  async (payload: ResearchSuggestionRequest) => fetchResearchSuggestions(payload),
)

export const startResearchJobFromSuggestion = createAsyncThunk(
  "research/startJobFromSuggestion",
  async (payload: CreateResearchJobFromSuggestionRequest) =>
    createResearchJobFromSuggestion(payload),
)

const researchSlice = createSlice({
  name: "research",
  initialState,
  reducers: {
    topicChanged(state, action: { payload: string }) {
      state.topic = action.payload
    },
    suggestionSelected(state, action: { payload: ResearchSuggestion }) {
      state.selectedSuggestion = action.payload
      state.error = null
    },
    jobEventReceived(state, action: { payload: ResearchJobEvent }) {
      const incomingId = action.payload.id
      if (incomingId && state.events.some((event) => event.id === incomingId)) {
        return
      }

      state.events.push(action.payload)
    },
    resetResearchState() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestResearchSuggestions.pending, (state, action) => {
        state.topic = action.meta.arg.topic
        state.suggestionsStatus = "loading"
        state.error = null
        state.selectedSuggestion = null
        state.job = null
        state.events = []
      })
      .addCase(requestResearchSuggestions.fulfilled, (state, action) => {
        state.suggestionsStatus = "succeeded"
        state.suggestionBatchId = action.payload.suggestion_batch_id
        state.suggestions = action.payload.suggestions
      })
      .addCase(requestResearchSuggestions.rejected, (state, action) => {
        state.suggestionsStatus = "failed"
        state.error = action.error.message ?? "Unable to fetch suggestions"
      })
      .addCase(startResearchJobFromSuggestion.pending, (state) => {
        state.jobStatus = "loading"
        state.error = null
      })
      .addCase(startResearchJobFromSuggestion.fulfilled, (state, action) => {
        state.jobStatus = "succeeded"
        state.job = action.payload
        state.events = []
      })
      .addCase(startResearchJobFromSuggestion.rejected, (state, action) => {
        state.jobStatus = "failed"
        state.error = action.error.message ?? "Unable to start research job"
      })
  },
})

export const {
  jobEventReceived,
  resetResearchState,
  suggestionSelected,
  topicChanged,
} = researchSlice.actions

export default researchSlice.reducer
