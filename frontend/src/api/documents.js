import apiClient from './client'

export async function getDocuments() {
  const { data } = await apiClient.get('/documents')
  return data
}

export async function createDocument(document) {
  const formData = new FormData()
  formData.append('title', document.title)
  if (document.description) {
    formData.append('description', document.description)
  }
  if (document.current_responsible_id) {
    formData.append('current_responsible_id', document.current_responsible_id)
  }
  formData.append('submission_mode', document.submission_mode ?? 'register')
  formData.append('file', document.file)

  const { data } = await apiClient.post('/documents', formData)

  return data
}

export async function updateDocument(id, document) {
  const { data } = await apiClient.put(`/documents/${id}`, document)
  return data
}
