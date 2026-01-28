import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { VeteranProfileProvider } from './contexts/VeteranProfileContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { SettingsPanel } from './components/SettingsPanel';
import HomePage from './pages/HomePage';
import ClaimsHub from './pages/ClaimsHub';
import { Evidence } from './pages/Evidence';
import { Benefits } from './pages/Benefits';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Retirement } from './pages/Retirement';
import { JobBoard } from './pages/JobBoard';
import OnboardingWizard from './pages/OnboardingWizard';
import VeteranProfileSetup from './pages/VeteranProfile';
import BenefitsDashboard from './pages/BenefitsDashboard';
import BenefitsMatrixDashboard from './components/BenefitsDashboard';
import CompleteClaimWizard from './components/CompleteClaimWizard';
import MatrixDashboard from './components/MatrixDashboard';
import { WizardPage } from './pages/WizardPage';
import { WalletPage } from './pages/WalletPage';
import { LifeMapPage } from './pages/LifeMapPage';
import { OpportunityRadarPage } from './pages/OpportunityRadarPage';
import { ThemeProvider } from './contexts/ThemeContext';
import TransitionPage from './pages/TransitionPage';
import EducationPage from './pages/EducationPage';
import EmploymentPage from './pages/EmploymentPage';
import MyTotalBenefitsCenter from './pages/MyTotalBenefitsCenter';
import VAKnowledgeCenter from './pages/VAKnowledgeCenter';
import MilitaryDiscountsPage from './components/pages/MilitaryDiscountsPage';

const AppContent: React.FC = () => {
  const { currentTheme, currentBackground, settings } = useSettings();

  return (
    <>
      {/* Static Background Image */}
      <div
        className="min-h-screen relative va-theme-bg bg-[url('/assets/background.jpg')] bg-contain bg-center bg-fixed bg-no-repeat"
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black opacity-40 z-0" />

        {/* Content Container */}
        <div className="relative z-10">
          {/* Modern Header with Branch Theme */}
          <header
            className="text-white py-6 shadow-2xl border-b-4 va-theme-bg va-theme-border"
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <Link to="/" className="hover:opacity-90 transition-opacity">
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{currentTheme.icon}</div>
                    <div>
                      <h1 className="text-4xl font-bold tracking-wide va-theme-text va-theme-shadow">VETS READY</h1>
                      <p className="font-semibold va-theme-accent-text">Serving Those Who Served</p>
                    </div>
                  </div>
                </Link>
                <nav className="hidden md:flex gap-6 items-center">
                  <Link
                    to="/claims"
                    className="transition-colors font-bold uppercase tracking-wide va-theme-text hover:va-theme-accent-text"
                  >
                    🎖️ Claims Management
                  </Link>
                  <Link
                    to="/transition"
                    className="transition-colors font-bold uppercase tracking-wide va-theme-text hover:va-theme-accent-text"
                  >
                    🎯 Career Transition
                  </Link>
                  <Link
                    to="/retirement"
                    className="transition-colors font-bold uppercase tracking-wide va-theme-text hover:va-theme-accent-text"
                  >
                    💰 Financial Planning
                  </Link>
                  <Link
                    to="/dashboard"
                    className="transition-colors font-bold uppercase tracking-wide va-theme-text hover:va-theme-accent-text"
                  >
                    📊 Benefits Center
                  </Link>
                  <Link
                    to="/va-knowledge"
                    className="transition-colors font-bold uppercase tracking-wide va-theme-text hover:va-theme-accent-text"
                  >
                    📚 VA Resources
                  </Link>
                  <Link
                    to="/wizard"
                    className="transition-colors font-bold uppercase tracking-wide va-theme-text hover:va-theme-accent-text"
                  >
                    🚀 File New Claim
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded font-bold transition va-theme-accent-bg text-black"
                  >
                    Login
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/start" element={<OnboardingWizard />} />
              <Route path="/wizard" element={<WizardPage />} />
              <Route path="/matrix" element={<MatrixDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<VeteranProfileSetup />} />
              <Route path="/dashboard" element={<BenefitsDashboard />} />
              <Route path="/benefits-center" element={<MyTotalBenefitsCenter />} />
              <Route path="/va-knowledge" element={<VAKnowledgeCenter />} />
              <Route path="/discounts" element={<MilitaryDiscountsPage />} />
              <Route path="/evidence" element={<Evidence />} />
              <Route path="/benefits" element={<Benefits />} />
              <Route path="/jobs" element={<JobBoard />} />
              <Route path="/claims" element={<ClaimsHub />} />

              {/* Transition & Career Pages */}
              <Route path="/transition" element={<TransitionPage />} />
              <Route path="/employment" element={<EmploymentPage />} />
              <Route path="/education" element={<EducationPage />} />

              {/* Retirement & Financial Pages */}
              <Route path="/retirement" element={<Retirement />} />

              {/* Dashboard Tab Redirects */}
              <Route path="/housing" element={<Navigate to="/dashboard?tab=housing" replace />} />
              <Route path="/appeals" element={<Navigate to="/dashboard?tab=appeals" replace />} />

              {/* Phase 2 Routes */}
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/lifemap" element={<LifeMapPage />} />
              <Route path="/opportunities" element={<OpportunityRadarPage />} />
            </Routes>
          </main>

          {/* Settings Side Panel */}
          <SettingsPanel />

          {/* Footer with Branch Theme */}
          <footer
            className="text-white py-8 mt-12 border-t-4 va-theme-bg va-theme-border"
          >
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Section */}
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                    <span className="text-4xl">{currentTheme.icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold va-theme-text">VetsReady</h3>
                    </div>
                  </div>
                  <p className="font-semibold va-theme-accent-text">
                    Honoring Service. Supporting Veterans Nationwide.
                  </p>
                </div>

                {/* Center Section */}
                <div className="text-center">
                  <nav className="flex flex-wrap justify-center gap-4">
                    <a href="#" className="hover:opacity-75 transition font-semibold va-theme-text">About</a>
                    <span className="va-theme-text">|</span>
                    <a href="#" className="hover:opacity-75 transition font-semibold va-theme-text">Contact</a>
                    <span className="va-theme-text">|</span>
                    <a href="#" className="hover:opacity-75 transition font-semibold va-theme-text">Privacy</a>
                  </nav>
                  <p className="text-sm mt-4 opacity-70 va-theme-text">
                    © {new Date().getFullYear()} VetsReady. All rights reserved.
                  </p>
                </div>

                {/* Right Section */}
                <div className="text-center md:text-right">
                  <div className="flex items-center gap-2 justify-center md:justify-end">
                    <span className="text-2xl">⭐</span>
                    <p className="font-bold text-lg italic va-theme-accent-text">
                      "Land of the Free, Because of the Brave"
                    </p>
                    <span className="text-2xl">⭐</span>
                  </div>
                  <p className="text-xs mt-3 opacity-60 va-theme-text">
                    Advisory platform only. Not affiliated with the Department of Veterans Affairs.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <style>{`
        @keyframes themeGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <VeteranProfileProvider>
      <ThemeProvider>
        <SettingsProvider>
          <Router>
            <AppContent />
          </Router>
        </SettingsProvider>
      </ThemeProvider>
    </VeteranProfileProvider>
  );
};

export default App;
