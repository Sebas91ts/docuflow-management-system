import { useCallback, useEffect, useState } from 'react'

import { createDocument, getDocuments, updateDocument } from '../api/documents'
import { getApiErrorMessage } from '../utils/apiError'

export function useDocuments() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadDocuments = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getDocuments()
      setDocuments(data)
      return { ok: true, documents: data }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo cargar el listado de documentos'))
      return { ok: false, documents: [] }
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (payload) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const document = await createDocument(payload)
      setSuccess('Documento creado correctamente')
      await loadDocuments()
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
      await loadDocuments()
      return { ok: true, document }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo archivar el documento'))
      return { ok: false, document: null }
    } finally {
      setSaving(false)
    }
  }, [])

  useEffect(() => {
    void loadDocuments()
  }, [loadDocuments])

  return {
    documents,
    loading,
    saving,
    error,
    success,
    loadDocuments,
    create,
    archive,
    setError,
    setSuccess,
  }
}
