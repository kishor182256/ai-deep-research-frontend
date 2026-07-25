import { AudioLines, Mic, Plus } from "lucide-react"
import type { FormEvent } from "react"
import { useState } from "react"

type AgendaComposerProps = {
  disabled?: boolean
  onSubmit: (topic: string) => void
}

export function AgendaComposer({ disabled, onSubmit }: AgendaComposerProps) {
  const [topic, setTopic] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTopic = topic.trim()

    if (trimmedTopic.length > 1) {
      onSubmit(trimmedTopic)
    }
  }

  return (
    <form className="agenda-composer" onSubmit={handleSubmit}>
      <button
        type="button"
        className="composer-icon-button"
        aria-label="Add context"
      >
        <Plus size={24} strokeWidth={1.8} />
      </button>

      <input
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        placeholder="Ask anything"
        aria-label="Research topic"
        disabled={disabled}
      />

      <button
        type="button"
        className="composer-icon-button"
        aria-label="Use voice input"
      >
        <Mic size={22} strokeWidth={1.9} />
      </button>

      <button
        type="submit"
        className="composer-submit-button"
        aria-label="Generate suggestions"
        disabled={disabled || topic.trim().length < 2}
      >
        <AudioLines size={24} strokeWidth={2.2} />
      </button>
    </form>
  )
}
