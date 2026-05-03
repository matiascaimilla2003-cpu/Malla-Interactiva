import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { RAMOS } from '../data/malla'

const RAMO_NAME = Object.fromEntries(RAMOS.map(r => [r.code, r.name]))

export default function Admin({ onClose }) {
  const [tab,     setTab]     = useState('pendientes')
  const [lista,   setLista]   = useState([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(null)

  const fetchTab = useCallback(async (estado) => {
    setLoading(true)
    const { data } = await supabase
      .from('comentarios')
      .select('id, ramo_id, texto, created_at, estado')
      .eq('estado', estado)
      .order('created_at', { ascending: true })
    setLista(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTab(tab) }, [fetchTab, tab])

  async function setEstado(id, estado) {
    setWorking(id)
    await supabase.from('comentarios').update({ estado }).eq('id', id)
    setLista(prev => prev.filter(c => c.id !== id))
    setWorking(null)
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar este comentario permanentemente?')) return
    setWorking(id)
    await supabase.from('comentarios').delete().eq('id', id)
    setLista(prev => prev.filter(c => c.id !== id))
    setWorking(null)
  }

  return (
    <div className="cal-overlay" onClick={onClose}>
      <div className="cal-page admin-page" onClick={e => e.stopPropagation()}>
        <div className="cal-header">
          <div>
            <h2 className="cal-title">Moderación de comentarios</h2>
            <p className="cal-sub">
              {loading ? 'Cargando…' : `${lista.length} ${tab === 'pendientes' ? 'pendiente' : 'aprobado'}${lista.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab${tab === 'pendientes' ? ' active' : ''}`}
            onClick={() => setTab('pendientes')}
          >
            Pendientes
          </button>
          <button
            className={`admin-tab${tab === 'aprobados' ? ' active' : ''}`}
            onClick={() => setTab('aprobados')}
          >
            Aprobados
          </button>
        </div>

        <div className="admin-body">
          {loading ? (
            <p className="admin-empty">Cargando comentarios…</p>
          ) : lista.length === 0 ? (
            <p className="admin-empty">
              {tab === 'pendientes' ? 'No hay comentarios pendientes. ✓' : 'No hay comentarios aprobados.'}
            </p>
          ) : (
            lista.map(c => (
              <div key={c.id} className="admin-comment-row">
                <div className="admin-comment-meta">
                  <span className="admin-comment-ramo">
                    {c.ramo_id} — {RAMO_NAME[c.ramo_id] ?? c.ramo_id}
                  </span>
                  <span className="admin-comment-date">
                    {new Date(c.created_at).toLocaleDateString('es-CL', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="admin-comment-texto">{c.texto}</p>
                <div className="admin-comment-actions">
                  {tab === 'pendientes' && (
                    <>
                      <button
                        className="admin-btn admin-btn-approve"
                        onClick={() => setEstado(c.id, 'aprobado')}
                        disabled={working === c.id}
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        className="admin-btn admin-btn-reject"
                        onClick={() => setEstado(c.id, 'rechazado')}
                        disabled={working === c.id}
                      >
                        ✗ Rechazar
                      </button>
                    </>
                  )}
                  <button
                    className="admin-btn admin-btn-delete"
                    onClick={() => eliminar(c.id)}
                    disabled={working === c.id}
                    title="Eliminar permanentemente"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
