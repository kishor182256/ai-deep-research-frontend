import { Clipboard, Clock3, FileText, RefreshCw, ShieldCheck, Video, Workflow } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import type {
  ResearchEvidenceChunk,
  ResearchJob,
  ResearchReport,
  ResearchSource,
  ResearchVerification,
} from "../types"

type ResearchMetricsPanelProps = {
  evidence: ResearchEvidenceChunk[]
  job: ResearchJob | null
  loading: boolean
  contentLoading: boolean
  onGenerateContent: () => void
  onRegenerate: () => void
  onReview: () => void
  report: ResearchReport | null
  regenerateLoading: boolean
  reviewLoading: boolean
  sources: ResearchSource[]
  verification: ResearchVerification | null
  visible: boolean
}

export function ResearchMetricsPanel({
  evidence,
  job,
  loading,
  contentLoading,
  onGenerateContent,
  onRegenerate,
  onReview,
  report,
  regenerateLoading,
  reviewLoading,
  sources,
  verification,
  visible,
}: ResearchMetricsPanelProps) {
  const [copiedEvidence, setCopiedEvidence] = useState(false)
  const [copiedReport, setCopiedReport] = useState(false)

  if (!visible || !job) {
    return null
  }

  const confidence = Math.round((verification?.score ?? report?.verification_score ?? 0) * 100)
  const canReview = Boolean(verification && !verification.quality_gate.passed)
  const isLowConfidence = Boolean(
    verification &&
      (!verification.quality_gate.passed ||
        verification.score < 0.8 ||
        verification.citation_coverage < 0.8),
  )

  async function handleCopyEvidence() {
    await navigator.clipboard.writeText(formatEvidenceChunks(evidence))
    setCopiedEvidence(true)
    window.setTimeout(() => setCopiedEvidence(false), 1600)
  }

  async function handleCopyReport() {
    if (!report) {
      return
    }

    await navigator.clipboard.writeText(report.content)
    setCopiedReport(true)
    window.setTimeout(() => setCopiedReport(false), 1600)
  }

  return (
    <section className="artifact-panel metrics-panel" aria-label="Research metrics">
      <div className="section-heading">
        <p>Research metrics</p>
        <span>{loading ? "Updating metrics" : job.display_step}</span>
      </div>

      {loading ? <span className="loading-bar" /> : null}

      <div className="metrics-grid">
        <MetricTile icon={<Workflow size={17} />} label="Status" value={job.display_step} />
        <MetricTile icon={<Clock3 size={17} />} label="Runtime" value={formatDuration(job.runtime_seconds)} />
        <MetricTile icon={<FileText size={17} />} label="Sources" value={String(sources.length)} />
        <MetricTile
          icon={<Clipboard size={17} />}
          label="Evidence"
          onClick={handleCopyEvidence}
          value={copiedEvidence ? "Copied" : `${evidence.length} chunks`}
        />
        <MetricTile
          disabled={!report}
          icon={<Clipboard size={17} />}
          label="Cited report"
          onClick={handleCopyReport}
          value={report ? (copiedReport ? "Copied" : `${report.citation_count} citations`) : "Pending"}
        />
        <MetricTile icon={<ShieldCheck size={17} />} label="Confidence" value={verification ? `${confidence}%` : "Pending"} />
        <MetricTile
          disabled={!report || contentLoading}
          icon={<Video className={contentLoading ? "spin" : undefined} size={17} />}
          label="Content"
          onClick={onGenerateContent}
          value={contentLoading ? "Generating" : report ? "Create" : "Pending"}
        />
        {isLowConfidence ? (
          <MetricTile
            disabled={regenerateLoading}
            icon={<RefreshCw className={regenerateLoading ? "spin" : undefined} size={17} />}
            label="Regenerate"
            onClick={onRegenerate}
            value={regenerateLoading ? "Running" : "Improve report"}
          />
        ) : null}
        {canReview ? (
          <MetricTile
            disabled={reviewLoading}
            icon={<ShieldCheck className={reviewLoading ? "spin" : undefined} size={17} />}
            label="Review evidence"
            onClick={onReview}
            value={reviewLoading ? "Reviewing" : "Strengthen"}
          />
        ) : null}
      </div>
    </section>
  )
}

function MetricTile({
  disabled,
  icon,
  label,
  onClick,
  value,
}: {
  disabled?: boolean
  icon: ReactNode
  label: string
  onClick?: () => void
  value: string
}) {
  if (onClick) {
    return (
      <button className="metric-tile clickable" disabled={disabled} type="button" onClick={onClick}>
        <span className="metric-icon">{icon}</span>
        <span>
          <small>{label}</small>
          <strong>{value}</strong>
        </span>
      </button>
    )
  }

  return (
    <div className="metric-tile">
      <span className="metric-icon">{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  )
}

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}m ${remainder}s`
}

function formatEvidenceChunks(evidence: ResearchEvidenceChunk[]) {
  if (evidence.length === 0) {
    return "No evidence chunks are available yet."
  }

  return [
    "# Evidence chunks",
    "",
    ...evidence.flatMap((chunk, index) => [
      `## ${String(index + 1).padStart(2, "0")}. ${chunk.claim}`,
      `Source: ${chunk.source_title}`,
      `URL: ${chunk.source_url}`,
      `Relevance: ${Math.round(chunk.relevance_score * 100)}%`,
      "",
      chunk.chunk_text,
      "",
    ]),
  ].join("\n")
}
