import { ArrowLeft, Download, ExternalLink, FileText, Clock3, Paperclip } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import LoadingSpinner from '../../components/common/LoadingSpinner'
import UploadRelatedModal from '../../components/documents/UploadRelatedModal'
import ActionModal from '../../components/common/ActionModal'
import FeedbackToast from '../../components/common/FeedbackToast'
import { useFeedbackToast } from '../../hooks/useFeedbackToast'
import { getDocument, downloadDocument, getRelatedDocuments, uploadRelatedDocument } from '../../api/documents'
import { getApiErrorMessage } from '../../utils/apiError'

const RELATION_TYPE_LABELS = {
  attachment: 'Anexo / Adjunto',
  response: 'Respuesta Oficial',
  backup: 'Respaldo / Antecedente',
}

const STATUS_META = {
  REGISTERED: {
    label: 'Registrado',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  DERIVED: {
    label: 'Derivado',
    className: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  ARCHIVED: {
    label: 'Archivado',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  IN_PROGRESS: {
    label: 'En atención',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  OBSERVED: {
    label: 'Observado',
    className: 'border-orange-200 bg-orange-50 text-orange-700',
  },
  LOGICALLY_DELETED: {
    label: 'Eliminado',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function DocumentDetailPage() {
  const { id } = useParams()
  const { toast, showSuccess, showError, clearToast } = useFeedbackToast()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [relatedDocs, setRelatedDocs] = useState([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadingRelated, setUploadingRelated] = useState(false)
  const [resultModal, setResultModal] = useState({ isOpen: false, type: 'success', title: '', message: '' })

  const handleDownload = async () => {
    if (!document) return
    setDownloading(true)
    try {
      await downloadDocument(document.id, document.drive_file_name || document.title || 'documento')
    } catch {
      if (document.drive_web_view_link) {
        window.open(document.drive_web_view_link, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const loadDocument = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getDocument(id)
        if (mounted) setDocument(data)
      } catch (requestError) {
        if (mounted) setError(getApiErrorMessage(requestError, 'No se pudo cargar el documento'))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadDocument()
    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    if (!id) return
    let mounted = true
    getRelatedDocuments(id)
      .then((data) => { if (mounted) setRelatedDocs(data) })
      .catch(() => {})
    return () => { mounted = false }
  }, [id])

  const handleUploadRelated = async (payload) => {
    if (!id) return
    setUploadingRelated(true)
    try {
      const newDoc = await uploadRelatedDocument(id, payload)
      setRelatedDocs((prev) => [
        ...prev,
        { id: newDoc.id, related_document: newDoc, relation_type: payload.relation_type },
      ])
      setUploadModalOpen(false)
      showSuccess('Archivo adjuntado correctamente')
      setResultModal({
        isOpen: true,
        type: 'success',
        title: 'Adjunto guardado',
        message: 'El archivo fue adjuntado y vinculado al documento correctamente.',
      })
    } catch (err) {
      const message = getApiErrorMessage(err, 'No se pudo adjuntar el archivo')
      showError(message)
      setResultModal({
        isOpen: true,
        type: 'error',
        title: 'Error al adjuntar',
        message,
      })
    } finally {
      setUploadingRelated(false)
    }
  }

  const statusMeta = document
    ? STATUS_META[document.status] || STATUS_META.REGISTERED
    : STATUS_META.REGISTERED

  return (
    <section className="mx-auto space-y-6">
      <div className='fixed right-6 top-6 z-50'>
        <FeedbackToast toast={toast} onClose={clearToast} />
      </div>

      {uploadingRelated ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-black/25 backdrop-blur-[1px]' />
          <div className='relative flex flex-col items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-8 py-7 shadow-2xl'>
            <LoadingSpinner size={160} />
            <p className='text-sm font-medium text-[var(--color-muted)]'>Adjuntando archivo...</p>
          </div>
        </div>
      ) : null}

      <ActionModal
        isOpen={resultModal.isOpen}
        type={resultModal.type}
        title={resultModal.title}
        message={resultModal.message}
        onClose={() => setResultModal({ isOpen: false, type: 'success', title: '', message: '' })}
      />

      {/* Header */}
      <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-app)]">
        <div>
          <p className="text-sm font-semibold text-[var(--color-primary)]">Documentos</p>
          <h1 className="mt-1 text-2xl font-bold">Detalle del documento</h1>
        </div>
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold transition hover:border-[var(--color-primary)]"
          to="/dashboard/documents"
        >
          <ArrowLeft size={16} />
          Volver
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-white shadow-[var(--shadow-app)]">
          <div className="flex flex-col items-center gap-3 text-sm text-[var(--color-muted)]">
            <LoadingSpinner size={32} />
            <p>Cargando documento...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : document ? (
        <>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

          {/* Columna izquierda: Info del documento */}
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)] self-start">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-[var(--color-page)] p-3 text-[var(--color-primary)]">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted)]">{document.code}</p>
                  <h2 className="mt-1 text-xl font-bold">{document.title}</h2>
                </div>
              </div>
              <span className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Descripción</p>
                <p className="mt-1 text-[var(--color-text)] leading-relaxed">
                  {document.description || 'Sin descripción'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Carpeta</p>
                <p className="mt-1 text-[var(--color-text)] font-mono">
                  {document.folder?.path || document.drive_folder_path || 'Sin carpeta'}
                </p>
              </div>
            </div>
          </div>
          {/* Columna derecha: Metadata + Acciones */}
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]">
            <h3 className="text-sm font-semibold text-[var(--color-primary)]">Información</h3>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Subido por</p>
                <p className="mt-1 font-medium">{document.uploaded_by?.full_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Responsable actual</p>
                <p className="mt-1 font-medium">{document.current_responsible?.full_name || 'Sin asignar'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Fecha de registro</p>
                <p className="mt-1 font-medium">{formatDate(document.created_at)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Última actualización</p>
                <p className="mt-1 font-medium">{formatDate(document.updated_at)}</p>
              </div>

              <div className="flex flex-col gap-3 pt-3 border-t border-[var(--color-border)]">
                {document.drive_file_id || document.drive_file_name ? (
                  <>
                    <button
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
                      type="button"
                      onClick={handleDownload}
                      disabled={downloading}
                    >
                      <Download size={16} />
                      {downloading ? 'Descargando...' : 'Descargar archivo'}
                    </button>
                    {document.drive_web_view_link ? (
                      <a
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        href={document.drive_web_view_link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={16} />
                        Abrir en Drive
                      </a>
                    ) : null}
                  </>
                ) : null}
                <Link
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-white"
                  to={`/dashboard/trazabilidad/${document.id}`}
                >
                  <Clock3 size={16} />
                  Ver trazabilidad
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Sección de documentos relacionados / vinculados */}
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-primary)]">Documentos vinculados</p>
              <h3 className="mt-0.5 text-base font-bold">
                {relatedDocs.length > 0 ? `${relatedDocs.length} adjunto${relatedDocs.length !== 1 ? 's' : ''}` : 'Sin adjuntos'}
              </h3>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
              onClick={() => setUploadModalOpen(true)}
              disabled={uploadingRelated}
            >
              <Paperclip size={15} />
              Adjuntar
            </button>
          </div>

          {relatedDocs.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-[var(--color-border)] py-8 text-center text-sm text-[var(--color-muted)]">
              No hay documentos adjuntos vinculados a este documento todavía.
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {relatedDocs.map((rel) => (
                <div
                  key={rel.id ?? rel.related_document?.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded bg-white p-1.5 text-violet-600 border border-violet-100">
                      <Paperclip size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{rel.related_document?.title ?? 'Adjunto'}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {RELATION_TYPE_LABELS[rel.relation_type] ?? rel.relation_type}
                        {rel.related_document?.mime_type ? ` · ${rel.related_document.mime_type.split('/')[1]?.toUpperCase()}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {rel.related_document?.id ? (
                      <button
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-white"
                        type="button"
                        onClick={() => downloadDocument(rel.related_document.id, rel.related_document.drive_file_name || rel.related_document.title)}
                      >
                        <Download size={13} />
                        Descargar
                      </button>
                    ) : null}
                    {rel.related_document?.drive_web_view_link ? (
                      <a
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-white"
                        href={rel.related_document.drive_web_view_link}
                        target="_blank"
                        rel="noreferrer"
                        title="Abrir en Drive"
                      >
                        <ExternalLink size={13} />
                        Drive
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>

      ) : null}

      <UploadRelatedModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onConfirm={handleUploadRelated}
      />
    </section>
  )
}

export default DocumentDetailPage
