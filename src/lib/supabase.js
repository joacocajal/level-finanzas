import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Si las variables de entorno están presentes, requerimos conexión a Supabase (sin fallback a LocalStorage)
export const isSupabaseConfigured = !!(url && key)

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase no configurado - usando modo LocalStorage')
} else if (url === 'https://tu-proyecto.supabase.co' || key === 'tu-anon-key-aqui') {
  console.error('❌ ERROR: Variables de entorno de Supabase tienen valores placeholder. Configurá credenciales reales en .env')
  throw new Error('Supabase configurado con credenciales placeholder. Por favor actualizá el archivo .env con credenciales reales.')
}

export const supabase = isSupabaseConfigured ? createClient(url, key) : null
