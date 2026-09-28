import { File, Upload, Trash2 } from 'lucide-react'

function DocumentDropzone({
  fileInputRef,
  fileSummary,
  extraFilesSummary = [],
  isDragging,
  onBrowse,
  onFileChange,
  onDrop,
  onDragEnter,
  onDragLeave,
  onClear,
  onRemoveExtraFile,
}) {
  const borderStyle = isDragging
    ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
    : 'border-dashed border-[var(--color-border)] bg-[var(--color-surface)]'

  return (
    <div className="min-w-0 space-y-3">
      <div>
        <label className="text-sm font-medium">Archivos</label>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Arrastra uno o más archivos aquí. El primero será el documento principal y los demás se guardarán como relacionados.
        </p>
      </div>

      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        multiple
        onChange={onFileChange}
      />

      <button
        className={[
          'flex min-w-0 w-full flex-col items-center justify-center gap-3 rounded-xl border px-4 py-6 text-center transition sm:px-6 sm:py-10',
          borderStyle,
        ].join(' ')}
        type="button"
        onClick={onBrowse}
        onDragEnter={onDragEnter}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shrink-0">
          <Upload size={20} />
        </div>
        <div className="min-w-0 w-full">
          <p className="text-sm font-semibold break-words">Suelta tus archivos o haz clic para buscar</p>
          <p className="mt-1 text-sm text-[var(--color-muted)] break-words">PDF, imagen o documento de oficina (puedes seleccionar varios).</p>
        </div>
      </button>

      {/* Archivo Principal */}
      {fileSummary ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Documento Principal
          </p>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="mt-0.5 shrink-0 text-[var(--color-primary)]">
                <File size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold break-words">{fileSummary.name}</p>
                <p className="text-sm text-[var(--color-muted)]">
                  {(fileSummary.size / 1024).toFixed(1)} KB · {fileSummary.type}
                </p>
              </div>
            </div>
            <button
              className="shrink-0 text-sm font-semibold text-[var(--color-primary)] transition hover:underline"
              type="button"
              onClick={onClear}
            >
              Quitar
            </button>
          </div>
        </div>
      ) : null}

      {/* Archivos Relacionados */}
      {extraFilesSummary.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-[var(--color-border)]/55">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Documentos Relacionados ({extraFilesSummary.length})
          </p>
          <div className="space-y-2">
            {extraFilesSummary.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)]/60 bg-[var(--color-surface)] px-3.5 py-2.5"
              >
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                  <div className="mt-0.5 shrink-0 text-[var(--color-muted)]">
                    <File size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-text)] break-words">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-muted)]">
                      {(file.size / 1024).toFixed(1)} KB · {file.type}
                    </p>
                  </div>
                </div>
                <button
                  className="shrink-0 rounded p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-page)] hover:text-[var(--color-primary)]"
                  type="button"
                  onClick={() => onRemoveExtraFile(index)}
                  title="Quitar de relacionados"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DocumentDropzone
