import type { ResearchEvidenceChunk } from "../types"

type EvidencePanelProps = {
  evidence: ResearchEvidenceChunk[]
  loading: boolean
  visible: boolean
}

export function EvidencePanel({ evidence, loading, visible }: EvidencePanelProps) {
  if (!visible) {
    return null
  }

  return (
    <section className="artifact-panel" aria-label="Evidence chunks">
      <div className="section-heading">
        <p>Evidence chunks</p>
        <span>{loading ? "Extracting evidence" : `${evidence.length} extracted`}</span>
      </div>

      {loading ? <span className="loading-bar" /> : null}
      {!loading && evidence.length === 0 ? (
        <p className="artifact-empty">
          Evidence needs live source snippets. Configure Tavily to extract cited evidence.
        </p>
      ) : null}

      <div className="evidence-list">
        {evidence.slice(0, 6).map((chunk) => (
          <article className="evidence-row" key={chunk.id}>
            <strong>{chunk.claim}</strong>
            <p>{chunk.chunk_text}</p>
            <small>{chunk.source_title}</small>
          </article>
        ))}
      </div>
    </section>
  )
}
