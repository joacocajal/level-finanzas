import { useEffect, useState } from 'react'
import { Save, Check } from 'lucide-react'
import { getConfig, updateConfig } from '../lib/dataService'
import { formatARS } from '../lib/utils'

function ConfigRow({ label, clave, value, onChange, prefix = '', suffix = '', type = 'number', min = 0 }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-dark-border last:border-0">
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-dark-text text-xs mt-0.5 font-mono">{clave}</p>
      </div>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-dark-text text-sm">{prefix}</span>}
        <input
          type={type}
          min={min}
          step={type === 'number' ? 100 : undefined}
          value={value}
          onChange={e => onChange(clave, type === 'number' ? Number(e.target.value) : e.target.value)}
          className="w-32 bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-white text-sm text-right focus:outline-none focus:border-brand/50 transition-colors"
        />
        {suffix && <span className="text-dark-text text-sm">{suffix}</span>}
      </div>
    </div>
  )
}

export default function Configuracion() {
  const [config,  setConfig]  = useState({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getConfig()
      .then(setConfig)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const set = (clave, valor) => setConfig(c => ({ ...c, [clave]: valor }))

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await Promise.all(Object.entries(config).map(([clave, valor]) => updateConfig(clave, valor)))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-dark-text">Cargando…</div>
  if (error)   return <div className="p-6 bg-brand/10 border border-brand/20 rounded-2xl text-brand">Error: {error}</div>

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-bebas text-5xl tracking-widest text-white">Configuración</h1>
          <p className="text-dark-text text-sm">Parámetros del negocio</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-brand text-white hover:bg-brand/90'
          } disabled:opacity-50`}
        >
          {saved ? <><Check size={15} /> Guardado</> : <><Save size={15} /> {saving ? 'Guardando…' : 'Guardar cambios'}</>}
        </button>
      </div>

      {/* Tipo de cambio */}
      <div className="bg-dark-card border border-dark-border rounded-2xl">
        <div className="px-6 py-4 border-b border-dark-border">
          <h2 className="font-bebas text-xl tracking-widest text-white">Tipo de cambio</h2>
          <p className="text-dark-text text-xs mt-0.5">Se usa para convertir transacciones en USD</p>
        </div>
        <div className="px-6">
          <ConfigRow
            label="USD → ARS"
            clave="tipo_cambio_usd"
            value={config.tipo_cambio_usd ?? 1400}
            onChange={set}
            prefix="1 USD ="
            suffix="ARS"
          />
        </div>
        {config.tipo_cambio_usd && (
          <div className="px-6 pb-4">
            <p className="text-dark-text text-xs">
              Ejemplo: $100 USD = {formatARS(100 * (config.tipo_cambio_usd ?? 1400))} ARS
            </p>
          </div>
        )}
      </div>

      {/* Precios de venta */}
      <div className="bg-dark-card border border-dark-border rounded-2xl">
        <div className="px-6 py-4 border-b border-dark-border">
          <h2 className="font-bebas text-xl tracking-widest text-white">Precios de venta</h2>
          <p className="text-dark-text text-xs mt-0.5">Precio sugerido en el simulador y modales de venta</p>
        </div>
        <div className="px-6">
          <ConfigRow
            label="Remera negra estampada"
            clave="precio_venta_negra"
            value={config.precio_venta_negra ?? 40000}
            onChange={set}
            prefix="$"
            suffix="ARS"
          />
          <ConfigRow
            label="Remera blanca estampada"
            clave="precio_venta_blanca"
            value={config.precio_venta_blanca ?? 40000}
            onChange={set}
            prefix="$"
            suffix="ARS"
          />
        </div>
      </div>

      {/* Costos de marketing */}
      <div className="bg-dark-card border border-dark-border rounded-2xl">
        <div className="px-6 py-4 border-b border-dark-border">
          <h2 className="font-bebas text-xl tracking-widest text-white">Herramientas de marketing</h2>
          <p className="text-dark-text text-xs mt-0.5">Costos mensuales de las herramientas de IA / generación de contenido</p>
        </div>
        <div className="px-6">
          <ConfigRow
            label="Runway (generación de video)"
            clave="costo_runway_mensual"
            value={config.costo_runway_mensual ?? 0}
            onChange={set}
            prefix="$"
            suffix="ARS/mes"
          />
          <ConfigRow
            label="Flux API (generación de imágenes)"
            clave="costo_flux_api"
            value={config.costo_flux_api ?? 0}
            onChange={set}
            prefix="$"
            suffix="ARS/mes"
          />
          <ConfigRow
            label="Gemini API"
            clave="costo_gemini_api"
            value={config.costo_gemini_api ?? 0}
            onChange={set}
            prefix="$"
            suffix="ARS/mes"
          />
        </div>
        <div className="px-6 pb-4">
          <p className="text-dark-text text-xs">
            Total marketing mensual:{' '}
            <span className="text-amber-400 font-semibold">
              {formatARS((config.costo_runway_mensual || 0) + (config.costo_flux_api || 0) + (config.costo_gemini_api || 0))}
            </span>
          </p>
        </div>
      </div>

      {/* Info Supabase */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
        <h2 className="font-bebas text-xl tracking-widest text-white mb-3">Base de datos</h2>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${import.meta.env.VITE_SUPABASE_URL ? 'bg-green-500' : 'bg-amber-500'}`} />
          <div>
            <p className="text-white text-sm font-medium">
              {import.meta.env.VITE_SUPABASE_URL ? 'Conectado a Supabase' : 'Modo localStorage (sin Supabase)'}
            </p>
            <p className="text-dark-text text-xs mt-0.5">
              {import.meta.env.VITE_SUPABASE_URL
                ? `URL: ${import.meta.env.VITE_SUPABASE_URL}`
                : 'Configurá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
