import { ExternalLink } from "lucide-react"
import type { ResearchSource } from "../types"

type SourcesPanelProps = {
  loading: boolean
  sources: ResearchSource[]
  visible: boolean
}

export function SourcesPanel({ loading, sources, visible }: SourcesPanelProps) {
  if (!visible) {
    return null
  }

  const providerLabel = sources.some((source) => source.status === "provider_not_configured")
    ? "fallback links"
    : "live sources"

  return (
    <section className="artifact-panel" aria-label="Discovered sources">
      <div className="section-heading">
        <p>Discovered sources</p>
        <span>{loading ? "Finding sources" : `${sources.length} ${providerLabel}`}</span>
      </div>

      {loading ? <span className="loading-bar" /> : null}
      {!loading && sources.length === 0 ? (
        <p className="artifact-empty">Sources will appear here after discovery finishes.</p>
      ) : null}

      <div className="source-list">
        {sources.map((source) => (
          <a
            className="source-row"
            href={source.url}
            key={source.id}
            rel="noreferrer"
            target="_blank"
          >
            <span className="source-rank">{source.rank.toString().padStart(2, "0")}</span>
            <span>
              <strong>{source.title}</strong>
              <small>{source.domain}</small>
            </span>
            <ExternalLink size={18} />
          </a>
        ))}
      </div>
    </section>
  )
}
