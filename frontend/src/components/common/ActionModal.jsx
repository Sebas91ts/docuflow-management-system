import { CheckCircle2, AlertTriangle } from 'lucide-react'

const toneConfig = {
  success: {
    icon: CheckCircle2,
    titleClass: 'text-emerald-700',
    panelClass: 'border-emerald-200 bg-emerald-50',
  },
  error: {
    icon: AlertTriangle,
    titleClass: 'text-rose-700',
    panelClass: 'border-rose-200 bg-rose-50',
  },
}

function ActionModal({ isOpen, type = 'success', title, message, onClose }) {
  if (!isOpen) {
    return null
  }

  const config = toneConfig[type] || toneConfig.success
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white px-6 py-7 text-center shadow-[var(--shadow-app)]">
        <div className="flex justify-center">
          <div className={`flex h-24 w-24 items-center justify-center rounded-full border-8 ${type === 'error' ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}>
            <Icon size={46} strokeWidth={2.4} />
          </div>
        </div>

        <p className={`mt-6 text-lg font-semibold ${config.titleClass}`}>{title}</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{message}</p>

        <div className="mt-7 flex justify-center">
          <button
            className={`inline-flex h-11 min-w-28 items-center justify-center rounded-md px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
              type === 'error'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            type="button"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActionModal
