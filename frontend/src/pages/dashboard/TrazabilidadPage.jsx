import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock3, Search, FileText, ChevronRight } from 'lucide-react'

import { getDocument, getDocuments, getDocumentTimeline } from '../../api/documents'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DocumentTimeline from '../../components/documents/DocumentTimeline'
import { getApiErrorMessage } from '../../utils/apiError'

const STATUS_META = {
  REGISTERED: { label: 'Registrado', className: 'border-sky-200 bg-sky-50 text-sky-700' },
  DERIVED: { label: 'Derivado', className: 'border-violet-200 bg-violet-50 text-violet-700' },
  ARCHIVED: { label: 'Archivado', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  IN_PROGRESS: { label: 'En atención', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  OBSERVED: { label: 'Observado', className: 'border-orange-200 bg-orange-50 text-orange-700' },
  LOGICALLY_DELETED: { label: 'Eliminado', className: 'border-rose-200 bg-rose-50 text-rose-700' },
}

function TrazabilidadPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Estado si hay ID de documento seleccionado
  const [documentInfo, setDocumentInfo] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [error, setError] = useState('')

  // Estado si no hay ID de documento seleccionado (lista general de búsqueda)
  const [documents, setDocuments] = useState([])
  const [search, setSearch] = useState('')
  const [listLoading, setListLoading] = useState(false)

  // ── Efecto para Cargar Trazabilidad de un Documento Específico ─────────────
  useEffect(() => {
    if (!id) return
    let mounted = true

    const loadTimelineData = async () => {
      setTimelineLoading(true)
      setError('')
      try {
        const [docData, timelineData] = await Promise.all([
          getDocument(id),
          getDocumentTimeline(id),
        ])
        if (mounted) {
          setDocumentInfo(docData)
          setTimeline(timelineData)
        }
      } catch (err) {
        if (mounted) {
          setError(getApiErrorMessage(err, 'No se pudo cargar la trazabilidad del documento'))
        }
      } finally {
        if (mounted) {
          setTimelineLoading(false)
        }
      }
    }

    void loadTimelineData()
    return () => { mounted = false }
  }, [id])

  // ── Efecto para Cargar la Lista de Documentos en Vista General ──────────────
  useEffect(() => {
    if (id) return
    let mounted = true

    const loadDocumentsList = async () => {
      setListLoading(true)
      try {
        const data = await getDocuments(search ? { search } : {})
        if (mounted) {
          setDocuments(data)
        }
      } catch (err) {
        console.error('Error al cargar documentos:', err)
      } finally {
        if (mounted) {
          setListLoading(false)
        }
      }
    }

    // Debounce simple para la búsqueda
    const timer = setTimeout(() => {
      void loadDocumentsList()
    }, 300)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [id, search])

  // ── Renderizado con ID seleccionado (Detalle de Trazabilidad) ───────────────
  if (id) {
    return (
      <section className='mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-app)]'>
          <div className='flex items-center gap-3'>
            <div className='rounded-md bg-[var(--color-primary-soft)] p-2.5 text-[var(--color-primary)]'>
              <Clock3 size={20} />
            </div>
            <div>
              <p className='text-sm font-semibold text-[var(--color-primary)]'>Trazabilidad</p>
              <h1 className='mt-1 text-2xl font-bold'>Historial de eventos</h1>
            </div>
          </div>
          <button
            className='inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold transition hover:border-[var(--color-primary)] bg-[var(--color-surface)]'
            type='button'
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        </div>

        {timelineLoading ? (
          <div className='flex min-h-[320px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-app)]'>
            <div className='flex flex-col items-center gap-3 text-sm text-[var(--color-muted)]'>
              <LoadingSpinner size={32} />
              <p>Cargando trazabilidad...</p>
            </div>
          </div>
        ) : error ? (
          <div className='rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
            {error}
          </div>
        ) : documentInfo ? (
          <div className='grid gap-6 lg:grid-cols-[1.5fr_1fr]'>
            {/* Columna Izquierda: La Línea de Tiempo */}
            <div className='rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-app)]'>
              <DocumentTimeline events={timeline} loading={false} />
            </div>

            {/* Columna Derecha: Tarjeta informativa rápida del documento */}
            <div className='rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-app)] self-start space-y-4'>
              <h3 className='text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wider'>
                Detalles del documento
              </h3>
              <div className='flex items-start gap-3 border-b border-[var(--color-border)] pb-4'>
                <div className='rounded bg-[var(--color-page)] p-2 text-[var(--color-primary)]'>
                  <FileText size={20} />
                </div>
                <div className='min-w-0'>
                  <p className='text-xs font-mono text-[var(--color-muted)]'>{documentInfo.code}</p>
                  <p className='font-semibold text-sm truncate'>{documentInfo.title}</p>
                </div>
              </div>

              <div className='space-y-3 text-sm'>
                <div>
                  <p className='text-xs text-[var(--color-muted)]'>Estado actual</p>
                  <span className={`inline-flex mt-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_META[documentInfo.status]?.className || ''}`}>
                    {STATUS_META[documentInfo.status]?.label || documentInfo.status}
                  </span>
                </div>
                <div>
                  <p className='text-xs text-[var(--color-muted)]'>Responsable actual</p>
                  <p className='font-medium text-sm mt-0.5'>
                    {documentInfo.current_responsible?.full_name || 'Sin responsable asignado'}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-[var(--color-muted)]'>Subido por</p>
                  <p className='font-medium text-sm mt-0.5'>{documentInfo.uploaded_by?.full_name}</p>
                </div>
              </div>

              <div className='pt-2 border-t border-[var(--color-border)]'>
                <Link
                  className='inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-xs font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-[var(--color-surface)]'
                  to={`/dashboard/documents/${documentInfo.id}`}
                >
                  Ver detalle completo
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    )
  }

  // ── Renderizado sin ID (Buscador y Selección de Trazabilidad) ──────────────
  return (
    <section className='mx-auto space-y-6'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-app)]'>
        <div className='flex items-center gap-3'>
          <div className='rounded-md bg-[var(--color-primary-soft)] p-2.5 text-[var(--color-primary)]'>
            <Clock3 size={20} />
          </div>
          <div>
            <p className='text-sm font-semibold text-[var(--color-primary)]'>Trazabilidad</p>
            <h1 className='mt-1 text-2xl font-bold'>Buscador de Trazabilidad</h1>
          </div>
        </div>

        {/* Buscador */}
        <div className='relative w-full max-w-xs'>
          <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]' />
          <input
            type='text'
            className='h-10 w-full rounded-md border border-[var(--color-border)] pl-9 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]'
            placeholder='Buscar por código o título...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className='rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-app)]'>
        <h2 className='text-lg font-bold mb-4'>Selecciona un documento para ver su trazabilidad</h2>

        {listLoading ? (
          <div className='flex min-h-40 items-center justify-center'>
            <LoadingSpinner size={32} />
          </div>
        ) : documents.length === 0 ? (
          <div className='rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-page)] py-10 text-center text-sm text-[var(--color-muted)]'>
            No se encontraron documentos registrados.
          </div>
        ) : (
          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
            {documents.map((doc) => (
              <article
                key={doc.id}
                className='flex flex-col justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4 transition hover:border-[var(--color-primary)]'
              >
                <div>
                  <div className='flex items-start gap-2.5'>
                    <FileText size={18} className='text-[var(--color-primary)] shrink-0 mt-0.5' />
                    <div className='min-w-0'>
                      <p className='text-xs font-mono text-[var(--color-muted)]'>{doc.code}</p>
                      <h3 className='font-semibold text-sm truncate mt-0.5' title={doc.title}>
                        {doc.title}
                      </h3>
                    </div>
                  </div>
                  <p className='mt-2 line-clamp-2 text-xs text-[var(--color-muted)] leading-relaxed'>
                    {doc.description || 'Sin descripción'}
                  </p>
                </div>

                <div className='mt-4 flex items-center justify-between border-t border-[var(--color-border)]/40 pt-3'>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_META[doc.status]?.className || ''}`}>
                    {STATUS_META[doc.status]?.label || doc.status}
                  </span>
                  <Link
                    to={`/dashboard/trazabilidad/${doc.id}`}
                    className='inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline'
                  >
                    Ver trazabilidad
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default TrazabilidadPage
