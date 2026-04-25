import { useState } from 'react'
import { RAMOS, SEMESTRES, AREAS } from '../data/malla'
import RamoCard from './RamoCard'
import RamoModal from './RamoModal'

export default function Malla({ progreso, onSetEstado, onClearEstado }) {
  const [ramoSeleccionado, setRamoSeleccionado] = useState(null)
  const [resaltados, setResaltados] = useState(new Set())

  // Un ramo está bloqueado si alguno de sus prereqs no está aprobado
  function estaBloqueado(ramo) {
    return ramo.prereqs.some(code => progreso[code] !== 'aprobado')
  }

  function handleHover(ramo) {
    if (!ramo) { setResaltados(new Set()); return }
    // Resaltar prereqs y dependientes
    const relacionados = new Set()
    ramo.prereqs.forEach(c => relacionados.add(c))
    RAMOS.forEach(r => { if (r.prereqs.includes(ramo.code)) relacionados.add(r.code) })
    setResaltados(relacionados)
  }

  // Estadísticas
  const aprobados = RAMOS.filter(r => progreso[r.code] === 'aprobado')
  const totalCredits = RAMOS.reduce((s, r) => s + r.credits, 0)
  const creditosAprobados = aprobados.reduce((s, r) => s + r.credits, 0)
  const porcentaje = Math.round((creditosAprobados / totalCredits) * 100)

  return (
    <div className="malla-container">
      {/* Header */}
      <div className="malla-header">
        <div>
          <h1>Malla Curricular</h1>
          <p>Ingeniería Comercial — USM</p>
        </div>
        <div className="malla-stats">
          <div className="stat">
            <span className="stat-valor">{aprobados.length}</span>
            <span className="stat-label">ramos aprobados</span>
          </div>
          <div className="stat">
            <span className="stat-valor">{creditosAprobados}/{totalCredits}</span>
            <span className="stat-label">créditos</span>
          </div>
          <div className="stat">
            <span className="stat-valor">{porcentaje}%</span>
            <span className="stat-label">avance</span>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${porcentaje}%` }} />
      </div>

      {/* Leyenda de áreas */}
      <div className="areas-leyenda">
        {Object.entries(AREAS).map(([key, area]) => (
          <div key={key} className="area-chip" style={{ '--area-color': area.color }}>
            <span className="area-dot" />
            {area.name}
          </div>
        ))}
      </div>

      {/* Grid de semestres */}
      <div className="semestres-grid">
        {SEMESTRES.map(sem => {
          const ramos = RAMOS.filter(r => r.sem === sem)
          return (
            <div key={sem} className="semestre-col">
              <div className="semestre-header">Sem {sem}</div>
              <div className="semestre-ramos">
                {ramos.map(ramo => (
                  <RamoCard
                    key={ramo.code}
                    ramo={ramo}
                    estado={progreso[ramo.code] ?? 'pendiente'}
                    bloqueado={estaBloqueado(ramo)}
                    resaltado={resaltados.has(ramo.code)}
                    onClick={setRamoSeleccionado}
                    onMouseEnter={() => handleHover(ramo)}
                    onMouseLeave={() => handleHover(null)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal detalle */}
      {ramoSeleccionado && (
        <RamoModal
          ramo={ramoSeleccionado}
          estado={progreso[ramoSeleccionado.code] ?? 'pendiente'}
          onSetEstado={(estado) => onSetEstado(ramoSeleccionado.code, estado)}
          onClear={() => onClearEstado(ramoSeleccionado.code)}
          onClose={() => setRamoSeleccionado(null)}
          progreso={progreso}
        />
      )}
    </div>
  )
}
