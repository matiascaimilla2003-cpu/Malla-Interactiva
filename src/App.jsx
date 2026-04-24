import { useAuth } from './hooks/useAuth'
import { useProgreso } from './hooks/useProgreso'
import Login from './pages/Login'
import Malla from './components/Malla'

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { progreso, loading: progresoLoading, setEstado, clearEstado } = useProgreso(user?.id)

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

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
