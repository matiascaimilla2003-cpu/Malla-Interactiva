import { AREAS } from '../data/malla'

const ESTADOS = ['pendiente', 'en_curso', 'aprobado']
const ESTADO_LABEL = {
  pendiente: '—',
  en_curso:  '▶',
  aprobado:  '✓',
}

export default function RamoCard({ ramo, estado = 'pendiente', bloqueado = false, resaltado = false, onClick }) {
  const area = AREAS[ramo.area]
  const color = area?.color ?? 'oklch(60% 0.1 200)'

  return (
    <div
      className={`ramo-card ${estado} ${bloqueado ? 'bloqueado' : ''} ${resaltado ? 'resaltado' : ''}`}
      style={{ '--area-color': color }}
      onClick={() => !bloqueado && onClick?.(ramo)}
      title={bloqueado ? `Requiere: ${ramo.prereqs.join(', ')}` : ramo.name}
    >
      <div className="ramo-estado-badge">{ESTADO_LABEL[estado]}</div>
      <div className="ramo-code">{ramo.code}</div>
      <div className="ramo-name">{ramo.name}</div>
      <div className="ramo-credits">{ramo.credits} cr.</div>
    </div>
  )
}
