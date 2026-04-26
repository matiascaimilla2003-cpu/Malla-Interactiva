import { useState, useEffect } from 'react'

const TESTIMONIOS = [
  { nombre: 'Migue Nova',          año: '5° año ICN', texto: 'Nunca más un Excel para calcular el promedio.' },
  { nombre: 'Álvaro Vergara',      año: '5° año ICN', texto: 'Ojalá hubiera existido esto en primero. Me habría ahorrado llegar estudiado a las pruebas.' },
  { nombre: 'Sergio Mora',         año: '5° año ICN', texto: 'Mejor organización para llegar a la hora y no equivocarme de sala.' },
  { nombre: 'Sebastián Rodriguez', año: '5° año ICN', texto: 'Nunca más llegué tarde. Todo el horario en un solo lugar, sin abrir el SIGA.' },
  { nombre: 'Francisco Cariaga',   año: '5° año ICN', texto: 'La proyección de notas es brujería. Sabes exactamente con cuánto entras al examen. Sin sorpresas.' },
  { nombre: 'Diego Miranda',       año: '5° año ICN', texto: 'Le mandé el link a todo el semestre. En una semana éramos 30 usando esto. Se habla solo.' },
  { nombre: 'Montserrat Castro',   año: '5° año ICN', texto: 'Por fin algo hecho para Icom, lo más grande.' },
  { nombre: 'Angello Avellaneda',  año: '5° año ICN', texto: 'Cinco años de carrera y recién en quinto aparece esto. Los mechones de ahora no saben la suerte que tienen.' },
  { nombre: 'Mariano Leiva',       año: '5° año ICN', texto: 'Mi promedio, mis ramos, mi horario. Todo en un lugar. La vida universitaria, pero organizada.' },
]

export default function TestimonialCarousel() {
  const [idx, setIdx]       = useState(0)
  const [visible, setVisible] = useState(true)

  function goTo(i) {
    setVisible(false)
    setTimeout(() => { setIdx(i); setVisible(true) }, 320)
  }

  useEffect(() => {
    const id = setInterval(() => {
      goTo((idx + 1) % TESTIMONIOS.length)
    }, 4000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const t = TESTIMONIOS[idx]

  return (
    <div className="auth-quote">
      <div className="testimonial-wrap" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.32s ease' }}>
        <p className="testimonial-text">"{t.texto}"</p>
        <div className="testimonial-autor">
          <span className="testimonial-nombre">{t.nombre}</span>
          <span className="testimonial-año">{t.año}</span>
        </div>
      </div>
      <div className="testimonial-dots">
        {TESTIMONIOS.map((_, i) => (
          <button
            key={i}
            className={`testimonial-dot${i === idx ? ' active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Testimonio ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
