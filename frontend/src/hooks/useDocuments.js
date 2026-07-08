import { useCallback, useState } from 'react'

import { createDocument, updateDocument } from '../api/documents'
import { getApiErrorMessage } from '../utils/apiError'

export function useDocuments() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const create = useCallback(async (payload) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const document = await createDocument(payload)
      setSuccess('Documento creado correctamente')
      return { ok: true, document }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo guardar el documento'))
      return { ok: false, document: null }
    } finally {
      setSaving(false)
    }
  }, [])

  const archive = useCallback(async (id, payload) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const document = await updateDocument(id, { ...payload, status: 'ARCHIVED' })
      setSuccess('Documento archivado correctamente')
      return { ok: true, document }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo archivar el documento'))
      return { ok: false, document: null }
    } finally {
      setSaving(false)
    }
  }, [])

  return {
    saving,
    error,
    success,
    create,
    archive,
    setError,
    setSuccess,
  }
}
