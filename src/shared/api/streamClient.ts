import { env } from "../../config/env"

export type StreamEventHandler<TEvent> = (event: TEvent) => void

export function createEventStream<TEvent>(
  path: string,
  onEvent: StreamEventHandler<TEvent>,
  onError?: (error: Error) => void,
) {
  const controller = new AbortController()

  void fetch(`${env.apiBaseUrl}${path}`, {
    signal: controller.signal,
    headers: {
      Accept: "text/event-stream, application/json",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Stream request failed with ${response.status}`)
      }

      const contentType = response.headers.get("content-type") ?? ""

      if (contentType.includes("application/json")) {
        const payload = (await response.json()) as TEvent | TEvent[]
        const events = Array.isArray(payload) ? payload : [payload]
        events.forEach(onEvent)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        return
      }

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (line.startsWith("data:")) {
            onEvent(JSON.parse(line.slice(5).trim()) as TEvent)
          }
        }
      }
    })
    .catch((error: unknown) => {
      if (!controller.signal.aborted) {
        onError?.(error instanceof Error ? error : new Error(String(error)))
      }
    })

  return () => controller.abort()
}
