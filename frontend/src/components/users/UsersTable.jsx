import { Pencil, UserX, UserCheck } from 'lucide-react'

function UsersTable({ users, loading, onEdit, onDeactivate, onActive }) {
  return (
    <div className='rounded-lg border border-(--color-border) bg-[var(--color-surface)] p-6 shadow-(--shadow-app)'>
      <div className='mb-5 flex items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-semibold text-(--color-primary)'>
            Listado
          </p>
          <h2 className='mt-1 text-xl font-bold'>Usuarios registrados</h2>
        </div>
        <span className='rounded-full bg-(--color-primary-soft) px-3 py-1 text-xs font-semibold text-(--color-primary)'>
          {users.length} registros
        </span>
      </div>

      {loading ? (
        <p className='text-sm text-(--color-muted)'>Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p className='text-sm text-(--color-muted)'>
          Todavia no hay usuarios registrados.
        </p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full border-separate border-spacing-y-2'>
            <thead>
              <tr className='text-left text-xs uppercase tracking-[0.16em] text-(--color-muted)'>
                <th className='px-3 py-2'>Usuario</th>
                <th className='px-3 py-2'>Rol</th>
                <th className='px-3 py-2'>Estado</th>
                <th className='px-3 py-2'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className='rounded-md bg-(--color-page)'>
                  <td className='px-3 py-3'>
                    <div className='font-semibold'>{user.full_name}</div>
                    <div className='text-sm text-(--color-muted)'>
                      {user.username}
                    </div>
                  </td>
                  <td className='px-3 py-3 text-sm capitalize'>{user.role}</td>
                  <td className='px-3 py-3'>
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-200 text-slate-600'
                      ].join(' ')}
                    >
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className='px-3 py-3'>
                    <div className='flex flex-wrap gap-2'>
                      <button
                        className='inline-flex items-center gap-2 rounded-md border border-(--color-border) px-3 py-2 text-sm font-medium transition hover:border-(--color-primary) hover:text-(--color-primary)'
                        type='button'
                        onClick={() => onEdit(user)}
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      {user.is_active && (
                      <button
                        className='inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60'
                        type='button'
                        onClick={() => onDeactivate(user)}
                        disabled={!user.is_active}
                      >
                          <UserX size={15} />
                          Desactivar
                        </button>
                      )}
                      {/* boton para activar */}
                      {!user.is_active && (
                        <button
                          className='inline-flex items-center gap-2 rounded-md border border-green-200 px-3 py-2 text-sm font-medium text-green-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60'
                          type='button'
                          onClick={() => onActive(user.id)}
                          disabled={user.is_active}
                        >
                          <UserCheck size={15} />
                          Activar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UsersTable
