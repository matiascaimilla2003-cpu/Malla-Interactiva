import { useState, useMemo } from 'react'
import { AREAS, RAMOS } from '../data/malla'

export default function GeneratorModal({ onClose, progreso }) {
  const [target, setTarget] = useState(40)

  const done = useMemo(() =>
    new Set(
      Object.entries(progreso)
        .filter(([, st]) => st === 'aprobado' || st === 'convalidado')
        .map(([code]) => code)
    )
  , [progreso])

  const suggestions = useMemo(() => {
    const pool = RAMOS.filter(r => !done.has(r.code))
    const sems = []
    const local = new Set(done)

    for (let i = 0; i < 3; i++) {
      const avail = pool.filter(r =>
        r.prereqs.every(p => local.has(p)) &&
        !sems.flat().find(x => x.code === r.code)
      )
      avail.sort((a, b) => a.sem - b.sem || b.credits - a.credits)

      const picked = []
      let cr = 0
      for (const r of avail) {
        if (cr + r.credits > target + 6) continue
        picked.push(r)
        cr += r.credits
        if (cr >= target) break
      }
      sems.push(picked)
      picked.forEach(p => local.add(p.code))
      if (picked.length === 0) break
    }
    return sems
  }, [done, target])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mini-modal gen-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close mini-modal-close" onClick={onClose}>✕</button>
        <h3 className="mini-modal-title">Generador de semestre</h3>
        <p className="mini-modal-sub">
          Qué tomar en los próximos semestres según tus prereqs aprobados.
        </p>

        <div className="gen-target-row">
          <label className="gen-target-label">
            Créditos objetivo por semestre: <b>{target}</b>
          </label>
          <input
            type="range"
            className="gen-slider"
            min="12" max="50" step="1"
            value={target}
            onChange={e => setTarget(+e.target.value)}
          />
          {target > 35 && (
            <p className="gen-overload-warn">
              ⚠ Los créditos formales por semestre son máximo 35.
            </p>
          )}
        </div>

        <div className="sem-suggest">
          {suggestions.map((sem, i) => (
            <div key={i} className="sem-suggest-card">
              <div className="sem-suggest-head">
                <span className="sem-suggest-label">Semestre +{i + 1}</span>
                <span className="sem-suggest-meta">
                  {sem.reduce((a, r) => a + r.credits, 0)} cr · {sem.length} ramos
                </span>
              </div>
              <div className="sem-ramos">
                {sem.length === 0 ? (
                  <span className="cal-empty-msg">Sin ramos disponibles.</span>
                ) : sem.map(r => (
                  <span
                    key={r.code}
                    className="sem-ramo-pill"
                    style={{ '--pill-color': AREAS[r.area].color }}
                  >
                    <i className="sem-ramo-dot" />
                    {r.code} {r.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
