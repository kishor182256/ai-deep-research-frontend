import { ExternalLink, Play } from "lucide-react"
import type { ResearchSource } from "../types"

type SourcesPanelProps = {
  loading: boolean
  onToggleSource: (sourceId: string) => void
  onUseSelected: () => void
  selectedSourceIds: string[]
  selecting: boolean
  sources: ResearchSource[]
  visible: boolean
  waitingForSelection: boolean
}

export function SourcesPanel({
  loading,
  onToggleSource,
  onUseSelected,
  selectedSourceIds,
  selecting,
  sources,
  visible,
  waitingForSelection,
}: SourcesPanelProps) {
  if (!visible) {
    return null
  }

  const selectedSet = new Set(selectedSourceIds)
  const providerLabel = sources.some((source) => source.status === "provider_not_configured")
    ? "fallback links"
    : "live sources"
  const selectedCount = selectedSourceIds.length
  const canSelect = waitingForSelection && !selecting

  return (
    <section className="artifact-panel" aria-label="Discovered sources">
      <div className="section-heading">
        <p>Discovered sources</p>
        <div className="source-heading-actions">
          <span>
            {loading
              ? "Finding sources"
              : waitingForSelection
                ? `${selectedCount} selected from ${sources.length}`
                : `${sources.length} ${providerLabel}`}
          </span>
          {waitingForSelection ? (
            <button
              className="use-sources-button"
              disabled={selecting || selectedCount === 0}
              onClick={onUseSelected}
              type="button"
            >
              <Play size={14} />
              <span>{selecting ? "Reading" : "Use selected sources"}</span>
            </button>
          ) : null}
        </div>
      </div>

      {loading ? <span className="loading-bar" /> : null}
      {!loading && sources.length === 0 ? (
        <p className="artifact-empty">Sources will appear here after discovery finishes.</p>
      ) : null}
      {!loading && waitingForSelection ? (
        <p className="artifact-empty">
          Review the discovered sources. ExtractionAgent will read only the checked sources.
        </p>
      ) : null}

      <div className="source-list">
        {sources.map((source) => (
          <div
            className={`source-row selectable ${selectedSet.has(source.id) ? "selected" : ""}`}
            key={source.id}
          >
            <span className="source-check">
              <input
                checked={selectedSet.has(source.id)}
                disabled={!canSelect}
                onChange={() => onToggleSource(source.id)}
                type="checkbox"
              />
            </span>
            <span className="source-rank">{source.rank.toString().padStart(2, "0")}</span>
            <span className="source-main">
              <strong>{source.title}</strong>
              <small>
                {source.domain} - {source.query}
              </small>
              {source.snippet ? <em>{source.snippet}</em> : null}
              <span className={`source-status ${source.status}`}>
                {formatSourceStatus(source.status)}
              </span>
            </span>
            <a
              aria-label={`Open source ${source.title}`}
              className="source-open-button"
              href={source.url}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

function formatSourceStatus(status: string) {
  return status.replaceAll("_", " ")
}
