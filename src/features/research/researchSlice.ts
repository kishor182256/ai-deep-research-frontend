import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  createResearchJobFromSuggestion,
  fetchResearchEvidence,
  fetchResearchJob,
  fetchResearchReport,
  fetchResearchSources,
  fetchResearchSuggestions,
  fetchResearchVerification,
  regenerateResearchReport,
} from "./researchApi"
import type {
  CreateResearchJobFromSuggestionRequest,
  ResearchEvidenceChunk,
  ResearchJob,
  ResearchJobEvent,
  ResearchReport,
  ResearchSource,
  ResearchSuggestion,
  ResearchSuggestionRequest,
  ResearchVerification,
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
  sources: ResearchSource[]
  sourcesStatus: RequestStatus
  evidence: ResearchEvidenceChunk[]
  evidenceStatus: RequestStatus
  report: ResearchReport | null
  reportStatus: RequestStatus
  verification: ResearchVerification | null
  verificationStatus: RequestStatus
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
  sources: [],
  sourcesStatus: "idle",
  evidence: [],
  evidenceStatus: "idle",
  report: null,
  reportStatus: "idle",
  verification: null,
  verificationStatus: "idle",
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

export const refreshResearchJob = createAsyncThunk(
  "research/refreshJob",
  async (jobId: string) => fetchResearchJob(jobId),
)

export const requestResearchSources = createAsyncThunk(
  "research/requestSources",
  async (jobId: string) => fetchResearchSources(jobId),
)

export const requestResearchEvidence = createAsyncThunk(
  "research/requestEvidence",
  async (jobId: string) => fetchResearchEvidence(jobId),
)

export const requestResearchReport = createAsyncThunk(
  "research/requestReport",
  async (jobId: string) => fetchResearchReport(jobId),
)

export const requestResearchVerification = createAsyncThunk(
  "research/requestVerification",
  async (jobId: string) => fetchResearchVerification(jobId),
)

export const regenerateCurrentReport = createAsyncThunk(
  "research/regenerateReport",
  async (jobId: string) => regenerateResearchReport(jobId),
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
        state.sources = []
        state.sourcesStatus = "idle"
        state.evidence = []
        state.evidenceStatus = "idle"
        state.report = null
        state.reportStatus = "idle"
        state.verification = null
        state.verificationStatus = "idle"
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
        state.sources = []
        state.sourcesStatus = "idle"
        state.evidence = []
        state.evidenceStatus = "idle"
        state.report = null
        state.reportStatus = "idle"
        state.verification = null
        state.verificationStatus = "idle"
      })
      .addCase(startResearchJobFromSuggestion.rejected, (state, action) => {
        state.jobStatus = "failed"
        state.error = action.error.message ?? "Unable to start research job"
      })
      .addCase(refreshResearchJob.fulfilled, (state, action) => {
        state.job = action.payload
      })
      .addCase(requestResearchSources.pending, (state) => {
        state.sourcesStatus = "loading"
      })
      .addCase(requestResearchSources.fulfilled, (state, action) => {
        state.sourcesStatus = "succeeded"
        state.sources = action.payload
      })
      .addCase(requestResearchSources.rejected, (state, action) => {
        state.sourcesStatus = "failed"
        state.error = action.error.message ?? "Unable to load discovered sources"
      })
      .addCase(requestResearchEvidence.pending, (state) => {
        state.evidenceStatus = "loading"
      })
      .addCase(requestResearchEvidence.fulfilled, (state, action) => {
        state.evidenceStatus = "succeeded"
        state.evidence = action.payload
      })
      .addCase(requestResearchEvidence.rejected, (state, action) => {
        state.evidenceStatus = "failed"
        state.error = action.error.message ?? "Unable to load evidence chunks"
      })
      .addCase(requestResearchReport.pending, (state) => {
        state.reportStatus = "loading"
      })
      .addCase(requestResearchReport.fulfilled, (state, action) => {
        state.reportStatus = "succeeded"
        state.report = action.payload
      })
      .addCase(requestResearchReport.rejected, (state, action) => {
        state.reportStatus = "failed"
        state.error = action.error.message ?? "Unable to load report"
      })
      .addCase(requestResearchVerification.pending, (state) => {
        state.verificationStatus = "loading"
      })
      .addCase(requestResearchVerification.fulfilled, (state, action) => {
        state.verificationStatus = "succeeded"
        state.verification = action.payload
      })
      .addCase(requestResearchVerification.rejected, (state, action) => {
        state.verificationStatus = "failed"
        state.error = action.error.message ?? "Unable to load verification"
      })
      .addCase(regenerateCurrentReport.pending, (state) => {
        state.reportStatus = "loading"
        state.verificationStatus = "loading"
        state.error = null
      })
      .addCase(regenerateCurrentReport.fulfilled, (state, action) => {
        state.reportStatus = "succeeded"
        state.report = action.payload
        state.verificationStatus = "idle"
      })
      .addCase(regenerateCurrentReport.rejected, (state, action) => {
        state.reportStatus = "failed"
        state.verificationStatus = "failed"
        state.error = action.error.message ?? "Unable to regenerate report"
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
