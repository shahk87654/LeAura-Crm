import { useState } from 'react'
import Modal from './Modal'

interface LostReasonModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason?: string) => void
}

export function LostReasonModal({ isOpen, onClose, onSubmit }: LostReasonModalProps) {
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    onSubmit(reason || undefined)
    setReason('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Lead as Lost" size="md">
      <div className="space-y-4">
        <p className="text-sm text-slate-300">Provide an optional reason for marking this lead as lost.</p>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} className="w-full rounded-md bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200">Cancel</button>
          <button onClick={handleSubmit} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Mark Lost</button>
        </div>
      </div>
    </Modal>
  )
}

export default LostReasonModal
