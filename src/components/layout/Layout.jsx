import Sidebar from './Sidebar'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function Layout({ children, onLogout }) {
  return (
    <div className="flex min-h-screen bg-dark-bg font-barlow">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Logo mobile — centrado arriba del contenido */}
        <div className="lg:hidden flex flex-col items-center pt-12 pb-4">
          <img src="/logorojosf.png" alt="LEVEL" className="h-12 w-auto object-contain" />
          <p className="text-dark-text text-[9px] tracking-[0.5em] uppercase mt-1.5">Finanzas</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-amber-400 text-xs font-medium flex items-center gap-2">
            <span>⚠</span>
            Modo local — los datos se guardan en este navegador. Configurá Supabase en{' '}
            <code className="font-mono bg-amber-500/10 px-1 rounded">.env</code> para persistencia real.
          </div>
        )}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  )
}
