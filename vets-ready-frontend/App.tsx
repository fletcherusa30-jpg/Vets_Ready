import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { VetsReadyLayout } from './components/layout/VetsReadyLayout'
import { HomePage } from './pages/HomePage'
import { BenefitsPage } from './pages/BenefitsPage'
import { ClaimsPage } from './pages/ClaimsPage'
import { TransitionPage } from './pages/TransitionPage'
import { FinancePage } from './pages/FinancePage'
import { JobsBusinessPage } from './pages/JobsBusinessPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { PartnersPage } from './pages/PartnersPage'

export const App: React.FC = () => {
  return (
    <Router>
      <VetsReadyLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/benefits" element={<BenefitsPage />} />
          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="/transition" element={<TransitionPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/jobs-business" element={<JobsBusinessPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/partners" element={<PartnersPage />} />
        </Routes>
      </VetsReadyLayout>
    </Router>
  )
}

export default App
