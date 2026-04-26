import { useState, useEffect, useMemo } from 'react'
import { RAMOS, AREAS } from '../data/malla'
import { useHorario } from '../hooks/useHorario'
import { supabase } from '../lib/supabase'

const DIAS   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const BLOCKS = Array.from({ length: 20 }, (_, i) => i + 1)

export default function Horario({ userId, onClose }) {
  const { bloques, loading } = useHorario(userId)

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

  // Build lookup: blockMap[bloque][dia] = { code, name, area, sala, paralelo }
  const blockMap = useMemo(() => {
    const map = {}
    bloques.forEach(entry => {
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
  }, [bloques, ramoInfos])

  const hasAny = BLOCKS.some(b => blockMap[b])

  return (
    <div className="cal-overlay" onClick={onClose}>
      <div className="cal-page" onClick={e => e.stopPropagation()}>

        <div className="cal-topbar">
          <h2 className="cal-page-title">Horario semanal</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="horario-page-body">
          {loading ? (
            <div className="cal-empty-msg" style={{ padding: 32 }}>Cargando…</div>
          ) : !hasAny ? (
            <div className="horario-empty">
              <p>No hay bloques agendados todavía.</p>
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
