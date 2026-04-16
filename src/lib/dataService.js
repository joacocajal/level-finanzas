import { supabase, isSupabaseConfigured } from './supabase'
import { generateId, today } from './utils'

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_TRANSACCIONES = [
  { id: 'tx1', fecha: '2025-10-01', concepto: 'Compra remeras base negras',   categoria: 'inversion_producto',  subcategoria: 'remeras_base', tipo: 'egreso', monto: 75866,  moneda: 'ARS', metodo_pago: 'transferencia', cantidad_unidades: 8,   notas: '8 remeras over negras',             created_at: new Date().toISOString() },
  { id: 'tx2', fecha: '2025-12-11', concepto: 'Compra tarjetas LEVEL',        categoria: 'inversion_packaging', subcategoria: 'tarjetas',     tipo: 'egreso', monto: 9800,   moneda: 'ARS', metodo_pago: 'transferencia', cantidad_unidades: 20,  notas: '20 tarjetas LEVEL',                 created_at: new Date().toISOString() },
  { id: 'tx3', fecha: '2025-12-12', concepto: 'Compra stickers',              categoria: 'inversion_packaging', subcategoria: 'stickers',     tipo: 'egreso', monto: 25590,  moneda: 'ARS', metodo_pago: 'transferencia', cantidad_unidades: 100, notas: '50 S.N y 50 S.B',                   created_at: new Date().toISOString() },
  { id: 'tx4', fecha: '2026-01-06', concepto: 'Compra remeras base blancas',  categoria: 'inversion_producto',  subcategoria: 'remeras_base', tipo: 'egreso', monto: 72505,  moneda: 'ARS', metodo_pago: 'transferencia', cantidad_unidades: 8,   notas: '8 remeras over blancas',            created_at: new Date().toISOString() },
  { id: 'tx5', fecha: '2026-01-08', concepto: 'Compra bolsas con diseño',     categoria: 'inversion_packaging', subcategoria: 'bolsas',       tipo: 'egreso', monto: 103733, moneda: 'ARS', metodo_pago: 'transferencia', cantidad_unidades: 200, notas: '200 bolsas negras con diseño',       created_at: new Date().toISOString() },
  { id: 'tx6', fecha: '2026-01-13', concepto: 'Serigrafía 5 remeras negras',  categoria: 'inversion_producto',  subcategoria: 'serigrafia',   tipo: 'egreso', monto: 31875,  moneda: 'ARS', metodo_pago: 'transferencia', cantidad_unidades: 5,   notas: 'Estampa 5 remeras negras',          created_at: new Date().toISOString() },
  { id: 'tx7', fecha: '2026-01-14', concepto: 'Serigrafía 3 remeras + relieve', categoria: 'inversion_producto', subcategoria: 'serigrafia', tipo: 'egreso', monto: 33125,  moneda: 'ARS', metodo_pago: 'transferencia', cantidad_unidades: 3,   notas: 'Estampa 3 remeras + relieve en las 8', created_at: new Date().toISOString() },
  { id: 'tx8', fecha: '2026-04-14', concepto: 'Serigrafía 8 remeras blancas', categoria: 'inversion_producto',  subcategoria: 'serigrafia',   tipo: 'egreso', monto: 98220,  moneda: 'ARS', metodo_pago: 'transferencia', cantidad_unidades: 8,   notas: 'Estampa 8 remeras blancas',         created_at: new Date().toISOString() },
  { id: 'tx9', fecha: '2026-04-16', concepto: 'Venta remera negra',            categoria: 'venta',               subcategoria: null,           tipo: 'ingreso', monto: 25000, moneda: 'ARS', metodo_pago: 'efectivo',      cantidad_unidades: 1,   notas: '1 negra con bolsa y 2 stickers',    created_at: new Date().toISOString() },
]

