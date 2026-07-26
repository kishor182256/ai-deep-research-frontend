import type { ResearchSuggestion } from "../types"
import { SuggestionCard } from "./SuggestionCard"

type SuggestionsPanelProps = {
  suggestions: ResearchSuggestion[]
  selectedSuggestion: ResearchSuggestion | null
  cacheAgeSeconds?: number | null
  cacheHit?: boolean
  disabled?: boolean
  onSelect: (suggestion: ResearchSuggestion) => void
}

export function SuggestionsPanel({
  cacheAgeSeconds,
  cacheHit,
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
        <span>
          {cacheHit
            ? `Using recent suggestions${cacheAgeSeconds ? ` from ${formatAge(cacheAgeSeconds)} ago` : ""}`
            : "Select one to start the research workflow"}
        </span>
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

function formatAge(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m`
  }

  return `${Math.floor(minutes / 60)}h`
}
