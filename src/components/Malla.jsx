import { useState, useMemo } from 'react'
import { RAMOS, SEMESTRES, AREAS } from '../data/malla'
import { supabase } from '../lib/supabase'
import RamoCard from './RamoCard'
import RamoModal from './RamoModal'

const PERIODOS_LIST = (() => {
  const arr = []
  let year = 2026, sem = 1
  for (let i = 0; i < 10; i++) {
    arr.push(`${year}-${sem}`)
    if (sem === 2) { year++; sem = 1 } else sem++
  }
  return arr
})()

function CerrarSemestreModal({ periodo, onPeriodoChange, cursandoRamos, saving, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="cerrar-sem-modal" onClick={e => e.stopPropagation()}>
        <h3 className="cerrar-sem-title">Cerrar semestre</h3>
        <div className="cerrar-sem-period-row">
          <span className="cerrar-sem-period-label">Período:</span>
          <select
            className="cerrar-sem-select"
            value={periodo}
            onChange={e => onPeriodoChange(e.target.value)}
          >
            {PERIODOS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <p className="cerrar-sem-body">
          Los <b>{cursandoRamos.length}</b> ramo{cursandoRamos.length !== 1 ? 's' : ''} en estado{' '}
          <b>Cursando</b> pasarán al Historial. Podrás registrar sus notas finales después.
        </p>
        {cursandoRamos.length > 0 && (
          <ul className="cerrar-sem-list">
            {cursandoRamos.map(r => (
              <li key={r.code}>
                <span className="cerrar-sem-code">{r.code}</span> {r.name}
              </li>
            ))}
          </ul>
        )}
        <div className="cerrar-sem-actions">
          <button className="cerrar-sem-cancel" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button className="cerrar-sem-confirm" onClick={onConfirm} disabled={saving || cursandoRamos.length === 0}>
            {saving ? 'Guardando…' : 'Confirmar →'}
          </button>
        </div>
        {cursandoRamos.length === 0 && (
          <p className="cerrar-sem-warn">No hay ramos en estado Cursando este período.</p>
        )}
      </div>
    </div>
  )
}

function loadGrade(userId, code) {
  try {
    const raw = localStorage.getItem(`malla_evals_${userId}_${code}`)
    if (!raw) return null
    const evals = JSON.parse(raw)
    const weighted = evals.filter(e => +e.weight > 0)
    if (!weighted.length) return null
    if (!weighted.every(e => e.grade !== '' && e.grade != null)) return null
    const totalW = weighted.reduce((s, e) => s + +e.weight, 0)
    return weighted.reduce((s, e) => s + +e.grade * +e.weight, 0) / totalW
  } catch { return null }
}

// Year bands: sem 1-2 → Año 1, sem 3-4 → Año 2, …
const maxSem = Math.max(...SEMESTRES)
const YEARS = Array.from({ length: Math.ceil(maxSem / 2) }, (_, i) => ({
  year: i + 1,
  sems: [i * 2 + 1, i * 2 + 2].filter(s => SEMESTRES.includes(s)),
}))

// ── Inline-editable name field ────────────────────────────────────────────────
function EditableName({ nombre, onSave }) {
  const [editing, setEditing]   = useState(false)
  const [draft,   setDraft]     = useState(nombre ?? '')
  const [saved,   setSaved]     = useState(false)

  function startEdit() { setDraft(nombre ?? ''); setEditing(true) }

  async function commit() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed === (nombre ?? '')) return
    await onSave(trimmed)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  if (editing) {
    return (
      <input
        className="malla-name-input"
        value={draft}
        maxLength={25}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Enter' && e.target.blur()}
        autoFocus
      />
    )
  }

  return (
    <div className="malla-name" onClick={startEdit} title="Click para editar">
      {nombre
        ? <span>{nombre}</span>
        : <span className="malla-name-placeholder">Tu nombre (click para editar)</span>
      }
      <span className="malla-name-icon">{saved ? '✓' : '✎'}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Malla({ progreso, onSetEstado, onClearEstado, nombre, onSaveNombre, userId }) {
  const [ramoSeleccionado, setRamoSeleccionado] = useState(null)
  const [resaltados, setResaltados] = useState(new Set())
  const [showCerrar, setShowCerrar]     = useState(false)
  const [closePeriodo, setClosePeriodo] = useState('2026-1')
  const [savingCerrar, setSavingCerrar] = useState(false)

  const cursandoRamos = useMemo(
    () => RAMOS.filter(r => progreso[r.code] === 'en_curso'),
    [progreso]
  )

  async function handleConfirmCerrar() {
    setSavingCerrar(true)
    const rows = cursandoRamos.map(r => ({
      user_id:      userId,
      periodo:      closePeriodo,
      ramo_id:      r.code,
      estado_final: 'en_curso',
      nota_final:   loadGrade(userId, r.code),
    }))
    const { error } = await supabase
      .from('historial_semestre')
      .upsert(rows, { onConflict: 'user_id,periodo,ramo_id' })
    setSavingCerrar(false)
    if (!error) setShowCerrar(false)
  }

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

  const grades = useMemo(() => {
    const g = {}
    RAMOS.forEach(r => {
      const grade = loadGrade(userId, r.code)
      if (grade != null) g[r.code] = grade
    })
    return g
  }, [progreso, userId])

  const aprobados        = RAMOS.filter(r => progreso[r.code] === 'aprobado' || progreso[r.code] === 'convalidado')
  const cursando         = RAMOS.filter(r => progreso[r.code] === 'en_curso')
  const totalRamos       = RAMOS.length
  const totalCredits     = RAMOS.reduce((s, r) => s + r.credits, 0)
  const creditosAprobados = aprobados.reduce((s, r) => s + r.credits, 0)
  const porcentajeRamos  = Math.round((aprobados.length / totalRamos) * 100)
  const porcentajeCr     = Math.round((creditosAprobados / totalCredits) * 100)

  const notasAprobadas   = aprobados.map(r => grades[r.code]).filter(g => g != null)
  const promedioGeneral  = notasAprobadas.length
    ? notasAprobadas.reduce((a, b) => a + b, 0) / notasAprobadas.length
    : null

  return (
    <div className="malla-container">

      {/* ── Nombre del estudiante ─────────────────────────────────────────── */}
      <div className="malla-name-row">
        <EditableName nombre={nombre} onSave={onSaveNombre} />
        <span className="malla-name-sub">Ing. Comercial · USM</span>
        <button className="cerrar-sem-btn" onClick={() => setShowCerrar(true)}>
          Cerrar semestre →
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
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

      {/* ── Leyenda de áreas ─────────────────────────────────────────────────── */}
      <div className="areas-leyenda">
        {Object.entries(AREAS).map(([key, area]) => (
          <div key={key} className="area-chip" style={{ '--area-color': area.color }}>
            <span className="area-dot" />
            {area.name}
          </div>
        ))}
      </div>

      {/* ── Malla horizontal con agrupación por año ───────────────────────── */}
      <div className="malla-scroll">
        {/* Year band headers */}
        <div className="malla-year-bands">
          {YEARS.map(({ year, sems }) => (
            <div
              key={year}
              className="malla-year-band"
              style={{ '--span': sems.length }}
            >
              <span className="malla-year-label">Año {year}</span>
            </div>
          ))}
        </div>

        {/* All semester columns in one horizontal row */}
        <div className="semestres-grid">
          {SEMESTRES.map(sem => (
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

      {ramoSeleccionado && (
        <RamoModal
          ramo={ramoSeleccionado}
          estado={progreso[ramoSeleccionado.code] ?? 'pendiente'}
          onSetEstado={estado => onSetEstado(ramoSeleccionado.code, estado)}
          onClear={() => onClearEstado(ramoSeleccionado.code)}
          onClose={() => setRamoSeleccionado(null)}
          progreso={progreso}
          userId={userId}
        />
      )}

      {showCerrar && (
        <CerrarSemestreModal
          periodo={closePeriodo}
          onPeriodoChange={setClosePeriodo}
          cursandoRamos={cursandoRamos}
          saving={savingCerrar}
          onConfirm={handleConfirmCerrar}
          onCancel={() => setShowCerrar(false)}
        />
      )}
    </div>
  )
}
