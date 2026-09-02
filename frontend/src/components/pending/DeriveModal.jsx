import { useState } from 'react'
import { X, UserRound, Send } from 'lucide-react'

function DeriveModal({ isOpen, onClose, onConfirm, users = [], loading = false }) {
  const [form, setForm] = useState({ assigned_to_id: '', message: '', due_date: '' })
  const [busy, setBusy] = useState(false)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.assigned_to_id) return
    setBusy(true)
    try {
      await onConfirm({
        assigned_to_id: form.assigned_to_id,
        message: form.message.trim() || null,
        due_date: form.due_date || null,
      })
      setForm({ assigned_to_id: '', message: '', due_date: '' })
    } finally {
      setBusy(false)
    }
  }

  const handleClose = () => {
    setForm({ assigned_to_id: '', message: '', due_date: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={handleClose} />
      <div className='relative w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl'>
        <div className='flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]'>
              Derivar documento
            </p>
            <h2 className='mt-0.5 text-base font-bold text-[var(--color-text)]'>
              Asignar a otro usuario
            </h2>
          </div>
          <button
            className='rounded-md p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-page)] hover:text-[var(--color-text)]'
            type='button'
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        <form className='space-y-4 px-6 py-5' onSubmit={handleSubmit}>
          <div className='space-y-1.5'>
            <label className='flex items-center gap-1.5 text-sm font-medium' htmlFor='derive-user'>
              <UserRound size={14} />
              Responsable <span className='text-[var(--color-danger)]'>*</span>
            </label>
            {loading ? (
              <div className='h-11 w-full animate-pulse rounded-md bg-[var(--color-page)]' />
            ) : (
              <select
                id='derive-user'
                className='h-11 w-full rounded-md border border-[var(--color-border)] px-3 text-sm outline-none transition focus:border-[var(--color-primary)] bg-[var(--color-surface)]'
                value={form.assigned_to_id}
                onChange={(e) => handleChange('assigned_to_id', e.target.value)}
                required
              >
                <option value=''>Selecciona un usuario...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.username})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm font-medium' htmlFor='derive-message'>
              Consigna o instrucción
            </label>
            <textarea
              id='derive-message'
              className='min-h-24 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] resize-none'
              placeholder='Ej: Revisar y aprobar el presupuesto adjunto...'
              value={form.message}
              onChange={(e) => handleChange('message', e.target.value)}
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm font-medium' htmlFor='derive-due-date'>
              Fecha límite (opcional)
            </label>
            <input
              id='derive-due-date'
              className='h-11 w-full rounded-md border border-[var(--color-border)] px-3 text-sm outline-none transition focus:border-[var(--color-primary)]'
              type='date'
              value={form.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
            />
          </div>

          <div className='flex justify-end gap-3 border-t border-[var(--color-border)] pt-4'>
            <button
              className='rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-page)]'
              type='button'
              onClick={handleClose}
              disabled={busy}
            >
              Cancelar
            </button>
            <button
              className='inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed'
              type='submit'
              disabled={busy || !form.assigned_to_id}
            >
              <Send size={14} />
              {busy ? 'Derivando...' : 'Derivar documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeriveModal
