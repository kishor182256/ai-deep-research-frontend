import { Camera, Clipboard, Download, MonitorPlay, SquarePlay, Video } from "lucide-react"
import { useState } from "react"
import type { ReactNode } from "react"
import type { ContentPackage, ContentPlatform } from "../types"

type ContentStudioPanelProps = {
  contentPackage: ContentPackage | null
  loading: boolean
  onGenerate: () => void
  onPlatformChange: (platform: ContentPlatform) => void
  selectedPlatform: ContentPlatform
  visible: boolean
}

export function ContentStudioPanel({
  contentPackage,
  loading,
  onGenerate,
  onPlatformChange,
  selectedPlatform,
  visible,
}: ContentStudioPanelProps) {
  const [copied, setCopied] = useState(false)

  if (!visible) {
    return null
  }

  const fullText = contentPackage ? packageToMarkdown(contentPackage) : ""

  async function handleCopy() {
    if (!fullText) {
      return
    }

    await navigator.clipboard.writeText(fullText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  function handleDownload() {
    if (!contentPackage) {
      return
    }

    const blob = new Blob([fullText], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${contentPackage.platform}-content-package.md`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="artifact-panel content-studio-panel" aria-label="Content Studio">
      <div className="section-heading">
        <p>Content Studio</p>
        <span>
          {loading
            ? "Generating content"
            : contentPackage
              ? `${formatPlatform(contentPackage.platform)} - ${contentPackage.language}`
              : "Creator package appears here"}
        </span>
      </div>

      <div className="content-controls" aria-label="Content platform">
        {PLATFORMS.map((platform) => (
          <button
            className={selectedPlatform === platform.value ? "selected" : undefined}
            disabled={loading}
            key={platform.value}
            onClick={() => onPlatformChange(platform.value)}
            type="button"
          >
            {platform.icon}
            <span>{platform.label}</span>
          </button>
        ))}
        <button className="generate-content-button" disabled={loading} onClick={onGenerate} type="button">
          <Video className={loading ? "spin" : undefined} size={16} />
          <span>{loading ? "Generating" : "Generate"}</span>
        </button>
      </div>

      {loading ? <span className="loading-bar" /> : null}
      {!loading && !contentPackage ? (
        <p className="artifact-empty">Generate creator content from the cited report.</p>
      ) : null}

      {contentPackage ? (
        <div className="content-package">
          {contentPackage.content_review ? (
            <div className={`content-review ${contentPackage.content_review.status}`}>
              <div>
                <strong>{Math.round(contentPackage.content_review.overall_score * 100)}% editorial score</strong>
                <small>{contentPackage.content_review.status === "ready" ? "Ready for creator review" : "Needs editorial review"}</small>
              </div>
              <div className="confidence-stats">
                <span>{Math.round(contentPackage.content_review.evidence_coverage * 100)}% evidence</span>
                <span>{Math.round(contentPackage.content_review.virality * 100)}% virality</span>
                <span>{Math.round(contentPackage.content_review.compliance * 100)}% compliance</span>
                <span>{Math.round(contentPackage.content_review.depth_score * 100)}% depth</span>
              </div>
            </div>
          ) : null}

          {contentPackage.chapter_outputs.length > 0 ? (
            <div className={`depth-panel ${contentPackage.script_depth_status ?? "unknown"}`}>
              <div>
                <strong>{formatDepthStatus(contentPackage.script_depth_status)}</strong>
                <small>
                  {formatPlatform(contentPackage.platform)} now uses modular passes, shared story memory,
                  consistency review, and a final composer.
                </small>
              </div>
              <div className="confidence-stats">
                <span>{formatNumber(contentPackage.estimated_word_count)} words</span>
                <span>{contentPackage.estimated_runtime_minutes.toFixed(1)} min est.</span>
                <span>{contentPackage.chapter_outputs.length} passes</span>
              </div>
            </div>
          ) : null}

          <div className="content-package-header">
            <span className="confidence-icon">
              <Video size={18} />
            </span>
            <div>
              <strong>{contentPackage.title}</strong>
              <small>{contentPackage.hook}</small>
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
            </div>
          </div>

          {contentPackage.chapter_plan.length > 0 ? (
            <div className="chapter-planner">
              <div>
                <strong>{contentPackage.platform === "youtube_long" ? "Long-form Chapter Planner" : "Platform Module Planner"}</strong>
                <small>Each pass has a purpose, question flow, evidence requirement, retention plan, and transition.</small>
              </div>
              <div className="chapter-grid">
                {contentPackage.chapter_plan.map((chapter) => (
                  <article className="chapter-card" key={chapter.title}>
                    <div className="chapter-card-header">
                      <div>
                        <strong>{chapter.title}</strong>
                        <small>{chapter.target_words} - {chapter.target_minutes}</small>
                      </div>
                    </div>
                    <p>{chapter.chapter_goal}</p>
                    <ChapterList items={chapter.learning_objectives} title="Learning objectives" />
                    <ChapterList items={chapter.question_flow} title="Question flow" />
                    <ChapterList items={chapter.narrative_sections} title="Narrative expansion" />
                    <ChapterList items={chapter.evidence_requirements} title="Evidence required" />
                    <ChapterList items={chapter.visual_plan} title="Visual plan" />
                    <ChapterList items={chapter.retention_hooks} title="Retention hooks" />
                    <div className="chapter-transition">
                      <span>Transition</span>
                      <p>{chapter.transition}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {contentPackage.story_memory ? (
            <div className="story-memory">
              <div>
                <strong>Shared Story Memory</strong>
                <small>{contentPackage.story_memory.tone}</small>
              </div>
              <p>{contentPackage.story_memory.core_message}</p>
              <div className="metrics-tags content-tags">
                {contentPackage.story_memory.key_terms.map((term) => (
                  <span key={term}>{term}</span>
                ))}
              </div>
              <KnowledgeList items={contentPackage.story_memory.facts_reserved} title="Facts reserved" />
            </div>
          ) : null}

          {contentPackage.chapter_outputs.length > 0 ? (
            <div className="chapter-planner">
              <div>
                <strong>Generated Passes</strong>
                <small>Each pass can be improved or retried independently later.</small>
              </div>
              <div className="chapter-grid">
                {contentPackage.chapter_outputs.map((output) => (
                  <article className="chapter-card" key={`${output.pass_number}-${output.title}`}>
                    <div className="chapter-card-header">
                      <div>
                        <strong>Pass {output.pass_number}: {output.title}</strong>
                        <small>
                          {output.chapter_type} - {output.word_count} words - {output.estimated_runtime_minutes.toFixed(1)} min
                        </small>
                      </div>
                      <span className={output.accepted ? "pass-status accepted" : "pass-status review"}>
                        {output.accepted ? "Accepted" : "Review"}
                      </span>
                    </div>
                    <pre className="module-draft">{output.draft}</pre>
                    <ChapterList items={output.checklist} title="Acceptance checklist" />
                    <ChapterList items={output.memory_updates} title="Story memory updates" />
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <div className="content-package-grid">
            <div>
              <span>{selectedPlatform === "youtube_long" ? "Expanded draft" : "Script"}</span>
              <pre>{contentPackage.script}</pre>
            </div>
            <div>
              <span>{selectedPlatform === "youtube_long" ? "Description" : "Caption"}</span>
              <pre>{contentPackage.caption}</pre>
            </div>
          </div>

          <div className="metrics-tags content-tags">
            {contentPackage.hashtags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
            {contentPackage.cta ? <span>{contentPackage.cta}</span> : null}
            {contentPackage.posting_time ? <span>{contentPackage.posting_time}</span> : null}
          </div>

          <div className="production-kit">
            <KnowledgeList items={contentPackage.design_brief} title="Design brief" />
            <KnowledgeList items={contentPackage.image_prompts} title="Image prompts" />
            <KnowledgeList items={contentPackage.video_prompts} title="AI video prompts" />
            <KnowledgeList items={contentPackage.b_roll} title="B-roll" />
            <KnowledgeList items={contentPackage.chapters} title="Chapters" />
            <KnowledgeList items={contentPackage.seo_keywords} title="SEO keywords" />
            <KnowledgeList items={contentPackage.tags} title="Platform tags" />
            {contentPackage.thumbnail_text || contentPackage.thumbnail_prompt ? (
              <div className="knowledge-list">
                <span>Thumbnail</span>
                <ul>
                  {contentPackage.thumbnail_text ? <li>{contentPackage.thumbnail_text}</li> : null}
                  {contentPackage.thumbnail_prompt ? <li>{contentPackage.thumbnail_prompt}</li> : null}
                </ul>
              </div>
            ) : null}
          </div>

          {contentPackage.story_plan ? (
            <div className="story-plan">
              <div>
                <strong>Story Planner</strong>
                <small>{contentPackage.story_plan.format} - {contentPackage.story_plan.target_runtime}</small>
              </div>
              <p>{contentPackage.story_plan.story_arc}</p>
              <div className="metrics-tags content-tags">
                {contentPackage.story_plan.narrative_layers.map((layer) => (
                  <span key={layer}>{layer}</span>
                ))}
              </div>
              <div className="story-beats">
                {contentPackage.story_plan.beats.slice(0, 7).map((beat) => (
                  <article className="story-beat" key={beat.title}>
                    <strong>{beat.title}</strong>
                    <small>{beat.duration}</small>
                    <p>{beat.purpose}</p>
                    <ul>
                      <li>{beat.narrative_question}</li>
                      <li>{beat.evidence_angle}</li>
                      <li>{beat.retention_hook}</li>
                      <li>{beat.visual_direction}</li>
                    </ul>
                  </article>
                ))}
              </div>
              <KnowledgeList items={contentPackage.story_plan.retention_hooks} title="Retention hooks" />
              <KnowledgeList items={contentPackage.story_plan.expansion_checks} title="Earn-the-runtime checks" />
            </div>
          ) : null}

          {contentPackage.consistency_review ? (
            <div className={`consistency-review ${contentPackage.consistency_review.status}`}>
              <div>
                <strong>{Math.round(contentPackage.consistency_review.score * 100)}% consistency review</strong>
                <small>{contentPackage.consistency_review.status === "passed" ? "Composer-ready" : "Needs cleanup"}</small>
              </div>
              <KnowledgeList items={contentPackage.consistency_review.composer_actions} title="Composer actions" />
              <KnowledgeList items={contentPackage.consistency_review.transition_fixes} title="Transition fixes" />
              <KnowledgeList items={contentPackage.consistency_review.duplicate_risks} title="Duplicate risks" />
              <KnowledgeList items={contentPackage.consistency_review.open_loops_resolved} title="Open loops resolved" />
            </div>
          ) : null}

          {contentPackage.structured_knowledge ? (
            <div className="structured-knowledge">
              <div>
                <strong>Reusable knowledge</strong>
                <small>Shared research layer for every content format</small>
              </div>
              <KnowledgeList
                items={contentPackage.structured_knowledge.statistics}
                title="Statistics"
              />
              <KnowledgeList
                items={contentPackage.structured_knowledge.facts}
                title="Facts"
              />
              <KnowledgeList
                items={contentPackage.structured_knowledge.visual_suggestions}
                title="Visual prompts"
              />
              <KnowledgeList
                items={contentPackage.structured_knowledge.video_scene_suggestions}
                title="Video scenes"
              />
            </div>
          ) : null}

          {contentPackage.content_review?.notes.length ? (
            <div className="verification-warnings">
              <div className="warning-heading">Editorial notes</div>
              <ul>
                {contentPackage.content_review.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function KnowledgeList({
  items,
  title,
}: {
  items: string[]
  title: string
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="knowledge-list">
      <span>{title}</span>
      <ul>
        {items.slice(0, 3).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function ChapterList({
  items,
  title,
}: {
  items: string[]
  title: string
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="chapter-list">
      <span>{title}</span>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

const PLATFORMS: Array<{
  icon: ReactNode
  label: string
  value: ContentPlatform
}> = [
  { icon: <Camera size={16} />, label: "Instagram", value: "instagram" },
  { icon: <SquarePlay size={16} />, label: "Shorts", value: "youtube_shorts" },
  { icon: <MonitorPlay size={16} />, label: "Long-form", value: "youtube_long" },
]

function packageToMarkdown(contentPackage: ContentPackage) {
  return [
    `# ${contentPackage.title}`,
    "",
    `Platform: ${formatPlatform(contentPackage.platform)}`,
    `Language: ${contentPackage.language}`,
    `Estimated words: ${contentPackage.estimated_word_count}`,
    `Estimated runtime: ${contentPackage.estimated_runtime_minutes} minutes`,
    `Depth status: ${formatDepthStatus(contentPackage.script_depth_status)}`,
    "",
    "## Hook",
    contentPackage.hook ?? "",
    "",
    "## Script",
    contentPackage.script ?? "",
    "",
    "## Caption",
    contentPackage.caption ?? "",
    "",
    "## CTA",
    contentPackage.cta ?? "",
    "",
    "## Hashtags",
    contentPackage.hashtags.join(" "),
    "",
    "## Production Kit",
    "",
    "### Design Brief",
    contentPackage.design_brief.map((item) => `- ${item}`).join("\n"),
    "",
    "### Image Prompts",
    contentPackage.image_prompts.map((item) => `- ${item}`).join("\n"),
    "",
    "### AI Video Prompts",
    contentPackage.video_prompts.map((item) => `- ${item}`).join("\n"),
    "",
    "### Thumbnail",
    contentPackage.thumbnail_text ?? "",
    contentPackage.thumbnail_prompt ?? "",
    "",
    "### SEO",
    contentPackage.seo_keywords.join(", "),
    "",
    "### Tags",
    contentPackage.tags.join(", "),
    "",
    "### Chapters",
    contentPackage.chapters.map((item) => `- ${item}`).join("\n"),
    "",
    "### B-roll",
    contentPackage.b_roll.map((item) => `- ${item}`).join("\n"),
    "",
    "## Story Planner",
    contentPackage.story_plan
      ? [
          `Format: ${contentPackage.story_plan.format}`,
          `Target runtime: ${contentPackage.story_plan.target_runtime}`,
          `Story arc: ${contentPackage.story_plan.story_arc}`,
          "",
          "### Beats",
          ...contentPackage.story_plan.beats.map(
            (beat) =>
              `- ${beat.title} (${beat.duration}): ${beat.purpose} | Question: ${beat.narrative_question} | Evidence: ${beat.evidence_angle} | Retention: ${beat.retention_hook} | Visual: ${beat.visual_direction}`,
          ),
          "",
          "### Expansion Checks",
          ...contentPackage.story_plan.expansion_checks.map((item) => `- ${item}`),
        ].join("\n")
      : "",
    "",
    "## Long-form Chapter Planner",
    contentPackage.chapter_plan.length
      ? contentPackage.chapter_plan
          .map((chapter) =>
            [
              `### ${chapter.title}`,
              `Target: ${chapter.target_words}, ${chapter.target_minutes}`,
              "",
              `Goal: ${chapter.chapter_goal}`,
              "",
              "Learning objectives:",
              ...chapter.learning_objectives.map((item) => `- ${item}`),
              "",
              "Question flow:",
              ...chapter.question_flow.map((item) => `- ${item}`),
              "",
              "Narrative expansion:",
              ...chapter.narrative_sections.map((item) => `- ${item}`),
              "",
              "Evidence required:",
              ...chapter.evidence_requirements.map((item) => `- ${item}`),
              "",
              "Visual plan:",
              ...chapter.visual_plan.map((item) => `- ${item}`),
              "",
              "Retention hooks:",
              ...chapter.retention_hooks.map((item) => `- ${item}`),
              "",
              `Transition: ${chapter.transition}`,
            ].join("\n"),
          )
          .join("\n\n")
      : "",
    "",
    "## Shared Story Memory",
    contentPackage.story_memory
      ? [
          `Core message: ${contentPackage.story_memory.core_message}`,
          `Tone: ${contentPackage.story_memory.tone}`,
          `Story arc: ${contentPackage.story_memory.story_arc}`,
          "",
          "Key terms:",
          ...contentPackage.story_memory.key_terms.map((item) => `- ${item}`),
          "",
          "Facts reserved:",
          ...contentPackage.story_memory.facts_reserved.map((item) => `- ${item}`),
        ].join("\n")
      : "",
    "",
    "## Generated Passes",
    contentPackage.chapter_outputs.length
      ? contentPackage.chapter_outputs
          .map((output) =>
            [
              `### Pass ${output.pass_number}: ${output.title}`,
              `Type: ${output.chapter_type}`,
              `Accepted: ${output.accepted ? "yes" : "no"}`,
              `Words: ${output.word_count}`,
              "",
              output.draft,
              "",
              "Checklist:",
              ...output.checklist.map((item) => `- ${item}`),
              "",
              "Memory updates:",
              ...output.memory_updates.map((item) => `- ${item}`),
            ].join("\n"),
          )
          .join("\n\n")
      : "",
    "",
    "## Consistency Review",
    contentPackage.consistency_review
      ? [
          `Status: ${contentPackage.consistency_review.status}`,
          `Score: ${Math.round(contentPackage.consistency_review.score * 100)}%`,
          "",
          "Composer actions:",
          ...contentPackage.consistency_review.composer_actions.map((item) => `- ${item}`),
          "",
          "Transition fixes:",
          ...contentPackage.consistency_review.transition_fixes.map((item) => `- ${item}`),
          "",
          "Duplicate risks:",
          ...contentPackage.consistency_review.duplicate_risks.map((item) => `- ${item}`),
          "",
          "Open loops resolved:",
          ...contentPackage.consistency_review.open_loops_resolved.map((item) => `- ${item}`),
        ].join("\n")
      : "",
  ].join("\n")
}

function formatPlatform(platform: string) {
  return platform
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatDepthStatus(status: string | null) {
  const labels: Record<string, string> = {
    documentary_depth: "Documentary depth",
    deep_draft: "Deep draft",
    expanded_outline: "Expanded outline",
    outline_needs_expansion: "Outline needs expansion",
    platform_depth_ok: "Platform depth OK",
  }

  return labels[status ?? ""] ?? "Depth pending"
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value)
}
