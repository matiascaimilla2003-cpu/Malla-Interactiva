import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useHorario(userId, ramoId = null) {
  const [bloques, setBloques] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setBloques([]); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    let q = supabase.from('horario').select('*').eq('user_id', userId)
    if (ramoId) q = q.eq('ramo_id', ramoId)
    q.then(({ data }) => {
      if (!cancelled) setBloques(data ?? [])
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [userId, ramoId])

  async function addBloque(ramo_id, dia, bloque_inicio, bloque_fin) {
    const { data, error } = await supabase
      .from('horario')
      .insert({ user_id: userId, ramo_id, dia, bloque_inicio, bloque_fin })
      .select()
      .single()
    if (!error && data) setBloques(prev => [...prev, data])
    return { error }
  }

  async function removeBloque(id) {
    const { error } = await supabase.from('horario').delete().eq('id', id)
    if (!error) setBloques(prev => prev.filter(b => b.id !== id))
    return { error }
  }

  return { bloques, loading, addBloque, removeBloque }
}
