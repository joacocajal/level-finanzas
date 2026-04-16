import { useEffect, useState, useMemo } from 'react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown, Package, DollarSign, Target, BarChart2 } from 'lucide-react'
import { getTransacciones, getInventario, getConfig } from '../lib/dataService'
import { formatARS, formatDate, CATEGORIA_LABELS, CATEGORIA_COLORS } from '../lib/utils'
import { CategoriaBadge, TipoBadge } from '../components/ui/Badge'

// ─── Tooltip custom para Recharts ────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-dark-text mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
          {formatARS(p.value)}
        </p>
      ))}
    </div>
  )
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, Icon, color = 'text-white', positive }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-5 flex flex-col gap-3 hover:border-dark-muted transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-dark-text text-xs font-semibold uppercase tracking-widest">{label}</span>
        <span className="p-2 rounded-xl bg-dark-surface">
          <Icon size={16} className={color} />
        </span>
      </div>
      <div>
        <p className={`font-bebas text-3xl tracking-wider ${color}`}>{value}</p>
        {sub && <p className="text-dark-text text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

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

  // ─── Métricas ──────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const totalEgresos  = transacciones.filter(t => t.tipo === 'egreso') .reduce((s, t) => s + t.monto, 0)
    const totalIngresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
    const balanceNeto   = totalIngresos - totalEgresos

    const remeras = inventario.filter(i =>
      i.producto.toLowerCase().includes('remera')
    )
    const stockDisponible = remeras.reduce((s, i) => s + i.cantidad_disponible, 0)
    const totalRemeras    = remeras.reduce((s, i) => s + i.cantidad_total, 0)
    const costoRemeras    = remeras.reduce((s, i) => s + i.costo_unitario * i.cantidad_total, 0)
    const costoPromedio   = totalRemeras > 0 ? costoRemeras / totalRemeras : 0

    const precioVenta   = config.precio_venta_negra ?? 40000
    const faltanVender  = precioVenta > 0
      ? Math.max(0, Math.ceil((totalEgresos - totalIngresos) / precioVenta))
      : 0

    return { totalEgresos, totalIngresos, balanceNeto, stockDisponible, costoPromedio, faltanVender }
  }, [transacciones, inventario, config])

  // ─── Datos para gráfico de gastos por categoría ───────────────────────────
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

  // ─── Datos para gráfico de balance acumulado ──────────────────────────────
  const balanceData = useMemo(() => {
    const sorted = [...transacciones].sort((a, b) => a.fecha.localeCompare(b.fecha))
    let acum = 0
    return sorted.map(t => {
      acum += t.tipo === 'ingreso' ? t.monto : -t.monto
      return { name: formatDate(t.fecha), balance: acum, concepto: t.concepto }
    })
  }, [transacciones])

  // ─── Últimas 5 transacciones ──────────────────────────────────────────────
  const ultimas = transacciones.slice(0, 5)

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-dark-text">
      Cargando…
    </div>
  )
  if (error) return (
    <div className="p-6 bg-brand/10 border border-brand/20 rounded-2xl text-brand">
      Error: {error}
    </div>
  )

  const { totalEgresos, totalIngresos, balanceNeto, stockDisponible, costoPromedio, faltanVender } = metrics
  const esGanancia = balanceNeto >= 0

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div>
        <h1 className="font-bebas text-5xl tracking-widest text-white">Dashboard</h1>
        <p className="text-dark-text text-sm mt-1">Drop 1 · Your Rules</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Inversión total"
          value={formatARS(totalEgresos)}
          Icon={TrendingDown}
          color="text-brand"
        />
        <MetricCard
          label="Ingresos ventas"
          value={formatARS(totalIngresos)}
          Icon={TrendingUp}
          color="text-green-400"
        />
        <MetricCard
          label="Balance neto"
          value={formatARS(Math.abs(balanceNeto))}
          sub={esGanancia ? 'Ganancia' : 'Pérdida acumulada'}
          Icon={DollarSign}
          color={esGanancia ? 'text-green-400' : 'text-brand'}
        />
        <MetricCard
          label="Stock remeras"
          value={`${stockDisponible} uds`}
          Icon={Package}
          color="text-white"
        />
        <MetricCard
          label="Costo promedio/remera"
          value={formatARS(costoPromedio)}
          Icon={BarChart2}
          color="text-amber-400"
        />
        <MetricCard
          label="Break-even"
          value={`${faltanVender} remeras`}
          sub="Para recuperar la inversión"
          Icon={Target}
          color="text-purple-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por categoría */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h2 className="font-bebas text-xl tracking-widest text-white mb-6">
            Gastos por categoría
          </h2>
          {gastosData.length === 0 ? (
            <p className="text-dark-text text-sm">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gastosData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 12, fontFamily: 'Barlow' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
                  {gastosData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Balance acumulado */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h2 className="font-bebas text-xl tracking-widest text-white mb-6">
            Balance acumulado
          </h2>
          {balanceData.length === 0 ? (
            <p className="text-dark-text text-sm">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={balanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 10, fontFamily: 'Barlow' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#e63946"
                  strokeWidth={2}
                  dot={{ fill: '#e63946', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Últimas transacciones */}
      <div className="bg-dark-card border border-dark-border rounded-2xl">
        <div className="px-6 py-4 border-b border-dark-border">
          <h2 className="font-bebas text-xl tracking-widest text-white">Últimas transacciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                {['Fecha', 'Concepto', 'Categoría', 'Tipo', 'Monto'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-dark-text text-xs font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ultimas.map((t, i) => (
                <tr
                  key={t.id}
                  className={`border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors ${
                    i === ultimas.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="px-6 py-3 text-dark-text whitespace-nowrap">{formatDate(t.fecha)}</td>
                  <td className="px-6 py-3 text-white max-w-[200px] truncate">{t.concepto}</td>
                  <td className="px-6 py-3"><CategoriaBadge categoria={t.categoria} /></td>
                  <td className="px-6 py-3"><TipoBadge tipo={t.tipo} /></td>
                  <td className={`px-6 py-3 font-semibold whitespace-nowrap ${t.tipo === 'ingreso' ? 'text-green-400' : 'text-brand'}`}>
                    {t.tipo === 'egreso' ? '−' : '+'}{formatARS(t.monto)}
                  </td>
                </tr>
              ))}
              {ultimas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-dark-text">
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
