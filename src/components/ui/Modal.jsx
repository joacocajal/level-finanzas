import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative z-10 w-full ${width} bg-dark-card border border-dark-border rounded-2xl shadow-2xl animate-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <h2 className="font-bebas text-2xl tracking-widest text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-dark-text hover:text-white transition-colors rounded-lg hover:bg-dark-surface"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
