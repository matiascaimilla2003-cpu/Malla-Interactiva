import { AREAS, RAMOS, RAMO_META, EVAL_TEMPLATES } from '../data/malla'

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente',  icon: '○' },
  { value: 'en_curso',  label: 'En curso',   icon: '▶' },
  { value: 'aprobado',  label: 'Aprobado',   icon: '✓' },
]

export default function RamoModal({ ramo, estado, onSetEstado, onClear, onClose, progreso }) {
  const area = AREAS[ramo.area]
  const meta = RAMO_META[ramo.code]
  const prereqsRamos = RAMOS.filter(r => ramo.prereqs.includes(r.code))
  const dependientes = RAMOS.filter(r => r.prereqs.includes(ramo.code))
  const evalTemplate = ramo.area === 'tcs' ? EVAL_TEMPLATES.taller
    : ramo.area === 'ing' ? EVAL_TEMPLATES.ing
    : EVAL_TEMPLATES.default

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header" style={{ '--area-color': area?.color }}>
          <div>
            <span className="modal-code">{ramo.code}</span>
            <h2 className="modal-name">{ramo.name}</h2>
            <span className="modal-area">{area?.name}</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Info básica */}
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
          <h3>Mi estado</h3>
          <div className="estado-buttons">
            {ESTADOS.map(e => (
              <button
                key={e.value}
                className={`estado-btn ${estado === e.value ? 'active' : ''} ${e.value}`}
                onClick={() => onSetEstado(e.value)}
              >
                <span>{e.icon}</span> {e.label}
              </button>
            ))}
            {estado !== 'pendiente' && (
              <button className="estado-btn clear" onClick={onClear}>
                Quitar
              </button>
            )}
          </div>
        </div>

        {/* Prerrequisitos */}
        {prereqsRamos.length > 0 && (
          <div className="modal-section">
            <h3>Prerrequisitos</h3>
            <div className="ramo-chips">
              {prereqsRamos.map(r => (
                <span
                  key={r.code}
                  className={`ramo-chip ${progreso[r.code] === 'aprobado' ? 'aprobado' : 'pendiente'}`}
                >
                  {progreso[r.code] === 'aprobado' ? '✓' : '○'} {r.code} — {r.name}
                </span>
              ))}
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

        {/* Evaluaciones */}
        <div className="modal-section">
          <h3>Ponderaciones típicas</h3>
          <div className="eval-list">
            {evalTemplate.map(ev => (
              <div key={ev.type} className="eval-row">
                <span>{ev.type}</span>
                <div className="eval-bar-track">
                  <div className="eval-bar-fill" style={{ width: `${ev.weight}%` }} />
                </div>
                <span className="eval-pct">{ev.weight}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
