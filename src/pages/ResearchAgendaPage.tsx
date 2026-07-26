import { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { AgendaComposer } from "../features/research/components/AgendaComposer"
import { ContentStudioPanel } from "../features/research/components/ContentStudioPanel"
import { ResearchMetricsPanel } from "../features/research/components/ResearchMetricsPanel"
import { ResearchJobPanel } from "../features/research/components/ResearchJobPanel"
import { SourcesPanel } from "../features/research/components/SourcesPanel"
import { SuggestionsPanel } from "../features/research/components/SuggestionsPanel"
import { TopicSidebar } from "../features/research/components/TopicSidebar"
import { WorkflowStatusPanel } from "../features/research/components/WorkflowStatusPanel"
import { useResearchJobStream } from "../features/research/hooks/useResearchJobStream"
import {
  regenerateCurrentReport,
  generateCreatorContent,
  openResearchMemoryJob,
  refreshResearchJob,
  requestResearchEvidence,
  requestResearchMemory,
  requestResearchReport,
  requestResearchSuggestions,
  requestResearchSources,
  requestResearchVerification,
  reviewCurrentResearchJob,
  retryCurrentResearchJob,
  selectSourcesForCurrentJob,
  sourceToggled,
  startResearchJobFromSuggestions,
  suggestionToggled,
  resetResearchState,
} from "../features/research/researchSlice"
import type { ContentPlatform, ResearchSuggestion } from "../features/research/types"

export default function ResearchAgendaPage() {
  const dispatch = useAppDispatch()
  const [selectedContentPlatform, setSelectedContentPlatform] =
    useState<ContentPlatform>("youtube_shorts")
  const [recentTopics, setRecentTopics] = useState<string[]>([])
  const {
    error,
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
    selectedSourceIds,
    sourceSelectionStatus,
    sourcesStatus,
    suggestions,
    suggestionsStatus,
    selectedSuggestions,
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
  const hasStartedResearch = isJobLoading || Boolean(job)
  const waitingForSourceSelection = job?.status === "awaiting_source_selection"
  const sourceWorkflowStarted =
    sourceSelectionStatus === "loading" ||
    eventTypes.has("sources_selected") ||
    eventTypes.has("extraction_ready") ||
    eventTypes.has("extraction_started") ||
    eventTypes.has("evidence_extracted") ||
    eventTypes.has("report_generation_started") ||
    eventTypes.has("verification_started")
  const workflowIsRunning =
    isJobLoading ||
    job?.status === "queued" ||
    job?.status === "running" ||
    job?.status === "awaiting_extraction" ||
    job?.status === "awaiting_report" ||
    job?.status === "awaiting_verification"

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
    }

    if (
      (latestEventType === "evidence_extracted" || latestEventType === "review_evidence_extracted") &&
      evidenceStatus === "idle"
    ) {
      void dispatch(refreshResearchJob(job.id))
      void dispatch(requestResearchEvidence(job.id))
    }

    if (
      latestEventType === "report_generated" &&
      reportStatus === "idle"
    ) {
      void dispatch(refreshResearchJob(job.id))
      void dispatch(requestResearchReport(job.id))
    }

    if (
      latestEventType === "verification_completed" &&
      verificationStatus === "idle"
    ) {
      void dispatch(refreshResearchJob(job.id))
      void dispatch(requestResearchReport(job.id))
      void dispatch(requestResearchVerification(job.id))
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

  }, [
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
    waitingForSourceSelection &&
    sourceSelectionStatus !== "loading"
  const metricsVisible =
    Boolean(job) &&
    (job?.status !== "queued" ||
      sources.length > 0 ||
      evidence.length > 0 ||
      Boolean(report) ||
      Boolean(verification))

  function handleTopicSubmit(nextTopic: string) {
    const cleanTopic = nextTopic.trim()
    if (!cleanTopic) {
      return
    }

    setRecentTopics((previousTopics) => [
      cleanTopic,
      ...previousTopics.filter((item) => item !== cleanTopic),
    ].slice(0, 12))
    void dispatch(
      requestResearchSuggestions({
        topic: cleanTopic,
      }),
    )
    void dispatch(requestResearchMemory(cleanTopic))
  }

  function handleNewResearch() {
    dispatch(resetResearchState())
  }

  function handleSuggestionToggle(suggestion: ResearchSuggestion) {
    dispatch(suggestionToggled(suggestion))
  }

  function handleResearchStart() {
    if (selectedSuggestions.length === 0) {
      return
    }

    void dispatch(
      startResearchJobFromSuggestions({
        suggestion_ids: selectedSuggestions.map((suggestion) => suggestion.id),
        budget_policy: "starter",
      }),
    )
  }

  function handleSourceUse() {
    if (!job?.id || selectedSourceIds.length === 0) {
      return
    }

    void dispatch(
      selectSourcesForCurrentJob({
        jobId: job.id,
        sourceIds: selectedSourceIds,
      }),
    )
  }

  return (
    <main className="agenda-page">
      <TopicSidebar
        currentTopic={topic}
        memoryLoading={memoryStatus === "loading"}
        memoryMatches={memoryMatches}
        onMemoryOpen={(jobId) => {
          void dispatch(openResearchMemoryJob(jobId))
        }}
        onNewResearch={handleNewResearch}
        onTopicSelect={handleTopicSubmit}
        recentTopics={recentTopics}
      />

      <section className="agenda-workspace">
        <ResearchMetricsPanel
          contentLoading={contentStatus === "loading"}
          evidence={evidence}
          job={job}
          loading={jobStatus === "loading"}
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
          onRegenerate={() => {
            if (job?.id) {
              void dispatch(regenerateCurrentReport(job.id))
                .unwrap()
                .then(() => dispatch(requestResearchVerification(job.id)))
                .catch(() => undefined)
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
          regenerateLoading={
            reportStatus === "loading" ||
            (eventTypes.has("report_generation_started") && reportStatus !== "succeeded")
          }
          reviewLoading={reviewStatus === "loading" || Boolean(job?.current_step?.startsWith("review"))}
          sources={sources}
          verification={verification}
          visible={metricsVisible}
        />

        <section className={`agenda-hero ${hasStartedResearch ? "compact" : ""}`}>
          <p className="eyebrow">AI Deep Research</p>
          <h1>What&apos;s on the agenda today?</h1>
          <AgendaComposer disabled={isSuggestionsLoading || isJobLoading} onSubmit={handleTopicSubmit} />
          {!hasStartedResearch ? (
            <p className="helper-text">
              Enter a topic. We&apos;ll suggest the top 10 research directions before
              starting the deeper workflow.
            </p>
          ) : null}
        </section>

        {error ? <div className="error-banner">{error}</div> : null}

        {isSuggestionsLoading && !hasStartedResearch ? (
          <section className="loading-panel">
            <span className="loading-bar" />
            <p>Finding useful research angles for {topic}...</p>
          </section>
        ) : null}

        {!hasStartedResearch ? (
          <SuggestionsPanel
            cacheAgeSeconds={suggestionCacheAgeSeconds}
            cacheHit={suggestionCacheHit}
            disabled={isJobLoading}
            onStart={handleResearchStart}
            onToggle={handleSuggestionToggle}
            selectedSuggestions={selectedSuggestions}
            starting={isJobLoading}
            suggestions={suggestions}
          />
        ) : null}

        <WorkflowStatusPanel
          events={events}
          job={job}
          mode={sourceWorkflowStarted ? "sources" : "research"}
          visible={Boolean(hasStartedResearch && workflowIsRunning && !waitingForSourceSelection)}
        />

        {job?.status === "failed" ? (
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
            selectedSuggestions={selectedSuggestions}
          />
        ) : null}

        <SourcesPanel
          loading={sourcesStatus === "loading"}
          onToggleSource={(sourceId) => dispatch(sourceToggled(sourceId))}
          onUseSelected={handleSourceUse}
          selectedSourceIds={selectedSourceIds}
          selecting={sourceSelectionStatus === "loading"}
          sources={sources}
          visible={sourcesVisible}
          waitingForSelection={waitingForSourceSelection}
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
          visible={contentStatus === "loading" || Boolean(contentPackage)}
        />
      </section>
    </main>
  )
}
