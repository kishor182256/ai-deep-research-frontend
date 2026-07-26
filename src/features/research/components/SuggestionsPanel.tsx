import { Play } from "lucide-react"
import type { ResearchSuggestion } from "../types"
import { SuggestionCard } from "./SuggestionCard"

type SuggestionsPanelProps = {
  suggestions: ResearchSuggestion[]
  selectedSuggestions: ResearchSuggestion[]
  cacheAgeSeconds?: number | null
  cacheHit?: boolean
  disabled?: boolean
  starting?: boolean
  onStart: () => void
  onToggle: (suggestion: ResearchSuggestion) => void
}

export function SuggestionsPanel({
  cacheAgeSeconds,
  cacheHit,
  disabled,
  onStart,
  onToggle,
  selectedSuggestions,
  starting,
  suggestions,
}: SuggestionsPanelProps) {
  if (suggestions.length === 0) {
    return null
  }

  const selectedIds = new Set(selectedSuggestions.map((suggestion) => suggestion.id))
  const selectedCount = selectedSuggestions.length

  return (
    <section className="suggestions-panel" aria-label="Suggested research directions">
      <div className="section-heading">
        <p>Top 10 research directions</p>
        <div className="suggestions-heading-actions">
          <span>
            {cacheHit
              ? `Using recent suggestions${cacheAgeSeconds ? ` from ${formatAge(cacheAgeSeconds)} ago` : ""}`
              : `${selectedCount} selected`}
          </span>
          <button
            className="start-research-button"
            disabled={disabled || starting || selectedCount === 0}
            onClick={onStart}
            type="button"
          >
            <Play size={14} />
            <span>{starting ? "Starting" : "Start research"}</span>
          </button>
        </div>
      </div>

      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.id}
            disabled={disabled}
            index={index}
            onToggle={onToggle}
            selected={selectedIds.has(suggestion.id)}
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
