import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`w-full ${sizeClasses[size]} rounded-2xl bg-slate-950 p-6 shadow-2xl border border-slate-800 text-white max-h-[90vh] overflow-y-auto`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg hover:bg-slate-900 p-2 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
