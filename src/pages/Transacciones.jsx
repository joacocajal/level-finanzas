import { useEffect, useState, useMemo, useCallback } from 'react'
import { Plus, Search, Download, Pencil, Trash2, X } from 'lucide-react'
import {
  getTransacciones, addTransaccion, updateTransaccion, deleteTransaccion, getConfig,
} from '../lib/dataService'
import {
  formatARS, formatDate, today,
  CATEGORIAS, CATEGORIA_LABELS, TIPO_LABELS, MONEDAS, METODOS_PAGO,
} from '../lib/utils'
import { CategoriaBadge, TipoBadge } from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

// ─── Formulario de transacción ────────────────────────────────────────────────
const EMPTY_FORM = {
  fecha: today(), concepto: '', categoria: 'inversion_producto',
  subcategoria: '', tipo: 'egreso', monto: '', moneda: 'ARS',
  metodo_pago: 'transferencia', cantidad_unidades: '', notas: '',
}

function FormTransaccion({ inicial, onSave, onCancel, tipoCambio }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...inicial })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.concepto.trim()) return setErr('El concepto es obligatorio')
    if (!form.monto || Number(form.monto) <= 0) return setErr('El monto debe ser mayor a 0')
    setSaving(true)
    try {
      await onSave({
        ...form,
        monto: Number(form.monto),
        cantidad_unidades: form.cantidad_unidades ? Number(form.cantidad_unidades) : null,
        subcategoria: form.subcategoria || null,
        notas: form.notas || null,
      })
    } catch (e) {
      setErr(e.message)
      setSaving(false)
    }
  }

  const montoARS = form.moneda === 'USD' && form.monto
    ? Number(form.monto) * tipoCambio
    : null

  const inputCls = 'w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors placeholder:text-dark-muted'
  const labelCls = 'block text-dark-text text-xs font-semibold uppercase tracking-wider mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {err && (
        <div className="bg-brand/10 border border-brand/20 rounded-xl px-4 py-2 text-brand text-sm flex items-center justify-between">
          {err}
          <button type="button" onClick={() => setErr('')}><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Fecha</label>
          <input type="date" className={inputCls} value={form.fecha} onChange={e => set('fecha', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Tipo</label>
          <select className={inputCls} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            <option value="egreso">Egreso</option>
            <option value="ingreso">Ingreso</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Concepto</label>
        <input className={inputCls} placeholder="Ej: Compra remeras base" value={form.concepto} onChange={e => set('concepto', e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Categoría</label>
          <select className={inputCls} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
            {CATEGORIAS.map(c => (
              <option key={c} value={c}>{CATEGORIA_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Subcategoría</label>
          <input className={inputCls} placeholder="Ej: remeras_base" value={form.subcategoria} onChange={e => set('subcategoria', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Monto</label>
          <input type="number" className={inputCls} placeholder="0" min="0" step="0.01" value={form.monto} onChange={e => set('monto', e.target.value)} required />
          {montoARS && (
            <p className="text-dark-text text-xs mt-1">
              ≈ {formatARS(montoARS)} ARS
            </p>
          )}
        </div>
        <div>
          <label className={labelCls}>Moneda</label>
          <select className={inputCls} value={form.moneda} onChange={e => set('moneda', e.target.value)}>
            {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Método de pago</label>
          <select className={inputCls} value={form.metodo_pago} onChange={e => set('metodo_pago', e.target.value)}>
            {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Cantidad (unidades)</label>
          <input type="number" className={inputCls} placeholder="Opcional" min="0" value={form.cantidad_unidades} onChange={e => set('cantidad_unidades', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Notas</label>
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Notas adicionales…" value={form.notas} onChange={e => set('notas', e.target.value)} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-dark-border text-dark-text text-sm hover:text-white hover:border-dark-muted transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50">
          {saving ? 'Guardando…' : inicial?.id ? 'Guardar cambios' : 'Agregar'}
        </button>
      </div>
    </form>
  )
}

// ─── Página ────────────────────────────────────────────────────────────────────
export default function Transacciones() {
  const [transacciones, setTransacciones] = useState([])
  const [config, setConfig]               = useState({})
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false)
  const [editando, setEditando]     = useState(null)
  const [confirmar, setConfirmar]   = useState(null) // id a eliminar

  // Filtros
  const [busqueda,  setBusqueda]    = useState('')
  const [filtCat,   setFiltCat]     = useState('')
  const [filtTipo,  setFiltTipo]    = useState('')
  const [filtMoneda, setFiltMoneda] = useState('')
  const [filtDesde, setFiltDesde]   = useState('')
  const [filtHasta, setFiltHasta]   = useState('')

  const tipoCambio = config.tipo_cambio_usd ?? 1400

  const cargar = useCallback(async () => {
    try {
      const [txs, cfg] = await Promise.all([getTransacciones(), getConfig()])
      setTransacciones(txs)
      setConfig(cfg)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // ─── Filtros ───────────────────────────────────────────────────────────────
  const filtradas = useMemo(() => {
    return transacciones.filter(t => {
      if (busqueda  && !t.concepto.toLowerCase().includes(busqueda.toLowerCase())) return false
      if (filtCat   && t.categoria !== filtCat)   return false
      if (filtTipo  && t.tipo      !== filtTipo)   return false
      if (filtMoneda && t.moneda   !== filtMoneda) return false
      if (filtDesde && t.fecha < filtDesde)        return false
      if (filtHasta && t.fecha > filtHasta)        return false
      return true
    })
  }, [transacciones, busqueda, filtCat, filtTipo, filtMoneda, filtDesde, filtHasta])

  const totales = useMemo(() => {
    const egresos  = filtradas.filter(t => t.tipo === 'egreso') .reduce((s, t) => s + t.monto, 0)
    const ingresos = filtradas.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
    return { egresos, ingresos, balance: ingresos - egresos }
  }, [filtradas])

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const abrirNueva = () => { setEditando(null); setModalOpen(true) }
  const abrirEditar = (t) => { setEditando(t); setModalOpen(true) }
  const cerrarModal = () => { setModalOpen(false); setEditando(null) }

  const handleSave = async (data) => {
    if (editando?.id) {
      await updateTransaccion(editando.id, data)
    } else {
      await addTransaccion(data)
    }
    cerrarModal()
    cargar()
  }

  const handleEliminar = async (id) => {
    await deleteTransaccion(id)
    setConfirmar(null)
    cargar()
  }

  // ─── Exportar CSV ──────────────────────────────────────────────────────────
  const exportCSV = () => {
    const cols = ['Fecha','Concepto','Categoría','Tipo','Monto','Moneda','Método','Unidades','Notas']
    const rows = filtradas.map(t => [
      formatDate(t.fecha),
      t.concepto,
      CATEGORIA_LABELS[t.categoria] ?? t.categoria,
      TIPO_LABELS[t.tipo] ?? t.tipo,
      t.monto,
      t.moneda,
      t.metodo_pago ?? '',
      t.cantidad_unidades ?? '',
      t.notas ?? '',
    ])
    const csv = [cols, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `level-transacciones-${today()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const resetFiltros = () => {
    setBusqueda(''); setFiltCat(''); setFiltTipo(''); setFiltMoneda(''); setFiltDesde(''); setFiltHasta('')
  }

  const hayFiltros = busqueda || filtCat || filtTipo || filtMoneda || filtDesde || filtHasta

  const inputCls   = 'bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors placeholder:text-dark-muted'
  const selectCls  = `${inputCls} cursor-pointer`

  if (loading) return <div className="flex items-center justify-center h-64 text-dark-text">Cargando…</div>
  if (error)   return <div className="p-6 bg-brand/10 border border-brand/20 rounded-2xl text-brand">Error: {error}</div>

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-bebas text-5xl tracking-widest text-white">Transacciones</h1>
          <p className="text-dark-text text-sm">{filtradas.length} registros</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dark-border text-dark-text text-sm hover:text-white hover:border-dark-muted transition-colors">
            <Download size={15} /> CSV
          </button>
          <button onClick={abrirNueva} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-colors">
            <Plus size={15} /> Nueva transacción
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
            <input className={`${inputCls} w-full pl-8`} placeholder="Buscar concepto…" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <select className={selectCls} value={filtCat} onChange={e => setFiltCat(e.target.value)}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{CATEGORIA_LABELS[c]}</option>)}
          </select>
          <select className={selectCls} value={filtTipo} onChange={e => setFiltTipo(e.target.value)}>
            <option value="">Ingreso + Egreso</option>
            <option value="ingreso">Solo ingresos</option>
            <option value="egreso">Solo egresos</option>
          </select>
          <select className={selectCls} value={filtMoneda} onChange={e => setFiltMoneda(e.target.value)}>
            <option value="">ARS + USD</option>
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-dark-text text-sm">
            <span>Desde</span>
            <input type="date" className={inputCls} value={filtDesde} onChange={e => setFiltDesde(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 text-dark-text text-sm">
            <span>Hasta</span>
            <input type="date" className={inputCls} value={filtHasta} onChange={e => setFiltHasta(e.target.value)} />
          </div>
          {hayFiltros && (
            <button onClick={resetFiltros} className="flex items-center gap-1 text-dark-text text-sm hover:text-brand transition-colors">
              <X size={13} /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                {['Fecha','Concepto','Categoría','Tipo','Monto','Moneda','Método','Uds.',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-dark-text text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((t, i) => (
                <tr key={t.id} className={`border-b border-dark-border/40 hover:bg-dark-surface/40 transition-colors ${i === filtradas.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 text-dark-text whitespace-nowrap">{formatDate(t.fecha)}</td>
                  <td className="px-4 py-3 text-white max-w-[180px]">
                    <span className="truncate block">{t.concepto}</span>
                    {t.notas && <span className="text-dark-text text-xs truncate block">{t.notas}</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap"><CategoriaBadge categoria={t.categoria} /></td>
                  <td className="px-4 py-3 whitespace-nowrap"><TipoBadge tipo={t.tipo} /></td>
                  <td className={`px-4 py-3 font-semibold whitespace-nowrap ${t.tipo === 'ingreso' ? 'text-green-400' : 'text-brand'}`}>
                    {t.tipo === 'egreso' ? '−' : '+'}{formatARS(t.monto)}
                    {t.moneda === 'USD' && (
                      <span className="block text-dark-text text-xs font-normal">
                        ≈ {formatARS(t.monto * tipoCambio)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-dark-text">{t.moneda}</td>
                  <td className="px-4 py-3 text-dark-text capitalize">{t.metodo_pago}</td>
                  <td className="px-4 py-3 text-dark-text text-center">{t.cantidad_unidades ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => abrirEditar(t)} className="p-1.5 text-dark-text hover:text-white rounded-lg hover:bg-dark-surface transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setConfirmar(t.id)} className="p-1.5 text-dark-text hover:text-brand rounded-lg hover:bg-brand/10 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-dark-text">
                    {hayFiltros ? 'Sin resultados para los filtros aplicados' : 'Sin transacciones'}
                  </td>
                </tr>
              )}
            </tbody>
            {/* Totales */}
            {filtradas.length > 0 && (
              <tfoot>
                <tr className="border-t border-dark-border bg-dark-surface/30">
                  <td colSpan={4} className="px-4 py-3 text-dark-text text-xs font-semibold uppercase tracking-wider">
                    Totales ({filtradas.length})
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-brand font-semibold block text-sm">−{formatARS(totales.egresos)}</span>
                    <span className="text-green-400 font-semibold block text-sm">+{formatARS(totales.ingresos)}</span>
                    <span className={`font-bold text-sm ${totales.balance >= 0 ? 'text-green-400' : 'text-brand'}`}>
                      = {formatARS(Math.abs(totales.balance))} {totales.balance >= 0 ? '↑' : '↓'}
                    </span>
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal nueva/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={editando ? 'Editar transacción' : 'Nueva transacción'}
        width="max-w-xl"
      >
        <FormTransaccion
          inicial={editando}
          onSave={handleSave}
          onCancel={cerrarModal}
          tipoCambio={tipoCambio}
        />
      </Modal>

      {/* Modal confirmar eliminación */}
      <Modal isOpen={!!confirmar} onClose={() => setConfirmar(null)} title="Eliminar transacción">
        <p className="text-dark-text text-sm mb-6">
          ¿Confirmás que querés eliminar esta transacción? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmar(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-dark-border text-dark-text text-sm hover:text-white transition-colors">
            Cancelar
          </button>
          <button onClick={() => handleEliminar(confirmar)} className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-colors">
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  )
}
