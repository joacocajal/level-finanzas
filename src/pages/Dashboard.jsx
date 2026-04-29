import { useEffect, useState, useMemo } from 'react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie,
} from 'recharts'
import { TrendingUp, TrendingDown, Package, DollarSign, Target, BarChart2, Zap } from 'lucide-react'
import { getTransacciones, getInventario, getConfig } from '../lib/dataService'
import { formatARS, formatDate, CATEGORIA_LABELS, CATEGORIA_COLORS } from '../lib/utils'
import { CategoriaBadge, TipoBadge } from '../components/ui/Badge'

// ─── Glassmorphism Tooltip ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-4 py-3 shadow-xl text-sm" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-dark-text mb-1.5 text-[10px] tracking-[0.2em] uppercase">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-semibold metric-number" style={{ color: p.color || p.stroke }}>
          {formatARS(p.value)}
        </p>
      ))}
    </div>
  )
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, Icon, color = 'text-white', index = 0 }) {
  return (
    <div
      className="glass card-glow rounded-2xl p-5 flex flex-col gap-3 slide-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-dark-text text-[10px] font-semibold uppercase tracking-[0.2em]">{label}</span>
        <span className="p-2 rounded-xl bg-dark-surface border border-white/5">
          <Icon size={15} className={color} />
        </span>
      </div>
      <div>
        <p className={`font-bebas tracking-wider metric-number ${color}`} style={{ fontSize: '2.6rem', lineHeight: 1 }}>{value}</p>
        {sub && <p className="text-dark-text text-xs mt-0.5 tracking-wide">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Drop Progress Card ───────────────────────────────────────────────────────
function DropProgressCard({ totalIngresos, totalEgresos }) {
  const progress = totalEgresos > 0 ? Math.min(100, (totalIngresos / totalEgresos) * 100) : 0
  const recovered = progress >= 100

  return (
    <div
      className="glass card-glow rounded-2xl p-5 slide-up"
      style={{ animationDelay: '0.38s' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand/10 border border-brand/20">
            <Zap size={15} className="text-brand" />
          </div>
          <div>
            <p className="text-dark-text text-[10px] font-semibold uppercase tracking-[0.2em]">Drop 1 · Progreso</p>
            <p className="text-white text-sm font-medium mt-0.5">
              {recovered ? '¡Break-even alcanzado!' : 'Recuperando inversión…'}
            </p>
          </div>
        </div>
        <p className={`font-bebas text-4xl tracking-wider metric-number ${recovered ? 'text-green-400' : 'text-brand'}`}>
          {progress.toFixed(1)}%
        </p>
      </div>

      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-full rounded-full progress-bar"
          style={{
            width: `${progress}%`,
            background: recovered
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : 'linear-gradient(90deg, #c1121f, #e63946, #ff6b76)',
          }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-dark-text text-xs tracking-wide">{formatARS(totalIngresos)} en ventas</span>
        <span className="text-dark-text text-xs tracking-wide">Meta: {formatARS(totalEgresos)}</span>
      </div>
    </div>
  )
}

// ─── Stock Donut ──────────────────────────────────────────────────────────────
function StockDonut({ stockDisponible, totalRemeras }) {
  const vendidas = Math.max(0, totalRemeras - stockDisponible)
  const pct = totalRemeras > 0 ? Math.round((stockDisponible / totalRemeras) * 100) : 0
  const data = [
    { name: 'Disponibles', value: stockDisponible || 0.01 },
    { name: 'Vendidas',    value: vendidas || 0.01 },
  ]
  const COLORS = ['#e63946', '#1f1f1f']

  return (
    <div className="glass card-glow rounded-2xl p-6">
      <h2 className="font-bebas text-xl tracking-widest text-white mb-4">Stock Remeras</h2>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
          <PieChart width={110} height={110}>
            <Pie
              data={data}
              cx={55}
              cy={55}
              innerRadius={34}
              outerRadius={50}
              dataKey="value"
              strokeWidth={0}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="font-bebas text-brand text-2xl leading-none metric-number">{pct}%</p>
              <p className="text-dark-text text-[8px] tracking-[0.2em] uppercase">disp.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-brand" />
              <p className="text-dark-text text-[10px] uppercase tracking-[0.15em]">Disponibles</p>
            </div>
            <p className="font-bebas text-2xl text-white tracking-wider metric-number">{stockDisponible} uds</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-dark-muted" />
              <p className="text-dark-text text-[10px] uppercase tracking-[0.15em]">Vendidas</p>
            </div>
            <p className="font-bebas text-2xl text-white tracking-wider metric-number">{vendidas} uds</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [transacciones, setTransacciones] = useState([])
  const [inventario, setInventario]       = useState([])
  const [config, setConfig]               = useState({})
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [txs, inv, cfg] = await Promise.all([
          getTransacciones(),
          getInventario(),
          getConfig(),
        ])
        setTransacciones(txs)
        setInventario(inv)
        setConfig(cfg)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const metrics = useMemo(() => {
    const totalEgresos  = transacciones.filter(t => t.tipo === 'egreso') .reduce((s, t) => s + t.monto, 0)
    const totalIngresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
    const balanceNeto   = totalIngresos - totalEgresos

    const remeras         = inventario.filter(i => i.producto.toLowerCase().includes('remera'))
    const stockDisponible = remeras.reduce((s, i) => s + i.cantidad_disponible, 0)
    const totalRemeras    = remeras.reduce((s, i) => s + i.cantidad_total, 0)
    const costoRemeras    = remeras.reduce((s, i) => s + i.costo_unitario * i.cantidad_total, 0)
    const costoPromedio   = totalRemeras > 0 ? costoRemeras / totalRemeras : 0

    const precioVenta  = config.precio_venta_negra ?? 40000
    const faltanVender = precioVenta > 0
      ? Math.max(0, Math.ceil((totalEgresos - totalIngresos) / precioVenta))
      : 0

    return { totalEgresos, totalIngresos, balanceNeto, stockDisponible, totalRemeras, costoPromedio, faltanVender }
  }, [transacciones, inventario, config])

  const gastosData = useMemo(() => {
    const cats = ['inversion_producto', 'inversion_packaging', 'inversion_marketing', 'gasto_operativo']
    return cats
      .map(cat => ({
        name:  CATEGORIA_LABELS[cat].replace('Inversión ', ''),
        monto: transacciones
          .filter(t => t.categoria === cat && t.tipo === 'egreso')
          .reduce((s, t) => s + t.monto, 0),
        fill: CATEGORIA_COLORS[cat],
      }))
      .filter(d => d.monto > 0)
  }, [transacciones])

  const balanceData = useMemo(() => {
    const sorted = [...transacciones].sort((a, b) => a.fecha.localeCompare(b.fecha))
    let acum = 0
    return sorted.map(t => {
      acum += t.tipo === 'ingreso' ? t.monto : -t.monto
      return { name: formatDate(t.fecha), balance: acum }
    })
  }, [transacciones])

  const ultimas = transacciones.slice(0, 5)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin mx-auto" />
        <p className="text-dark-text text-xs tracking-[0.3em] uppercase">Cargando</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="p-6 glass rounded-2xl" style={{ border: '1px solid rgba(230,57,70,0.2)' }}>
      <p className="text-brand text-sm">Error: {error}</p>
    </div>
  )

  const { totalEgresos, totalIngresos, balanceNeto, stockDisponible, totalRemeras, costoPromedio, faltanVender } = metrics
  const esGanancia = balanceNeto >= 0

  return (
    <div className="space-y-5 animate-in">

      {/* Header */}
      <div className="slide-up" style={{ animationDelay: '0s' }}>
        <h1 className="font-bebas text-5xl tracking-[0.15em] text-white">Dashboard</h1>
        <p className="text-dark-text text-[10px] mt-1 tracking-[0.4em] uppercase">Drop 1 · Your Rules</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard label="Inversión total"      value={formatARS(totalEgresos)}          Icon={TrendingDown} color="text-brand"     index={0} />
        <MetricCard label="Ingresos ventas"       value={formatARS(totalIngresos)}         Icon={TrendingUp}   color="text-green-400" index={1} />
        <MetricCard
          label="Balance neto"
          value={formatARS(Math.abs(balanceNeto))}
          sub={esGanancia ? 'Ganancia' : 'Pérdida acumulada'}
          Icon={DollarSign}
          color={esGanancia ? 'text-green-400' : 'text-brand'}
          index={2}
        />
        <MetricCard label="Stock remeras"         value={`${stockDisponible} uds`}         Icon={Package}      color="text-white"     index={3} />
        <MetricCard label="Costo prom. / remera"  value={formatARS(costoPromedio)}         Icon={BarChart2}    color="text-amber-400" index={4} />
        <MetricCard
          label="Break-even"
          value={`${faltanVender} remeras`}
          sub="Para recuperar inversión"
          Icon={Target}
          color="text-purple-400"
          index={5}
        />
      </div>

      {/* Drop Progress */}
      <DropProgressCard totalIngresos={totalIngresos} totalEgresos={totalEgresos} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 slide-up" style={{ animationDelay: '0.44s' }}>

        {/* Gastos por categoría */}
        <div className="glass card-glow rounded-2xl p-6">
          <h2 className="font-bebas text-xl tracking-widest text-white mb-5">Gastos</h2>
          {gastosData.length === 0 ? (
            <p className="text-dark-text text-sm">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gastosData} barSize={20}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#505050', fontSize: 11, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="monto" radius={[5, 5, 0, 0]}>
                  {gastosData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Balance acumulado — AreaChart con gradiente rojo */}
        <div className="glass card-glow rounded-2xl p-6">
          <h2 className="font-bebas text-xl tracking-widest text-white mb-5">Balance</h2>
          {balanceData.length === 0 ? (
            <p className="text-dark-text text-sm">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={balanceData}>
                <defs>
                  <linearGradient id="gradBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#e63946" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#e63946" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#505050', fontSize: 10, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#e63946"
                  strokeWidth={2}
                  fill="url(#gradBalance)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#e63946', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stock Donut */}
        <StockDonut stockDisponible={stockDisponible} totalRemeras={totalRemeras} />
      </div>

      {/* Últimas transacciones */}
      <div className="glass card-glow rounded-2xl slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="font-bebas text-xl tracking-widest text-white">Últimas transacciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Fecha', 'Concepto', 'Categoría', 'Tipo', 'Monto'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-dark-text text-[10px] font-semibold uppercase tracking-[0.2em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ultimas.map((t, i) => (
                <tr
                  key={t.id}
                  className={`border-b border-white/4 transition-colors ${
                    i === ultimas.length - 1 ? 'border-0' : ''
                  }`}
                  style={{ transition: 'background 0.15s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-6 py-3.5 text-dark-text whitespace-nowrap text-xs tracking-wide">
                    {formatDate(t.fecha)}
                  </td>
                  <td className="px-6 py-3.5 text-white max-w-[200px] truncate font-medium text-sm">
                    {t.concepto}
                  </td>
                  <td className="px-6 py-3.5"><CategoriaBadge categoria={t.categoria} /></td>
                  <td className="px-6 py-3.5"><TipoBadge tipo={t.tipo} /></td>
                  <td className={`px-6 py-3.5 font-bebas text-lg tracking-wider whitespace-nowrap metric-number ${
                    t.tipo === 'ingreso' ? 'text-green-400' : 'text-brand'
                  }`}>
                    {t.tipo === 'egreso' ? '−' : '+'}{formatARS(t.monto)}
                  </td>
                </tr>
              ))}
              {ultimas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-dark-text text-xs tracking-[0.3em] uppercase">
                    Sin transacciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
