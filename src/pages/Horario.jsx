import { useState, useEffect, useMemo } from 'react'
import { RAMOS, AREAS } from '../data/malla'
import { useHorario } from '../hooks/useHorario'
import { supabase } from '../lib/supabase'

const DIAS   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const BLOCKS = Array.from({ length: 20 }, (_, i) => i + 1)

const PERIODOS = (() => {
  const arr = []
  let year = 2026, sem = 1
  for (let i = 0; i < 10; i++) {
    arr.push(`${year}-${sem}`)
    if (sem === 2) { year++; sem = 1 } else sem++
  }
  return arr
})()

export default function Horario({ userId, onClose }) {
  const { bloques, loading } = useHorario(userId)
  const [periodo, setPeriodo] = useState('2026-1')

  // Fetch paralelo from ramo_info for all scheduled ramos
  const [ramoInfos, setRamoInfos] = useState({})
  useEffect(() => {
    if (!userId || !bloques.length) return
    const ramoIds = [...new Set(bloques.map(b => b.ramo_id))]
    supabase
      .from('ramo_info')
      .select('ramo_id, paralelo')
      .eq('user_id', userId)
      .in('ramo_id', ramoIds)
      .then(({ data }) => {
        const map = {}
        ;(data ?? []).forEach(r => { map[r.ramo_id] = r })
        setRamoInfos(map)
      })
  }, [userId, bloques])

  // Filter bloques by selected period (default '2026-1' for legacy rows without periodo)
  const periodoBloques = useMemo(
    () => bloques.filter(b => (b.periodo ?? '2026-1') === periodo),
    [bloques, periodo]
  )

  // Build lookup: blockMap[bloque][dia] = { code, name, area, sala, paralelo }
  const blockMap = useMemo(() => {
    const map = {}
    periodoBloques.forEach(entry => {
      const ramo = RAMOS.find(r => r.code === entry.ramo_id)
      if (!ramo) return
      const area = AREAS[ramo.area]
      const info = ramoInfos[entry.ramo_id]
      for (let b = entry.bloque_inicio; b <= entry.bloque_fin; b++) {
        if (!map[b]) map[b] = {}
        map[b][entry.dia] = {
          code:     entry.ramo_id,
          name:     ramo.name,
          area,
          sala:     entry.sala,
          paralelo: info?.paralelo,
        }
      }
    })
    return map
  }, [periodoBloques, ramoInfos])

  const hasAny = BLOCKS.some(b => blockMap[b])

  return (
    <div className="cal-overlay" onClick={onClose}>
      <div className="cal-page" onClick={e => e.stopPropagation()}>

        <div className="cal-topbar">
          <h2 className="cal-page-title">Horario semanal</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="horario-periodo-bar">
          <span className="horario-periodo-label">Período</span>
          <div className="horario-periodo-tabs">
            {PERIODOS.map(p => (
              <button
                key={p}
                className={`horario-periodo-tab${periodo === p ? ' active' : ''}`}
                onClick={() => setPeriodo(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="horario-page-body">
          {loading ? (
            <div className="cal-empty-msg" style={{ padding: 32 }}>Cargando…</div>
          ) : !hasAny ? (
            <div className="horario-empty">
              <p>No hay bloques agendados para <b>{periodo}</b>.</p>
              <p>Abre un ramo desde la malla y agrega bloques en la sección <b>Horario semanal</b>.</p>
            </div>
          ) : (
            <div className="horario-table-wrap">
              <table className="horario-table">
                <thead>
                  <tr>
                    <th className="horario-th horario-th-bloque">#</th>
                    {DIAS.map(d => <th key={d} className="horario-th">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {BLOCKS.map(bloque => {
                    const row = blockMap[bloque] ?? {}
                    if (!Object.keys(row).length) return null
                    return (
                      <tr key={bloque} className="horario-tr">
                        <td className="horario-td horario-td-num">{bloque}</td>
                        {DIAS.map(dia => {
                          const cell = row[dia]
                          return (
                            <td
                              key={dia}
                              className={`horario-td${cell ? ' horario-td-filled' : ' horario-td-empty'}`}
                              style={cell ? { '--ev-color': cell.area.color } : {}}
                              title={cell ? cell.name : undefined}
                            >
                              {cell && (
                                <div className="horario-cell-content">
                                  <span className="horario-cell-code">{cell.code}</span>
                                  {cell.sala && (
                                    <span className="horario-cell-sala">{cell.sala}</span>
                                  )}
                                  {cell.paralelo && (
                                    <span className="horario-cell-para">P{cell.paralelo}</span>
                                  )}
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="horario-hint">
                Solo se muestran bloques con al menos una clase agendada.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
