import { AREAS } from '../data/malla'

const FEATURES = [
  {
    num: '01',
    color: 'oklch(78% 0.14 205)',
    title: 'Proyección en tiempo real',
    desc: 'Ingresa tus notas y calcula al instante cuánto necesitas en cada evaluación pendiente para aprobar con 55.',
  },
  {
    num: '02',
    color: 'oklch(72% 0.18 355)',
    title: 'Árbol de prerrequisitos',
    desc: 'Visualiza al instante qué ramos habilita cada aprobación. Planifica tu ruta académica sin sorpresas.',
  },
  {
    num: '03',
    color: 'oklch(65% 0.19 260)',
    title: 'Horario visual',
    desc: 'Arma tu semana bloque a bloque. Ve sala, paralelo y ramo en una vista limpia tipo SIGA pero bonita.',
  },
  {
    num: '04',
    color: 'oklch(72% 0.19 145)',
    title: 'Tu progreso, tuyo',
    desc: 'Datos guardados en la nube. Accede desde cualquier dispositivo. Sin publicidad. Sin fines de lucro.',
  },
]

// 8 semesters × 5 ramos each — mirrors the real malla areas
const PREVIEW_SEMS = [
  ['mat', 'tcs', 'eh',   'inf', 'eco'],
  ['mat', 'tcs', 'fin',  'ing', 'adm'],
  ['eco', 'mat', 'adm',  'eh',  'def'],
  ['fin', 'mkt', 'ops',  'ing', 'eco'],
  ['fin', 'elec','mkt',  'ops', 'adm'],
  ['elec','fin', 'mkt',  'ing', 'ops'],
  ['elec','fin', 'ops',  'mkt', 'adm'],
  ['elec','fin', 'mkt',  'ing', 'ops'],
]
const SEM_STATES = ['done','done','done','active','locked','locked','locked','locked']

export default function Landing({ onShowAuth }) {
  return (
    <div className="landing">

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="brand">
          <div className="brand-mark">M</div>
          <span>malla<em className="brand-ic">.ic</em></span>
        </div>
        <div className="nav-links">
          <button className="btn btn-ghost btn-sm" onClick={() => onShowAuth('login')}>
            Entrar
          </button>
          <button className="btn btn-cta btn-sm" onClick={() => onShowAuth('signup')}>
            Crear cuenta
          </button>
        </div>
      </nav>

      {/* ── Hero two-column ── */}
      <section className="hero-two">

        {/* Left */}
        <div className="hero-left">
          <div className="hero-badge">
            <span className="hero-badge-dot">●</span>
            Hecho por y para estudiantes <b>ICN · USM</b>
          </div>
          <h1 className="hero-title">
            Tu malla curricular,<br />
            inteligente y en<br />
            <span className="hero-gradient">tiempo real.</span>
          </h1>
          <p className="lead">
            Registra notas, proyecta tu semestre y desbloquea ramos.
            Diseñado por estudiantes ICN para estudiantes ICN.
          </p>
          <div className="hero-cta">
            <button className="btn btn-cta btn-lg" onClick={() => onShowAuth('signup')}>
              Empezar gratis →
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => onShowAuth('login')}>
              Ya tengo cuenta
            </button>
          </div>
        </div>

        {/* Right — animated malla preview */}
        <div className="hero-right" aria-hidden="true">
          <div className="malla-preview">
            <div className="malla-preview-inner">
              {PREVIEW_SEMS.map((ramos, semIdx) => (
                <div key={semIdx} className="preview-col">
                  <div className="preview-sem-label">S{semIdx + 1}</div>
                  {ramos.map((area, ramoIdx) => {
                    const areaData = AREAS[area]
                    const state    = SEM_STATES[semIdx]
                    return (
                      <div
                        key={ramoIdx}
                        className={`preview-ramo preview-ramo-${state}`}
                        style={{ '--cell-color': areaData?.color }}
                      >
                        {state === 'done'   && <span className="preview-check">✓</span>}
                        {state === 'active' && <span className="preview-pulse" />}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* ── Features 2×2 ── */}
      <div className="features-grid">
        {FEATURES.map(f => (
          <div key={f.num} className="feature-card" style={{ '--fn-color': f.color }}>
            <div className="feature-num">{f.num}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <footer className="landing-foot">
        <div className="foot-icons">
          <a
            href="https://github.com/matiascaimilla2003-cpu/malla-interactiva"
            target="_blank" rel="noopener noreferrer"
            className="foot-icon-link" aria-label="GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
          <a href="mailto:contacto@malla-ic.cl" className="foot-icon-link" aria-label="Correo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
        </div>
        <p>Proyecto estudiantil independiente · No afiliado oficialmente a la USM · Ing. Comercial · 2026</p>
      </footer>

    </div>
  )
}
