function DocumentsFilters({ filters, onChange, onApply, onClear }) {
  return (
    <form
      className="rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-app)]"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <input
          className="h-10 rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          placeholder="Buscar documentos"
          value={filters.search}
          onChange={(event) => onChange('search', event.target.value)}
        />
        <select
          className="h-10 rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          value={filters.status}
          onChange={(event) => onChange('status', event.target.value)}
        >
          <option value="">Estado</option>
          <option value="REGISTERED">Registrado</option>
          <option value="ARCHIVED">Archivado</option>
          <option value="IN_PROGRESS">En proceso</option>
        </select>
        <input
          className="h-10 rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          placeholder="Subido por"
          value={filters.uploaded_by_id}
          onChange={(event) => onChange('uploaded_by_id', event.target.value)}
        />
        <input
          className="h-10 rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          placeholder="Responsable"
          value={filters.current_responsible_id}
          onChange={(event) => onChange('current_responsible_id', event.target.value)}
        />
        <input
          className="h-10 rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          type="date"
          value={filters.created_from}
          onChange={(event) => onChange('created_from', event.target.value)}
        />
        <input
          className="h-10 rounded-md border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          type="date"
          value={filters.created_to}
          onChange={(event) => onChange('created_to', event.target.value)}
        />
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
