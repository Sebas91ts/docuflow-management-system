function LoadingSpinner({ size = 24, className = '', label = 'Cargando' }) {
  const spinnerSize = `${size}px`

  return (
    <div className={`inline-flex items-center justify-center ${className}`} aria-live="polite" aria-label={label}>
      <svg
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        role="img"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-[var(--color-border)]"
          opacity="0.35"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-[var(--color-primary)]"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default LoadingSpinner
