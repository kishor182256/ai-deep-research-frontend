import { Clipboard, Download, RefreshCw } from "lucide-react"
import { useState } from "react"
import type { ResearchReport } from "../types"

type ReportPanelProps = {
  loading: boolean
  onRegenerate: () => void
  report: ResearchReport | null
  visible: boolean
}

export function ReportPanel({
  loading,
  onRegenerate,
  report,
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
          <pre>{report.content}</pre>
        </article>
      ) : null}
    </section>
  )
}
