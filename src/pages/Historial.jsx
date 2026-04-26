import { useState, useEffect, useMemo } from 'react'
import { RAMOS, AREAS } from '../data/malla'
import { supabase } from '../lib/supabase'

const ESTADO_LABELS = {
  aprobado:    { label: 'Aprobado',   cls: 'aprobado' },
  reprobado:   { label: 'Reprobado',  cls: 'reprobado' },
  convalidado: { label: 'Convalidado',cls: 'convalidado' },
  en_curso:    { label: 'Cursando',   cls: 'en_curso' },
}

export default function Historial({ userId, onClose }) {
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(null) // { id, nota_final, estado_final }
  const [saving,  setSaving]    = useState(false)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('historial_semestre')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setRecords(data ?? []); setLoading(false) })
  }, [userId])

  const byPeriodo = useMemo(() => {
    const map = {}
    records.forEach(r => {
      if (!map[r.periodo]) map[r.periodo] = []
      map[r.periodo].push(r)
    })
    return map
  }, [records])

  const periodos = Object.keys(byPeriodo).sort().reverse()

  async function saveRecord(rec) {
    setSaving(true)
    const { error } = await supabase
      .from('historial_semestre')
      .update({ nota_final: rec.nota_final, estado_final: rec.estado_final })
      .eq('id', rec.id)
    if (!error) {
      setRecords(prev => prev.map(r => r.id === rec.id ? { ...r, ...rec } : r))
      setEditing(null)
    }
    setSaving(false)
  }

  return (
    <div className="cal-overlay" onClick={onClose}>
      <div className="cal-page historial-page" onClick={e => e.stopPropagation()}>

        <div className="cal-topbar">
          <h2 className="cal-page-title">Historial académico</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="historial-body">
          {loading ? (
            <div className="cal-empty-msg" style={{ padding: 32 }}>Cargando…</div>
          ) : periodos.length === 0 ? (
            <div className="historial-empty">
              <p>Sin semestres cerrados todavía.</p>
              <p>Usa el botón <b>Cerrar semestre →</b> en la malla para archivar un período.</p>
            </div>
          ) : periodos.map(periodo => {
            const recs = byPeriodo[periodo]
            const aprobados = recs.filter(r =>
              r.estado_final === 'aprobado' || r.estado_final === 'convalidado'
            )
            const notas = recs
              .map(r => r.nota_final)
              .filter(n => n != null && +n > 0)
            const promedio = notas.length
              ? notas.reduce((a, b) => a + +b, 0) / notas.length
              : null
            const creditosAprobados = aprobados.reduce((s, r) => {
              const ramo = RAMOS.find(x => x.code === r.ramo_id)
              return s + (ramo?.credits ?? 0)
            }, 0)

            return (
              <div key={periodo} className="historial-periodo">
                <div className="historial-periodo-head">
                  <span className="historial-periodo-label">Período {periodo}</span>
                  <div className="historial-periodo-stats">
                    {promedio != null && (
                      <span className={`historial-stat-badge ${promedio >= 55 ? 'ok' : 'warn'}`}>
                        Prom. {promedio.toFixed(1)}
                      </span>
                    )}
                    <span className="historial-stat-badge">
                      {creditosAprobados} cr aprobados
                    </span>
                    <span className="historial-stat-badge neutral">
                      {recs.length} ramo{recs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="historial-ramos-list">
                  {recs.map(rec => {
                    const ramo = RAMOS.find(x => x.code === rec.ramo_id)
                    const area = ramo ? AREAS[ramo.area] : null
                    const isEditing = editing?.id === rec.id
                    const estadoInfo = ESTADO_LABELS[rec.estado_final] ?? { label: rec.estado_final ?? '—', cls: '' }

                    return (
                      <div key={rec.id} className="historial-ramo-row">
                        <span
                          className="historial-ramo-dot"
                          style={{ background: area?.color ?? 'var(--muted)' }}
                        />
                        <span className="historial-ramo-code">{rec.ramo_id}</span>
                        <span className="historial-ramo-name">{ramo?.name ?? rec.ramo_id}</span>
                        <span className="historial-ramo-cr">{ramo?.credits ?? '?'} cr</span>

                        {isEditing ? (
                          <>
                            <input
                              className="historial-nota-input"
                              type="number" min="0" max="100" step="0.1"
                              value={editing.nota_final ?? ''}
                              onChange={e => setEditing(prev => ({ ...prev, nota_final: e.target.value === '' ? null : +e.target.value }))}
                              placeholder="Nota"
                            />
                            <select
                              className="historial-estado-select"
                              value={editing.estado_final ?? ''}
                              onChange={e => setEditing(prev => ({ ...prev, estado_final: e.target.value }))}
                            >
                              <option value="aprobado">Aprobado</option>
                              <option value="reprobado">Reprobado</option>
                              <option value="convalidado">Convalidado</option>
                              <option value="en_curso">Cursando</option>
                            </select>
                            <button
                              className="historial-save-btn"
                              onClick={() => saveRecord(editing)}
                              disabled={saving}
                            >
                              {saving ? '…' : '✓'}
                            </button>
                            <button
                              className="eval-remove-btn"
                              onClick={() => setEditing(null)}
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <>
                            <span className={`historial-ramo-nota ${rec.nota_final != null && +rec.nota_final > 0 ? (+rec.nota_final >= 55 ? 'ok' : 'err') : ''}`}>
                              {rec.nota_final != null && +rec.nota_final > 0
                                ? (+rec.nota_final).toFixed(1)
                                : '—'}
                            </span>
                            <span className={`historial-ramo-estado ${estadoInfo.cls}`}>
                              {estadoInfo.label}
                            </span>
                            <button
                              className="historial-edit-btn"
                              onClick={() => setEditing({ id: rec.id, nota_final: rec.nota_final, estado_final: rec.estado_final })}
                              title="Editar"
                            >
                              ✎
                            </button>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
