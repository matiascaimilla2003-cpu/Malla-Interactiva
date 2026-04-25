import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modo, setModo] = useState('login') // 'login' | 'registro'
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Malla Interactiva</h1>
          <p>Ing. Comercial USM</p>
        </div>

        <div className="login-tabs">
          <button
            className={modo === 'login' ? 'active' : ''}
            onClick={() => setModo('login')}
          >
            Iniciar sesión
          </button>
          <button
            className={modo === 'registro' ? 'active' : ''}
            onClick={() => setModo('registro')}
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

          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
