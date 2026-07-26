import { Activity, BadgeDollarSign, Clock3, FileText, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"
import type {
  ResearchCostSummary,
  ResearchEvidenceChunk,
  ResearchJob,
  ResearchReport,
  ResearchSource,
  ResearchVerification,
} from "../types"

type ResearchMetricsPanelProps = {
  costSummary: ResearchCostSummary | null
  evidence: ResearchEvidenceChunk[]
  job: ResearchJob | null
  loading: boolean
  report: ResearchReport | null
  sources: ResearchSource[]
  verification: ResearchVerification | null
  visible: boolean
}

export function ResearchMetricsPanel({
  costSummary,
  evidence,
  job,
  loading,
  report,
  sources,
  verification,
  visible,
}: ResearchMetricsPanelProps) {
  if (!visible || !job) {
    return null
  }

  const confidence = Math.round((verification?.score ?? report?.verification_score ?? 0) * 100)
  const totalCost = formatCost(costSummary?.total_estimated_cost ?? 0, costSummary?.currency ?? "USD")
  const tokenCount = (costSummary?.input_tokens ?? 0) + (costSummary?.output_tokens ?? 0)
  const latestModelCalls = costSummary?.model_calls.slice(-3).reverse() ?? []
  const latestToolRecords = costSummary?.cost_records.slice(-3).reverse() ?? []

  return (
    <section className="artifact-panel metrics-panel" aria-label="Research metrics">
      <div className="section-heading">
        <p>Research metrics</p>
        <span>{loading ? "Updating metrics" : job.display_step}</span>
      </div>

      {loading ? <span className="loading-bar" /> : null}

      <div className="metrics-grid">
        <MetricTile icon={<Clock3 size={17} />} label="Runtime" value={formatDuration(job.runtime_seconds)} />
        <MetricTile icon={<BadgeDollarSign size={17} />} label="Est. cost" value={totalCost} />
        <MetricTile icon={<Activity size={17} />} label="Model calls" value={String(costSummary?.model_call_count ?? 0)} />
        <MetricTile icon={<FileText size={17} />} label="Evidence" value={`${evidence.length} chunks`} />
        <MetricTile icon={<FileText size={17} />} label="Sources" value={String(sources.length)} />
        <MetricTile icon={<ShieldCheck size={17} />} label="Confidence" value={verification ? `${confidence}%` : "Pending"} />
      </div>

      <div className="metrics-breakdown">
        <div>
          <strong>Cost activity</strong>
          <span>
            {tokenCount.toLocaleString()} tokens, {costSummary?.tool_record_count ?? 0} tool records
          </span>
        </div>
        <div className="metrics-tags">
          {latestModelCalls.map((call) => (
            <span key={call.id}>
              {call.task_type}: {call.provider}/{call.model}
            </span>
          ))}
          {latestToolRecords.map((record) => (
            <span key={record.id}>{record.category}</span>
          ))}
          {!loading && !costSummary ? <span>Metrics will appear after the first workflow event.</span> : null}
        </div>
      </div>
    </section>
  )
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
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

function formatCost(amount: number, currency: string) {
  if (amount === 0) {
    return `${currency} 0.00`
  }

  return new Intl.NumberFormat(undefined, {
    currency,
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(amount)
}
