import { useEffect, useState, useCallback } from 'react'
import { ShoppingBag, Gift, Package, AlertTriangle } from 'lucide-react'
import { getInventario, getConfig, registrarVenta, registrarRegalo } from '../lib/dataService'
import { formatARS, formatNumber, today, METODOS_PAGO } from '../lib/utils'
import Modal from '../components/ui/Modal'

// ─── Barra de stock visual ────────────────────────────────────────────────────
function StockBar({ disponible, vendida, regalada, total }) {
  const pctVendida  = total > 0 ? (vendida  / total) * 100 : 0
  const pctRegalada = total > 0 ? (regalada / total) * 100 : 0
  const pctDisp     = total > 0 ? (disponible / total) * 100 : 0
  return (
    <div className="w-full h-2 rounded-full bg-dark-surface overflow-hidden flex">
      <div className="bg-green-500 h-full transition-all" style={{ width: `${pctVendida}%` }} />
      <div className="bg-purple-500 h-full transition-all" style={{ width: `${pctRegalada}%` }} />
      <div className="bg-dark-muted h-full transition-all" style={{ width: `${pctDisp}%` }} />
    </div>
  )
}

// ─── Card de producto ──────────────────────────────────────────────────────────
function ProductoCard({ item, onVenta, onRegalo }) {
  const esRemera = item.producto.toLowerCase().includes('remera')
  const stockBajo = item.cantidad_disponible <= 2 && item.cantidad_disponible > 0
  const sinStock  = item.cantidad_disponible === 0

  return (
    <div className={`bg-dark-card border rounded-2xl p-5 flex flex-col gap-4 hover:border-dark-muted transition-all ${sinStock ? 'border-dark-border opacity-60' : 'border-dark-border'}`}>
      {/* Thumbnail */}
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center">
          <Package size={20} className="text-dark-muted" />
        </div>
        <div className="flex flex-col items-end gap-1">
          {stockBajo && !sinStock && (
            <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
              <AlertTriangle size={11} /> Stock bajo
            </span>
          )}
          {sinStock && (
            <span className="text-brand text-xs font-semibold">Sin stock</span>
          )}
          <span className="text-dark-text text-xs">
            Costo u.: {formatARS(item.costo_unitario)}
          </span>
        </div>
      </div>

      {/* Nombre + disponible */}
      <div>
        <h3 className="font-semibold text-white text-base leading-tight">{item.producto}</h3>
        <p className="text-brand font-bebas text-3xl tracking-wider mt-1">
          {formatNumber(item.cantidad_disponible)}
          <span className="text-dark-text font-barlow text-sm font-normal tracking-normal ml-1">disponibles</span>
        </p>
      </div>

      {/* Barra */}
      <StockBar
        disponible={item.cantidad_disponible}
        vendida={item.cantidad_vendida}
        regalada={item.cantidad_regalada}
        total={item.cantidad_total}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Total', value: item.cantidad_total, color: 'text-white' },
          { label: 'Vendidas', value: item.cantidad_vendida, color: 'text-green-400' },
          { label: 'Regaladas', value: item.cantidad_regalada, color: 'text-purple-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-dark-surface rounded-xl py-2">
            <p className={`font-semibold text-lg leading-none ${color}`}>{formatNumber(value)}</p>
            <p className="text-dark-text text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Acciones */}
      {!sinStock && (
        <div className="flex gap-2">
          {esRemera && (
            <button
              onClick={() => onVenta(item)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors"
            >
              <ShoppingBag size={14} /> Venta
            </button>
          )}
          <button
            onClick={() => onRegalo(item)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-colors"
          >
            <Gift size={14} /> Regalo
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Modal venta ──────────────────────────────────────────────────────────────
function ModalVenta({ item, config, onConfirm, onClose }) {
  const [cantidad, setCantidad] = useState(1)
  const [precio,   setPrecio]   = useState('')
  const [metodo,   setMetodo]   = useState('efectivo')
  const [notas,    setNotas]    = useState('')
  const [saving,   setSaving]   = useState(false)
  const [err,      setErr]      = useState('')

  // Precio sugerido según tipo de remera
  useEffect(() => {
    if (!item) return
    const esNegra = item.producto.toLowerCase().includes('negra')
    const sugerido = esNegra ? (config.precio_venta_negra ?? 40000) : (config.precio_venta_blanca ?? 40000)
    setPrecio(sugerido)
  }, [item, config])

  const total = (Number(precio) || 0) * (Number(cantidad) || 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!precio || Number(precio) <= 0) return setErr('Ingresá un precio válido')
    if (Number(cantidad) < 1) return setErr('La cantidad debe ser al menos 1')
    if (Number(cantidad) > item.cantidad_disponible) return setErr('No hay stock suficiente')
    setSaving(true)
    try {
      await onConfirm({ cantidad: Number(cantidad), monto: Number(precio), metodo_pago: metodo, notas, fecha: today() })
    } catch (e) {
      setErr(e.message)
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-dark-surface rounded-xl px-4 py-3 text-sm">
        <p className="text-dark-text">Producto</p>
        <p className="text-white font-semibold">{item?.producto}</p>
        <p className="text-dark-text text-xs mt-1">Stock disponible: {item?.cantidad_disponible} ud.</p>
      </div>

      {err && <div className="bg-brand/10 border border-brand/20 rounded-xl px-4 py-2 text-brand text-sm">{err}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-dark-text text-xs font-semibold uppercase tracking-wider mb-1.5">Cantidad</label>
          <input type="number" className={inputCls} min={1} max={item?.cantidad_disponible} value={cantidad} onChange={e => setCantidad(e.target.value)} />
        </div>
        <div>
          <label className="block text-dark-text text-xs font-semibold uppercase tracking-wider mb-1.5">Precio unitario (ARS)</label>
          <input type="number" className={inputCls} min={0} value={precio} onChange={e => setPrecio(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-dark-text text-xs font-semibold uppercase tracking-wider mb-1.5">Método de pago</label>
        <select className={inputCls} value={metodo} onChange={e => setMetodo(e.target.value)}>
          {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-dark-text text-xs font-semibold uppercase tracking-wider mb-1.5">Notas</label>
        <input className={inputCls} placeholder="Ej: con bolsa y stickers" value={notas} onChange={e => setNotas(e.target.value)} />
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex justify-between items-center">
        <span className="text-dark-text text-sm">Total de la venta</span>
        <span className="text-green-400 font-bebas text-2xl tracking-wider">{formatARS(total)}</span>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-dark-border text-dark-text text-sm hover:text-white transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-400 transition-colors disabled:opacity-50">
          {saving ? 'Registrando…' : 'Confirmar venta'}
        </button>
      </div>
    </form>
  )
}

// ─── Modal regalo ─────────────────────────────────────────────────────────────
function ModalRegalo({ item, onConfirm, onClose }) {
  const [cantidad, setCantidad] = useState(1)
  const [notas,    setNotas]    = useState('')
  const [saving,   setSaving]   = useState(false)
  const [err,      setErr]      = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Number(cantidad) > item.cantidad_disponible) return setErr('No hay stock suficiente')
    setSaving(true)
    try {
      await onConfirm({ cantidad: Number(cantidad), notas })
    } catch (e) {
      setErr(e.message)
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-dark-surface rounded-xl px-4 py-3 text-sm">
        <p className="text-dark-text">Producto</p>
        <p className="text-white font-semibold">{item?.producto}</p>
        <p className="text-dark-text text-xs mt-1">Stock disponible: {item?.cantidad_disponible} ud.</p>
      </div>

      {err && <div className="bg-brand/10 border border-brand/20 rounded-xl px-4 py-2 text-brand text-sm">{err}</div>}

      <div>
        <label className="block text-dark-text text-xs font-semibold uppercase tracking-wider mb-1.5">Cantidad</label>
        <input type="number" className={inputCls} min={1} max={item?.cantidad_disponible} value={cantidad} onChange={e => setCantidad(e.target.value)} />
      </div>

      <div>
        <label className="block text-dark-text text-xs font-semibold uppercase tracking-wider mb-1.5">Notas</label>
        <input className={inputCls} placeholder="¿A quién o para qué?" value={notas} onChange={e => setNotas(e.target.value)} />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-dark-border text-dark-text text-sm hover:text-white transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors disabled:opacity-50">
          {saving ? 'Registrando…' : 'Confirmar regalo'}
        </button>
      </div>
    </form>
  )
}

// ─── Página ────────────────────────────────────────────────────────────────────
export default function Inventario() {
  const [inventario, setInventario] = useState([])
  const [config,     setConfig]     = useState({})
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const [ventaItem,  setVentaItem]  = useState(null)
  const [regaloItem, setRegaloItem] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const [inv, cfg] = await Promise.all([getInventario(), getConfig()])
      setInventario(inv)
      setConfig(cfg)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleVenta = async (data) => {
    await registrarVenta({
      productoId: ventaItem.id,
      producto:   ventaItem.producto,
      ...data,
    })
    setVentaItem(null)
    cargar()
  }

  const handleRegalo = async (data) => {
    await registrarRegalo({ productoId: regaloItem.id, ...data })
    setRegaloItem(null)
    cargar()
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-dark-text">Cargando…</div>
  if (error)   return <div className="p-6 bg-brand/10 border border-brand/20 rounded-2xl text-brand">Error: {error}</div>

  const totalDisponible = inventario.reduce((s, i) => s + i.cantidad_disponible, 0)
  const totalVendido    = inventario.reduce((s, i) => s + i.cantidad_vendida,    0)

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-bebas text-5xl tracking-widest text-white">Inventario</h1>
          <p className="text-dark-text text-sm">{inventario.length} productos · {formatNumber(totalDisponible)} unidades disponibles</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-center">
            <p className="text-green-400 font-bebas text-2xl">{formatNumber(totalVendido)}</p>
            <p className="text-dark-text text-xs">Vendidas</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-center">
            <p className="text-white font-bebas text-2xl">{formatNumber(totalDisponible)}</p>
            <p className="text-dark-text text-xs">Disponibles</p>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 text-xs text-dark-text">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Vendidas</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Regaladas</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-dark-muted" /> Disponibles</span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {inventario.map(item => (
          <ProductoCard
            key={item.id}
            item={item}
            onVenta={setVentaItem}
            onRegalo={setRegaloItem}
          />
        ))}
      </div>

      {/* Modal venta */}
      <Modal isOpen={!!ventaItem} onClose={() => setVentaItem(null)} title="Registrar venta">
        {ventaItem && (
          <ModalVenta
            item={ventaItem}
            config={config}
            onConfirm={handleVenta}
            onClose={() => setVentaItem(null)}
          />
        )}
      </Modal>

      {/* Modal regalo */}
      <Modal isOpen={!!regaloItem} onClose={() => setRegaloItem(null)} title="Registrar regalo">
        {regaloItem && (
          <ModalRegalo
            item={regaloItem}
            onConfirm={handleRegalo}
            onClose={() => setRegaloItem(null)}
          />
        )}
      </Modal>
    </div>
  )
}
