import { useUsers } from '../../hooks/useUsers'
import { useUserForm } from '../../hooks/useUserForm'
import UsersHeader from '../../components/users/UsersHeader'
import StatusAlert from '../../components/users/StatusAlert'
import UsersTable from '../../components/users/UsersTable'
import UserModal from '../../components/users/UserModal'
import ConfirmModal from '../../components/users/ConfirmModal'
import { useState } from 'react'

function UsersPage() {
  const usersState = useUsers()
  const formState = useUserForm()
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    userId: null,
    userName: ''
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      full_name: formState.form.full_name.trim(),
      username: formState.form.username.trim(),
      role: formState.form.role,
      is_active: formState.form.is_active
    }

    if (formState.form.password.trim()) {
      payload.password = formState.form.password.trim()
    } else if (!formState.isEditing) {
      usersState.setError('La contrasena es obligatoria para crear un usuario')
      return
    }

    const wasSaved = formState.isEditing
      ? await usersState.update(formState.editingId, payload)
      : await usersState.create(payload)

    if (wasSaved) {
      formState.close()
    }
  }

  const requestDeactivate = (user) => {
    setConfirmState({
      isOpen: true,
      userId: user.id,
      userName: user.full_name
    })
  }

  const closeConfirm = () => {
    setConfirmState({
      isOpen: false,
      userId: null,
      userName: ''
    })
  }

  const handleConfirmDeactivate = async () => {
    if (!confirmState.userId) {
      return
    }

    const wasSaved = await usersState.deactivate(confirmState.userId)
    if (wasSaved) {
      closeConfirm()
    }
  }

  return (
    <section className='space-y-6'>
      <UsersHeader
        onRefresh={usersState.loadUsers}
        onCreate={formState.openCreate}
      />

      {formState.isModalOpen ? null : (
        <>
          <StatusAlert type='error' message={usersState.error} />
          <StatusAlert type='success' message={usersState.success} />
        </>
      )}

      <UsersTable
        users={usersState.users}
        loading={usersState.loading}
        onEdit={formState.openEdit}
        onDeactivate={requestDeactivate}
        onActive={usersState.activate}
      />

      <UserModal
        isOpen={formState.isModalOpen}
        title={formState.isEditing ? 'Editar usuario' : 'Nuevo usuario'}
        subtitle={
          formState.isEditing ? 'Actualizar registro' : 'Crear registro'
        }
        form={formState.form}
        onChange={formState.handleChange}
        onClose={formState.close}
        onSubmit={handleSubmit}
        loading={usersState.saving}
        isEditing={formState.isEditing}
        error={usersState.error}
        success={usersState.success}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title='Desactivar usuario'
        message={`Estas a punto de desactivar a ${confirmState.userName}. Esta accion se puede revertir despues.`}
        confirmLabel='Desactivar'
        cancelLabel='Cancelar'
        onConfirm={handleConfirmDeactivate}
        onCancel={closeConfirm}
        loading={usersState.saving}
      />
    </section>
  )
}

export default UsersPage
