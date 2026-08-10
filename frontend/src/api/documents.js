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
  console.log('document:', document)

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
