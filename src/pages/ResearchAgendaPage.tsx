import { useAppDispatch, useAppSelector } from "../app/hooks"
import { AgendaComposer } from "../features/research/components/AgendaComposer"
import { ResearchJobPanel } from "../features/research/components/ResearchJobPanel"
import { SuggestionsPanel } from "../features/research/components/SuggestionsPanel"
import { useResearchJobStream } from "../features/research/hooks/useResearchJobStream"
import {
  requestResearchSuggestions,
  startResearchJobFromSuggestion,
  suggestionSelected,
} from "../features/research/researchSlice"
import type { ResearchSuggestion } from "../features/research/types"

export default function ResearchAgendaPage() {
  const dispatch = useAppDispatch()
  const {
    error,
    events,
    job,
    jobStatus,
    selectedSuggestion,
    suggestions,
    suggestionsStatus,
    topic,
  } = useAppSelector((state) => state.research)

  useResearchJobStream(job?.id)

  const isSuggestionsLoading = suggestionsStatus === "loading"
  const isJobLoading = jobStatus === "loading"

  function handleTopicSubmit(nextTopic: string) {
    void dispatch(
      requestResearchSuggestions({
        topic: nextTopic,
        audience: "general",
        freshness: "latest",
      }),
    )
  }

  function handleSuggestionSelect(suggestion: ResearchSuggestion) {
    dispatch(suggestionSelected(suggestion))
    void dispatch(
      startResearchJobFromSuggestion({
        project_id: null,
        suggestion_id: suggestion.id,
        budget_policy: "starter",
      }),
    )
  }

  return (
    <main className="agenda-page">
      <section className="agenda-hero">
        <p className="eyebrow">AI Deep Research</p>
        <h1>What&apos;s on the agenda today?</h1>
        <AgendaComposer disabled={isSuggestionsLoading} onSubmit={handleTopicSubmit} />
        <p className="helper-text">
          Enter a topic. We&apos;ll suggest the top 10 research directions before
          starting the deeper workflow.
        </p>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      {isSuggestionsLoading ? (
        <section className="loading-panel">
          <span className="loading-bar" />
          <p>Finding useful research angles for {topic}...</p>
        </section>
      ) : null}

      <SuggestionsPanel
        disabled={isJobLoading}
        onSelect={handleSuggestionSelect}
        selectedSuggestion={selectedSuggestion}
        suggestions={suggestions}
      />

      <ResearchJobPanel
        events={events}
        job={job}
        loading={isJobLoading}
        selectedSuggestion={selectedSuggestion}
      />
    </main>
  )
}
