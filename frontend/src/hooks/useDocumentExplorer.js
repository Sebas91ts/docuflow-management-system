import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getDocuments, getFolders } from '../api/documents'
import { getApiErrorMessage } from '../utils/apiError'

function buildFolderTree(folders) {
  const byParent = new Map()
  folders.forEach((folder) => {
    const key = folder.parent_id ?? 'root'
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key).push(folder)
  })
  return byParent
}

export function useDocumentExplorer() {
  const [folders, setFolders] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    uploaded_by_id: '',
    current_responsible_id: '',
    created_from: '',
    created_to: '',
    folder_id: '',
  })
  const [activeFolderId, setActiveFolderId] = useState('')
  const [error, setError] = useState('')
  const didMountRef = useRef(false)
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.search ||
        filters.status ||
        filters.uploaded_by_id ||
        filters.current_responsible_id ||
        filters.created_from ||
        filters.created_to,
    )
  }, [filters])

  const searchMode = useMemo(() => {
    if (!filters.search) {
      return 'browse'
    }
    return 'search'
  }, [filters.search])

  const folderTree = useMemo(() => buildFolderTree(folders), [folders])

  const loadData = useCallback(async (nextFilters, folderId) => {
    const resolvedFilters =
      nextFilters ?? {
        search: '',
        status: '',
        uploaded_by_id: '',
        current_responsible_id: '',
        created_from: '',
        created_to: '',
        folder_id: '',
      }
    const resolvedFolderId = folderId ?? ''

    setLoading(true)
    setError('')
    try {
      const shouldScopeByFolder = Boolean(resolvedFolderId) && !(
        resolvedFilters.search ||
        resolvedFilters.status ||
        resolvedFilters.uploaded_by_id ||
        resolvedFilters.current_responsible_id ||
        resolvedFilters.created_from ||
        resolvedFilters.created_to
      )
      const [folderData, documentData] = await Promise.all([
        getFolders(),
        getDocuments({
          search: resolvedFilters.search || undefined,
          status: resolvedFilters.status || undefined,
          uploaded_by: resolvedFilters.uploaded_by_id || undefined,
          current_responsible: resolvedFilters.current_responsible_id || undefined,
          created_from: resolvedFilters.created_from || undefined,
          created_to: resolvedFilters.created_to || undefined,
          folder_id: shouldScopeByFolder ? resolvedFolderId : undefined,
        }),
      ])
      setFolders(folderData)
      setDocuments(documentData)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo cargar el explorador'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    void loadData(filters, activeFolderId)
  }, [activeFolderId, loadData])

  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }))

  const applyFilters = async () => {
    await loadData(filters, activeFolderId)
  }

  const clearFilters = async () => {
    const nextFilters = {
      search: '',
      status: '',
      uploaded_by_id: '',
      current_responsible_id: '',
      created_from: '',
      created_to: '',
      folder_id: '',
    }
    setFilters(nextFilters)
    setActiveFolderId('')
    await loadData(nextFilters, '')
  }

  return {
    loading,
    folders,
    folderTree,
    documents,
    filters,
    error,
    hasActiveFilters,
    searchMode,
    activeFolderId,
    expandedFolders,
    setActiveFolderId,
    setExpandedFolders,
    updateFilter,
    applyFilters,
    clearFilters,
    reload: loadData,
  }
}
