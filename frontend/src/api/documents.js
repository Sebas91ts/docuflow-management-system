import apiClient from './client'

export async function getDocuments() {
  const { data } = await apiClient.get('/documents')
  return data
}

export async function createDocument(document) {
  const { data } = await apiClient.post('/documents', document)
  return data
}

export async function updateDocument(id, document) {
  const { data } = await apiClient.put(`/documents/${id}`, document)
  return data
}
