import { useState } from 'react'
import TestimonialCarousel from '../components/TestimonialCarousel'

const COHORTES = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]

export default function Onboarding({ user, onDone }) {
  const [step, setStep] = useState(0)
  const [semActual, setSemActual] = useState(1)
  const [cohorte, setCohorte] = useState(new Date().getFullYear())
  const [esPrimero, setEsPrimero] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const nombre = user.email?.split('@')[0] ?? 'estudiante'

  const steps = [
    {
      title: `Bienvenide,\n${nombre}.`,
      sub: 'Configuremos tu malla en menos de 30 segundos.',
      canAdvance: true,
      body: (
        <p className="ob-intro">
          Te haremos 2 preguntas rápidas para marcar los ramos que ya aprobaste.
          Después puedes editar todo lo que quieras.
        </p>
      ),
    },
    {
      title: '¿Eres de\nprimer año?',
      sub: 'Si lo eres, activamos el tutorial guiado desde el inicio.',
      canAdvance: esPrimero !== null,
      body: (
        <div className="ob-choices">
          <button
            className={`ob-choice ${esPrimero === true ? 'on' : ''}`}
            onClick={() => setEsPrimero(true)}
          >
            🎓 Sí, primer año
          </button>
          <button
            className={`ob-choice ${esPrimero === false ? 'on' : ''}`}
            onClick={() => setEsPrimero(false)}
          >
            👋 No, ya llevo algo
          </button>
        </div>
      ),
    },
    {
      title: '¿En qué semestre\nvas ahora?',
      sub: 'Usamos esto para destacar qué ramos están disponibles.',
      canAdvance: true,
      body: (
        <div className="ob-field">
          <label>Semestre actual</label>
          <select value={semActual} onChange={e => setSemActual(+e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <option key={n} value={n}>Semestre {n}</option>
            ))}
          </select>
        </div>
      ),
    },
    {
      title: '¿Año de\ningreso?',
      sub: 'Solo para estadística interna — nada raro.',
      canAdvance: true,
      body: (
        <div className="ob-field">
          <label>Cohorte</label>
          <select value={cohorte} onChange={e => setCohorte(+e.target.value)}>
            {COHORTES.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      ),
    },
  ]

  const cur = steps[step]
  const isLast = step === steps.length - 1
  const pct = Math.round(((step + 1) / steps.length) * 100)

  const handleNext = async () => {
    if (!isLast) { setStep(s => s + 1); return }
    setSaving(true)
    setSaveError('')
    const { error } = await onDone({ semActual, cohorte, esPrimero })
    if (error) setSaveError('Error al guardar. Intenta de nuevo.')
    setSaving(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <span className="auth-back">Paso {step + 1} / {steps.length}</span>
        <h1 className="auth-title" style={{ whiteSpace: 'pre-line' }}>{cur.title}</h1>
        <p className="auth-sub">{cur.sub}</p>
        {cur.body}
        {saveError && <p className="login-error" style={{ marginTop: 12 }}>{saveError}</p>}
        <button
          className="auth-submit"
          disabled={!cur.canAdvance || saving}
          onClick={handleNext}
        >
          {saving ? 'Guardando...' : isLast ? 'Entrar a mi malla →' : 'Continuar →'}
        </button>
      </div>
      <div className="auth-visual">
        <TestimonialCarousel />
      </div>
    </div>
  )
}
