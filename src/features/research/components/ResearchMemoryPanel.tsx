import { ArrowRight, Clock, Database, FileText } from "lucide-react"
import type { ResearchMemoryMatch } from "../types"

type ResearchMemoryPanelProps = {
  loading: boolean
  matches: ResearchMemoryMatch[]
  onOpen: (jobId: string) => void
  visible: boolean
}

export function ResearchMemoryPanel({
  loading,
  matches,
  onOpen,
  visible,
}: ResearchMemoryPanelProps) {
  if (!visible) {
    return null
  }

  return (
    <section className="memory-panel" aria-label="Previous research">
      <div className="section-heading">
        <p>Previous research</p>
        <span>{loading ? "Checking memory" : `${matches.length} reusable matches`}</span>
      </div>

      {loading ? <span className="loading-bar" /> : null}
      {!loading && matches.length === 0 ? (
        <p className="artifact-empty">No similar completed research found yet.</p>
      ) : null}

      {matches.length > 0 ? (
        <div className="memory-list">
          {matches.map((match) => (
            <article className="memory-row" key={match.job_id}>
              <div>
                <strong>{match.title}</strong>
                <p>{match.summary}</p>
              </div>
              <div className="memory-stats">
                <span>
                  <Database size={14} />
                  {Math.round(match.score * 100)}% match
                </span>
                <span>
                  <FileText size={14} />
                  {match.citation_count} citations
                </span>
                <span>
                  <Clock size={14} />
                  {formatRuntime(match.runtime_seconds)}
                </span>
                <button type="button" onClick={() => onOpen(match.job_id)}>
                  <span>Open</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function formatRuntime(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}
