import { AlertTriangle, CheckCircle2, Clipboard, Download, RefreshCw, ShieldCheck } from "lucide-react"
import { useState } from "react"
import type { ResearchReport, ResearchVerification } from "../types"

type ReportPanelProps = {
  loading: boolean
  onRegenerate: () => void
  report: ResearchReport | null
  verification: ResearchVerification | null
  verificationLoading: boolean
  visible: boolean
}

export function ReportPanel({
  loading,
  onRegenerate,
  report,
  verification,
  verificationLoading,
  visible,
}: ReportPanelProps) {
  const [copied, setCopied] = useState(false)

  if (!visible) {
    return null
  }

  async function handleCopy() {
    if (!report) {
      return
    }

    await navigator.clipboard.writeText(report.content)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  function handleDownload() {
    if (!report) {
      return
    }

    const blob = new Blob([report.content], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${report.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const confidenceScore = Math.round(
    (verification?.score ?? report?.verification_score ?? 0) * 100,
  )
  const citationCoverage = Math.round((verification?.citation_coverage ?? 0) * 100)
  const confidenceLabel = getConfidenceLabel(verification?.status, confidenceScore)
  const hasWarnings = Boolean(verification?.warnings.length)

  return (
    <section className="artifact-panel report-panel" aria-label="Cited report">
      <div className="section-heading">
        <p>Cited report</p>
        <span>
          {loading
            ? "Writing report"
            : `${report?.citation_count ?? 0} citations`}
        </span>
      </div>

      {loading ? <span className="loading-bar" /> : null}
      {!loading && !report ? (
        <p className="artifact-empty">The report will appear here when generation finishes.</p>
      ) : null}

      {report ? (
        <article className="report-content">
          <div className="report-title-row">
            <div>
              <h2>{report.title}</h2>
              <p className="report-summary">{report.summary}</p>
            </div>
            <div className="report-actions">
              <button type="button" onClick={handleCopy}>
                <Clipboard size={16} />
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button type="button" onClick={handleDownload}>
                <Download size={16} />
                <span>Markdown</span>
              </button>
              <button disabled={loading} type="button" onClick={onRegenerate}>
                <RefreshCw className={loading ? "spin" : undefined} size={16} />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          <div
            className={`confidence-panel ${verification?.quality_gate.passed ? "passed" : "attention"}`}
            aria-label="Report confidence"
          >
            <div className="confidence-main">
              <span className="confidence-icon">
                {verification?.quality_gate.passed ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <ShieldCheck size={18} />
                )}
              </span>
              <div>
                <strong>{verificationLoading ? "Checking confidence" : confidenceLabel}</strong>
                <small>
                  {verification
                    ? verification.quality_gate.message
                    : "Confidence appears here after verification finishes."}
                </small>
              </div>
            </div>
            <div className="confidence-stats">
              <span>{confidenceScore}% confidence</span>
              <span>{citationCoverage}% citation coverage</span>
              <span>{report.citation_count} citations</span>
            </div>
          </div>

          {hasWarnings ? (
            <div className="verification-warnings">
              <div className="warning-heading">
                <AlertTriangle size={16} />
                <span>Needs review</span>
              </div>
              <ul>
                {verification?.warnings.slice(0, 3).map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <pre>{report.content}</pre>
        </article>
      ) : null}
    </section>
  )
}

function getConfidenceLabel(status: string | undefined, score: number) {
  if (status === "passed") {
    return `High confidence: ${score}%`
  }

  if (status === "needs_review") {
    return `Needs review: ${score}% confidence`
  }

  if (status === "failed") {
    return `Low confidence: ${score}%`
  }

  return "Confidence pending"
}
