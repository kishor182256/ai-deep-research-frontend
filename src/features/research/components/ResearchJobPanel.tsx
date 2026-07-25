import { CheckCircle2, Loader2 } from "lucide-react"
import type { ResearchJob, ResearchJobEvent, ResearchSuggestion } from "../types"

type ResearchJobPanelProps = {
  job: ResearchJob | null
  events: ResearchJobEvent[]
  selectedSuggestion: ResearchSuggestion | null
  loading: boolean
}

export function ResearchJobPanel({
  events,
  job,
  loading,
  selectedSuggestion,
}: ResearchJobPanelProps) {
  if (!job && !loading) {
    return null
  }

  const isRunning = loading || job?.status === "queued" || job?.status === "running"

  return (
    <section className="job-panel" aria-label="Research job status">
      <div className="job-panel-header">
        <div>
          <p>Research workflow</p>
          <strong>{selectedSuggestion?.title ?? "Starting selected research"}</strong>
          {job ? (
            <small>
              {job.current_step.replaceAll("_", " ")} · {job.progress}%
            </small>
          ) : null}
        </div>
        {isRunning ? (
          <Loader2 className="spin" size={22} />
        ) : (
          <CheckCircle2 size={22} />
        )}
      </div>

      <div className="progress-track">
        <span style={{ width: `${job?.progress ?? 8}%` }} />
      </div>

      <div className="event-list">
        {events.map((event, index) => (
          <div className="event-row" key={`${event.type}-${index}`}>
            <span>{event.type.replaceAll("_", " ")}</span>
            <strong>{event.status}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}
