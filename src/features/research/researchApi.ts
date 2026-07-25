import { httpClient } from "../../shared/api/httpClient"
import type {
  CreateResearchJobFromSuggestionRequest,
  ResearchJob,
  ResearchSuggestionRequest,
  ResearchSuggestionResponse,
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
