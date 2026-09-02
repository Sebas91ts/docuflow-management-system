import { AlertTriangle, Bell, CheckCircle2, Info, X } from 'lucide-react'

const toneStyles = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  assignment: 'border-[var(--color-primary)]/40 bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-medium shadow-md',
}

const toneIcons = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
  assignment: Bell,
}

function FeedbackToast({ toast, onClose, onAction }) {
  if (!toast?.message) {
    return null
  }

  const Icon = toneIcons[toast.type] ?? CheckCircle2

  return (
    <div
      className={[
        'pointer-events-auto flex w-[min(28rem,calc(100vw-3rem))] items-center gap-3 rounded-lg border px-4 py-3 shadow-[var(--shadow-app)] transition-all',
        toneStyles[toast.type] ?? toneStyles.success,
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <Icon className="shrink-0" size={20} />
      <div className="min-w-0 flex-1">
        {toast.title ? <p className="text-xs font-bold uppercase tracking-wider opacity-80">{toast.title}</p> : null}
        <p className="min-w-0 text-sm font-medium">{toast.message}</p>
      </div>
      {toast.actionLabel && onAction ? (
        <button
          className="ml-2 shrink-0 rounded bg-[var(--color-primary)] px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          type="button"
          onClick={onAction}
        >
          {toast.actionLabel}
        </button>
      ) : null}
      <button
        className="ml-1 rounded-md p-1 transition hover:bg-black/10"
        type="button"
        onClick={onClose}
        aria-label="Cerrar mensaje"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default FeedbackToast

