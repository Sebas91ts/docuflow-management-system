import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getCookie } from '../utils/cookies'
import { playNotificationSound } from '../utils/sound'

const ACCESS_TOKEN_COOKIE = 'docuflow_access_token'

export function usePendingNotifications(autoHideMs = 7000) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)
  const socketRef = useRef(null)
  const navigate = useNavigate()

  const clearToast = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setToast(null)
  }, [])

  const handleAction = useCallback(() => {
    clearToast()
    navigate('/dashboard/pending')
  }, [clearToast, navigate])

  useEffect(() => {
    const token = getCookie(ACCESS_TOKEN_COOKIE)
    if (!token) {
      return undefined
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'
    const wsUrl = apiUrl.replace(/^http/, 'ws').replace(/\/api$/, '')
    const socket = new WebSocket(`${wsUrl}/api/document-assignments/ws/pending?token=${encodeURIComponent(token)}`)
    socketRef.current = socket

    socket.onmessage = (event) => {
      let toastMessage = 'Has recibido un nuevo documento en tu bandeja'
      try {
        const payload = JSON.parse(event.data)
        if (payload?.type === 'document_assignment_created') {
          toastMessage = '¡Se te ha asignado un nuevo documento para revisión!'
        }
      } catch {
        // Mensaje por defecto si el payload no es JSON
      }

      playNotificationSound()

      window.dispatchEvent(new CustomEvent('docuflow:pending-updated'))

      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }

      setToast({
        type: 'assignment',
        title: 'Nuevo Pendiente Recibido',
        message: toastMessage,
        actionLabel: 'Ver pendientes',
      })

      timerRef.current = window.setTimeout(() => {
        setToast(null)
        timerRef.current = null
      }, autoHideMs)
    }

    socket.onerror = () => {
      socket.close()
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
      socket.close()
      socketRef.current = null
    }
  }, [autoHideMs])

  return {
    toast,
    clearToast,
    handleAction,
  }
}
