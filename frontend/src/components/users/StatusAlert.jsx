function StatusAlert({ type, message }) {
  if (!message) {
    return null
  }

  const styles = type === 'error'
    ? 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
    : 'border-green-200 bg-green-50 text-green-700'

  return (
    <p className={`rounded-md border px-3 py-2 text-sm ${styles}`}>
      {message}
    </p>
  )
}

export default StatusAlert
