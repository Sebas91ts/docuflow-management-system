import { AlertTriangle, CheckCircle2, X } from 'lucide-react'

const toneStyles = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
}

const toneIcons = {
  success: CheckCircle2,
  error: AlertTriangle,
}

function FeedbackToast({ toast, onClose }) {
  if (!toast?.message) {
    return null
  }

  const Icon = toneIcons[toast.type] ?? CheckCircle2

  return (
    <div
      className={[
        'pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border px-4 py-3 shadow-[var(--shadow-app)]',
        toneStyles[toast.type] ?? toneStyles.success,
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <Icon className="mt-0.5 shrink-0" size={18} />
      <p className="min-w-0 flex-1 text-sm font-medium">{toast.message}</p>
      <button
        className="ml-1 rounded-md p-1 transition hover:bg-black/5"
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
