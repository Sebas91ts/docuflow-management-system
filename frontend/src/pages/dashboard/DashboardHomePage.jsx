import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getDashboardStats } from '../../api/documents'
import { getApiErrorMessage } from '../../utils/apiError'
import {
  FileText,
  Inbox,
  Clock3,
  CheckCircle2,
  PlusCircle,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  History
} from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const STATUS_LABELS = {
  REGISTERED: { label: 'Registrado', style: 'border-amber-200 bg-amber-50 text-amber-700' },
  DERIVED: { label: 'Derivado', style: 'border-violet-200 bg-violet-50 text-violet-700' },
  IN_PROGRESS: { label: 'En atención', style: 'border-blue-200 bg-blue-50 text-blue-700' },
  ARCHIVED: { label: 'Archivado', style: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  OBSERVED: { label: 'Observado', style: 'border-orange-200 bg-orange-50 text-orange-700' },
}

function DashboardHomePage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    getDashboardStats()
      .then((data) => {
        if (mounted) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(getApiErrorMessage(err, 'No se pudieron cargar las estadísticas'))
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-white shadow-[var(--shadow-app)]">
        <div className="flex flex-col items-center gap-3 text-sm text-[var(--color-muted)]">
          <LoadingSpinner size={36} />
          <p>Cargando resumen del dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-[var(--shadow-app)]">
        <p className="font-semibold">Error al cargar el resumen</p>
        <p className="mt-1 opacity-90">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--color-primary)]/10 bg-gradient-to-r from-[var(--color-primary)] to-indigo-700 p-6 text-white shadow-lg md:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-white/10 blur-xl" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Panel de control</p>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">¡Bienvenido, {currentUser.full_name}!</h1>
          <p className="text-sm text-indigo-100 leading-relaxed max-w-xl">
            Desde este resumen tienes acceso rápido al flujo de tus documentos, asignaciones activas e historial de trazabilidad de la institución.
          </p>
        </div>
      </section>

      {/* Grid de Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Pendientes */}
        <button
          onClick={() => navigate('/dashboard/pending')}
          className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-white p-5 text-left shadow-[var(--shadow-app)] transition hover:border-amber-300 hover:shadow-md group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:scale-110">
            <Inbox size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Pendientes</p>
            <h3 className="mt-0.5 text-2xl font-extrabold text-[var(--color-text)]">{stats?.pending_assignments ?? 0}</h3>
            <p className="text-[10px] text-[var(--color-muted)] mt-0.5 flex items-center gap-1">
              Por resolver <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition" />
            </p>
          </div>
        </button>

        {/* Card 2: En atención */}
        <button
          onClick={() => navigate('/dashboard/pending')}
          className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-white p-5 text-left shadow-[var(--shadow-app)] transition hover:border-blue-300 hover:shadow-md group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-110">
            <Clock3 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">En atención</p>
            <h3 className="mt-0.5 text-2xl font-extrabold text-[var(--color-text)]">{stats?.in_progress_assignments ?? 0}</h3>
            <p className="text-[10px] text-[var(--color-muted)] mt-0.5 flex items-center gap-1">
              Trabajando <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition" />
            </p>
          </div>
        </button>

        {/* Card 3: Total documentos */}
        <button
          onClick={() => navigate('/dashboard/documents')}
          className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-white p-5 text-left shadow-[var(--shadow-app)] transition hover:border-sky-300 hover:shadow-md group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:scale-110">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Total Archivos</p>
            <h3 className="mt-0.5 text-2xl font-extrabold text-[var(--color-text)]">{stats?.total_documents ?? 0}</h3>
            <p className="text-[10px] text-[var(--color-muted)] mt-0.5 flex items-center gap-1">
              En repositorio <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition" />
            </p>
          </div>
        </button>

        {/* Card 4: Finalizados */}
        <button
          onClick={() => navigate('/dashboard/documents')}
          className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-white p-5 text-left shadow-[var(--shadow-app)] transition hover:border-emerald-300 hover:shadow-md group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-110">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Archivados</p>
            <h3 className="mt-0.5 text-2xl font-extrabold text-[var(--color-text)]">{stats?.archived_documents ?? 0}</h3>
            <p className="text-[10px] text-[var(--color-muted)] mt-0.5 flex items-center gap-1">
              Completados <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition" />
            </p>
          </div>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Accesos rápidos / Acciones recomendadas */}
        <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-app)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-primary)]">Accesos Rápidos</h2>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">Acciones clave del sistema documental</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              to="/dashboard/documents/new"
              className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] p-4 transition hover:border-[var(--color-primary)] group"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--color-primary-soft)] p-2 text-[var(--color-primary)]">
                  <PlusCircle size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-[var(--color-text)]">Crear Documento</p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-0.5">Subir principal y relacionados</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-[var(--color-muted)] transition group-hover:translate-x-1" />
            </Link>

            <Link
              to="/dashboard/pending"
              className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] p-4 transition hover:border-[var(--color-primary)] group"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100/50 p-2 text-amber-700">
                  <Inbox size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-[var(--color-text)]">Bandeja de Pendientes</p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-0.5">Marcar atención, derivar o finalizar</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-[var(--color-muted)] transition group-hover:translate-x-1" />
            </Link>

            <Link
              to="/dashboard/trazabilidad"
              className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] p-4 transition hover:border-[var(--color-primary)] group"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-100/50 p-2 text-violet-700">
                  <History size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-[var(--color-text)]">Ver Trazabilidad</p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-0.5">Línea de tiempo global de trámites</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-[var(--color-muted)] transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Últimos documentos registrados */}
        <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-app)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-primary)]">Últimos Documentos</h2>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">Documentos creados recientemente</p>
            </div>
            <Link
              to="/dashboard/documents"
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {stats?.recent_documents && stats.recent_documents.length > 0 ? (
              stats.recent_documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 pr-4 space-y-1">
                    <p className="text-xs font-semibold truncate text-[var(--color-text)]">{d.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted)]">
                      <span>{d.code}</span>
                      <span>•</span>
                      <span>{new Date(d.created_at).toLocaleDateString('es-BO')}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${STATUS_LABELS[d.status]?.style ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {STATUS_LABELS[d.status]?.label ?? d.status}
                    </span>
                    <Link
                      to={`/dashboard/documents/${d.id}`}
                      className="rounded p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-page)] hover:text-[var(--color-primary)]"
                      title="Ver detalle del documento"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[var(--color-muted)]">
                No hay documentos registrados en el sistema.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHomePage
