import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import TrialExpired from './pages/TrialExpired'
import Onboarding from './pages/Onboarding'

function LoadingScreen() {
  return (
    <div style={{ background: "#080c14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 9, background: "linear-gradient(135deg,#f59e0b,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22, color: "#000", margin: "0 auto 14px" }}>F</div>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#4a5c7a" }}>Cargando...</div>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading, onboardingDone, isTrialActive } = useAuth()

  console.log('[FinPulse] App render — user:', user?.id ?? null, '| loading:', loading, '| onboardingDone:', onboardingDone)

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        user ? <Navigate to={onboardingDone ? "/app" : "/onboarding"} replace /> : <AuthPage mode="login" />
      } />
      <Route path="/signup" element={
        user ? <Navigate to={onboardingDone ? "/app" : "/onboarding"} replace /> : <AuthPage mode="signup" />
      } />
      <Route path="/onboarding" element={
        !user
          ? <Navigate to="/login" replace />
          : onboardingDone
            ? <Navigate to="/app" replace />
            : <Onboarding />
      } />
      <Route path="/app" element={
        !user
          ? <Navigate to="/login" replace />
          : !onboardingDone
            ? <Navigate to="/onboarding" replace />
            : !isTrialActive()
              ? <TrialExpired />
              : <Dashboard />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
