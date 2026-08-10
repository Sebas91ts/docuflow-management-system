function DocumentsFilters({ filters, onChange, onApply, onClear }) {
  return (
    <form
      className="rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-app)]"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <p className="text-sm font-semibold text-[var(--color-primary)]">Busqueda</p>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--color-muted)]">Buscar</p>
          <input
            className="h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            placeholder="Buscar documentos"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--color-muted)]">Estado</p>
          <select
            className="h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
          >
            <option value="">Todos</option>
            <option value="REGISTERED">Registrado</option>
            <option value="ARCHIVED">Archivado</option>
            <option value="IN_PROGRESS">En proceso</option>
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--color-muted)]">Subido por</p>
          <input
            className="h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            placeholder="Nombre o usuario"
            value={filters.uploaded_by_id}
            onChange={(event) => onChange('uploaded_by_id', event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--color-muted)]">Responsable</p>
          <input
            className="h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            placeholder="Nombre o usuario"
            value={filters.current_responsible_id}
            onChange={(event) => onChange('current_responsible_id', event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--color-muted)]">Fecha desde</p>
          <input
            className="h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            type="date"
            aria-label="Fecha desde"
            value={filters.created_from}
            onChange={(event) => onChange('created_from', event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--color-muted)]">Fecha hasta</p>
          <input
            className="h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            type="date"
            aria-label="Fecha hasta"
            value={filters.created_to}
            onChange={(event) => onChange('created_to', event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold transition hover:border-[var(--color-primary)]"
          onClick={onClear}
        >
          Limpiar
        </button>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
        >
          Aplicar filtros
        </button>
      </div>
    </form>
  )
}

export default DocumentsFilters
