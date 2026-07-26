import { AlertTriangle, CheckCircle2, Loader2, RotateCcw } from "lucide-react"
import type { ResearchJob, ResearchJobEvent, ResearchSuggestion } from "../types"

type ResearchJobPanelProps = {
  job: ResearchJob | null
  events: ResearchJobEvent[]
  selectedSuggestion: ResearchSuggestion | null
  loading: boolean
  onRetry: () => void
  retryLoading: boolean
}

export function ResearchJobPanel({
  events,
  job,
  loading,
  onRetry,
  retryLoading,
  selectedSuggestion,
}: ResearchJobPanelProps) {
  if (!job && !loading) {
    return null
  }

  const isRunning = loading || job?.status === "queued" || job?.status === "running"
  const isFailed = job?.status === "failed"
  const latestEvent = events.at(-1)

  return (
    <section className={`job-panel compact ${isFailed ? "failed" : ""}`} aria-label="Research job status">
      <div className="job-status-row">
        <span className="job-status-icon">
          {isRunning ? (
            <Loader2 className="spin" size={16} />
          ) : isFailed ? (
            <AlertTriangle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
        </span>
        <div className="job-status-copy">
          <strong>{job?.display_step ?? "Starting research"}</strong>
          <small>
            {selectedSuggestion?.title ?? "Selected research"} - {job?.progress ?? 8}% -{" "}
            {formatRuntime(job?.runtime_seconds ?? 0)}
          </small>
          {latestEvent?.message ? <em>{latestEvent.message}</em> : null}
        </div>
        {isRunning ? (
          <span className="job-status-pill">Running</span>
        ) : isFailed ? (
          <button className="job-retry-button" disabled={retryLoading} type="button" onClick={onRetry}>
            <RotateCcw className={retryLoading ? "spin" : undefined} size={14} />
            <span>{retryLoading ? "Retrying" : "Retry"}</span>
          </button>
        ) : (
          <span className="job-status-pill">Done</span>
        )}
      </div>

      <div className="progress-track">
        <span style={{ width: `${job?.progress ?? 8}%` }} />
      </div>
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
