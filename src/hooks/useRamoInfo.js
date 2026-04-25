import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const EMPTY = { profesor: '', horario_texto: '', sala: '', notas_extra: '' }

export function useRamoInfo(userId, ramoId) {
  const [info, setInfo] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !ramoId) { setInfo(EMPTY); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    supabase
      .from('ramo_info')
      .select('profesor, horario_texto, sala, notas_extra')
      .eq('user_id', userId)
      .eq('ramo_id', ramoId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setInfo(data ?? EMPTY)
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [userId, ramoId])

  async function saveInfo(patch) {
    const merged = { ...info, ...patch }
    setInfo(merged)
    const { error } = await supabase
      .from('ramo_info')
      .upsert(
        { user_id: userId, ramo_id: ramoId, ...merged },
        { onConflict: 'user_id,ramo_id' }
      )
    if (error) console.error('useRamoInfo save:', error)
    return { error }
  }

  return { info, loading, saveInfo }
}
