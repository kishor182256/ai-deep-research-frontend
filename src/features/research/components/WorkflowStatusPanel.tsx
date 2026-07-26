import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import type { ResearchJob, ResearchJobEvent } from "../types"

type WorkflowStatusPanelProps = {
  events: ResearchJobEvent[]
  job: ResearchJob | null
  mode: "research" | "sources"
  visible: boolean
}

const researchSteps = [
  { label: "Planning", events: ["planning_started", "planning_completed"] },
  { label: "Discovering sources", events: ["source_discovery_started", "sources_discovered"] },
  { label: "Waiting for source selection", events: ["source_selection_required"] },
]

const sourceSteps = [
  { label: "Reading selected sources", events: ["extraction_started", "evidence_extracted"] },
  { label: "Building evidence chunks", events: ["evidence_extracted"] },
  { label: "Writing cited report", events: ["report_generation_started", "report_generated"] },
  { label: "Checking confidence", events: ["verification_started", "verification_completed"] },
]

export function WorkflowStatusPanel({
  events,
  job,
  mode,
  visible,
}: WorkflowStatusPanelProps) {
  if (!visible) {
    return null
  }

  const latestEvent = events.at(-1)
  const eventTypes = new Set(events.map((event) => event.type))
  const steps = mode === "sources" ? sourceSteps : researchSteps
  const nextStepIndex = steps.findIndex(
    (step) => !step.events.some((eventType) => eventTypes.has(eventType)),
  )
  const activeIndex = nextStepIndex >= 0 ? nextStepIndex : steps.length - 1
  const isComplete = job?.status === "completed"

  return (
    <section className="workflow-status-panel" aria-live="polite">
      <div className="workflow-status-head">
        <span className="workflow-spinner">
          <Loader2 className="spin" size={18} />
        </span>
        <div>
          <strong>{job?.display_step ?? (mode === "sources" ? "Reading selected sources" : "Starting research")}</strong>
          <small>{latestEvent?.message ?? "The research workflow is running."}</small>
        </div>
        <span>{job?.progress ?? 8}%</span>
      </div>

      <div className="workflow-steps">
        {steps.map((step, index) => {
          const done = isComplete || step.events.some((eventType) => eventTypes.has(eventType))
          const active = !done && index === activeIndex

          return (
            <div className={`workflow-step ${done ? "done" : ""} ${active ? "active" : ""}`} key={step.label}>
              {done ? <CheckCircle2 size={15} /> : active ? <Loader2 className="spin" size={15} /> : <Circle size={15} />}
              <span>{step.label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
