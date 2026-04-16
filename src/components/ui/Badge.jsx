import { CATEGORIA_COLORS, CATEGORIA_LABELS } from '../../lib/utils'

export function CategoriaBadge({ categoria }) {
  const color = CATEGORIA_COLORS[categoria] ?? '#64748b'
  const label = CATEGORIA_LABELS[categoria] ?? categoria
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{ backgroundColor: color + '22', color, border: `1px solid ${color}44` }}
    >
      {label}
    </span>
  )
}

export function TipoBadge({ tipo }) {
  const isIngreso = tipo === 'ingreso'
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${
        isIngreso
          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
          : 'bg-brand/10 text-brand border border-brand/20'
      }`}
    >
      {isIngreso ? 'Ingreso' : 'Egreso'}
    </span>
  )
}
