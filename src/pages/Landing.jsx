const FEATURES = [
  {
    num: '01',
    title: 'Notas en vivo',
    desc: 'Anota cada certamen, control e informe. Tu nota final se actualiza al tipear.',
  },
  {
    num: '02',
    title: '¿Con cuánto me salvo?',
    desc: 'Te decimos qué necesitas en lo que queda para pasar. O salvarte del 3.9.',
  },
  {
    num: '03',
    title: 'Prereqs claros',
    desc: 'Click a un ramo y ves exactamente qué desbloquea. Planifica sin adivinar.',
  },
  {
    num: '04',
    title: 'Sin cosas raras',
    desc: 'Gratis, sin publicidad, sin fines de lucro. Hecho por ICN para ICN.',
  },
]

export default function Landing({ onShowAuth }) {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="brand">
          <div className="brand-mark">M</div>
          <span>malla<em className="brand-accent">.ic</em></span>
        </div>
        <div className="nav-links">
          <button className="btn btn-ghost btn-sm" onClick={() => onShowAuth('login')}>
            Entrar
          </button>
          <button className="btn btn-sm" onClick={() => onShowAuth('signup')}>
            Crear cuenta
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot">●</span>
          <span>Hecho por y para estudiantes <b>ICN · USM</b></span>
        </div>
        <h1 className="hero-title">
          Tu malla,<br />
          pero que <em>al fin</em> <span className="scribble">entiende</span><br />
          cómo estudias.
        </h1>
        <p className="lead">
          Calcula tus notas, proyecta tu semestre, desbloquea ramos.
          Sin fines de lucro. Solo para apañar.
        </p>
        <div className="hero-cta">
          <button className="btn btn-lg" onClick={() => onShowAuth('signup')}>
            Empezar gratis →
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => onShowAuth('login')}>
            Ya tengo cuenta
          </button>
        </div>
      </section>

      <div className="hero-preview" aria-hidden="true">
        <div className="preview-frame">
          <div className="preview-inner">
            {Array.from({ length: 80 }).map((_, i) => {
              const cls = i % 11 === 0 ? 'c' : i % 7 === 0 ? 'd' : i % 13 === 0 ? 'e' : ''
              return <div key={i} className={`preview-cell ${cls}`} />
            })}
          </div>
        </div>
      </div>

      <div className="features">
        {FEATURES.map(f => (
          <div key={f.num} className="feature">
            <div className="feature-num">{f.num}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <footer className="landing-foot">
        Proyecto estudiantil sin fines de lucro · No afiliado oficialmente a la USM · 2026
      </footer>
    </div>
  )
}
