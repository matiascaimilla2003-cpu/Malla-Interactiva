import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook para leer y escribir el progreso del usuario autenticado.
 * estados posibles: 'pendiente' | 'en_curso' | 'aprobado'
 */
export function useProgreso(userId) {
  const [progreso, setProgreso] = useState({}) // { code: estado }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setProgreso({}); setLoading(false); return }
    setProgreso({})     // evita flash de datos del usuario anterior
    setLoading(true)
    fetchProgreso()
  }, [userId])

  async function fetchProgreso() {
    setLoading(true)
    const { data, error } = await supabase
      .from('progreso')
      .select('ramo_id, estado')
      .eq('user_id', userId)

    if (!error && data) {
      const map = {}
      data.forEach(row => { map[row.ramo_id] = row.estado })
      setProgreso(map)
    }
    setLoading(false)
  }

  async function setEstado(ramoId, estado) {
    // Optimistic update
    setProgreso(prev => ({ ...prev, [ramoId]: estado }))

    const { error } = await supabase
      .from('progreso')
      .upsert(
        { user_id: userId, ramo_id: ramoId, estado, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,ramo_id' }
      )

    if (error) {
      console.error('Error guardando progreso:', error)
      // Revertir si falla
      fetchProgreso()
    }
  }

  async function clearEstado(ramoId) {
    setProgreso(prev => {
      const next = { ...prev }
      delete next[ramoId]
      return next
    })

    await supabase
      .from('progreso')
      .delete()
      .eq('user_id', userId)
      .eq('ramo_id', ramoId)
  }

  return { progreso, loading, setEstado, clearEstado }
}
