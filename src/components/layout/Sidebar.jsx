import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Package, Calculator, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'

const LINKS = [
  { to: '/',              label: 'Dashboard',     Icon: LayoutDashboard },
  { to: '/transacciones', label: 'Transacciones', Icon: ArrowLeftRight },
  { to: '/inventario',    label: 'Inventario',    Icon: Package },
  { to: '/simulador',     label: 'Simulador',     Icon: Calculator },
  { to: '/config',        label: 'Configuración', Icon: Settings },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-dark-border">
        <span className="font-bebas text-4xl tracking-[0.2em] text-white">
          LEVEL
        </span>
        <p className="text-dark-text text-xs font-barlow mt-0.5 tracking-widest uppercase">
          Finanzas
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-brand/10 text-brand border border-brand/20'
                  : 'text-dark-text hover:text-white hover:bg-dark-surface'
              }`
            }
          >
            <Icon size={17} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-dark-border">
        <p className="text-dark-muted text-xs">Your Rules — Drop 1</p>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-dark-card border-r border-dark-border min-h-screen sticky top-0 h-screen">
        {navContent}
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-dark-card border-b border-dark-border">
        <span className="font-bebas text-2xl tracking-[0.2em] text-white">LEVEL</span>
        <button
          onClick={() => setOpen(v => !v)}
          className="p-2 text-dark-text hover:text-white transition-colors"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-10 flex flex-col w-64 bg-dark-card border-r border-dark-border h-full animate-in">
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}
