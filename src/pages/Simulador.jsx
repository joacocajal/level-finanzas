import { useEffect, useState, useMemo } from 'react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { getTransacciones, getInventario, getConfig } from '../lib/dataService'
import { formatARS } from '../lib/utils'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-dark-text mb-1">{label}</p>
      <p className="font-semibold text-white">{formatARS(payload[0]?.value)}</p>
    </div>
  )
}

function Slider({ label, value, min, max, step = 1000, onChange, format }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-dark-text text-xs font-semibold uppercase tracking-wider">{label}</label>
        <span className="text-brand font-bebas text-xl tracking-wider">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #e63946 0%, #e63946 ${((value - min) / (max - min)) * 100}%, #262626 ${((value - min) / (max - min)) * 100}%, #262626 100%)`
        }}
      />
      <div className="flex justify-between text-dark-muted text-xs">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  )
}

function ResultCard({ label, value, sub, color = 'text-white', bg = 'bg-dark-surface' }) {
  return (
    <div className={`${bg} border border-dark-border rounded-2xl p-4`}>
      <p className="text-dark-text text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-bebas text-3xl tracking-wider ${color}`}>{value}</p>
      {sub && <p className="text-dark-text text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Simulador() {
  const [loading, setLoading] = useState(true)

  // Base data
  const [totalEgresos,    setTotalEgresos]    = useState(0)
  const [totalIngresos,   setTotalIngresos]   = useState(0)
  const [stockRemeras,    setStockRemeras]     = useState(13)

  // Inputs del simulador
  const [precioVenta,  setPrecioVenta]  = useState(40000)
  const [mkgMensual,   setMkgMensual]   = useState(55000)
  const [mesesMkg,     setMesesMkg]     = useState(1)

  useEffect(() => {
    const load = async () => {
      try {
        const [txs, inv, cfg] = await Promise.all([getTransacciones(), getInventario(), getConfig()])
        const egresos  = txs.filter(t => t.tipo === 'egreso') .reduce((s, t) => s + t.monto, 0)
        const ingresos = txs.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
        setTotalEgresos(egresos)
        setTotalIngresos(ingresos)
        const remeras = inv.filter(i => i.producto.toLowerCase().includes('remera'))
        setStockRemeras(remeras.reduce((s, i) => s + i.cantidad_disponible, 0))
        // Precio sugerido
        if (cfg.precio_venta_negra) setPrecioVenta(cfg.precio_venta_negra)
        // Marketing sugerido
        const mkgTotal = (cfg.costo_runway_mensual || 0) + (cfg.costo_flux_api || 0) + (cfg.costo_gemini_api || 0)
        if (mkgTotal > 0) setMkgMensual(mkgTotal)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const resultados = useMemo(() => {
    const ingresoProyectado = stockRemeras * precioVenta
    const costoMarketing    = mkgMensual * mesesMkg
    const costoTotal        = totalEgresos + costoMarketing
    const ingresosReales    = totalIngresos
    const gananciaProyectada = (ingresoProyectado + ingresosReales) - costoTotal
    const breakEven          = precioVenta > 0
      ? Math.max(0, Math.ceil((costoTotal - ingresosReales) / precioVenta))
      : 0
    const margen = costoTotal > 0
      ? ((gananciaProyectada / costoTotal) * 100).toFixed(1)
      : 0

    return { ingresoProyectado, costoMarketing, costoTotal, gananciaProyectada, breakEven, margen }
  }, [stockRemeras, precioVenta, mkgMensual, mesesMkg, totalEgresos, totalIngresos])

  const chartData = [
    { name: 'Ingresos proyectados', value: resultados.ingresoProyectado + totalIngresos, color: '#22c55e' },
    { name: 'Costos totales',       value: resultados.costoTotal,                        color: '#e63946' },
  ]

  if (loading) return <div className="flex items-center justify-center h-64 text-dark-text">Cargando…</div>

  const esRentable = resultados.gananciaProyectada >= 0

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="font-bebas text-5xl tracking-widest text-white">Simulador de precios</h1>
        <p className="text-dark-text text-sm">Ajustá los parámetros y mirá el impacto en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de inputs */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-8">
          <h2 className="font-bebas text-xl tracking-widest text-white">Parámetros</h2>

          <Slider
            label="Precio de venta por remera"
            value={precioVenta}
            min={10000}
            max={150000}
            step={1000}
            onChange={setPrecioVenta}
            format={formatARS}
          />

          <div className="space-y-2">
            <label className="block text-dark-text text-xs font-semibold uppercase tracking-wider">
              Precio de venta (manual)
            </label>
            <input
              type="number"
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors"
              value={precioVenta}
              min={0}
              onChange={e => setPrecioVenta(Number(e.target.value))}
            />
          </div>

          <Slider
            label="Costo marketing mensual"
            value={mkgMensual}
            min={0}
            max={500000}
            step={5000}
            onChange={setMkgMensual}
            format={formatARS}
          />

          <Slider
            label="Meses de marketing"
            value={mesesMkg}
            min={1}
            max={12}
            step={1}
            onChange={setMesesMkg}
            format={v => `${v} ${v === 1 ? 'mes' : 'meses'}`}
          />

          {/* Info base */}
          <div className="bg-dark-surface rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-text">Inversión acumulada</span>
              <span className="text-white font-medium">{formatARS(totalEgresos)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-text">Ingresos actuales</span>
              <span className="text-green-400 font-medium">{formatARS(totalIngresos)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-text">Remeras disponibles</span>
              <span className="text-white font-medium">{stockRemeras} uds.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-text">Marketing proyectado</span>
              <span className="text-amber-400 font-medium">{formatARS(resultados.costoMarketing)}</span>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className="space-y-4">
          <h2 className="font-bebas text-xl tracking-widest text-white">Proyección</h2>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Ingreso proyectado"
              value={formatARS(resultados.ingresoProyectado + totalIngresos)}
              sub="Si vendés todo el stock"
              color="text-green-400"
            />
            <ResultCard
              label="Costo total"
              value={formatARS(resultados.costoTotal)}
              sub="Inversión + marketing"
              color="text-brand"
            />
            <ResultCard
              label={esRentable ? 'Ganancia neta' : 'Pérdida neta'}
              value={formatARS(Math.abs(resultados.gananciaProyectada))}
              color={esRentable ? 'text-green-400' : 'text-brand'}
              bg={esRentable ? 'bg-green-500/5' : 'bg-brand/5'}
            />
            <ResultCard
              label="Break-even"
              value={`${resultados.breakEven} uds.`}
              sub="Para recuperar inversión"
              color="text-amber-400"
            />
            <ResultCard
              label="Margen de ganancia"
              value={`${resultados.margen}%`}
              sub={esRentable ? 'Sobre el costo total' : 'Pérdida sobre el costo'}
              color={esRentable ? 'text-green-400' : 'text-brand'}
            />
            <ResultCard
              label="Break-even vs stock"
              value={resultados.breakEven <= stockRemeras ? 'Alcanzable' : 'Imposible sin más ventas'}
              color={resultados.breakEven <= stockRemeras ? 'text-green-400' : 'text-brand'}
              sub={`Tenés ${stockRemeras} remeras`}
            />
          </div>

          {/* Gráfico comparativo */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="font-bebas text-lg tracking-widest text-white mb-4">Ingresos vs Costos</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={48}>
                <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 11, fontFamily: 'Barlow' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff06' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
