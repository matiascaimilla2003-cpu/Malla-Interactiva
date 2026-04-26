import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import TestimonialCarousel from '../components/TestimonialCarousel'

export default function Login({ defaultMode = 'login', onBack }) {
  const { signIn, signUp } = useAuth()
  const [modo, setModo] = useState(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMensaje('')
    setCargando(true)

    if (modo === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError('Correo o contraseña incorrectos.')
    } else {
      const { error } = await signUp(email, password)
      if (error) setError('Error al registrarse: ' + error.message)
      else setMensaje('¡Cuenta creada! Revisa tu correo para confirmar.')
    }
    setCargando(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        {onBack
          ? <button type="button" className="auth-back" onClick={onBack}>← Volver al inicio</button>
          : <div style={{ marginBottom: 32 }} />
        }

        <h1 className="auth-title">
          {modo === 'login' ? <>Hola de<br />nuevo.</> : <>Créate<br />una cuenta.</>}
        </h1>
        <p className="auth-sub">
          {modo === 'login' ? 'Entra con tu cuenta ICN.' : 'Gratis. Usa tu mail @alumnos.usm.cl.'}
        </p>

        <div className="auth-login-tabs">
          <button
            className={modo === 'login' ? 'active' : ''}
            onClick={() => { setModo('login'); setError(''); setMensaje('') }}
          >
            Iniciar sesión
          </button>
          <button
            className={modo === 'signup' ? 'active' : ''}
            onClick={() => { setModo('signup'); setError(''); setMensaje('') }}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@usm.cl"
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <p className="login-error">{error}</p>}
          {mensaje && <p className="login-success">{mensaje}</p>}

          <button type="submit" className="auth-submit" disabled={cargando}>
            {cargando ? 'Cargando...' : modo === 'login' ? 'Entrar →' : 'Crear cuenta →'}
          </button>
        </form>
      </div>

      <div className="auth-visual">
        <TestimonialCarousel />
      </div>
    </div>
  )
}
