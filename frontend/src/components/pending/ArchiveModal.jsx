import { useState } from 'react'
import { X, Archive } from 'lucide-react'

function ArchiveModal({ isOpen, onClose, onConfirm, documentTitle = '' }) {
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await onConfirm(comment.trim() || null)
      setComment('')
    } finally {
      setBusy(false)
    }
  }

  const handleClose = () => {
    setComment('')
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
              Finalizar proceso
            </p>
            <h2 className='mt-0.5 text-base font-bold text-[var(--color-text)]'>
              Archivar documento
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
          <div className='rounded-lg border border-amber-200 bg-amber-50 px-4 py-3'>
            <p className='text-sm text-amber-800'>
              Esto cerrará definitivamente el proceso de{' '}
              <span className='font-semibold'>"{documentTitle}"</span>. El documento quedará
              archivado y saldrá de la bandeja de pendientes.
            </p>
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm font-medium' htmlFor='archive-comment'>
              Comentario de cierre (opcional)
            </label>
            <textarea
              id='archive-comment'
              className='min-h-24 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] resize-none'
              placeholder='Ej: Aprobado y conforme. Proceso finalizado.'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
              disabled={busy}
            >
              <Archive size={14} />
              {busy ? 'Archivando...' : 'Finalizar y archivar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ArchiveModal
