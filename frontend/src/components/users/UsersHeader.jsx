import { Plus, RefreshCw } from 'lucide-react'

function UsersHeader({ onRefresh, onCreate, error, success }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-app)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-primary)]">Usuarios</p>
          <h1 className="mt-2 text-2xl font-bold">Administracion de usuarios</h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted)]">
            Crea, edita y desactiva usuarios internos del sistema. Esta pantalla es solo para administradores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            type="button"
            onClick={onRefresh}
          >
            <RefreshCw size={16} />
            Refrescar
          </button>

          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
            type="button"
            onClick={onCreate}
          >
            <Plus size={16} />
            Nuevo usuario
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      ) : null}
    </div>
  )
}

export default UsersHeader
