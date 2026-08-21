import apiClient from './client'

export async function getDocuments(params = {}) {
  const { data } = await apiClient.get('/documents', { params })
  return data
}

export async function getDocument(id) {
  const { data } = await apiClient.get(`/documents/${id}`)
  return data
}

export async function getFolders(parentId = null) {
  const { data } = await apiClient.get('/documents/folder', {
    params: parentId ? { parent_id: parentId } : {},
  })
  return data
}

export async function createDocument(document) {
  const formData = new FormData()

  formData.append('title', document.title)

  if (document.description) {
    formData.append('description', document.description)
  }

  if (document.current_responsible_id) {
    formData.append(
      'current_responsible_id',
      document.current_responsible_id
    )
  }

  formData.append(
    'submission_mode',
    document.submission_mode ?? 'register'
  )

  if (document.assigned_to_id) {
    formData.append(
      'assigned_to_id',
      document.assigned_to_id
    )
  }

  if (document.assignment_message) {
    formData.append(
      'assignment_message',
      document.assignment_message
    )
  }

  if (document.assignment_due_date) {
    formData.append(
      'assignment_due_date',
      document.assignment_due_date
    )
  }

  formData.append('file', document.file)

  const { data } = await apiClient.post('/documents', formData)

  return data
}

export async function updateDocument(id, document) {
  const { data } = await apiClient.put(`/documents/${id}`, document)
  return data
}

export async function getPendingAssignments() {
  const { data } = await apiClient.get('/document-assignments/pending')
  return data
}

export async function attendAssignment(assignmentId) {
  const { data } = await apiClient.patch(`/document-assignments/${assignmentId}/attend`)
  return data
}

export async function archiveAssignment(assignmentId, comment = null) {
  const { data } = await apiClient.patch(`/document-assignments/${assignmentId}/archive`, {
    comment,
  })
  return data
}

export async function deriveAssignment(assignmentId, payload) {
  const { data } = await apiClient.patch(`/document-assignments/${assignmentId}/derive`, payload)
  return data
}

export async function downloadDocument(id, fallbackFilename) {
  const response = await apiClient.get(`/documents/${id}/download`, {
    responseType: 'blob',
  })

  // Leer el nombre real del archivo desde el header Content-Disposition
  // Formato: attachment; filename="nombre_archivo.pdf"
  const contentDisposition = response.headers['content-disposition']
  let filename = fallbackFilename || 'documento'
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";\n]+)"?/)
    if (match && match[1]) {
      filename = match[1].trim()
    }
  }

  const mimeType = response.headers['content-type'] || 'application/octet-stream'
  const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

