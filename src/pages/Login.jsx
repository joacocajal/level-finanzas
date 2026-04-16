import { useState } from 'react'
import { Lock, ArrowRight } from 'lucide-react'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simular validación (en producción esto debería ir a Supabase Auth)
    if (password === import.meta.env.VITE_APP_PASSWORD || 'Level.8558') {
      setTimeout(() => {
        onLogin()
      }, 500)
    } else {
      setError('Contraseña incorrecta')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="font-bebas text-6xl tracking-widest text-white mb-2">LEVEL</h1>
          <p className="text-dark-text text-sm tracking-wider">FINANZAS</p>
        </div>

        {/* Login Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Lock size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Acceso Restringido</h2>
              <p className="text-dark-text text-xs">Ingresá tu contraseña para continuar</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-brand text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : (
                <>
                  Ingresar
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-dark-text text-xs mt-6">
          Sistema de gestión financiera LEVEL
        </p>
      </div>
    </div>
  )
}
