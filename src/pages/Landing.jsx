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

        {/* Upper — brand sign-off */}
        <div className="foot-upper">
          <p className="foot-made">Hecho con 💙 por <span className="foot-brand-gradient">Ingecos</span></p>
          <p className="foot-sub">Estudiantes de Ingeniería Comercial · USM</p>
        </div>

        {/* Lower — info bar */}
        <div className="foot-lower">
          <span className="foot-copy">malla.ic · 2026</span>

          <div className="foot-links">
            <a href="mailto:matias.caimilla@usm.cl" className="foot-link" aria-label="Correo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              matias.caimilla@usm.cl
            </a>
            <a
              href="https://www.instagram.com/ingenieriacomercialusm/"
              target="_blank" rel="noopener noreferrer"
              className="foot-link" aria-label="Instagram"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @ingenieriacomercialusm
            </a>
          </div>

          <span className="foot-right">Proyecto estudiantil independiente</span>
        </div>

      </footer>

    </div>
  )
}
