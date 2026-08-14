function DocumentsHeader({ mode = 'create' }) {
  const isList = mode === 'list'
  const title = isList ? 'Explorar documentos' : 'Registrar un nuevo documento'
  const description = isList
    ? 'Revisa los documentos cargados, navega por carpetas y abre cada archivo desde su tarjeta.'
    : 'Carga el archivo, completa los datos principales y elige si quieres archivarlo de una vez o dejarlo preparado para derivarlo después.'

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]">
      <p className="text-sm font-semibold text-[var(--color-primary)]">Documentos</p>
      <h1 className="mt-2 text-2xl font-bold">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted)]">{description}</p>
    </div>
  )
}

export default DocumentsHeader
