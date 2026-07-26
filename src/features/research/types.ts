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
  cache_hit: boolean
  cache_age_seconds: number | null
  source: string
}

export type ResearchJob = {
  id: string
  project_id: string | null
  suggestion_id: string | null
  status: string
  progress: number
  current_step: string
  display_step: string
  runtime_seconds: number
  created_at?: string | null
  updated_at?: string | null
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

export type ContentPlatform = "instagram" | "youtube_shorts" | "youtube_long"

export type ContentGenerationRequest = {
  source_report_id: string
  platform?: ContentPlatform
  language?: string
}

export type ContentPackage = {
  content_job_id: string
  source_report_id: string | null
  platform: ContentPlatform
  language: string
  status: string
  title: string | null
  hook: string | null
  script: string | null
  caption: string | null
  cta: string | null
  hashtags: string[]
  source_summary: string | null
  design_brief: string[]
  image_prompts: string[]
  video_prompts: string[]
  seo_keywords: string[]
  posting_time: string | null
  thumbnail_text: string | null
  thumbnail_prompt: string | null
  tags: string[]
  chapters: string[]
  b_roll: string[]
  story_plan: StoryPlan | null
  chapter_plan: ChapterPlan[]
  story_memory: StoryMemory | null
  chapter_outputs: ChapterOutput[]
  consistency_review: ConsistencyReview | null
  estimated_word_count: number
  estimated_runtime_minutes: number
  script_depth_status: string | null
  structured_knowledge: StructuredKnowledge | null
  content_review: ContentReview | null
}

export type StoryBeat = {
  title: string
  purpose: string
  duration: string
  narrative_question: string
  evidence_angle: string
  retention_hook: string
  visual_direction: string
  earns_runtime: boolean
}

export type StoryPlan = {
  format: string
  target_runtime: string
  story_arc: string
  narrative_layers: string[]
  opening_hook: string
  retention_hooks: string[]
  beats: StoryBeat[]
  expansion_checks: string[]
  ending: string
}

export type ChapterPlan = {
  title: string
  target_words: string
  target_minutes: string
  chapter_goal: string
  learning_objectives: string[]
  question_flow: string[]
  narrative_sections: string[]
  evidence_requirements: string[]
  visual_plan: string[]
  retention_hooks: string[]
  transition: string
}

export type StoryMemory = {
  topic: string
  core_message: string
  audience: string
  tone: string
  story_arc: string
  characters: string[]
  key_terms: string[]
  facts_already_used: string[]
  facts_reserved: string[]
}

export type ChapterOutput = {
  pass_number: number
  title: string
  chapter_type: string
  draft: string
  word_count: number
  estimated_runtime_minutes: number
  accepted: boolean
  checklist: string[]
  memory_updates: string[]
}

export type ConsistencyReview = {
  status: string
  score: number
  terminology_notes: string[]
  duplicate_risks: string[]
  transition_fixes: string[]
  citation_notes: string[]
  open_loops_resolved: string[]
  composer_actions: string[]
}

export type StructuredKnowledge = {
  topic: string
  facts: string[]
  statistics: string[]
  citations: string[]
  timeline: string[]
  counterpoints: string[]
  trends: string[]
  visual_suggestions: string[]
  video_scene_suggestions: string[]
}

export type ContentReview = {
  overall_score: number
  evidence_coverage: number
  freshness: number
  source_diversity: number
  bias_check: number
  readability: number
  virality: number
  compliance: number
  depth_score: number
  status: string
  notes: string[]
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

export type ModelCallLog = {
  id: string
  job_id: string | null
  provider: string
  model: string
  task_type: string
  reason: string
  input_tokens: number
  output_tokens: number
  estimated_cost: number
}

export type CostRecord = {
  id: string
  job_id: string | null
  category: string
  amount: number
  currency: string
  description: string | null
}

export type ResearchCostSummary = {
  job_id: string
  total_estimated_cost: number
  currency: string
  model_call_count: number
  tool_record_count: number
  input_tokens: number
  output_tokens: number
  model_calls: ModelCallLog[]
  cost_records: CostRecord[]
}

export type ResearchMemoryMatch = {
  job_id: string
  suggestion_id: string | null
  title: string
  summary: string
  score: number
  verification_score: number
  citation_count: number
  source_count: number
  evidence_count: number
  runtime_seconds: number
  updated_at?: string | null
}