const SEED_INVENTARIO = [
  { id: 'inv1', producto: 'Remera negra estampada', cantidad_total: 8,   cantidad_disponible: 5,   cantidad_vendida: 1, cantidad_regalada: 2, costo_unitario: 17608, updated_at: new Date().toISOString() },
  { id: 'inv2', producto: 'Remera blanca estampada', cantidad_total: 8,  cantidad_disponible: 8,   cantidad_vendida: 0, cantidad_regalada: 0, costo_unitario: 21341, updated_at: new Date().toISOString() },
  { id: 'inv3', producto: 'Bolsa con diseño',         cantidad_total: 200, cantidad_disponible: 199, cantidad_vendida: 0, cantidad_regalada: 1, costo_unitario: 519,   updated_at: new Date().toISOString() },
  { id: 'inv4', producto: 'Tarjeta LEVEL',            cantidad_total: 20,  cantidad_disponible: 20,  cantidad_vendida: 0, cantidad_regalada: 0, costo_unitario: 490,   updated_at: new Date().toISOString() },
  { id: 'inv5', producto: 'Sticker',                  cantidad_total: 100, cantidad_disponible: 98,  cantidad_vendida: 0, cantidad_regalada: 2, costo_unitario: 256,   updated_at: new Date().toISOString() },
]

const SEED_CONFIG = [
  { id: 'cfg1', clave: 'tipo_cambio_usd',      valor: 1400,  updated_at: new Date().toISOString() },
  { id: 'cfg2', clave: 'precio_venta_negra',   valor: 40000, updated_at: new Date().toISOString() },
  { id: 'cfg3', clave: 'precio_venta_blanca',  valor: 40000, updated_at: new Date().toISOString() },
  { id: 'cfg4', clave: 'costo_runway_mensual', valor: 0,     updated_at: new Date().toISOString() },
  { id: 'cfg5', clave: 'costo_flux_api',       valor: 0,     updated_at: new Date().toISOString() },
  { id: 'cfg6', clave: 'costo_gemini_api',     valor: 0,     updated_at: new Date().toISOString() },
]

// ─── localStorage helpers (SOLO para modo sin Supabase) ─────────────────────

const LS = {
  TX:   'level_transacciones',
  INV:  'level_inventario',
  CFG:  'level_config',
  INIT: 'level_initialized',
}

function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}

function lsSet(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function ensureInit() {
  if (lsGet(LS.INIT)) return
  lsSet(LS.TX,   SEED_TRANSACCIONES)
  lsSet(LS.INV,  SEED_INVENTARIO)
  lsSet(LS.CFG,  SEED_CONFIG)
  lsSet(LS.INIT, true)
}

// ─── Inicialización: limpiar LocalStorage si Supabase está configurado ─────────

if (isSupabaseConfigured) {
  console.log('🧹 Supabase configurado - limpiando LocalStorage para evitar conflicto de datos')
  clearLocalStorage()
}

// ─── TRANSACCIONES ───────────────────────────────────────────────────────────

export async function getTransacciones() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
      .order('fecha', { ascending: false })
    if (error) {
      console.error('❌ Error al obtener transacciones de Supabase:', error)
      throw new Error(`Error de conexión a Supabase: ${error.message}`)
    }
    return data
  }
  ensureInit()
  const txs = lsGet(LS.TX) ?? []
  return [...txs].sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export async function addTransaccion(payload) {
  const record = {
    ...payload,
    id: generateId(),
    created_at: new Date().toISOString(),
  }
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('transacciones')
      .insert([record])
      .select()
      .single()
    if (error) {
      console.error('❌ Error al agregar transacción en Supabase:', error)
      throw new Error(`Error de conexión a Supabase: ${error.message}`)
    }
    console.log('✅ Transacción agregada a Supabase:', record.concepto)
    return data
  }
  ensureInit()
  const txs = lsGet(LS.TX) ?? []
  lsSet(LS.TX, [record, ...txs])
  return record
}

export async function updateTransaccion(id, payload) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('transacciones')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('❌ Error al actualizar transacción en Supabase:', error)
      throw new Error(`Error de conexión a Supabase: ${error.message}`)
    }
    return data
  }
  ensureInit()
  const txs = lsGet(LS.TX) ?? []
  const updated = txs.map(t => t.id === id ? { ...t, ...payload } : t)
  lsSet(LS.TX, updated)
  return updated.find(t => t.id === id)
}

export async function deleteTransaccion(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('transacciones').delete().eq('id', id)
    if (error) {
      console.error('❌ Error al eliminar transacción de Supabase:', error)
      throw new Error(`Error de conexión a Supabase: ${error.message}`)
    }
    console.log('✅ Transacción eliminada de Supabase')
    return
  }
  ensureInit()
  const txs = lsGet(LS.TX) ?? []
  lsSet(LS.TX, txs.filter(t => t.id !== id))
}

// ─── INVENTARIO ──────────────────────────────────────────────────────────────

export async function getInventario() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('inventario').select('*')
    if (error) {
      console.error('❌ Error al obtener inventario de Supabase:', error)
      throw new Error(`Error de conexión a Supabase: ${error.message}`)
    }
    return data
  }
  ensureInit()
  return lsGet(LS.INV) ?? []
}

export async function updateInventario(id, payload) {
  const ts = { ...payload, updated_at: new Date().toISOString() }
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('inventario')
      .update(ts)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('❌ Error al actualizar inventario en Supabase:', error)
      throw new Error(`Error de conexión a Supabase: ${error.message}`)
    }
    return data
  }
  ensureInit()
  const items = lsGet(LS.INV) ?? []
  const updated = items.map(i => i.id === id ? { ...i, ...ts } : i)
  lsSet(LS.INV, updated)
  return updated.find(i => i.id === id)
}

// ─── CONFIG ──────────────────────────────────────────────────────────────────

export async function getConfig() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('config').select('*')
    if (error) {
      console.error('❌ Error al obtener config de Supabase:', error)
      throw new Error(`Error de conexión a Supabase: ${error.message}`)
    }
    return Object.fromEntries(data.map(r => [r.clave, r.valor]))
  }
  ensureInit()
  const rows = lsGet(LS.CFG) ?? []
  return Object.fromEntries(rows.map(r => [r.clave, r.valor]))
}

export async function updateConfig(clave, valor) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('config')
      .update({ valor, updated_at: new Date().toISOString() })
      .eq('clave', clave)
    if (error) {
      console.error('❌ Error al actualizar config en Supabase:', error)
      throw new Error(`Error de conexión a Supabase: ${error.message}`)
    }
    return
  }
  ensureInit()
  const rows = lsGet(LS.CFG) ?? []
  lsSet(LS.CFG, rows.map(r => r.clave === clave ? { ...r, valor, updated_at: new Date().toISOString() } : r))
}

// ─── OPERACIONES ATÓMICAS ────────────────────────────────────────────────────

// Registrar venta: descuenta inventario + crea transacción de ingreso
export async function registrarVenta({ productoId, producto, cantidad, monto, metodo_pago, notas, fecha }) {
  const inv = await getInventario()
  const item = inv.find(i => i.id === productoId)
  if (!item) throw new Error('Producto no encontrado')
  if (item.cantidad_disponible < cantidad) throw new Error('Stock insuficiente')

  await updateInventario(productoId, {
    cantidad_disponible: item.cantidad_disponible - cantidad,
    cantidad_vendida:    item.cantidad_vendida + cantidad,
  })

  await addTransaccion({
    fecha:            fecha || today(),
    concepto:         `Venta ${producto}`,
    categoria:        'venta',
    subcategoria:     null,
    tipo:             'ingreso',
    monto:            monto * cantidad,
    moneda:           'ARS',
    metodo_pago:      metodo_pago || 'efectivo',
    cantidad_unidades: cantidad,
    notas:            notas || '',
  })
}

// Registrar regalo: solo descuenta inventario, sin transacción de ingreso
export async function registrarRegalo({ productoId, cantidad, notas }) {
  const inv = await getInventario()
  const item = inv.find(i => i.id === productoId)
  if (!item) throw new Error('Producto no encontrado')
  if (item.cantidad_disponible < cantidad) throw new Error('Stock insuficiente')

  await updateInventario(productoId, {
    cantidad_disponible: item.cantidad_disponible - cantidad,
    cantidad_regalada:   item.cantidad_regalada + cantidad,
  })
}

// ─── LIMPIEZA DE LOCALSTORAGE ─────────────────────────────────────────────────────

export function clearLocalStorage() {
  localStorage.removeItem(LS.TX)
  localStorage.removeItem(LS.INV)
  localStorage.removeItem(LS.CFG)
  localStorage.removeItem(LS.INIT)
  console.log('LocalStorage limpiado completamente')
}
