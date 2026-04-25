import { AREAS } from '../data/malla'

const ESTADO_ICONS = {
  pendiente:   '—',
  en_curso:    '▶',
  aprobado:    '✓',
  reprobado:   '✗',
  convalidado: '⇄',
  inscrito:    '◷',
}

export default function RamoCard({
  ramo,
  estado = 'pendiente',
  bloqueado = false,
  resaltado = false,
  grade = null,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const area  = AREAS[ramo.area]
  const color = area?.color ?? 'oklch(60% 0.1 200)'

  return (
    <div
      className={`ramo-card ${estado}${bloqueado ? ' bloqueado' : ''}${resaltado ? ' resaltado' : ''}`}
      style={{ '--area-color': color }}
      onClick={() => !bloqueado && onClick?.(ramo)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={bloqueado ? `Requiere: ${ramo.prereqs.join(', ')}` : ramo.name}
    >
      <div className="ramo-estado-badge">{ESTADO_ICONS[estado] ?? '—'}</div>
      <div className="ramo-code">{ramo.code}</div>
      <div className="ramo-name">{ramo.name}</div>
      <div className="ramo-footer">
        <span className="ramo-credits">{ramo.credits} cr.</span>
        {grade != null && (
          <span className={`ramo-grade${grade >= 55 ? ' ok' : ' err'}`}>
            {grade.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  )
}
