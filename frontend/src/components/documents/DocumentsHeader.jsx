function DocumentsHeader() {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]">
      <p className="text-sm font-semibold text-[var(--color-primary)]">Documentos</p>
      <h1 className="mt-2 text-2xl font-bold">Registrar un nuevo documento</h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted)]">
        Carga el archivo, completa los datos principales y elige si quieres archivarlo de una vez o dejarlo
        preparado para derivarlo después.
      </p>
    </div>
  )
}

export default DocumentsHeader
