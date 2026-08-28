import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Archive,
  CalendarDays,
  Clock3,
  Download,
  Eye,
  ExternalLink,
  FileText,
  RefreshCcw,
  UserRound,
  Paperclip,
} from 'lucide-react'
import { downloadDocument, getRelatedDocuments, uploadRelatedDocument } from '../../api/documents'
import UploadRelatedModal from '../documents/UploadRelatedModal'
import ActionModal from '../common/ActionModal'
import FeedbackToast from '../common/FeedbackToast'
import LoadingSpinner from '../common/LoadingSpinner'
import { useFeedbackToast } from '../../hooks/useFeedbackToast'
import { getApiErrorMessage } from '../../utils/apiError'

const statusLabel = {
  PENDING: { text: 'Pendiente', style: 'bg-amber-100 text-amber-700' },
  IN_PROGRESS: { text: 'En atención', style: 'bg-blue-100 text-blue-700' },
}

const RELATION_TYPE_LABELS = {
  attachment: 'Anexo',
  response: 'Respuesta',
  backup: 'Respaldo',
}

function PendingCard({ assignment, onAttend, onDerive, onArchive, busy = false }) {
  const navigate = useNavigate()
  const { toast, showSuccess, showError, clearToast } = useFeedbackToast()
  const [downloading, setDownloading] = useState(false)
  const [relatedDocs, setRelatedDocs] = useState([])
  const [relatedOpen, setRelatedOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadingRelated, setUploadingRelated] = useState(false)
  const [resultModal, setResultModal] = useState({ isOpen: false, type: 'success', title: '', message: '' })

  const doc = assignment.document ?? {}
  const statusInfo = statusLabel[assignment.status] ?? statusLabel.PENDING

  // Cargar documentos relacionados cuando se abre la tarjeta
  useEffect(() => {
    if (!doc.id) return
    let mounted = true
    getRelatedDocuments(doc.id)
      .then((data) => { if (mounted) setRelatedDocs(data) })
      .catch(() => {})
    return () => { mounted = false }
  }, [doc.id])

  const handleViewDetail = () => {
    navigate(`/dashboard/documents/${doc.id}`)
  }

  const handleDownload = async () => {
    if (!doc.id) return
    setDownloading(true)
    try {
      await downloadDocument(doc.id, doc.drive_file_name || doc.title || 'documento')
    } catch {
      if (doc.drive_web_view_link) {
        window.open(doc.drive_web_view_link, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setDownloading(false)
    }
  }

  const handleUploadRelated = async (payload) => {
    if (!doc.id) return
    setUploadingRelated(true)
    try {
      const newDoc = await uploadRelatedDocument(doc.id, payload)
      setRelatedDocs((prev) => [...prev, { id: newDoc.id, related_document: newDoc, relation_type: payload.relation_type }])
      setUploadModalOpen(false)
      showSuccess('Archivo adjuntado correctamente')
      setResultModal({ isOpen: true, type: 'success', title: 'Adjunto guardado', message: 'El archivo fue adjuntado y vinculado al documento correctamente.' })
    } catch (err) {
      const message = getApiErrorMessage(err, 'No se pudo adjuntar el archivo')
      showError(message)
      setResultModal({ isOpen: true, type: 'error', title: 'Error al adjuntar', message })
    } finally {
      setUploadingRelated(false)
    }
  }

  return (
    <>
      {/* Toast global para esta tarjeta */}
      <div className='fixed right-4 top-16 z-[60] lg:right-6 lg:top-6'>
        <FeedbackToast toast={toast} onClose={clearToast} />
      </div>

      {/* Spinner de carga al adjuntar */}
      {uploadingRelated ? (
        <div className='fixed inset-0 z-[55] flex items-center justify-center'>
          <div className='absolute inset-0 bg-black/25 backdrop-blur-[2px]' />
          <div className='relative flex flex-col items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-7 shadow-2xl'>
            <LoadingSpinner size={120} />
            <p className='text-sm font-medium text-[var(--color-muted)]'>Adjuntando archivo...</p>
          </div>
        </div>
      ) : null}

      <UploadRelatedModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onConfirm={handleUploadRelated}
      />

      <ActionModal
        isOpen={resultModal.isOpen}
        type={resultModal.type}
        title={resultModal.title}
        message={resultModal.message}
        onClose={() => setResultModal({ isOpen: false, type: 'success', title: '', message: '' })}
      />

      <article className='rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-app)] transition hover:border-[var(--color-primary)]/50 hover:shadow-md'>
        {/* Header */}
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]'>
              <FileText size={15} className='shrink-0 text-[var(--color-primary)]' />
              {doc.title ?? 'Documento sin título'}
            </p>
            <p className='mt-0.5 text-xs text-[var(--color-muted)]'>
              {doc.code ?? ''}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {relatedDocs.length > 0 ? (
              <button
                type='button'
                className='inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-violet-700 transition hover:bg-violet-100'
                onClick={() => setRelatedOpen((v) => !v)}
                title='Ver documentos relacionados'
              >
                <Paperclip size={10} />
                {relatedDocs.length} {relatedDocs.length === 1 ? 'adjunto' : 'adjuntos'}
              </button>
            ) : null}
            <span className={['rounded-full px-3 py-1 text-xs font-semibold', statusInfo.style].join(' ')}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className='mt-4 grid gap-2 text-xs text-[var(--color-muted)] sm:grid-cols-3'>
          <p className='flex items-center gap-1.5'>
            <UserRound size={13} />
            De: {assignment.assigned_by?.full_name ?? 'Sin remitente'}
          </p>
          <p className='flex items-center gap-1.5'>
            <Clock3 size={13} />
            {assignment.due_date ? `Vence: ${assignment.due_date}` : 'Sin vencimiento'}
          </p>
          <p className='flex items-center gap-1.5'>
            <CalendarDays size={13} />
            {new Date(assignment.created_at).toLocaleString('es-BO')}
          </p>
        </div>

        {/* Consigna */}
        {assignment.message ? (
          <p className='mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-3 py-2 text-xs text-[var(--color-text)] leading-relaxed'>
            {assignment.message}
          </p>
        ) : null}

        {/* Documentos relacionados expandibles */}
        {relatedOpen && relatedDocs.length > 0 ? (
          <div className='mt-3 space-y-1.5 rounded-lg border border-violet-100 bg-violet-50/40 p-3'>
            <p className='text-[10px] font-semibold uppercase tracking-wider text-violet-600 mb-2'>
              Documentos adjuntos / relacionados
            </p>
            {relatedDocs.map((rel) => (
              <div
                key={rel.id ?? rel.related_document?.id}
                className='flex items-center justify-between gap-2 rounded-md bg-[var(--color-surface)] border border-violet-100 px-3 py-2'
              >
                <div className='min-w-0'>
                  <p className='text-xs font-medium truncate'>
                    {rel.related_document?.title ?? 'Adjunto'}
                  </p>
                  <p className='text-[10px] text-[var(--color-muted)]'>
                    {RELATION_TYPE_LABELS[rel.relation_type] ?? rel.relation_type}
                  </p>
                </div>
                <div className='flex shrink-0 items-center gap-1'>
                  {rel.related_document?.id ? (
                    <button
                      className='rounded p-1.5 text-[var(--color-primary)] transition hover:bg-violet-100'
                      type='button'
                      title='Descargar adjunto'
                      onClick={() => downloadDocument(rel.related_document.id, rel.related_document.drive_file_name || rel.related_document.title)}
                    >
                      <Download size={12} />
                    </button>
                  ) : null}
                  {rel.related_document?.drive_web_view_link ? (
                    <a
                      className='rounded p-1.5 text-[var(--color-muted)] transition hover:bg-violet-100 hover:text-[var(--color-primary)]'
                      href={rel.related_document.drive_web_view_link}
                      target='_blank'
                      rel='noreferrer'
                      title='Abrir en Drive'
                    >
                      <ExternalLink size={12} />
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Acciones */}
        <div className='mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-4'>
          {/* Ver detalle */}
          <button
            id={`btn-view-${assignment.id}`}
            className='inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50'
            type='button'
            onClick={handleViewDetail}
            disabled={busy}
            title='Ver detalle del documento'
          >
            <Eye size={13} />
            Ver detalle
          </button>

          {/* Ver trazabilidad */}
          <button
            id={`btn-timeline-${assignment.id}`}
            className='inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50'
            type='button'
            onClick={() => navigate(`/dashboard/trazabilidad/${doc.id}`)}
            disabled={busy || !doc.id}
            title='Ver trazabilidad del documento'
          >
            <Clock3 size={13} />
            Trazabilidad
          </button>

          {/* Descargar */}
          <button
            id={`btn-download-${assignment.id}`}
            className='inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed'
            type='button'
            onClick={handleDownload}
            disabled={busy || downloading || !doc.id}
            title='Descargar archivo directamente'
          >
            <Download size={13} />
            {downloading ? 'Descargando...' : 'Descargar'}
          </button>

          {/* Adjuntar anexo — solo cuando está EN ATENCIÓN */}
          {assignment.status === 'IN_PROGRESS' ? (
            <button
              id={`btn-attach-${assignment.id}`}
              className='inline-flex items-center gap-1.5 rounded-md border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed'
              type='button'
              onClick={() => setUploadModalOpen(true)}
              disabled={busy || uploadingRelated}
              title='Adjuntar un documento de respaldo o respuesta'
            >
              <Paperclip size={13} />
              Adjuntar anexo
            </button>
          ) : null}

          <div className='flex-1' />

          {/* Atender */}
          {assignment.status === 'PENDING' ? (
            <button
              id={`btn-attend-${assignment.id}`}
              className='inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed'
              type='button'
              onClick={() => onAttend(assignment.id)}
              disabled={busy}
              title='Marcar que estás trabajando en este documento'
            >
              <Clock3 size={13} />
              Atender
            </button>
          ) : null}

          {/* Derivar */}
          <button
            id={`btn-derive-${assignment.id}`}
            className='inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-page)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed'
            type='button'
            onClick={() => onDerive(assignment)}
            disabled={assignment.status !== 'IN_PROGRESS'}
            title={assignment.status !== 'IN_PROGRESS' ? 'Debe marcar en atención primero' : 'Pasar este documento a otro usuario'}
          >
            <RefreshCcw size={13} />
            Derivar
          </button>

          {/* Finalizar */}
          <button
            id={`btn-archive-${assignment.id}`}
            className='inline-flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed'
            type='button'
            onClick={() => onArchive(assignment)}
            disabled={assignment.status !== 'IN_PROGRESS'}
            title={assignment.status !== 'IN_PROGRESS' ? 'Debe marcar en atención primero' : 'Finalizar y archivar este documento'}
          >
            <Archive size={13} />
            Finalizar
          </button>
        </div>
      </article>
    </>
  )
}

export default PendingCard
