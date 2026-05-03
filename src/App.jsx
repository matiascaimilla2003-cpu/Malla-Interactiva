import { useState, useEffect, useRef } from 'react'
import { useAuth } from './hooks/useAuth'
import { useProgreso } from './hooks/useProgreso'
import { usePerfil } from './hooks/usePerfil'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Bienvenida from './pages/Bienvenida'
import Malla from './components/Malla'
import Calendario from './pages/Calendario'
import Horario from './pages/Horario'
import Historial from './pages/Historial'
import Admin from './pages/Admin'
import Configuracion from './pages/Configuracion'
import ShareModal from './components/ShareModal'
import GeneratorModal from './components/GeneratorModal'

const ADMIN_EMAIL = 'matias.caimilla@usm.cl'

const NAV_ITEMS = [
  { id: 'malla',      icon: '▦',  label: 'Mi malla' },
  { id: 'horario',    icon: '⊟',  label: 'Horario' },
  { id: 'historial',  icon: '◳',  label: 'Historial' },
  { id: 'calendario', icon: '◫',  label: 'Calendario' },
  { id: 'generador',  icon: '◈',  label: 'Generador' },
  { id: 'compartir',  icon: '↗',  label: 'Compartir' },
  { id: 'como',       icon: '?',  label: 'Cómo funciona' },
  { id: 'configuracion', icon: '⚙', label: 'Configuración' },
]

// Read hash ONCE synchronously before Supabase clears it.
// type=signup means this is a fresh email confirmation flow.
function detectSignupHash() {
  const hash = window.location.hash
  if (hash.includes('type=signup') || hash.includes('type=email_change')) {
    sessionStorage.setItem('malla_from_signup', '1')
  }
  return sessionStorage.getItem('malla_from_signup') === '1'
}

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { progreso, loading: progresoLoading, setEstado, clearEstado } = useProgreso(user?.id)
  const { perfil, loading: perfilLoading, savePerfil, saveNombre } = usePerfil(user?.id)

  // Stable across re-renders; cleared when user clicks "Empezar →"
  const [fromSignup, setFromSignup] = useState(detectSignupHash)

  const [page, setPage]             = useState('landing')
  const [authMode, setAuthMode]     = useState('login')
  const [showCalendar, setShowCalendar]   = useState(false)
  const [showHorario, setShowHorario]     = useState(false)
  const [showHistorial, setShowHistorial] = useState(false)
  const [showShare, setShowShare]         = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [showHowTo, setShowHowTo]         = useState(false)
  const [showAdmin, setShowAdmin]             = useState(false)
  const [showConfig, setShowConfig]           = useState(false)
  const [pendingCount, setPendingCount]       = useState(0)

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (!isAdmin) return
    supabase.from('comentarios').select('id', { count: 'exact', head: true })
      .eq('estado', 'pendiente')
      .then(({ count }) => setPendingCount(count ?? 0))
  }, [isAdmin, showAdmin])

  const prevUserRef = useRef(null)
  useEffect(() => {
    if (prevUserRef.current !== null && user === null) setPage('landing')
    prevUserRef.current = user ?? null
  }, [user])

  function showAuth(mode) { setAuthMode(mode); setPage('auth') }

  function handleNav(id) {
    if (id === 'calendario')  setShowCalendar(true)
    else if (id === 'horario')    setShowHorario(true)
    else if (id === 'historial')  setShowHistorial(true)
    else if (id === 'generador')  setShowGenerator(true)
    else if (id === 'compartir')  setShowShare(true)
    else if (id === 'como')       setShowHowTo(true)
    else if (id === 'admin')         setShowAdmin(true)
    else if (id === 'configuracion') setShowConfig(true)
  }

  const activeNav = showCalendar  ? 'calendario'
    : showHorario    ? 'horario'
    : showHistorial  ? 'historial'
    : showGenerator  ? 'generador'
    : showShare      ? 'compartir'
    : showHowTo      ? 'como'
    : showAdmin      ? 'admin'
    : showConfig     ? 'configuracion'
    : 'malla'

  if (authLoading) {
    return <div className="loading-screen"><div className="loading-spinner" /><p>Cargando…</p></div>
  }

  if (!user) {
    if (page === 'auth') return <Login defaultMode={authMode} onBack={() => setPage('landing')} />
    return <Landing onShowAuth={showAuth} />
  }

  if (perfilLoading) {
    return <div className="loading-screen"><div className="loading-spinner" /><p>Cargando tu perfil…</p></div>
  }

  // New user arriving from email confirmation link → show welcome screen once
  if (!perfil && fromSignup) {
    return (
      <Bienvenida onStart={() => {
        sessionStorage.removeItem('malla_from_signup')
        setFromSignup(false)
      }} />
    )
  }

  if (!perfil) return <Onboarding user={user} onDone={savePerfil} />

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand-mark">M</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">malla<em>.ic</em></span>
            <span className="sidebar-logo-sub">Ing. Comercial · USM</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-link${activeNav === item.id ? ' active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </button>
          ))}
          {isAdmin && (
            <button
              className={`sidebar-link${activeNav === 'admin' ? ' active' : ''}`}
              onClick={() => handleNav('admin')}
            >
              <span className="sidebar-link-icon">⚑</span>
              <span className="sidebar-link-label">
                Admin
                {pendingCount > 0 && (
                  <span className="sidebar-badge">{pendingCount}</span>
                )}
              </span>
            </button>
          )}
        </nav>

        <div className="sidebar-foot">
          <span className="sidebar-email">{user.email}</span>
          <button className="sidebar-signout" onClick={signOut}>Cerrar sesión</button>
        </div>
      </aside>

      <div className="main-content">
        {progresoLoading ? (
          <div className="loading-screen"><div className="loading-spinner" /><p>Cargando tu progreso…</p></div>
        ) : (
          <Malla
            progreso={progreso}
            onSetEstado={setEstado}
            onClearEstado={clearEstado}
            nombre={perfil?.nombre ?? ''}
            onSaveNombre={saveNombre}
            userId={user.id}
          />
        )}
      </div>

      {showCalendar  && <Calendario  progreso={progreso} userId={user.id} onClose={() => setShowCalendar(false)} />}
      {showHorario   && <Horario     userId={user.id}     onClose={() => setShowHorario(false)} />}
      {showHistorial && <Historial   userId={user.id}     onClose={() => setShowHistorial(false)} />}
      {showShare     && <ShareModal  user={user} progreso={progreso} onClose={() => setShowShare(false)} />}
      {showGenerator && <GeneratorModal progreso={progreso} onClose={() => setShowGenerator(false)} />}
      {showHowTo     && <HowToModal onClose={() => setShowHowTo(false)} />}
      {showAdmin     && <Admin userEmail={user.email} onClose={() => setShowAdmin(false)} />}
      {showConfig    && <Configuracion userId={user.id} onClose={() => setShowConfig(false)} />}
    </div>
  )
}

