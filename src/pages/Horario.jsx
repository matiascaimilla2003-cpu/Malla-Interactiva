import { useMemo } from 'react'
import { RAMOS, AREAS } from '../data/malla'
import { useHorario } from '../hooks/useHorario'

const DIAS   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const BLOCKS = Array.from({ length: 20 }, (_, i) => i + 1)

// Build lookup: blockMap[bloque][dia] = { code, area }
function buildBlockMap(bloques) {
  const map = {}
  bloques.forEach(entry => {
    const ramo = RAMOS.find(r => r.code === entry.ramo_id)
    if (!ramo) return
    const area = AREAS[ramo.area]
    for (let b = entry.bloque_inicio; b <= entry.bloque_fin; b++) {
      if (!map[b]) map[b] = {}
      // Last write wins if two ramos overlap
      map[b][entry.dia] = { code: entry.ramo_id, name: ramo.name, area }
    }
  })
  return map
}

export default function Horario({ userId, onClose }) {
  const { bloques, loading } = useHorario(userId)

  const blockMap = useMemo(() => buildBlockMap(bloques), [bloques])

  // Collect only blocks that have at least one event (to avoid empty leading rows)
  const activeBlocks = BLOCKS.filter(b => blockMap[b])
  const hasAny = activeBlocks.length > 0

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
              <p>Abre un ramo desde la malla y ve a la sección <b>Horario semanal</b> para agregar bloques.</p>
            </div>
          ) : (
            <div className="horario-table-wrap">
              <table className="horario-table">
                <thead>
                  <tr>
                    <th className="horario-th horario-th-bloque">#</th>
                    {DIAS.map(d => (
                      <th key={d} className="horario-th">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BLOCKS.map(bloque => {
                    const row = blockMap[bloque] ?? {}
                    const isEmpty = !Object.keys(row).length
                    if (isEmpty) return null
                    return (
                      <tr key={bloque} className="horario-tr">
                        <td className="horario-td horario-td-num">{bloque}</td>
                        {DIAS.map(dia => {
                          const cell = row[dia]
                          return (
                            <td
                              key={dia}
                              className={`horario-td${cell ? ' horario-td-filled' : ''}`}
                              style={cell ? { '--ev-color': cell.area.color } : {}}
                            >
                              {cell && (
                                <span className="horario-cell-chip" title={cell.name}>
                                  {cell.code}
                                </span>
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
                Solo se muestran los bloques con al menos una clase agendada. Los bloques vacíos se omiten.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
