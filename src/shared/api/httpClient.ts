import axios from "axios"
import { env } from "../../config/env"

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 45_000,
  headers: {
    "Content-Type": "application/json",
  },
})

httpClient.interceptors.request.use((config) => {
  config.headers.set("X-Request-Id", crypto.randomUUID())
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data
      const apiError =
        typeof payload === "object" && payload !== null && "error" in payload
          ? (payload.error as { message?: string; request_id?: string })
          : null
      const legacyDetail =
        typeof payload === "object" && payload !== null && "detail" in payload
          ? String(payload.detail)
          : null
      const requestId = apiError?.request_id
      const message = apiError?.message ?? legacyDetail ?? error.message
      const suffix = requestId ? ` Request ID: ${requestId}` : ""

      return Promise.reject(new Error(`${message}${suffix}`))
    }

    return Promise.reject(error)
  },
)
