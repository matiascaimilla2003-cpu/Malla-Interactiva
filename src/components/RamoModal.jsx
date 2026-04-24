import { useState, useEffect } from 'react'
import { AREAS, RAMOS, RAMO_META, EVAL_TEMPLATES } from '../data/malla'

const ESTADOS = [
  { value: 'aprobado',    label: 'Aprobado',      icon: '✓' },
  { value: 'en_curso',    label: 'Cursando',       icon: '▶' },
  { value: 'reprobado',   label: 'Reprobado',      icon: '✗' },
  { value: 'convalidado', label: 'Convalidado',    icon: '⇄' },
  { value: 'inscrito',    label: 'Inscrito próx.', icon: '◷' },
  { value: 'pendiente',   label: 'Pendiente',      icon: '○' },
]

function computeFinalGrade(evals) {
  const withWeight = evals.filter(e => +e.weight > 0)
  if (withWeight.length === 0) return null
  const allGraded = withWeight.every(e => e.grade !== '' && e.grade != null)
  if (!allGraded) return null
  const totalW = withWeight.reduce((s, e) => s + +e.weight, 0)
  const sum = withWeight.reduce((s, e) => s + +e.grade * +e.weight, 0)
  return sum / totalW
}

function computeProjected(evals) {
  const withWeight = evals.filter(e => +e.weight > 0)
  if (withWeight.length === 0) return 0
  const totalW = withWeight.reduce((s, e) => s + +e.weight, 0)
  const sum = withWeight.reduce((s, e) => {
    const g = e.grade !== '' && e.grade != null ? +e.grade : 0
    return s + g * +e.weight
  }, 0)
  return sum / totalW
}

function whatINeed(evals, passing = 55) {
  const withWeight = evals.filter(e => +e.weight > 0)
  const ungraded = withWeight.filter(e => e.grade === '' || e.grade == null)
  if (ungraded.length === 0) return null
  const remW = ungraded.reduce((s, e) => s + +e.weight, 0)
  if (remW === 0) return null
  const totalW = withWeight.reduce((s, e) => s + +e.weight, 0)
  const earned = withWeight
    .filter(e => e.grade !== '' && e.grade != null)
    .reduce((s, e) => s + +e.grade * +e.weight, 0)
  return { remW, needed: (passing * totalW - earned) / remW }
}

const evalsKey = code => `malla_evals_${code}`

function loadEvals(ramo) {
  try {
    const stored = localStorage.getItem(evalsKey(ramo.code))
    if (stored) return JSON.parse(stored)
  } catch {}
  const template = ramo.area === 'tcs' ? EVAL_TEMPLATES.taller
    : ramo.area === 'ing' ? EVAL_TEMPLATES.ing
    : EVAL_TEMPLATES.default
  return template.map((t, i) => ({
    id: Date.now() + i,
    type: t.type,
    date: '',
    weight: t.weight,
    grade: '',
  }))
}

