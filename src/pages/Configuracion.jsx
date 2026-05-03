import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DIAS_OPTS = [1, 3, 5, 7]

export default function Configuracion({ userId, onClose }) {
  const [notif,   setNotif]   = useState(true)
  const [dias,    setDias]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    supabase.from('configuracion_usuario')
      .select('notif_activa, dias_anticipacion')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setNotif(data.notif_activa)
          setDias(data.dias_anticipacion)
        }
        setLoading(false)
      })
  }, [userId])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await supabase.from('configuracion_usuario').upsert(
      { user_id: userId, notif_activa: notif, dias_anticipacion: dias, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="cal-overlay" onClick={onClose}>
      <div className="cal-page config-page" onClick={e => e.stopPropagation()}>
        <div className="cal-header">
          <div>
            <h2 className="cal-title">Configuración</h2>
            <p className="cal-sub">Preferencias de notificaciones</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="config-body"><p className="admin-empty">Cargando…</p></div>
        ) : (
          <div className="config-body">
            <div className="config-section">
              <div className="config-row">
                <div>
                  <div className="config-label">Recordatorios de evaluaciones</div>
                  <div className="config-hint">Muestra una alerta antes de certámenes y tareas</div>
                </div>
                <label className="toggle-wrap">
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={notif}
                    onChange={e => setNotif(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>

            <div className={`config-section${!notif ? ' config-section--disabled' : ''}`}>
              <div className="config-label">Días de anticipación</div>
              <div className="config-hint">Avisar con cuántos días de antelación</div>
              <div className="days-selector">
                {DIAS_OPTS.map(d => (
                  <button
                    key={d}
                    className={`days-btn${dias === d ? ' active' : ''}`}
                    onClick={() => setDias(d)}
                    disabled={!notif}
                  >
                    {d} {d === 1 ? 'día' : 'días'}
                  </button>
                ))}
              </div>
            </div>

            <div className="config-footer">
              {saved && <span className="config-saved">✓ Guardado</span>}
              <button
                className="config-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
