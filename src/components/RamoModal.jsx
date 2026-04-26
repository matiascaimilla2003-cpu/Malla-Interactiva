import { useState, useEffect } from 'react'
import { AREAS, RAMOS, EVAL_TEMPLATES } from '../data/malla'
import { useRamoInfo } from '../hooks/useRamoInfo'
import { useHorario } from '../hooks/useHorario'

const ESTADOS = [
  { value: 'aprobado',    label: 'Aprobado',      icon: '✓' },
  { value: 'en_curso',    label: 'Cursando',       icon: '▶' },
  { value: 'reprobado',   label: 'Reprobado',      icon: '✗' },
  { value: 'convalidado', label: 'Convalidado',    icon: '⇄' },
  { value: 'inscrito',    label: 'Inscrito próx.', icon: '◷' },
  { value: 'pendiente',   label: 'Pendiente',      icon: '○' },
]

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function computeFinalGrade(evals) {
  const w = evals.filter(e => +e.weight > 0)
  if (!w.length) return null
  if (!w.every(e => e.grade !== '' && e.grade != null)) return null
  const totalW = w.reduce((s, e) => s + +e.weight, 0)
  return w.reduce((s, e) => s + +e.grade * +e.weight, 0) / totalW
}

function computeProjected(evals) {
  const w = evals.filter(e => +e.weight > 0)
  if (!w.length) return 0
  const totalW = w.reduce((s, e) => s + +e.weight, 0)
  return w.reduce((s, e) => {
    const g = e.grade !== '' && e.grade != null ? +e.grade : 0
    return s + g * +e.weight
  }, 0) / totalW
}

function whatINeed(evals, passing = 55) {
  const w = evals.filter(e => +e.weight > 0)
  const ungraded = w.filter(e => e.grade === '' || e.grade == null)
  if (!ungraded.length) return null
  const remW = ungraded.reduce((s, e) => s + +e.weight, 0)
  if (!remW) return null
  const totalW = w.reduce((s, e) => s + +e.weight, 0)
  const earned = w.filter(e => e.grade !== '' && e.grade != null)
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
    id: Date.now() + i, type: t.type, date: '', weight: t.weight, grade: '',
  }))
}

// ── Inline field that saves on blur ──────────────────────────────────────────
function InfoInput({ label, value, placeholder, onSave, textarea = false }) {
  const [draft, setDraft] = useState(value ?? '')
  useEffect(() => { setDraft(value ?? '') }, [value])

  function handleBlur() {
    if (draft !== (value ?? '')) onSave(draft)
  }

  const props = {
    className: `info-editable${textarea ? ' info-editable-ta' : ''}`,
    value: draft,
    placeholder: placeholder ?? `Agregar ${label.toLowerCase()}…`,
    onChange: e => setDraft(e.target.value),
    onBlur: handleBlur,
  }

  return (
    <div className="info-item info-item-edit">
      <span className="info-label">{label}</span>
      {textarea ? <textarea {...props} rows={2} /> : <input {...props} />}
    </div>
  )
}

// ── Helpers para resumir horario y sala desde bloques ─────────────────────
function formatHorario(bloques) {
  return bloques.map(b => `${b.dia} ${b.bloque_inicio}–${b.bloque_fin}`).join(' · ')
}
function formatSala(bloques) {
  return [...new Set(bloques.map(b => b.sala).filter(Boolean))].join(', ')
}

