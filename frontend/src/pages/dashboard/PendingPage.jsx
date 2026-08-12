import { CalendarDays, Clock3, FileText, UserRound } from 'lucide-react'

import LoadingSpinner from '../../components/common/LoadingSpinner'
import { usePendingAssignments } from '../../hooks/usePendingAssignments'

function PendingPage() {
  const { assignments, loading, error, reload } = usePendingAssignments()

  return (
    <section className='space-y-5 rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-semibold text-[var(--color-primary)]'>
            Pendientes
          </p>
          <h1 className='mt-1 text-2xl font-bold'>Bandeja de pendientes</h1>
        </div>
        <button
          className='rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-page)]'
          type='button'
          onClick={reload}
        >
          Refrescar
        </button>
      </div>

      {error ? (
        <div className='rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]'>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className='flex min-h-40 items-center justify-center'>
          <LoadingSpinner size={32} />
        </div>
      ) : assignments.length === 0 ? (
        <div className='rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-page)] px-4 py-8 text-center text-sm text-[var(--color-muted)]'>
          No tienes pendientes asignados por ahora.
        </div>
      ) : (
        <div className='grid gap-4'>
          {assignments.map((assignment) => (
            <article
              key={assignment.id}
              className='rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4 transition hover:border-[var(--color-primary)]'
            >
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]'>
                    <FileText size={16} />
                    {assignment.document?.title ?? 'Documento sin título'}
                  </p>
                  <p className='mt-1 text-xs text-[var(--color-muted)]'>
                    {assignment.document?.code ?? ''}
                  </p>
                </div>
                <span className='rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]'>
                  Pendiente
                </span>
              </div>

              <div className='mt-4 grid gap-3 text-sm text-[var(--color-muted)] md:grid-cols-3'>
                <p className='flex items-center gap-2'>
                  <UserRound size={15} />
                  {assignment.assigned_by?.full_name ?? 'Sin remitente'}
                </p>
                <p className='flex items-center gap-2'>
                  <Clock3 size={15} />
                  {assignment.due_date ?? 'Sin vencimiento'}
                </p>
                <p className='flex items-center gap-2'>
                  <CalendarDays size={15} />
                  {new Date(assignment.created_at).toLocaleString('es-BO')}
                </p>
              </div>

              {assignment.message ? (
                <p className='mt-4 rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)]'>
                  {assignment.message}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default PendingPage