const HOW_TO_STEPS = [
  { h: 'Explora tu malla',        p: 'Los ramos vibrantes están disponibles. Los opacos requieren prereqs. Hover para ver relaciones.' },
  { h: 'Marca el estado',         p: 'Clic en un ramo → elige Cursando, Aprobado, Convalidado, etc. El color de la tarjeta cambia.' },
  { h: 'Ingresa evaluaciones',    p: 'Agrega certámenes, controles y tareas con su peso %. La nota final se calcula al tipear.' },
  { h: 'Lee la proyección',       p: 'La barra te dice cuánto necesitas en lo que falta para llegar a 55. En vivo.' },
  { h: 'Planifica con Generador', p: 'Sugiere los mejores ramos para los próximos semestres según tus prereqs y créditos.' },
  { h: 'Comparte tu avance',      p: 'Genera un link para que compañeros vean tu malla sin registrarse.' },
]

function HowToModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="howto-modal" onClick={e => e.stopPropagation()}>
        <div className="howto-head">
          <div>
            <h2 className="howto-title">Cómo funciona <em>malla.ic</em></h2>
            <p className="howto-sub">Guía rápida · 6 pasos</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="howto-body">
          {HOW_TO_STEPS.map((s, i) => (
            <div key={i} className="howto-step">
              <div className="howto-num">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <div className="howto-step-title">{s.h}</div>
                <p className="howto-step-body">{s.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
