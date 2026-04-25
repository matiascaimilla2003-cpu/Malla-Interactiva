import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePerfil(userId) {
  // null = no hay perfil (onboarding pendiente), undefined = cargando
  const [perfil, setPerfil] = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setPerfil(null); setLoading(false); return }
    fetchPerfil()
  }, [userId])

  async function fetchPerfil() {
    setLoading(true)
    const { data, error } = await supabase
      .from('perfil')
      .select('sem_actual, cohorte, es_primero')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) console.error('usePerfil:', error)
    setPerfil(data ?? null)
    setLoading(false)
  }

  async function savePerfil({ semActual, cohorte, esPrimero }) {
    const payload = { user_id: userId, sem_actual: semActual, cohorte, es_primero: esPrimero }
    const { error } = await supabase
      .from('perfil')
      .upsert(payload, { onConflict: 'user_id' })

    if (!error) setPerfil({ sem_actual: semActual, cohorte, es_primero: esPrimero })
    return { error }
  }

  return { perfil, loading, savePerfil }
}
