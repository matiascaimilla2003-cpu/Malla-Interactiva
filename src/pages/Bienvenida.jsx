import { useEffect, useRef } from 'react'

export default function Bienvenida({ onStart }) {
  const started = useRef(false)

  useEffect(() => {
    return () => { started.current = false }
  }, [])

  function handleStart() {
    if (started.current) return
    started.current = true
    onStart()
  }

  return (
    <div className="bienvenida-page">

      <div className="bienvenida-card">
        {/* Animated check SVG */}
        <div className="bv-check-wrap">
          <svg viewBox="0 0 80 80" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="oklch(78% 0.14 205)" />
                <stop offset="100%" stopColor="oklch(65% 0.25 295)" />
              </linearGradient>
            </defs>
            <circle className="bv-glow-bg" cx="40" cy="40" r="39" />
            <circle className="bv-ring"    cx="40" cy="40" r="36" transform="rotate(-90 40 40)" />
            <polyline className="bv-mark"  points="23,41 35,53 57,29" />
          </svg>
        </div>

        <h1 className="bv-title">¡Cuenta confirmada! 🎓</h1>
        <p className="bv-subtitle">Bienvenide a malla.ic</p>
        <p className="bv-message">
          Tu carrera en Ingeniería Comercial empieza a organizarse hoy.
        </p>

        <button className="bv-btn" onClick={handleStart}>
          Empezar →
        </button>
      </div>

    </div>
  )
}
