import { useState, useMemo } from 'react'
import { RAMOS, SEMESTRES, AREAS } from '../data/malla'
import RamoCard from './RamoCard'
import RamoModal from './RamoModal'

function loadGrade(code) {
  try {
    const raw = localStorage.getItem(`malla_evals_${code}`)
    if (!raw) return null
    const evals = JSON.parse(raw)
    const weighted = evals.filter(e => +e.weight > 0)
    if (!weighted.length) return null
    if (!weighted.every(e => e.grade !== '' && e.grade != null)) return null
    const totalW = weighted.reduce((s, e) => s + +e.weight, 0)
    return weighted.reduce((s, e) => s + +e.grade * +e.weight, 0) / totalW
  } catch { return null }
}

const maxSem = Math.max(...SEMESTRES)
const YEARS = Array.from({ length: Math.ceil(maxSem / 2) }, (_, i) => ({
  year: i + 1,
  sems: [i * 2 + 1, i * 2 + 2].filter(s => SEMESTRES.includes(s)),
}))

export default function Malla({ progreso, onSetEstado, onClearEstado }) {
  const [ramoSeleccionado, setRamoSeleccionado] = useState(null)
  const [resaltados, setResaltados] = useState(new Set())

  function estaBloqueado(ramo) {
    return ramo.prereqs.some(code => {
      const st = progreso[code]
      return st !== 'aprobado' && st !== 'convalidado'
    })
  }

  function handleHover(ramo) {
    if (!ramo) { setResaltados(new Set()); return }
    const rel = new Set(ramo.prereqs)
    RAMOS.forEach(r => { if (r.prereqs.includes(ramo.code)) rel.add(r.code) })
    setResaltados(rel)
  }

  // Re-read localStorage grades whenever progreso changes
  const grades = useMemo(() => {
    const g = {}
    RAMOS.forEach(r => {
      const grade = loadGrade(r.code)
      if (grade != null) g[r.code] = grade
    })
    return g
  }, [progreso])

  const aprobados = RAMOS.filter(r => progreso[r.code] === 'aprobado' || progreso[r.code] === 'convalidado')
  const cursando  = RAMOS.filter(r => progreso[r.code] === 'en_curso')
  const totalRamos    = RAMOS.length
  const totalCredits  = RAMOS.reduce((s, r) => s + r.credits, 0)
  const creditosAprobados = aprobados.reduce((s, r) => s + r.credits, 0)
  const porcentajeRamos   = Math.round((aprobados.length / totalRamos) * 100)
  const porcentajeCr      = Math.round((creditosAprobados / totalCredits) * 100)

  const notasAprobadas = aprobados.map(r => grades[r.code]).filter(g => g != null)
  const promedioGeneral = notasAprobadas.length
    ? (notasAprobadas.reduce((a, b) => a + b, 0) / notasAprobadas.length)
    : null

  return (
    <div className="malla-container">

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-value">{porcentajeRamos}%</div>
          <div className="stat-card-label">Avance carrera</div>
          <div className="stat-card-sub">{aprobados.length} / {totalRamos} ramos</div>
          <div className="stat-card-bar">
            <div className="stat-card-bar-fill" style={{ width: `${porcentajeRamos}%` }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-value">{creditosAprobados}</div>
          <div className="stat-card-label">Créditos aprobados</div>
          <div className="stat-card-sub">de {totalCredits} totales</div>
          <div className="stat-card-bar">
            <div className="stat-card-bar-fill" style={{ width: `${porcentajeCr}%` }} />
          </div>
        </div>

        <div className="stat-card">
          <div className={`stat-card-value${promedioGeneral != null ? (promedioGeneral >= 55 ? ' ok' : ' warn') : ''}`}>
            {promedioGeneral != null ? promedioGeneral.toFixed(1) : '—'}
          </div>
          <div className="stat-card-label">Promedio general</div>
          <div className="stat-card-sub">escala 0 – 100</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-value">{cursando.length}</div>
          <div className="stat-card-label">Cursando</div>
          <div className="stat-card-sub">ramos este semestre</div>
        </div>
      </div>

      {/* ── Leyenda de áreas ────────────────────────────────────────────── */}
      <div className="areas-leyenda">
        {Object.entries(AREAS).map(([key, area]) => (
          <div key={key} className="area-chip" style={{ '--area-color': area.color }}>
            <span className="area-dot" />
            {area.name}
          </div>
        ))}
      </div>

      {/* ── Semestres agrupados por año ──────────────────────────────────── */}
      {YEARS.map(({ year, sems }) => (
        <div key={year} className="year-group">
          <div className="year-group-header">
            <span className="year-group-label">Año {year}</span>
            <span className="year-group-sems">
              {sems.length === 2 ? `Sem. ${sems[0]} y ${sems[1]}` : `Sem. ${sems[0]}`}
            </span>
          </div>
          <div className="year-sems">
            {sems.map(sem => (
              <div key={sem} className="semestre-col">
                <div className="semestre-header">Sem. {sem}</div>
                <div className="semestre-ramos">
                  {RAMOS.filter(r => r.sem === sem).map(ramo => (
                    <RamoCard
                      key={ramo.code}
                      ramo={ramo}
                      estado={progreso[ramo.code] ?? 'pendiente'}
                      bloqueado={estaBloqueado(ramo)}
                      resaltado={resaltados.has(ramo.code)}
                      grade={grades[ramo.code] ?? null}
                      onClick={setRamoSeleccionado}
                      onMouseEnter={() => handleHover(ramo)}
                      onMouseLeave={() => handleHover(null)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {ramoSeleccionado && (
        <RamoModal
          ramo={ramoSeleccionado}
          estado={progreso[ramoSeleccionado.code] ?? 'pendiente'}
          onSetEstado={estado => onSetEstado(ramoSeleccionado.code, estado)}
          onClear={() => onClearEstado(ramoSeleccionado.code)}
          onClose={() => setRamoSeleccionado(null)}
          progreso={progreso}
        />
      )}
    </div>
  )
}
