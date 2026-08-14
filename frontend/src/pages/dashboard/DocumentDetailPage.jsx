import { ArrowLeft, ExternalLink, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import LoadingSpinner from '../../components/common/LoadingSpinner'
import { getDocument } from '../../api/documents'
import { getApiErrorMessage } from '../../utils/apiError'

const STATUS_META = {
  REGISTERED: {
    label: 'Registrado',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  ARCHIVED: {
    label: 'Archivado',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  IN_PROGRESS: {
    label: 'En proceso',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  LOGICALLY_DELETED: {
    label: 'Eliminado lógicamente',
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
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadDocument = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getDocument(id)
        if (mounted) {
          setDocument(data)
        }
      } catch (requestError) {
        if (mounted) {
          setError(getApiErrorMessage(requestError, 'No se pudo cargar el documento'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadDocument()

    return () => {
      mounted = false
    }
  }, [id])

  const statusMeta = document ? STATUS_META[document.status] || STATUS_META.REGISTERED : STATUS_META.REGISTERED

  return (
    <section className="mx-auto space-y-6">
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
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-[var(--color-page)] p-3 text-[var(--color-primary)]">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted)]">{document.code}</p>
                  <h2 className="mt-1 text-2xl font-bold">{document.title}</h2>
                </div>
              </div>
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Descripcion</p>
                <p className="mt-1 text-sm text-[var(--color-text)]">
                  {document.description || 'Sin descripcion'}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Carpeta</p>
                <p className="mt-1 text-sm text-[var(--color-text)]">
                  {document.folder?.path || document.drive_folder_path || 'Sin carpeta'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]">
            <h3 className="text-sm font-semibold text-[var(--color-primary)]">Informacion</h3>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Subido por</p>
                <p className="mt-1 font-medium">{document.uploaded_by?.full_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Responsable</p>
                <p className="mt-1 font-medium">{document.current_responsible?.full_name || 'Sin asignar'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Fecha de registro</p>
                <p className="mt-1 font-medium">{formatDate(document.created_at)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Fecha de actualizacion</p>
                <p className="mt-1 font-medium">{formatDate(document.updated_at)}</p>
              </div>
              {document.drive_web_view_link ? (
                <a
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
                  href={document.drive_web_view_link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={16} />
                  Abrir archivo
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default DocumentDetailPage
