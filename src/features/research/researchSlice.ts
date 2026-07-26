import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  createResearchJobFromSuggestion,
  createResearchJobFromSuggestions,
  fetchResearchCosts,
  fetchResearchMemory,
  fetchResearchEvidence,
  fetchResearchJob,
  fetchResearchReport,
  fetchResearchSources,
  fetchResearchSuggestions,
  fetchResearchVerification,
  generateContentPackage,
  regenerateResearchReport,
  reviewResearchJob,
  retryResearchJob,
  selectResearchSources,
} from "./researchApi"
import type {
  ContentGenerationRequest,
  ContentPackage,
  CreateResearchJobFromSuggestionRequest,
  CreateResearchJobFromSuggestionsRequest,
  ResearchCostSummary,
  ResearchEvidenceChunk,
  ResearchJob,
  ResearchJobEvent,
  ResearchMemoryMatch,
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
  suggestionCacheHit: boolean
  suggestionCacheAgeSeconds: number | null
  suggestions: ResearchSuggestion[]
  memoryMatches: ResearchMemoryMatch[]
  memoryStatus: RequestStatus
  selectedSuggestion: ResearchSuggestion | null
  selectedSuggestions: ResearchSuggestion[]
  suggestionsStatus: RequestStatus
  jobStatus: RequestStatus
  job: ResearchJob | null
  events: ResearchJobEvent[]
  sources: ResearchSource[]
  sourcesStatus: RequestStatus
  selectedSourceIds: string[]
  sourceSelectionStatus: RequestStatus
  evidence: ResearchEvidenceChunk[]
  evidenceStatus: RequestStatus
  report: ResearchReport | null
  reportStatus: RequestStatus
  verification: ResearchVerification | null
  verificationStatus: RequestStatus
  costSummary: ResearchCostSummary | null
  costStatus: RequestStatus
  contentPackage: ContentPackage | null
  contentStatus: RequestStatus
  reviewStatus: RequestStatus
  retryStatus: RequestStatus
  error: string | null
}

const initialState: ResearchState = {
  topic: "",
  suggestionBatchId: null,
  suggestionCacheHit: false,
  suggestionCacheAgeSeconds: null,
  suggestions: [],
  memoryMatches: [],
  memoryStatus: "idle",
  selectedSuggestion: null,
  selectedSuggestions: [],
  suggestionsStatus: "idle",
  jobStatus: "idle",
  job: null,
  events: [],
  sources: [],
  sourcesStatus: "idle",
  selectedSourceIds: [],
  sourceSelectionStatus: "idle",
  evidence: [],
  evidenceStatus: "idle",
  report: null,
  reportStatus: "idle",
  verification: null,
  verificationStatus: "idle",
  costSummary: null,
  costStatus: "idle",
  contentPackage: null,
  contentStatus: "idle",
  reviewStatus: "idle",
  retryStatus: "idle",
  error: null,
}

export const requestResearchSuggestions = createAsyncThunk(
  "research/requestSuggestions",
  async (payload: ResearchSuggestionRequest) => fetchResearchSuggestions(payload),
)

export const requestResearchMemory = createAsyncThunk(
  "research/requestMemory",
  async (query: string) => fetchResearchMemory(query),
)

export const startResearchJobFromSuggestion = createAsyncThunk(
  "research/startJobFromSuggestion",
  async (payload: CreateResearchJobFromSuggestionRequest) =>
    createResearchJobFromSuggestion(payload),
)

export const startResearchJobFromSuggestions = createAsyncThunk(
  "research/startJobFromSuggestions",
  async (payload: CreateResearchJobFromSuggestionsRequest) =>
    createResearchJobFromSuggestions(payload),
)

export const refreshResearchJob = createAsyncThunk(
  "research/refreshJob",
  async (jobId: string) => fetchResearchJob(jobId),
)

export const requestResearchSources = createAsyncThunk(
  "research/requestSources",
  async (jobId: string) => fetchResearchSources(jobId),
)

