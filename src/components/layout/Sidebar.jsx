import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Package, Calculator, Settings, Menu, X, LogOut, ExternalLink } from 'lucide-react'
import { useState } from 'react'

const LINKS = [
  { to: '/',              label: 'Dashboard',     Icon: LayoutDashboard },
  { to: '/transacciones', label: 'Transacciones', Icon: ArrowLeftRight  },
  { to: '/inventario',    label: 'Inventario',    Icon: Package         },
  { to: '/simulador',     label: 'Simulador',     Icon: Calculator      },
  { to: '/config',        label: 'Configuración', Icon: Settings        },
]

// TODO: replace with your real landing URL
const LANDING_URL = 'https://levelstudios.site'

export default function Sidebar({ onLogout }) {
  const [open, setOpen] = useState(false)

  const navContent = (
    <>
      {/* Logo */}
      <div className="py-6 border-b border-white/5 flex flex-col items-center justify-center gap-2 w-full">
        <img src="/logorojosf.png" alt="LEVEL" className="w-44 object-contain" />
        <p className="text-dark-text text-[9px] tracking-[0.5em] uppercase text-center">Finanzas</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-150 ${
                isActive
                  ? 'bg-brand/10 text-brand border border-brand/25 shadow-[0_0_14px_rgba(230,57,70,0.1)]'
                  : 'text-dark-text hover:text-white hover:bg-dark-surface border border-transparent'
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        <a
          href={LANDING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium
            text-white border border-brand/40 hover:bg-brand hover:border-brand
            transition-all duration-200 tracking-wide"
        >
          <ExternalLink size={15} className="shrink-0" />
          <span>Volver a la Web</span>
        </a>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium
            text-dark-text hover:text-white hover:bg-dark-surface border border-transparent
            transition-all duration-150 tracking-wide"
        >
          <LogOut size={15} />
          <span>Cerrar sesión</span>
        </button>
        <p className="text-dark-muted text-[10px] px-3.5 tracking-[0.25em] uppercase pt-1">
          Your Rules · Drop 1
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 glass-sidebar border-r border-white/5 min-h-screen sticky top-0 h-screen">
        {navContent}
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-center px-4 py-2 glass-sidebar border-b border-white/5 relative">
        <img src="/logorojosf.png" alt="LEVEL" className="h-9 w-auto object-contain" />
        <button
          onClick={() => setOpen(v => !v)}
          className="absolute right-4 p-2 text-dark-text hover:text-white transition-colors"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-10 flex flex-col w-64 glass-sidebar border-r border-white/5 h-full animate-in">
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}
