import { File, Upload } from 'lucide-react'

function DocumentDropzone({
  fileInputRef,
  fileSummary,
  isDragging,
  onBrowse,
  onFileChange,
  onDrop,
  onDragEnter,
  onDragLeave,
  onClear,
}) {
  const borderStyle = isDragging
    ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
    : 'border-dashed border-[var(--color-border)] bg-white'

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Archivo</label>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Arrastra un archivo aquí o selecciónalo manualmente.
        </p>
      </div>

      <input ref={fileInputRef} className="hidden" type="file" onChange={onFileChange} />

      <button
        className={[
          'flex w-full flex-col items-center justify-center gap-3 rounded-xl border px-6 py-10 text-center transition',
          borderStyle,
        ].join(' ')}
        type="button"
        onClick={onBrowse}
        onDragEnter={onDragEnter}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
          <Upload size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold">Suelta el archivo o haz clic para buscar</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">PDF, imagen o documento de oficina.</p>
        </div>
      </button>

      {fileSummary ? (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[var(--color-primary)]">
              <File size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">{fileSummary.name}</p>
              <p className="text-sm text-[var(--color-muted)]">
                {(fileSummary.size / 1024).toFixed(1)} KB · {fileSummary.type}
              </p>
            </div>
          </div>
          <button
            className="text-sm font-semibold text-[var(--color-primary)] transition hover:underline"
            type="button"
            onClick={onClear}
          >
            Quitar
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default DocumentDropzone
