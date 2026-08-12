import { useCallback, useEffect, useState } from 'react'

import { getPendingAssignments } from '../api/documents'
import { getApiErrorMessage } from '../utils/apiError'

export function usePendingAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAssignments = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getPendingAssignments()
      setAssignments(data)
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
    const handlePendingUpdate = () => {
      void loadAssignments()
    }

    window.addEventListener('docuflow:pending-updated', handlePendingUpdate)
    return () => {
      window.removeEventListener('docuflow:pending-updated', handlePendingUpdate)
    }
  }, [loadAssignments])

  return {
    assignments,
    loading,
    error,
    reload: loadAssignments,
  }
}


