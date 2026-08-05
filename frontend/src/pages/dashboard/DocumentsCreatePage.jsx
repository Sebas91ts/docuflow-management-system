import { useState } from 'react'

import { createDocument } from '../../api/documents'
import ActionModal from '../../components/common/ActionModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FeedbackToast from '../../components/common/FeedbackToast'
import DocumentDropzone from '../../components/documents/DocumentDropzone'
import DocumentModeToggle from '../../components/documents/DocumentModeToggle'
import DocumentsHeader from '../../components/documents/DocumentsHeader'
import { useDocumentForm } from '../../hooks/useDocumentForm'
import { useFeedbackToast } from '../../hooks/useFeedbackToast'
import { getApiErrorMessage } from '../../utils/apiError'

function DocumentsCreatePage() {
  const formState = useDocumentForm()
  const { toast, showError, showSuccess, clearToast } = useFeedbackToast()
  const [submitting, setSubmitting] = useState(false)
  const [resultModal, setResultModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) {
      return
    }

    if (!formState.form.title.trim()) {
      showError('Escribe un nombre para el documento')
      return
    }

    if (!formState.selectedFile) {
      showError('Debes seleccionar un archivo para continuar')
      return
    }

    try {
      setSubmitting(true)
      await createDocument({
        title: formState.form.title.trim(),
        description: formState.form.description.trim() || null,
        submission_mode: formState.form.submissionMode,
        file: formState.selectedFile
      })

      showSuccess(
        formState.form.submissionMode === 'archive'
          ? 'Documento creado y archivado correctamente'
          : 'Documento creado correctamente'
      )
      setResultModal({
        isOpen: true,
        type: 'success',
        title: 'Documento guardado',
        message:
          formState.form.submissionMode === 'archive'
            ? 'El documento quedó archivado correctamente.'
            : 'El documento fue guardado correctamente.'
      })

      formState.close()
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        'No se pudo subir o guardar el documento'
      )
      showError(message)
      setResultModal({
        isOpen: true,
        type: 'error',
        title: 'No se pudo guardar',
        message
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className='mx-auto space-y-6'>
      <div className='fixed right-6 top-6 z-50'>
        <FeedbackToast toast={toast} onClose={clearToast} />
      </div>

      <DocumentsHeader mode='create' />

      <div className='relative rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]'>
        <form className='space-y-6' onSubmit={handleSubmit}>
          <div className='grid gap-6 lg:grid-cols-[1fr_0.95fr]'>
            <div className='space-y-6'>
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

              <div className='rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3'>
                <p className='text-sm text-[var(--color-muted)]'>
                  {formState.form.submissionMode === 'archive'
                    ? 'El documento quedará archivado al guardar.'
                    : 'El documento se guardará listo para derivación posterior.'}
                </p>
              </div>
            </div>

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
          </div>

          <div className='flex items-center justify-end gap-3 border-t border-[var(--color-border)] pt-5'>
            <button
              className='inline-flex h-11 items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70'
              disabled={submitting}
              type='submit'
            >
              Guardar documento
            </button>
          </div>
        </form>

        {submitting ? (
          <div className='absolute inset-0 z-30 overflow-hidden rounded-lg'>
            <div className='absolute inset-0 bg-black/20 backdrop-blur-[1px]' />
            <div className='relative z-40 flex min-h-[360px] items-center justify-center px-6 py-10'>
              <div className='flex flex-col items-center gap-3 rounded-lg border border-[var(--color-border)] bg-white/30 px-6 py-5 shadow-[var(--shadow-app)]'>
                <LoadingSpinner size={200} />
                <p className='text-sm font-medium text-[var(--color-muted)]'>
                  Guardando documento...
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <ActionModal
        isOpen={resultModal.isOpen && !submitting}
        type={resultModal.type}
        title={resultModal.title}
        message={resultModal.message}
        onClose={() =>
          setResultModal({
            isOpen: false,
            type: 'success',
            title: '',
            message: ''
          })
        }
      />
    </section>
  )
}

export default DocumentsCreatePage
