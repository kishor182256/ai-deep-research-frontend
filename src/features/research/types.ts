export type ResearchSuggestionRequest = {
  topic: string
  project_id?: string | null
  audience?: string
  freshness?: string
}

export type ResearchSuggestion = {
  id: string
  title: string
  summary: string
  score: number
  reason: string
}

export type ResearchSuggestionResponse = {
  suggestion_batch_id: string
  suggestions: ResearchSuggestion[]
}

export type ResearchJob = {
  id: string
  project_id: string | null
  suggestion_id: string | null
  status: string
  progress: number
  current_step: string
}

export type ResearchJobEvent = {
  id?: string
  job_id: string
  type: string
  status: string
  message?: string
}

export type CreateResearchJobFromSuggestionRequest = {
  project_id?: string | null
  suggestion_id: string
  budget_policy?: string
}

export type ResearchSource = {
  id: string
  job_id: string
  query: string
  title: string
  url: string
  domain: string
  snippet: string | null
  score: number
  credibility_score: number
  freshness: string
  status: string
  rank: number
}

export type ResearchEvidenceChunk = {
  id: string
  job_id: string
  source_id: string
  source_title: string
  source_url: string
  claim: string
  chunk_text: string
  relevance_score: number
  rank: number
  metadata: Record<string, string | number | null>
}

export type ResearchReport = {
  id: string
  job_id: string
  title: string
  summary: string
  content: string
  citation_count: number
  verification_score: number
  status: string
}

export type ResearchVerification = {
  id: string
  job_id: string
  status: string
  score: number
  citation_coverage: number
  checked_claims: number
  supported_claims: number
  warning_count: number
  warnings: string[]
  unsupported_claims: string[]
  quality_gate: {
    passed: boolean
    status: string
    minimum_score: number
    minimum_citation_coverage: number
    message: string
  }
  model_provider: string
  model_name: string
  routing_reason: string
}
