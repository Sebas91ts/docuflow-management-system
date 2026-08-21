import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Archive,
  CalendarDays,
  Clock3,
  Download,
  Eye,
  FileText,
  RefreshCcw,
  UserRound,
} from 'lucide-react'
import { downloadDocument } from '../../api/documents'

const statusLabel = {
  PENDING: { text: 'Pendiente', style: 'bg-amber-100 text-amber-700' },
  IN_PROGRESS: { text: 'En atención', style: 'bg-blue-100 text-blue-700' },
}

function PendingCard({ assignment, onAttend, onDerive, onArchive, busy = false }) {
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)

  const doc = assignment.document ?? {}
  const statusInfo = statusLabel[assignment.status] ?? statusLabel.PENDING

  const handleViewDetail = () => {
    navigate(`/dashboard/documents/${doc.id}`)
  }

  const handleDownload = async () => {
    console.log("documento:", doc);
    if (!doc.id) return
    setDownloading(true)
    try {
      await downloadDocument(doc.id, doc.drive_file_name || doc.title || 'documento')
    } catch {
      // Si falla la descarga directa, abrir en Drive como fallback
      if (doc.drive_web_view_link) {
        window.open(doc.drive_web_view_link, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setDownloading(false)
    }
  }

  return (
    <article className='rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-app)] transition hover:border-[var(--color-primary)]/50 hover:shadow-md'>
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
        <span
          className={[
            'rounded-full px-3 py-1 text-xs font-semibold',
            statusInfo.style,
          ].join(' ')}
        >
          {statusInfo.text}
        </span>
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
          className='inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50 bg-white'
          type='button'
          onClick={() => navigate(`/dashboard/trazabilidad/${doc.id}`)}
          disabled={busy || !doc.id}
          title='Ver trazabilidad del documento'
        >
          <Clock3 size={13} />
          Ver trazabilidad
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
          disabled={assignment.status != "IN_PROGRESS"}
          title={assignment.status != "IN_PROGRESS" ? "Debe marcar en atención primero" : "Pasar este documento a otro usuario"}
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
          disabled={assignment.status != "IN_PROGRESS"}
          title={assignment.status != "IN_PROGRESS" ? "Debe marcar en atención primero" : "Finalizar y archivar este documento"}
        >
          <Archive size={13} />
          Finalizar
        </button>
      </div>
    </article>
  )
}

export default PendingCard
