import { AlertTriangle, X } from 'lucide-react'

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-app)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-primary)]">{title}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{message}</p>
            </div>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            type="button"
            onClick={onCancel}
            aria-label="Cerrar confirmacion"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            className="h-11 rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
