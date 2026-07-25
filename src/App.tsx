import { Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { lazyRoutes } from "./app/router/lazyRoutes"
import { PageLoader } from "./shared/ui/PageLoader"

function App() {
  const ResearchAgendaPage = lazyRoutes.researchAgenda

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<ResearchAgendaPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
