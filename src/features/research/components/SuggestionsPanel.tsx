import type { ResearchSuggestion } from "../types"
import { SuggestionCard } from "./SuggestionCard"

type SuggestionsPanelProps = {
  suggestions: ResearchSuggestion[]
  selectedSuggestion: ResearchSuggestion | null
  disabled?: boolean
  onSelect: (suggestion: ResearchSuggestion) => void
}

export function SuggestionsPanel({
  disabled,
  onSelect,
  selectedSuggestion,
  suggestions,
}: SuggestionsPanelProps) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <section className="suggestions-panel" aria-label="Suggested research directions">
      <div className="section-heading">
        <p>Top 10 research directions</p>
        <span>Select one to start the research workflow</span>
      </div>

      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.id}
            disabled={disabled}
            index={index}
            onSelect={onSelect}
            selected={selectedSuggestion?.id === suggestion.id}
            suggestion={suggestion}
          />
        ))}
      </div>
    </section>
  )
}
