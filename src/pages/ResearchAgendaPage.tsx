import { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { AgendaComposer } from "../features/research/components/AgendaComposer"
import { ContentStudioPanel } from "../features/research/components/ContentStudioPanel"
import { EvidencePanel } from "../features/research/components/EvidencePanel"
import { ReportPanel } from "../features/research/components/ReportPanel"
import { ResearchMemoryPanel } from "../features/research/components/ResearchMemoryPanel"
import { ResearchMetricsPanel } from "../features/research/components/ResearchMetricsPanel"
import { ResearchJobPanel } from "../features/research/components/ResearchJobPanel"
import { SourcesPanel } from "../features/research/components/SourcesPanel"
import { SuggestionsPanel } from "../features/research/components/SuggestionsPanel"
import { useResearchJobStream } from "../features/research/hooks/useResearchJobStream"
import {
  regenerateCurrentReport,
  generateCreatorContent,
  openResearchMemoryJob,
  refreshResearchJob,
  requestResearchCosts,
  requestResearchEvidence,
  requestResearchMemory,
  requestResearchReport,
  requestResearchSuggestions,
  requestResearchSources,
  requestResearchVerification,
  reviewCurrentResearchJob,
  retryCurrentResearchJob,
  startResearchJobFromSuggestion,
  suggestionSelected,
} from "../features/research/researchSlice"
import type { ContentPlatform, ResearchSuggestion } from "../features/research/types"

export default function ResearchAgendaPage() {
  const dispatch = useAppDispatch()
  const [selectedContentPlatform, setSelectedContentPlatform] =
    useState<ContentPlatform>("youtube_shorts")
  const {
    error,
    costSummary,
    costStatus,
    contentPackage,
    contentStatus,
    evidence,
    evidenceStatus,
    events,
    job,
    jobStatus,
    memoryMatches,
    memoryStatus,
    report,
    reportStatus,
    reviewStatus,
    retryStatus,
    selectedSuggestion,
    suggestionCacheAgeSeconds,
    suggestionCacheHit,
    sources,
    sourcesStatus,
    suggestions,
    suggestionsStatus,
    topic,
    verification,
    verificationStatus,
  } = useAppSelector((state) => state.research)

  useResearchJobStream(job?.id, job?.status)

  const isSuggestionsLoading = suggestionsStatus === "loading"
  const isJobLoading = jobStatus === "loading"
  const eventTypes = useMemo(
    () => new Set(events.map((event) => event.type)),
    [events],
  )
  const latestEventType = events.at(-1)?.type

  useEffect(() => {
    if (!job?.id) {
      return
    }

    if (events.length > 0) {
      void dispatch(refreshResearchJob(job.id))
    }

    if (
      (latestEventType === "sources_discovered" || latestEventType === "review_sources_discovered") &&
      sourcesStatus === "idle"
    ) {
      void dispatch(refreshResearchJob(job.id))
      void dispatch(requestResearchSources(job.id))
      void dispatch(requestResearchCosts(job.id))
    }

    if (
      (latestEventType === "evidence_extracted" || latestEventType === "review_evidence_extracted") &&
      evidenceStatus === "idle"
    ) {
      void dispatch(refreshResearchJob(job.id))
      void dispatch(requestResearchEvidence(job.id))
      void dispatch(requestResearchCosts(job.id))
    }

    if (
      latestEventType === "report_generated" &&
      reportStatus === "idle"
    ) {
      void dispatch(refreshResearchJob(job.id))
      void dispatch(requestResearchReport(job.id))
      void dispatch(requestResearchCosts(job.id))
    }

    if (
      latestEventType === "verification_completed" &&
      verificationStatus === "idle"
    ) {
      void dispatch(refreshResearchJob(job.id))
      void dispatch(requestResearchReport(job.id))
      void dispatch(requestResearchVerification(job.id))
      void dispatch(requestResearchCosts(job.id))
    }

    if (
      job.status === "completed" &&
      sourcesStatus === "idle"
    ) {
      void dispatch(requestResearchSources(job.id))
    }

    if (
      job.status === "completed" &&
      evidenceStatus === "idle"
    ) {
      void dispatch(requestResearchEvidence(job.id))
    }

    if (
      job.status === "completed" &&
      reportStatus === "idle"
    ) {
      void dispatch(requestResearchReport(job.id))
    }

    if (
      job.status === "completed" &&
      (report || reportStatus === "succeeded") &&
      !verification &&
      verificationStatus === "idle"
    ) {
      void dispatch(requestResearchVerification(job.id))
    }

    if (
      job.status === "completed" &&
      costStatus === "idle"
    ) {
      void dispatch(requestResearchCosts(job.id))
    }
  }, [
    costStatus,
    dispatch,
    evidenceStatus,
    eventTypes,
    events.length,
    job?.id,
    job?.status,
    latestEventType,
    report,
    reportStatus,
    sourcesStatus,
    verification,
    verificationStatus,
  ])

  const sourcesVisible =
    Boolean(job) &&
    (eventTypes.has("source_discovery_started") ||
      eventTypes.has("review_started") ||
      eventTypes.has("sources_discovered") ||
      eventTypes.has("review_sources_discovered") ||
      sources.length > 0)
  const evidenceVisible =
    Boolean(job) &&
    (eventTypes.has("extraction_started") ||
      eventTypes.has("review_extraction_started") ||
      eventTypes.has("evidence_extracted") ||
      eventTypes.has("review_evidence_extracted") ||
      evidence.length > 0)
  const reportVisible =
    Boolean(job) &&
    (eventTypes.has("report_generation_started") ||
      eventTypes.has("review_report_generation_started") ||
      eventTypes.has("report_generated") ||
      eventTypes.has("review_completed") ||
      eventTypes.has("verification_started") ||
      eventTypes.has("verification_completed") ||
      Boolean(report))
  const metricsVisible =
    Boolean(job) &&
    (job?.status !== "queued" ||
      sources.length > 0 ||
      evidence.length > 0 ||
      Boolean(report) ||
      Boolean(verification))

  function handleTopicSubmit(nextTopic: string) {
    void dispatch(
      requestResearchSuggestions({
        topic: nextTopic,
      }),
    )
    void dispatch(requestResearchMemory(nextTopic))
  }

  function handleSuggestionSelect(suggestion: ResearchSuggestion) {
    dispatch(suggestionSelected(suggestion))
    void dispatch(
      startResearchJobFromSuggestion({
        suggestion_id: suggestion.id,
        budget_policy: "starter",
      }),
    )
  }

  return (
    <main className="agenda-page">
      <section className="agenda-hero">
        <p className="eyebrow">AI Deep Research</p>
        <h1>What&apos;s on the agenda today?</h1>
        <AgendaComposer disabled={isSuggestionsLoading} onSubmit={handleTopicSubmit} />
        <p className="helper-text">
          Enter a topic. We&apos;ll suggest the top 10 research directions before
          starting the deeper workflow.
        </p>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      {isSuggestionsLoading ? (
        <section className="loading-panel">
          <span className="loading-bar" />
          <p>Finding useful research angles for {topic}...</p>
        </section>
      ) : null}

      <SuggestionsPanel
        cacheAgeSeconds={suggestionCacheAgeSeconds}
        cacheHit={suggestionCacheHit}
        disabled={isJobLoading}
        onSelect={handleSuggestionSelect}
        selectedSuggestion={selectedSuggestion}
        suggestions={suggestions}
      />

      <ResearchJobPanel
        events={events}
        job={job}
        loading={isJobLoading}
        onRetry={() => {
          if (job?.id) {
            void dispatch(retryCurrentResearchJob(job.id))
          }
        }}
        retryLoading={retryStatus === "loading"}
        selectedSuggestion={selectedSuggestion}
      />

      <ResearchMemoryPanel
        loading={memoryStatus === "loading"}
        matches={memoryMatches}
        onOpen={(jobId) => {
          void dispatch(openResearchMemoryJob(jobId))
        }}
        visible={suggestionsStatus !== "idle"}
      />

      <ResearchMetricsPanel
        costSummary={costSummary}
        evidence={evidence}
        job={job}
        loading={costStatus === "loading"}
        report={report}
        sources={sources}
        verification={verification}
        visible={metricsVisible}
      />

      <SourcesPanel
        loading={
          (eventTypes.has("source_discovery_started") ||
            eventTypes.has("review_started")) &&
          sourcesStatus !== "succeeded"
        }
        sources={sources}
        visible={sourcesVisible}
      />

      <EvidencePanel
        evidence={evidence}
        loading={
          (eventTypes.has("extraction_started") ||
            eventTypes.has("review_extraction_started")) &&
          evidenceStatus !== "succeeded"
        }
        visible={evidenceVisible}
      />

      <ReportPanel
        contentLoading={contentStatus === "loading"}
        loading={
          reportStatus === "loading" ||
          (eventTypes.has("report_generation_started") && reportStatus !== "succeeded")
        }
        onRegenerate={() => {
          if (job?.id) {
            void dispatch(regenerateCurrentReport(job.id))
              .unwrap()
              .then(() => dispatch(requestResearchVerification(job.id)))
              .then(() => dispatch(requestResearchCosts(job.id)))
              .catch(() => undefined)
          }
        }}
        onGenerateContent={() => {
          if (report?.id) {
            void dispatch(
              generateCreatorContent({
                platform: selectedContentPlatform,
                source_report_id: report.id,
              }),
            )
          }
        }}
        onReview={() => {
          if (job?.id) {
            void dispatch(reviewCurrentResearchJob(job.id))
              .unwrap()
              .catch(() => dispatch(refreshResearchJob(job.id)))
          }
        }}
        report={report}
        reviewLoading={reviewStatus === "loading" || Boolean(job?.current_step?.startsWith("review"))}
        verification={verification}
        verificationLoading={
          verificationStatus === "loading" ||
          (eventTypes.has("verification_started") && verificationStatus !== "succeeded")
        }
        visible={reportVisible}
      />

      <ContentStudioPanel
        contentPackage={contentPackage}
        loading={contentStatus === "loading"}
        onGenerate={() => {
          if (report?.id) {
            void dispatch(
              generateCreatorContent({
                platform: selectedContentPlatform,
                source_report_id: report.id,
              }),
            )
          }
        }}
        onPlatformChange={setSelectedContentPlatform}
        selectedPlatform={selectedContentPlatform}
        visible={Boolean(report)}
      />
    </main>
  )
}
