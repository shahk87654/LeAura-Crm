import Modal from './Modal'

interface ConfirmModalProps {
  isOpen: boolean
  title?: string
  message?: string
  onConfirm: () => void
  onClose: () => void
  confirmLabel?: string
}

export function ConfirmModal({ isOpen, title = 'Confirm', message, onConfirm, onClose, confirmLabel = 'Confirm' }: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {message && <p className="text-sm text-slate-300">{message}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200">Cancel</button>
          <button onClick={onConfirm} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal
