import StatusAlert from './StatusAlert'
import { X } from 'lucide-react'

function UserModal({
  isOpen,
  title,
  subtitle,
  form,
  onChange,
  onClose,
  onSubmit,
  loading,
  isEditing,
  error,
  success,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-app)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-[var(--color-primary)]">{title}</p>
            <h2 className="mt-1 text-xl font-bold">{subtitle}</h2>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>

        <form className="space-y-4 px-6 py-5" onSubmit={onSubmit}>
          <StatusAlert type="error" message={error} />
          <StatusAlert type="success" message={success} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="full_name">
                Nombre completo
              </label>
              <input
                className="h-11 w-full rounded-md border border-[var(--color-border)] px-3 outline-none transition focus:border-[var(--color-primary)]"
                id="full_name"
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={onChange}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="username">
                Usuario
              </label>
              <input
                className="h-11 w-full rounded-md border border-[var(--color-border)] px-3 outline-none transition focus:border-[var(--color-primary)]"
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={onChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="role">
                Rol
              </label>
              <select
                className="h-11 w-full rounded-md border border-[var(--color-border)] px-3 outline-none transition focus:border-[var(--color-primary)]"
                id="role"
                name="role"
                value={form.role}
                onChange={onChange}
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Contrasena {isEditing ? '(opcional)' : ''}
              </label>
              <input
                className="h-11 w-full rounded-md border border-[var(--color-border)] px-3 outline-none transition focus:border-[var(--color-primary)]"
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder={isEditing ? 'Dejar vacio para mantenerla' : ''}
                autoComplete="new-password"
                required={!isEditing}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              className="h-4 w-4 rounded border-[var(--color-border)]"
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={onChange}
            />
            Usuario activo
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-end">
            <button
              className="h-11 rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar usuario' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal
