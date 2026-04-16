// Formato argentino: $ 103.733 (punto miles, coma decimal)
export const formatARS = (amount, decimals = 0) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat('es-AR').format(num ?? 0)
}

// "2025-10-01" → "01/10/2025"
export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

// Hoy como "yyyy-mm-dd"
export const today = () => new Date().toISOString().split('T')[0]

export const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

// ─── Constantes de categorías ───────────────────────────────────────────────

export const CATEGORIAS = [
  'inversion_producto',
  'inversion_packaging',
  'inversion_marketing',
  'venta',
  'regalo',
  'gasto_operativo',
]

export const CATEGORIA_LABELS = {
  inversion_producto:  'Inversión Producto',
  inversion_packaging: 'Inversión Packaging',
  inversion_marketing: 'Inversión Marketing',
  venta:               'Venta',
  regalo:              'Regalo',
  gasto_operativo:     'Gasto Operativo',
}

export const CATEGORIA_COLORS = {
  inversion_producto:  '#e63946',
  inversion_packaging: '#f4a261',
  inversion_marketing: '#2a9d8f',
  venta:               '#22c55e',
  regalo:              '#8b5cf6',
  gasto_operativo:     '#64748b',
}

export const TIPO_LABELS = {
  ingreso: 'Ingreso',
  egreso:  'Egreso',
}

export const MONEDAS = ['ARS', 'USD']

export const METODOS_PAGO = [
  'transferencia',
  'efectivo',
  'tarjeta',
  'crypto',
  'otro',
]
