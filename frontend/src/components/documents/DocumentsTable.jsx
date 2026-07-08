function DocumentsTable({ documents, loading }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-primary)]">Recientes</p>
          <h2 className="mt-1 text-xl font-bold">Documentos registrados</h2>
        </div>
        <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
          {documents.length} registros
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--color-muted)]">Cargando documentos...</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">Todavia no hay documentos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                <th className="px-3 py-2">Codigo</th>
                <th className="px-3 py-2">Titulo</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Subido por</th>
                <th className="px-3 py-2">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id} className="rounded-md bg-[var(--color-page)]">
                  <td className="px-3 py-3 text-sm font-semibold">{document.code}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold">{document.title}</div>
                    <div className="text-sm text-[var(--color-muted)]">{document.description || 'Sin descripcion'}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
                      {document.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {document.uploaded_by?.full_name ?? 'N/A'}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {document.current_responsible?.full_name ?? 'Sin asignar'}
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

export default DocumentsTable
