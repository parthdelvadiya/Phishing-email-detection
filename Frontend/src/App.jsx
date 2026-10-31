import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { AppErrorBoundary } from './components/layout/ErrorBoundary'
import { AnalyzePage } from './pages/AnalyzePage'
import { HistoryPage } from './pages/HistoryPage'
import { HistoryDetailPage } from './pages/HistoryDetailPage'
import { IntelligencePage } from './pages/IntelligencePage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <AppErrorBoundary>
      <ScrollToTop />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<AnalyzePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:id" element={<HistoryDetailPage />} />
          <Route path="/intelligence" element={<IntelligencePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AppErrorBoundary>
  )
}
