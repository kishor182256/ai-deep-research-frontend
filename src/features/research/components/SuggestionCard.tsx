import type { ResearchSuggestion } from "../types"

type SuggestionCardProps = {
  index: number
  suggestion: ResearchSuggestion
  selected: boolean
  disabled?: boolean
  onToggle: (suggestion: ResearchSuggestion) => void
}

export function SuggestionCard({
  disabled,
  index,
  onToggle,
  selected,
  suggestion,
}: SuggestionCardProps) {
  return (
    <label
      className={`suggestion-card${selected ? " selected" : ""}`}
    >
      <span className="suggestion-check">
        <input
          checked={selected}
          disabled={disabled}
          onChange={() => onToggle(suggestion)}
          type="checkbox"
        />
      </span>
      <span className="suggestion-rank">{String(index + 1).padStart(2, "0")}</span>
      <span className="suggestion-content">
        <strong>{suggestion.title}</strong>
        <small>{suggestion.summary}</small>
      </span>
    </label>
  )
}