// ── Add-bloque form ────────────────────────────────────────────────────────
function AddBloqueForm({ ramoId, onAdd }) {
  const [dia,    setDia]    = useState('Lun')
  const [inicio, setInicio] = useState(1)
  const [fin,    setFin]    = useState(2)
  const [sala,   setSala]   = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (+fin < +inicio) return
    setSaving(true)
    await onAdd(ramoId, dia, +inicio, +fin, sala)
    setSaving(false)
  }

  return (
    <div className="horario-add-form">
      <select className="eval-input" value={dia} onChange={e => setDia(e.target.value)}>
        {DIAS.map(d => <option key={d}>{d}</option>)}
      </select>
      <input
        className="eval-input eval-input-num"
        type="number" min={1} max={20} value={inicio}
        onChange={e => setInicio(e.target.value)}
      />
      <span className="horario-dash">→</span>
      <input
        className="eval-input eval-input-num"
        type="number" min={1} max={20} value={fin}
        onChange={e => setFin(e.target.value)}
      />
      <input
        className="eval-input horario-sala-input"
        value={sala}
        onChange={e => setSala(e.target.value)}
        placeholder="Sala (opcional)"
      />
      <button className="eval-add-btn horario-add-btn" onClick={handleAdd} disabled={saving}>
        {saving ? '…' : '+ Agregar'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RamoModal({ ramo, estado, onSetEstado, onClear, onClose, progreso, userId }) {
  const area         = AREAS[ramo.area]
  const prereqsRamos = RAMOS.filter(r => ramo.prereqs.includes(r.code))
  const dependientes = RAMOS.filter(r => r.prereqs.includes(ramo.code))

  // Local estado for immediate UI feedback (optimistic)
  const [localEstado, setLocalEstado] = useState(estado)
  useEffect(() => { setLocalEstado(estado) }, [estado])

  // Evaluaciones (localStorage)
  const [evals, setEvals] = useState(() => loadEvals(ramo))
  useEffect(() => {
    try { localStorage.setItem(evalsKey(ramo.code), JSON.stringify(evals)) } catch {}
  }, [evals, ramo.code])

  // Info editable (Supabase)
  const { info, saveInfo } = useRamoInfo(userId, ramo.code)

  // Horario semanal (Supabase)
  const { bloques, addBloque, removeBloque } = useHorario(userId, ramo.code)

  const addEval    = () => setEvals(prev => [...prev, { id: Date.now(), type: 'Evaluación', date: '', weight: 0, grade: '' }])
  const updateEval = (id, patch) => setEvals(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
  const removeEval = id => setEvals(prev => prev.filter(e => e.id !== id))

  const totalWeight   = evals.reduce((s, e) => s + (+e.weight || 0), 0)
  const final         = computeFinalGrade(evals)
  const projected     = computeProjected(evals)
  const need          = whatINeed(evals, 55)
  const displayFinal  = final != null ? final : projected
  const gradeClass    = displayFinal >= 55 ? 'grade-ok' : displayFinal >= 40 ? 'grade-warn' : 'grade-err'

  function handleEstado(v) {
    setLocalEstado(v)
    if (v === 'pendiente') onClear()
    else onSetEstado(v)
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

        {/* Info editable */}
        <div className="modal-info-grid">
          <div className="info-item">
            <span className="info-label">Créditos</span>
            <span className="info-valor">{ramo.credits}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Semestre</span>
            <span className="info-valor">{ramo.sem}°</span>
          </div>
          <InfoInput label="Profesor"  value={info?.profesor}  onSave={v => saveInfo({ profesor: v })} />
          <InfoInput label="Paralelo" value={info?.paralelo}  onSave={v => saveInfo({ paralelo: v })}  placeholder="Ej: 1, 2, 3" />
          {bloques.length > 0 && (
            <div className="info-item">
              <span className="info-label">Horario</span>
              <span className="info-valor">{formatHorario(bloques)}</span>
            </div>
          )}
          {formatSala(bloques) && (
            <div className="info-item">
              <span className="info-label">Sala</span>
              <span className="info-valor">{formatSala(bloques)}</span>
            </div>
          )}
        </div>

        {/* Notas extra */}
        <div className="modal-section">
          <InfoInput
            label="Notas del ramo"
            value={info?.notas_extra}
            onSave={v => saveInfo({ notas_extra: v })}
            placeholder="Apuntes, observaciones…"
            textarea
          />
        </div>

        {/* Estado */}
        <div className="modal-section">
          <h3>Estado del ramo</h3>
          <div className="estado-buttons">
            {ESTADOS.map(e => (
              <button
                key={e.value}
                className={`estado-btn ${localEstado === e.value ? 'active' : ''} ${e.value}`}
                onClick={() => handleEstado(e.value)}
              >
                <span>{e.icon}</span> {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horario semanal */}
        <div className="modal-section">
          <h3>Horario semanal</h3>
          {bloques.length > 0 && (
            <div className="horario-bloques-list">
              {bloques.map(b => (
                <div key={b.id} className="horario-bloque-row">
                  <span className="horario-bloque-dia">{b.dia}</span>
                  <span className="horario-bloque-range">Bloques {b.bloque_inicio} – {b.bloque_fin}</span>
                  {b.sala && <span className="horario-bloque-sala">{b.sala}</span>}
                  <button className="eval-remove-btn" onClick={() => removeBloque(b.id)}>×</button>
                </div>
              ))}
            </div>
          )}
          <div className="horario-add-label">
            <span>Día</span><span>Inicio</span><span /><span>Fin</span><span>Sala</span><span />
          </div>
          <AddBloqueForm ramoId={ramo.code} onAdd={addBloque} />
        </div>

        {/* Evaluaciones */}
        <div className="modal-section">
          <h3>Evaluaciones</h3>
          <div className="eval-edit-head">
            <span>Tipo</span><span>Fecha</span><span>Peso %</span><span>Nota</span><span />
          </div>
          {evals.map(ev => (
            <div className="eval-edit-row" key={ev.id}>
              <input className="eval-input" value={ev.type}
                onChange={e => updateEval(ev.id, { type: e.target.value })}
                placeholder="Ej: Certamen 1" />
              <input className="eval-input eval-input-date" type="date" value={ev.date || ''}
                onChange={e => updateEval(ev.id, { date: e.target.value })} />
              <input className="eval-input eval-input-num" type="number" value={ev.weight}
                onChange={e => updateEval(ev.id, { weight: e.target.value })} min="0" max="100" />
              <input className="eval-input eval-input-num" type="number" value={ev.grade}
                onChange={e => updateEval(ev.id, { grade: e.target.value })}
                placeholder="—" min="0" max="100" />
              <button className="eval-remove-btn" onClick={() => removeEval(ev.id)}>×</button>
            </div>
          ))}
          <button className="eval-add-btn" onClick={addEval}>+ Agregar evaluación</button>

          <div className="eval-weight-summary">
            <span>Total peso:{' '}
              <b style={{ color: totalWeight === 100 ? 'var(--aprobado-color)' : 'var(--grade-warn)' }}>
                {totalWeight}%
              </b>
            </span>
            {totalWeight !== 100 && <span className="eval-weight-warn">⚠ Debería sumar 100%</span>}
          </div>

          {evals.length > 0 && (
            <div className="projection">
              <div className="proj-row">
                <span className="proj-label">
                  {final != null ? 'Nota final (evaluada)' : 'Proyectada (0 en lo pendiente)'}
                </span>
                <span className={`proj-val ${gradeClass}`}>{displayFinal.toFixed(1)}</span>
              </div>
              <div className="proj-bar">
                <div className={`proj-bar-fill ${gradeClass}`}
                  style={{ width: `${Math.max(0, Math.min(100, displayFinal))}%` }} />
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
                const done = progreso[r.code] === 'aprobado' || progreso[r.code] === 'convalidado'
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
                <span key={r.code} className="ramo-chip siguiente">→ {r.code} — {r.name}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
