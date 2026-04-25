import { useState, useMemo } from 'react'
import { AREAS, RAMOS } from '../data/malla'

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
  'Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_NAMES   = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const MON_SHORT   = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function loadEvalsFromStorage(code) {
  try {
    const raw = localStorage.getItem(`malla_evals_${code}`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export default function Calendario({ progreso, onClose }) {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed

  // Collect every evaluation that has a date from localStorage
  const allEvents = useMemo(() => {
    const evs = []
    RAMOS.forEach(ramo => {
      loadEvalsFromStorage(ramo.code).forEach(ev => {
        if (!ev.date) return
        evs.push({
          date:     ev.date,   // 'YYYY-MM-DD'
          type:     ev.type,
          grade:    ev.grade,
          weight:   ev.weight,
          ramoCode: ramo.code,
          ramoName: ramo.name,
          area:     AREAS[ramo.area],
        })
      })
    })
    return evs
  }, [progreso]) // eslint-disable-line -- re-read storage when progreso changes

  // Calendar geometry
  const firstDay   = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow   = (firstDay.getDay() + 6) % 7 // Mon = 0

  // Events keyed by day number for the current month view
  const byDay = useMemo(() => {
    const map = {}
    allEvents.forEach(ev => {
      const [y, m, d] = ev.date.split('-').map(Number)
      if (y === year && m === month + 1) {
        ;(map[d] ??= []).push(ev)
      }
    })
    return map
  }, [allEvents, year, month])

  const todayStr  = today.toISOString().slice(0, 10)
  const todayDay  = today.getFullYear() === year && today.getMonth() === month
    ? today.getDate() : null

  // Next 8 events from today onwards
  const upcoming = useMemo(() =>
    [...allEvents]
      .filter(ev => ev.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8)
  , [allEvents, todayStr])

  // Events in the currently displayed month
  const monthEvs = useMemo(() =>
    allEvents.filter(ev => {
      const [y, m] = ev.date.split('-').map(Number)
      return y === year && m === month + 1
    })
  , [allEvents, year, month])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="cal-overlay" onClick={onClose}>
      <div className="cal-page" onClick={e => e.stopPropagation()}>

        {/* Top bar */}
        <div className="cal-topbar">
          <h2 className="cal-page-title">Calendario de evaluaciones</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="cal-layout">
          {/* ── Left: monthly grid ─────────────────────────────────────── */}
          <div className="cal-main">
            <div className="cal-nav">
              <button className="cal-arrow" onClick={prevMonth}>←</button>
              <h3 className="cal-month-title">
                {MONTH_NAMES[month]} <em>{year}</em>
              </h3>
              <button className="cal-arrow" onClick={nextMonth}>→</button>
            </div>

            <div className="cal-grid-head">
              {DAY_NAMES.map(d => <div key={d} className="cal-dow">{d}</div>)}
            </div>

            <div className="cal-grid">
              {Array.from({ length: startDow }).map((_, i) => (
                <div key={`e${i}`} className="cal-cell empty" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const evs = byDay[day] || []
                return (
                  <div
                    key={day}
                    className={`cal-cell${day === todayDay ? ' today' : ''}${evs.length ? ' has-events' : ''}`}
                  >
                    <span className="cal-day-num">{day}</span>
                    <div className="cal-day-events">
                      {evs.slice(0, 3).map((ev, j) => (
                        <span
                          key={j}
                          className="cal-ev-chip"
                          style={{ '--ev-color': ev.area.color }}
                          title={`${ev.ramoName} — ${ev.type}`}
                        >
                          <span className="cal-ev-dot" />
                          <span className="cal-ev-label">{ev.type}</span>
                        </span>
                      ))}
                      {evs.length > 3 && (
                        <span className="cal-ev-more">+{evs.length - 3}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Right: upcoming + month summary ────────────────────────── */}
          <div className="cal-aside">
            <div className="cal-aside-section">
              <h4 className="cal-aside-title">Próximas evaluaciones</h4>
              {upcoming.length === 0 ? (
                <p className="cal-empty-msg">
                  Sin evaluaciones agendadas. Agrega fechas abriendo un ramo.
                </p>
              ) : upcoming.map((ev, i) => {
                const [y, m, d] = ev.date.split('-').map(Number)
                const diffDays = Math.ceil((new Date(y, m - 1, d) - today) / 86400000)
                const label = diffDays === 0 ? 'Hoy'
                  : diffDays === 1 ? 'Mañana'
                  : `En ${diffDays} días`
                const urgent = diffDays <= 3
                return (
                  <div
                    key={i}
                    className={`cal-upcoming-row${urgent ? ' urgent' : ''}`}
                    style={{ '--ev-color': ev.area.color }}
                  >
                    <div className="cal-upcoming-date">
                      <span className="cal-up-day">{d}</span>
                      <span className="cal-up-mon">{MON_SHORT[m - 1]}</span>
                    </div>
                    <div className="cal-upcoming-info">
                      <div className="cal-up-type">{ev.type}</div>
                      <div className="cal-up-ramo">{ev.ramoName}</div>
                    </div>
                    <div className="cal-upcoming-meta">
                      <span className={`cal-up-diff${urgent ? ' urgent' : ''}`}>{label}</span>
                      <span className="cal-up-weight">{ev.weight}%</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="cal-aside-section">
              <h4 className="cal-aside-title">Resumen del mes</h4>
              {monthEvs.length === 0 ? (
                <p className="cal-empty-msg">Sin evaluaciones este mes.</p>
              ) : (
                <>
                  <div className="cal-summary-stats">
                    <div className="cal-stat">
                      <span className="cal-stat-label">Evaluaciones</span>
                      <span className="cal-stat-value">{monthEvs.length}</span>
                    </div>
                    <div className="cal-stat">
                      <span className="cal-stat-label">Ramos</span>
                      <span className="cal-stat-value">
                        {new Set(monthEvs.map(e => e.ramoCode)).size}
                      </span>
                    </div>
                  </div>
                  <div className="cal-summary-list">
                    {monthEvs.slice(0, 6).map((ev, i) => (
                      <div key={i} className="cal-summary-row">
                        <span className="cal-summary-dot" style={{ background: ev.area.color }} />
                        <span className="cal-summary-text">{ev.type} — {ev.ramoName}</span>
                        <span className="cal-summary-date">
                          {ev.date.slice(8)}/{ev.date.slice(5, 7)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
