import { useMemo, useState } from 'react'

const emptyForm = {
  full_name: '',
  username: '',
  role: 'user',
  password: '',
  is_active: true,
}

export function useUserForm() {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isEditing = useMemo(() => editingId !== null, [editingId])

  const reset = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const openCreate = () => {
    reset()
    setIsModalOpen(true)
  }

  const openEdit = (user) => {
    setEditingId(user.id)
    setForm({
      full_name: user.full_name ?? '',
      username: user.username ?? '',
      role: user.role ?? 'user',
      password: '',
      is_active: user.is_active ?? true,
    })
    setIsModalOpen(true)
  }

  const close = () => {
    setIsModalOpen(false)
    reset()
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return {
    form,
    setForm,
    editingId,
    isEditing,
    isModalOpen,
    openCreate,
    openEdit,
    close,
    reset,
    handleChange,
    setIsModalOpen,
  }
}
