import { Clock3, Database, FileText, Plus, Search } from "lucide-react"
import type { ResearchMemoryMatch } from "../types"

type TopicSidebarProps = {
  currentTopic: string
  memoryMatches: ResearchMemoryMatch[]
  memoryLoading: boolean
  recentTopics: string[]
  onMemoryOpen: (jobId: string) => void
  onNewResearch: () => void
  onTopicSelect: (topic: string) => void
}

export function TopicSidebar({
  currentTopic,
  memoryLoading,
  memoryMatches,
  onMemoryOpen,
  onNewResearch,
  onTopicSelect,
  recentTopics,
}: TopicSidebarProps) {
  return (
    <aside className="topic-sidebar" aria-label="Research topics">
      <div className="topic-sidebar-header">
        <strong>AI Deep Research</strong>
        <button type="button" onClick={onNewResearch}>
          <Plus size={15} />
          <span>New research</span>
        </button>
      </div>

      <div className="topic-search-box">
        <Search size={15} />
        <span>{currentTopic || "Search any topic"}</span>
      </div>

      <nav className="topic-sidebar-section" aria-label="Recent topics">
        <span>Recent topics</span>
        {recentTopics.length > 0 ? (
          recentTopics.map((topic) => (
            <button
              className={topic === currentTopic ? "active" : undefined}
              key={topic}
              type="button"
              onClick={() => onTopicSelect(topic)}
            >
              <FileText size={14} />
              <span>{topic}</span>
            </button>
          ))
        ) : (
          <p>No topic searches yet.</p>
        )}
      </nav>

      <div className="topic-sidebar-section">
        <span>{memoryLoading ? "Checking memory" : "Reusable research"}</span>
        {memoryMatches.length > 0 ? (
          memoryMatches.slice(0, 5).map((match) => (
            <button key={match.job_id} type="button" onClick={() => onMemoryOpen(match.job_id)}>
              <Database size={14} />
              <span>{match.title}</span>
              <small>{Math.round(match.score * 100)}%</small>
            </button>
          ))
        ) : (
          <p>{memoryLoading ? "Looking for similar reports..." : "No reusable matches yet."}</p>
        )}
      </div>

      <div className="topic-sidebar-footnote">
        <Clock3 size={14} />
        <span>Sources, evidence, reports, and content stay tied to the active topic.</span>
      </div>
    </aside>
  )
}
