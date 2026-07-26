import { useEffect } from "react"
import { useAppDispatch } from "../../../app/hooks"
import { createEventStream } from "../../../shared/api/streamClient"
import { jobEventReceived } from "../researchSlice"
import type { ResearchJobEvent } from "../types"

export function useResearchJobStream(
  jobId: string | null | undefined,
  streamKey?: string | null,
) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!jobId) {
      return undefined
    }

    return createEventStream<ResearchJobEvent>(
      `/research/jobs/${jobId}/events`,
      (event) => dispatch(jobEventReceived(event)),
    )
  }, [dispatch, jobId, streamKey])
}
