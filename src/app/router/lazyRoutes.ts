import { lazy } from "react"

export const lazyRoutes = {
  researchAgenda: lazy(() => import("../../pages/ResearchAgendaPage")),
}
