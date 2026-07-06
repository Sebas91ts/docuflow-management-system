import { useCallback, useEffect, useState } from 'react'

import { createUser, deactivateUser, getUsers, updateUser, activateUser } from '../api/users'
import { getApiErrorMessage } from '../utils/apiError'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getUsers()
      setUsers(data)
    } catch {
      setError('No se pudo cargar el listado de usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (payload) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await createUser(payload)
      setSuccess('Usuario creado correctamente')
      await loadUsers()
      return true
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo guardar el usuario'))
      return false
    } finally {
      setSaving(false)
    }
  }, [loadUsers])

  const update = useCallback(async (id, payload) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await updateUser(id, payload)
      setSuccess('Usuario actualizado correctamente')
      await loadUsers()
      return true
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo guardar el usuario'))
      return false
    } finally {
      setSaving(false)
    }
  }, [loadUsers])

  const deactivate = useCallback(async (id) => {
    setError('')
    setSuccess('')

    try {
      await deactivateUser(id)
      setSuccess('Usuario desactivado correctamente')
      await loadUsers()
      return true
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo desactivar el usuario'))
      return false
    }
  }, [loadUsers])

  const activate = useCallback(async (id) => {
    setError('')
    setSuccess('')
    
    try {
      await activateUser(id)
      setSuccess('Usuario activado correctamente')
      await loadUsers()
      return true
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo activar el usuario'))
      return false
    }
  }, [loadUsers])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  return {
    users,
    loading,
    saving,
    error,
    success,
    loadUsers,
    create,
    update,
    deactivate,
    setError,
    setSuccess,
    activate,
  }
}
