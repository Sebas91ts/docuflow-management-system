import { useCallback, useEffect, useRef, useState } from 'react'

import { getPendingAssignments } from '../api/documents'
import { getCookie } from '../utils/cookies'
import { getApiErrorMessage } from '../utils/apiError'

const ACCESS_TOKEN_COOKIE = 'docuflow_access_token'

export function usePendingAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const socketRef = useRef(null)

  const loadAssignments = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getPendingAssignments()
      setAssignments(data)
      console.log('data', data)
      return data
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudieron cargar los pendientes'))
      setAssignments([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAssignments()
  }, [loadAssignments])

  useEffect(() => {
    const token = getCookie(ACCESS_TOKEN_COOKIE)
    if (!token) {
      return undefined
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'
    const wsUrl = apiUrl.replace(/^http/, 'ws').replace(/\/api$/, '')
    const socket = new WebSocket(`${wsUrl}/api/document-assignments/ws/pending?token=${encodeURIComponent(token)}`)
    socketRef.current = socket

    socket.onmessage = () => {
      void loadAssignments()
    }

    socket.onerror = () => {
      socket.close()
    }

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [loadAssignments])

  return {
    assignments,
    loading,
    error,
    reload: loadAssignments,
  }
}
