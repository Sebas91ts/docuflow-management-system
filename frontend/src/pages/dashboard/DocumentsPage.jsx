import FeedbackToast from '../../components/common/FeedbackToast'
import DocumentDropzone from '../../components/documents/DocumentDropzone'
import DocumentModeToggle from '../../components/documents/DocumentModeToggle'
import DocumentsHeader from '../../components/documents/DocumentsHeader'
import { useDocuments } from '../../hooks/useDocuments'
import { useDocumentForm } from '../../hooks/useDocumentForm'
import { useFeedbackToast } from '../../hooks/useFeedbackToast'

function DocumentsPage() {
  const documentsState = useDocuments()
  const formState = useDocumentForm()
  const { toast, showError, showSuccess, clearToast } = useFeedbackToast()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formState.form.title.trim()) {
      showError('Escribe un nombre para el documento')
      return
    }

    if (!formState.selectedFile) {
      showError('Debes seleccionar un archivo para continuar')
      return
    }

    const payload = {
      title: formState.form.title.trim(),
      description: formState.form.description.trim() || null,
      current_responsible_id: null,
      drive_file_id: null,
      drive_file_name: formState.selectedFile.name,
      drive_web_view_link: null,
      mime_type: formState.selectedFile.type || null,
      file_size: formState.selectedFile.size
    }

    const created = await documentsState.create(payload)
    if (!created.ok) {
      documentsState.error || 'No se pudo guardar el documento'
      return
    }

    if (formState.form.submissionMode === 'archive' && created.document) {
      const archiveResult = await documentsState.archive(created.document.id, {
        title: created.document.title,
        description: created.document.description,
        current_responsible_id: created.document.current_responsible_id,
        drive_file_id: created.document.drive_file_id,
        drive_file_name: created.document.drive_file_name,
        drive_web_view_link: created.document.drive_web_view_link,
        mime_type: created.document.mime_type,
        file_size: created.document.file_size
      })

      if (!archiveResult.ok) {
        showError(documentsState.error || 'No se pudo archivar el documento')
        return
      }
    }

    showSuccess(
      formState.form.submissionMode === 'archive'
        ? 'Documento creado y archivado correctamente'
        : 'Documento creado correctamente'
    )

    formState.close()
  }

  return (
    <section className='mx-auto space-y-6'>
      <div className='fixed right-6 top-6 z-50'>
        <FeedbackToast toast={toast} onClose={clearToast} />
      </div>

      <DocumentsHeader />

      <div className='rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]'>
        <form className='space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <label className='text-sm font-medium' htmlFor='title'>
              Nombre del documento
            </label>
            <input
              className='h-11 w-full rounded-md border border-[var(--color-border)] px-3 outline-none transition focus:border-[var(--color-primary)]'
              id='title'
              name='title'
              type='text'
              value={formState.form.title}
              onChange={formState.handleChange}
              placeholder='Ej. Carta de solicitud'
              required
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium' htmlFor='description'>
              Descripcion del documento
            </label>
            <textarea
              className='min-h-28 w-full rounded-md border border-[var(--color-border)] px-3 py-2 outline-none transition focus:border-[var(--color-primary)]'
              id='description'
              name='description'
              value={formState.form.description}
              onChange={formState.handleChange}
              placeholder='Describe el contexto o contenido del documento'
            />
          </div>

          <DocumentModeToggle
            value={formState.form.submissionMode}
            onChange={formState.handleChange}
          />

          <DocumentDropzone
            fileInputRef={formState.fileInputRef}
            fileSummary={formState.fileSummary}
            isDragging={formState.isDragging}
            onBrowse={formState.openFilePicker}
            onFileChange={formState.handleFileInputChange}
            onDrop={formState.handleDrop}
            onDragEnter={() => formState.setIsDragging(true)}
            onDragLeave={() => formState.setIsDragging(false)}
            onClear={formState.clearFile}
          />

          <div className='rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3'>
            <p className='text-sm text-[var(--color-muted)]'>
              {formState.form.submissionMode === 'archive'
                ? 'El documento quedará archivado al guardar.'
                : 'El documento se guardará listo para derivación posterior.'}
            </p>
          </div>

          <div className='flex items-center justify-end gap-3 border-t border-[var(--color-border)] pt-5'>
            <button
              className='inline-flex h-11 items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70'
              type='submit'
              disabled={documentsState.saving}
            >
              {documentsState.saving ? 'Guardando...' : 'Guardar documento'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default DocumentsPage
