import { httpClient } from "../../shared/api/httpClient"
import type {
  ContentGenerationRequest,
  ContentPackage,
  CreateResearchJobFromSuggestionRequest,
  CreateResearchJobFromSuggestionsRequest,
  ResearchCostSummary,
  ResearchEvidenceChunk,
  ResearchJob,
  ResearchMemoryMatch,
  ResearchReport,
  ResearchSource,
  ResearchSourceSelectionRequest,
  ResearchSuggestionRequest,
  ResearchSuggestionResponse,
  ResearchVerification,
} from "./types"

export async function fetchResearchSuggestions(
  payload: ResearchSuggestionRequest,
) {
  const response = await httpClient.post<ResearchSuggestionResponse>(
    "/research/suggestions",
    payload,
  )
  return response.data
}

export async function fetchResearchMemory(query: string) {
  const response = await httpClient.get<ResearchMemoryMatch[]>("/research/memory", {
    params: { query },
  })
  return response.data
}

export async function createResearchJobFromSuggestion(
  payload: CreateResearchJobFromSuggestionRequest,
) {
  const response = await httpClient.post<ResearchJob>(
    "/research/jobs/from-suggestion",
    payload,
  )
  return response.data
}

export async function createResearchJobFromSuggestions(
  payload: CreateResearchJobFromSuggestionsRequest,
) {
  const response = await httpClient.post<ResearchJob>(
    "/research/jobs/from-suggestions",
    payload,
  )
  return response.data
}

export async function fetchResearchJob(jobId: string) {
  const response = await httpClient.get<ResearchJob>(`/research/jobs/${jobId}`)
  return response.data
}

export async function fetchResearchSources(jobId: string) {
  const response = await httpClient.get<ResearchSource[]>(
    `/research/jobs/${jobId}/sources`,
  )
  return response.data
}

export async function selectResearchSources(
  jobId: string,
  payload: ResearchSourceSelectionRequest,
) {
  const response = await httpClient.post<ResearchJob>(
    `/research/jobs/${jobId}/sources/select`,
    payload,
  )
  return response.data
}

export async function fetchResearchEvidence(jobId: string) {
  const response = await httpClient.get<ResearchEvidenceChunk[]>(
    `/research/jobs/${jobId}/evidence`,
  )
  return response.data
}

export async function fetchResearchReport(jobId: string) {
  const response = await httpClient.get<ResearchReport>(
    `/research/jobs/${jobId}/report`,
  )
  return response.data
}

export async function fetchResearchVerification(jobId: string) {
  const response = await httpClient.get<ResearchVerification>(
    `/research/jobs/${jobId}/verification`,
  )
  return response.data
}

export async function fetchResearchCosts(jobId: string) {
  const response = await httpClient.get<ResearchCostSummary>(
    `/research/jobs/${jobId}/costs`,
  )
  return response.data
}

export async function regenerateResearchReport(jobId: string) {
  const response = await httpClient.post<ResearchReport>(
    `/research/jobs/${jobId}/report/regenerate`,
  )
  return response.data
}

export async function reviewResearchJob(jobId: string) {
  const response = await httpClient.post<ResearchJob>(
    `/research/jobs/${jobId}/review`,
  )
  return response.data
}

export async function retryResearchJob(jobId: string) {
  const response = await httpClient.post<ResearchJob>(
    `/research/jobs/${jobId}/retry`,
  )
  return response.data
}

export async function generateContentPackage(payload: ContentGenerationRequest) {
  const response = await httpClient.post<ContentPackage>("/content/generate", payload)
  return response.data
}
