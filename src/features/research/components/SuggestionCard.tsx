import { ArrowRight } from "lucide-react"
import type { ResearchSuggestion } from "../types"

type SuggestionCardProps = {
  index: number
  suggestion: ResearchSuggestion
  selected: boolean
  disabled?: boolean
  onSelect: (suggestion: ResearchSuggestion) => void
}

export function SuggestionCard({
  disabled,
  index,
  onSelect,
  selected,
  suggestion,
}: SuggestionCardProps) {
  return (
    <button
      type="button"
      className={`suggestion-card${selected ? " selected" : ""}`}
      onClick={() => onSelect(suggestion)}
      disabled={disabled}
    >
      <span className="suggestion-rank">{String(index + 1).padStart(2, "0")}</span>
      <span className="suggestion-content">
        <strong>{suggestion.title}</strong>
        <small>{suggestion.summary}</small>
      </span>
      <span className="suggestion-action">
        <ArrowRight size={18} />
      </span>
    </button>
  )
}
