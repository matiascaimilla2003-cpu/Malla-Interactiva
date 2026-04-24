import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useProgreso } from './hooks/useProgreso'
import { usePerfil } from './hooks/usePerfil'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Malla from './components/Malla'

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { progreso, loading: progresoLoading, setEstado, clearEstado } = useProgreso(user?.id)
  const { perfil, loading: perfilLoading, savePerfil } = usePerfil(user?.id)

  // Unauthenticated navigation: 'landing' | 'auth'
  const [page, setPage] = useState('landing')
  const [authMode, setAuthMode] = useState('login')

  function showAuth(mode) {
    setAuthMode(mode)
    setPage('auth')
  }

  // ── Loading auth session ──────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Cargando...</p>
      </div>
    )
  }

  // ── Unauthenticated flow: Landing → Login ─────────────────────────────────
  if (!user) {
    if (page === 'auth') {
      return <Login defaultMode={authMode} onBack={() => setPage('landing')} />
    }
    return <Landing onShowAuth={showAuth} />
  }

  // ── Loading user profile ──────────────────────────────────────────────────
  if (perfilLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Cargando tu perfil...</p>
      </div>
    )
  }

  // ── Onboarding (first time) ───────────────────────────────────────────────
  if (!perfil) {
    return (
      <Onboarding
        user={user}
        onDone={savePerfil}
      />
    )
  }

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-brand">Malla IC · USM</span>
        <div className="navbar-right">
          <span className="navbar-email">{user.email}</span>
          <button className="btn-signout" onClick={signOut}>Cerrar sesión</button>
        </div>
      </nav>

      {progresoLoading ? (
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Cargando tu progreso...</p>
        </div>
      ) : (
        <Malla
          progreso={progreso}
          onSetEstado={setEstado}
          onClearEstado={clearEstado}
        />
      )}
    </div>
  )
}