export default function RamoModal({ ramo, estado, onSetEstado, onClear, onClose, progreso }) {
  const area = AREAS[ramo.area]
  const meta = RAMO_META[ramo.code]
  const prereqsRamos = RAMOS.filter(r => ramo.prereqs.includes(r.code))
  const dependientes = RAMOS.filter(r => r.prereqs.includes(ramo.code))

  const [evals, setEvals] = useState(() => loadEvals(ramo))

  useEffect(() => {
    try {
      localStorage.setItem(evalsKey(ramo.code), JSON.stringify(evals))
    } catch {}
  }, [evals, ramo.code])

  const addEval = () =>
    setEvals(prev => [...prev, { id: Date.now(), type: 'Evaluación', date: '', weight: 0, grade: '' }])

  const updateEval = (id, patch) =>
    setEvals(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))

  const removeEval = id =>
    setEvals(prev => prev.filter(e => e.id !== id))

  const totalWeight = evals.reduce((s, e) => s + (+e.weight || 0), 0)
  const final = computeFinalGrade(evals)
  const projected = computeProjected(evals)
  const need = whatINeed(evals, 55)
  const displayFinal = final != null ? final : projected
  const gradeClass = displayFinal >= 55 ? 'grade-ok' : displayFinal >= 40 ? 'grade-warn' : 'grade-err'

  const handleEstado = value => {
    if (value === 'pendiente') onClear()
    else onSetEstado(value)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header" style={{ '--area-color': area?.color }}>
          <div>
            <span className="modal-code">{ramo.code} · {ramo.credits} cr · Sem {ramo.sem}</span>
            <h2 className="modal-name">{ramo.name}</h2>
            <span className="modal-area">{area?.name}</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Info */}
        <div className="modal-info-grid">
          <div className="info-item">
            <span className="info-label">Créditos</span>
            <span className="info-valor">{ramo.credits}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Semestre</span>
            <span className="info-valor">{ramo.sem}°</span>
          </div>
          {meta && <>
            <div className="info-item">
              <span className="info-label">Profesor</span>
              <span className="info-valor">{meta.prof}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Horario</span>
              <span className="info-valor">{meta.horario}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Sala</span>
              <span className="info-valor">{meta.sala}</span>
            </div>
          </>}
        </div>

        {/* Estado */}
        <div className="modal-section">
          <h3>Estado del ramo</h3>
          <div className="estado-buttons">
            {ESTADOS.map(e => (
              <button
                key={e.value}
                className={`estado-btn ${estado === e.value ? 'active' : ''} ${e.value}`}
                onClick={() => handleEstado(e.value)}
              >
                <span>{e.icon}</span> {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Evaluaciones */}
        <div className="modal-section">
          <h3>Evaluaciones</h3>
          <div className="eval-edit-head">
            <span>Tipo</span>
            <span>Fecha</span>
            <span>Peso %</span>
            <span>Nota</span>
            <span />
          </div>
          {evals.map(ev => (
            <div className="eval-edit-row" key={ev.id}>
              <input
                className="eval-input eval-input-type"
                value={ev.type}
                onChange={e => updateEval(ev.id, { type: e.target.value })}
                placeholder="Ej: Certamen 1"
              />
              <input
                className="eval-input eval-input-date"
                type="date"
                value={ev.date || ''}
                onChange={e => updateEval(ev.id, { date: e.target.value })}
              />
              <input
                className="eval-input eval-input-num"
                type="number"
                value={ev.weight}
                onChange={e => updateEval(ev.id, { weight: e.target.value })}
                min="0"
                max="100"
              />
              <input
                className="eval-input eval-input-num"
                type="number"
                value={ev.grade}
                onChange={e => updateEval(ev.id, { grade: e.target.value })}
                placeholder="—"
                min="0"
                max="100"
              />
              <button className="eval-remove-btn" onClick={() => removeEval(ev.id)}>×</button>
            </div>
          ))}
          <button className="eval-add-btn" onClick={addEval}>+ Agregar evaluación</button>

          <div className="eval-weight-summary">
            <span>
              Total peso:{' '}
              <b style={{ color: totalWeight === 100 ? 'var(--aprobado-color)' : 'var(--grade-warn)' }}>
                {totalWeight}%
              </b>
            </span>
            {totalWeight !== 100 && (
              <span className="eval-weight-warn">⚠ Debería sumar 100%</span>
            )}
          </div>

          {evals.length > 0 && (
            <div className="projection">
              <div className="proj-row">
                <span className="proj-label">
                  {final != null ? 'Nota actual (evaluada)' : 'Proyectada (0 en lo pendiente)'}
                </span>
                <span className={`proj-val ${gradeClass}`}>{displayFinal.toFixed(1)}</span>
              </div>
              <div className="proj-bar">
                <div
                  className={`proj-bar-fill ${gradeClass}`}
                  style={{ width: `${Math.max(0, Math.min(100, displayFinal))}%` }}
                />
                <div className="proj-threshold" />
              </div>
              {need ? (
                <p className="proj-hint">
                  Te queda <b>{need.remW}%</b> de peso.{' '}
                  {need.needed > 100
                    ? <span style={{ color: 'var(--grade-err)' }}>Matemáticamente <b>no alcanzas</b> a aprobar.</span>
                    : need.needed <= 0
                      ? <span style={{ color: 'var(--aprobado-color)' }}>Ya tienes el 55 <b>asegurado</b>. Respira.</span>
                      : <>Necesitas promediar <b style={{ color: 'var(--accent)' }}>{need.needed.toFixed(1)}</b> para pasar con 55.</>
                  }
                </p>
              ) : (
                <p className="proj-hint">
                  <b>{displayFinal.toFixed(1)}</b> · {displayFinal >= 55 ? '✅ Aprobado' : '❌ Reprobado'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Prerrequisitos */}
        {prereqsRamos.length > 0 && (
          <div className="modal-section">
            <h3>Prerrequisitos</h3>
            <div className="ramo-chips">
              {prereqsRamos.map(r => {
                const st = progreso[r.code]
                const done = st === 'aprobado' || st === 'convalidado'
                return (
                  <span key={r.code} className={`ramo-chip ${done ? 'aprobado' : 'pendiente'}`}>
                    {done ? '✓' : '○'} {r.code} — {r.name}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Desbloquea */}
        {dependientes.length > 0 && (
          <div className="modal-section">
            <h3>Desbloquea</h3>
            <div className="ramo-chips">
              {dependientes.map(r => (
                <span key={r.code} className="ramo-chip siguiente">
                  → {r.code} — {r.name}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