export const selectSourcesForCurrentJob = createAsyncThunk(
  "research/selectSources",
  async ({ jobId, sourceIds }: { jobId: string; sourceIds: string[] }) => {
    const job = await selectResearchSources(jobId, { source_ids: sourceIds })
    return { job, sourceIds }
  },
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

export const requestResearchCosts = createAsyncThunk(
  "research/requestCosts",
  async (jobId: string) => fetchResearchCosts(jobId),
)

export const generateCreatorContent = createAsyncThunk(
  "research/generateCreatorContent",
  async (payload: ContentGenerationRequest) => generateContentPackage(payload),
)

export const regenerateCurrentReport = createAsyncThunk(
  "research/regenerateReport",
  async (jobId: string) => regenerateResearchReport(jobId),
)

export const reviewCurrentResearchJob = createAsyncThunk(
  "research/reviewJob",
  async (jobId: string) => reviewResearchJob(jobId),
)

export const retryCurrentResearchJob = createAsyncThunk(
  "research/retryJob",
  async (jobId: string) => retryResearchJob(jobId),
)

export const openResearchMemoryJob = createAsyncThunk(
  "research/openMemoryJob",
  async (jobId: string) => {
    const [job, sources, evidence, report, verification, costSummary] = await Promise.all([
      fetchResearchJob(jobId),
      fetchResearchSources(jobId),
      fetchResearchEvidence(jobId),
      fetchResearchReport(jobId),
      fetchResearchVerification(jobId),
      fetchResearchCosts(jobId),
    ])
    return { costSummary, evidence, job, report, sources, verification }
  },
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
      state.selectedSuggestions = [action.payload]
      state.error = null
    },
    suggestionToggled(state, action: { payload: ResearchSuggestion }) {
      const suggestion = action.payload
      const alreadySelected = state.selectedSuggestions.some(
        (item) => item.id === suggestion.id,
      )
      state.selectedSuggestions = alreadySelected
        ? state.selectedSuggestions.filter((item) => item.id !== suggestion.id)
        : [...state.selectedSuggestions, suggestion].sort(
            (left, right) =>
              state.suggestions.findIndex((item) => item.id === left.id) -
              state.suggestions.findIndex((item) => item.id === right.id),
          )
      state.selectedSuggestion = state.selectedSuggestions[0] ?? null
      state.error = null
    },
    sourceToggled(state, action: { payload: string }) {
      const sourceId = action.payload
      state.selectedSourceIds = state.selectedSourceIds.includes(sourceId)
        ? state.selectedSourceIds.filter((id) => id !== sourceId)
        : [...state.selectedSourceIds, sourceId]
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
        state.suggestionCacheHit = false
        state.suggestionCacheAgeSeconds = null
        state.memoryMatches = []
        state.memoryStatus = "idle"
        state.error = null
        state.selectedSuggestion = null
        state.selectedSuggestions = []
        state.job = null
        state.events = []
        state.sources = []
        state.sourcesStatus = "idle"
        state.selectedSourceIds = []
        state.sourceSelectionStatus = "idle"
        state.evidence = []
        state.evidenceStatus = "idle"
        state.report = null
        state.reportStatus = "idle"
        state.verification = null
        state.verificationStatus = "idle"
        state.costSummary = null
        state.costStatus = "idle"
        state.contentPackage = null
        state.contentStatus = "idle"
        state.reviewStatus = "idle"
        state.retryStatus = "idle"
      })
      .addCase(requestResearchSuggestions.fulfilled, (state, action) => {
        state.suggestionsStatus = "succeeded"
        state.suggestionBatchId = action.payload.suggestion_batch_id
        state.suggestionCacheHit = action.payload.cache_hit
        state.suggestionCacheAgeSeconds = action.payload.cache_age_seconds
        state.suggestions = action.payload.suggestions
      })
      .addCase(requestResearchSuggestions.rejected, (state, action) => {
        state.suggestionsStatus = "failed"
        state.error = action.error.message ?? "Unable to fetch suggestions"
      })
      .addCase(requestResearchMemory.pending, (state) => {
        state.memoryStatus = "loading"
      })
      .addCase(requestResearchMemory.fulfilled, (state, action) => {
        state.memoryStatus = "succeeded"
        state.memoryMatches = action.payload
      })
      .addCase(requestResearchMemory.rejected, (state) => {
        state.memoryStatus = "failed"
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
        state.selectedSourceIds = []
        state.sourceSelectionStatus = "idle"
        state.evidence = []
        state.evidenceStatus = "idle"
        state.report = null
        state.reportStatus = "idle"
        state.verification = null
        state.verificationStatus = "idle"
        state.costSummary = null
        state.costStatus = "idle"
        state.contentPackage = null
        state.contentStatus = "idle"
        state.reviewStatus = "idle"
        state.retryStatus = "idle"
      })
      .addCase(startResearchJobFromSuggestion.rejected, (state, action) => {
        state.jobStatus = "failed"
        state.error = action.error.message ?? "Unable to start research job"
      })
      .addCase(startResearchJobFromSuggestions.pending, (state) => {
        state.jobStatus = "loading"
        state.error = null
      })
      .addCase(startResearchJobFromSuggestions.fulfilled, (state, action) => {
        state.jobStatus = "succeeded"
        state.job = action.payload
        state.events = []
        state.sources = []
        state.sourcesStatus = "idle"
        state.selectedSourceIds = []
        state.sourceSelectionStatus = "idle"
        state.evidence = []
        state.evidenceStatus = "idle"
        state.report = null
        state.reportStatus = "idle"
        state.verification = null
        state.verificationStatus = "idle"
        state.costSummary = null
        state.costStatus = "idle"
        state.contentPackage = null
        state.contentStatus = "idle"
        state.reviewStatus = "idle"
        state.retryStatus = "idle"
      })
      .addCase(startResearchJobFromSuggestions.rejected, (state, action) => {
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
        const selectedFromServer = action.payload
          .filter((source) => ["selected", "extracted"].includes(source.status))
          .map((source) => source.id)
        if (selectedFromServer.length > 0) {
          state.selectedSourceIds = selectedFromServer
        } else if (state.selectedSourceIds.length === 0) {
          state.selectedSourceIds = action.payload
            .filter((source) => source.status !== "provider_not_configured")
            .slice()
            .sort(
              (left, right) =>
                right.credibility_score + right.score -
                (left.credibility_score + left.score),
            )
            .slice(0, 8)
            .map((source) => source.id)
        }
      })
      .addCase(requestResearchSources.rejected, (state, action) => {
        state.sourcesStatus = "failed"
        state.error = action.error.message ?? "Unable to load discovered sources"
      })
      .addCase(selectSourcesForCurrentJob.pending, (state) => {
        state.sourceSelectionStatus = "loading"
        state.error = null
      })
      .addCase(selectSourcesForCurrentJob.fulfilled, (state, action) => {
        state.sourceSelectionStatus = "succeeded"
        state.job = action.payload.job
        state.selectedSourceIds = action.payload.sourceIds
        const selectedIds = new Set(action.payload.sourceIds)
        state.sources = state.sources.map((source) => ({
          ...source,
          status: selectedIds.has(source.id) ? "selected" : "excluded",
        }))
        state.evidence = []
        state.evidenceStatus = "idle"
        state.report = null
        state.reportStatus = "idle"
        state.verification = null
        state.verificationStatus = "idle"
        state.costSummary = null
        state.costStatus = "idle"
        state.contentPackage = null
        state.contentStatus = "idle"
      })
      .addCase(selectSourcesForCurrentJob.rejected, (state, action) => {
        state.sourceSelectionStatus = "failed"
        state.error = action.error.message ?? "Unable to use selected sources"
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
      .addCase(requestResearchCosts.pending, (state) => {
        state.costStatus = "loading"
      })
      .addCase(requestResearchCosts.fulfilled, (state, action) => {
        state.costStatus = "succeeded"
        state.costSummary = action.payload
      })
      .addCase(requestResearchCosts.rejected, (state, action) => {
        state.costStatus = "failed"
        state.error = action.error.message ?? "Unable to load research metrics"
      })
      .addCase(generateCreatorContent.pending, (state) => {
        state.contentStatus = "loading"
        state.error = null
      })
      .addCase(generateCreatorContent.fulfilled, (state, action) => {
        state.contentStatus = "succeeded"
        state.contentPackage = action.payload
      })
      .addCase(generateCreatorContent.rejected, (state, action) => {
        state.contentStatus = "failed"
        state.error = action.error.message ?? "Unable to generate creator content"
      })
      .addCase(regenerateCurrentReport.pending, (state) => {
        state.reportStatus = "loading"
        state.verificationStatus = "loading"
        state.costStatus = "idle"
        state.contentPackage = null
        state.contentStatus = "idle"
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
      .addCase(reviewCurrentResearchJob.pending, (state) => {
        state.reviewStatus = "loading"
        state.error = null
      })
      .addCase(reviewCurrentResearchJob.fulfilled, (state, action) => {
        state.reviewStatus = "succeeded"
        state.job = action.payload
        state.sourcesStatus = "idle"
        state.selectedSourceIds = []
        state.sourceSelectionStatus = "idle"
        state.evidenceStatus = "idle"
        state.reportStatus = "idle"
        state.verificationStatus = "idle"
        state.costStatus = "idle"
        state.contentPackage = null
        state.contentStatus = "idle"
      })
      .addCase(reviewCurrentResearchJob.rejected, (state, action) => {
        state.reviewStatus = "failed"
        state.error = action.error.message ?? "Unable to start review"
      })
      .addCase(retryCurrentResearchJob.pending, (state) => {
        state.retryStatus = "loading"
        state.error = null
      })
      .addCase(retryCurrentResearchJob.fulfilled, (state, action) => {
        state.retryStatus = "succeeded"
        state.job = action.payload
        state.events = []
        state.sources = []
        state.sourcesStatus = "idle"
        state.selectedSourceIds = []
        state.sourceSelectionStatus = "idle"
        state.evidence = []
        state.evidenceStatus = "idle"
        state.report = null
        state.reportStatus = "idle"
        state.verification = null
        state.verificationStatus = "idle"
        state.costSummary = null
        state.costStatus = "idle"
        state.contentPackage = null
        state.contentStatus = "idle"
      })
      .addCase(retryCurrentResearchJob.rejected, (state, action) => {
        state.retryStatus = "failed"
        state.error = action.error.message ?? "Unable to retry research"
      })
      .addCase(openResearchMemoryJob.pending, (state) => {
        state.jobStatus = "loading"
        state.error = null
      })
      .addCase(openResearchMemoryJob.fulfilled, (state, action) => {
        state.jobStatus = "succeeded"
        state.job = action.payload.job
        state.events = []
        state.sources = action.payload.sources
        state.sourcesStatus = "succeeded"
        state.selectedSourceIds = action.payload.sources
          .filter((source) => ["selected", "extracted"].includes(source.status))
          .map((source) => source.id)
        state.sourceSelectionStatus = "idle"
        state.evidence = action.payload.evidence
        state.evidenceStatus = "succeeded"
        state.report = action.payload.report
        state.reportStatus = "succeeded"
        state.verification = action.payload.verification
        state.verificationStatus = "succeeded"
        state.costSummary = action.payload.costSummary
        state.costStatus = "succeeded"
        state.contentPackage = null
        state.contentStatus = "idle"
      })
      .addCase(openResearchMemoryJob.rejected, (state, action) => {
        state.jobStatus = "failed"
        state.error = action.error.message ?? "Unable to open previous research"
      })
  },
})

export const {
  jobEventReceived,
  resetResearchState,
  sourceToggled,
  suggestionSelected,
  suggestionToggled,
  topicChanged,
} = researchSlice.actions

export default researchSlice.reducer
