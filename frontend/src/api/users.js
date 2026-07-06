import apiClient from './client'

export async function getUsers() {
  const { data } = await apiClient.get('/users')
  return data
}

export async function createUser(user) {
  const { data } = await apiClient.post('/users', user)
  return data
}

export async function updateUser(id, user) {
  const { data } = await apiClient.put(`/users/${id}`, user)
  return data
}

export async function deactivateUser(id) {
  const { data } = await apiClient.patch(`/users/${id}/deactivate`)
  return data
}

export async function activateUser(id) {
  const { data } = await apiClient.patch(`/users/${id}/activate`)
  return data
}
