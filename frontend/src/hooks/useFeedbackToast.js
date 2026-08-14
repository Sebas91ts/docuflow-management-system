import { useCallback, useEffect, useRef, useState } from 'react'

export function useFeedbackToast(autoHideMs = 4000) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const clearToast = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    setToast(null)
  }, [])

  const showToast = useCallback(
    (type, message) => {
      if (!message) {
        return
      }

      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }

      setToast({ type, message })

      timerRef.current = window.setTimeout(() => {
        setToast(null)
        timerRef.current = null
      }, autoHideMs)
    },
    [autoHideMs],
  )

  const showSuccess = useCallback((message) => showToast('success', message), [showToast])
  const showError = useCallback((message) => showToast('error', message), [showToast])

  useEffect(() => clearToast, [clearToast])

  return {
    toast,
    showSuccess,
    showError,
    clearToast,
  }
}
