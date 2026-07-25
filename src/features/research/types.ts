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
