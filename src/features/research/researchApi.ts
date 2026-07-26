import { httpClient } from "../../shared/api/httpClient"
import type {
  CreateResearchJobFromSuggestionRequest,
  ResearchEvidenceChunk,
  ResearchJob,
  ResearchReport,
  ResearchSource,
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

export async function createResearchJobFromSuggestion(
  payload: CreateResearchJobFromSuggestionRequest,
) {
  const response = await httpClient.post<ResearchJob>(
    "/research/jobs/from-suggestion",
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
