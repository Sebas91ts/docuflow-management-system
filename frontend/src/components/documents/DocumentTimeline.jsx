import {
  Archive,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Send,
  Upload,
  Paperclip,
} from 'lucide-react'

// Mapa de acciones del backend a presentación visual
const ACTION_META = {
  ASSIGNED: {
    label: 'Documento derivado',
    Icon: Send,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  MARKED_IN_PROGRESS: {
    label: 'Tomado en atención',
    Icon: Clock3,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  DERIVED: {
    label: 'Re-derivado a otro usuario',
    Icon: ArrowRight,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
  },
  ARCHIVED: {
    label: 'Finalizado y archivado',
    Icon: Archive,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  UPLOADED: {
    label: 'Documento registrado',
    Icon: Upload,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  RELATED_DOCUMENT_ADDED: {
    label: 'Documento relacionado adjuntado',
    Icon: Paperclip,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
  },
}

const DEFAULT_META = {
  label: 'Evento del sistema',
  Icon: FileText,
  color: 'text-[var(--color-muted)]',
  bg: 'bg-[var(--color-page)]',
  border: 'border-[var(--color-border)]',
  dot: 'bg-[var(--color-muted)]',
}

const STATUS_LABELS = {
  REGISTERED: 'Registrado',
  DERIVED: 'Derivado',
  IN_PROGRESS: 'En atención',
  ARCHIVED: 'Archivado',
  OBSERVED: 'Observado',
  LOGICALLY_DELETED: 'Eliminado',
}

function formatEventDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function UserAvatar({ user, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'
  if (!user) return null
  return (
    <div
      className={`${sizeClass} shrink-0 rounded-full bg-[var(--color-primary)] font-semibold text-white flex items-center justify-center`}
      title={user.full_name}
    >
      {getInitials(user.full_name)}
    </div>
  )
}

function TimelineEvent({ event, isLast }) {
  const meta = ACTION_META[event.action] ?? DEFAULT_META
  const { Icon } = meta

  return (
    <div className='relative flex gap-4'>
      {/* Línea vertical conectora */}
      {!isLast && (
        <div className='absolute left-[19px] top-10 bottom-0 w-0.5 bg-[var(--color-border)]' />
      )}

      {/* Icono del evento */}
      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${meta.border} ${meta.bg}`}
      >
        <Icon size={16} className={meta.color} />
      </div>

      {/* Contenido */}
      <div className='flex-1 pb-6'>
        <div className={`rounded-xl border ${meta.border} ${meta.bg} px-4 py-3`}>
          {/* Header del evento */}
          <div className='flex flex-wrap items-start justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <UserAvatar user={event.user} size='sm' />
              <div>
                <p className={`text-sm font-semibold ${meta.color}`}>{meta.label}</p>
                <p className='text-xs text-[var(--color-muted)]'>
                  por{' '}
                  <span className='font-medium text-[var(--color-text)]'>
                    {event.user?.full_name ?? 'Sistema'}
                  </span>
                </p>
              </div>
            </div>
            <time className='text-xs text-[var(--color-muted)] whitespace-nowrap'>
              {formatEventDate(event.created_at)}
            </time>
          </div>

          {/* Cambio de responsable */}
          {event.new_responsible && (
            <div className='mt-2 flex items-center gap-1.5 text-xs text-[var(--color-muted)]'>
              <span>Para:</span>
              <UserAvatar user={event.new_responsible} size='sm' />
              <span className='font-medium text-[var(--color-text)]'>
                {event.new_responsible.full_name}
              </span>
            </div>
          )}

          {/* Cambio de estado */}
          {event.previous_status && event.new_status && event.previous_status !== event.new_status && (
            <div className='mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]'>
              <span className='rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 font-medium'>
                {STATUS_LABELS[event.previous_status] ?? event.previous_status}
              </span>
              <ArrowRight size={11} />
              <span className={`rounded-full border ${meta.border} ${meta.bg} px-2 py-0.5 font-medium ${meta.color}`}>
                {STATUS_LABELS[event.new_status] ?? event.new_status}
              </span>
            </div>
          )}

          {/* Comentario / consigna */}
          {event.comment && (
            <p className='mt-2 rounded-lg border border-white/60 bg-white/60 px-3 py-2 text-xs text-[var(--color-text)] leading-relaxed'>
              💬 {event.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function DocumentTimeline({ events = [], loading = false }) {
  if (loading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='flex gap-4'>
            <div className='h-10 w-10 shrink-0 animate-pulse rounded-full bg-[var(--color-page)]' />
            <div className='flex-1 space-y-2 py-1'>
              <div className='h-4 w-3/4 animate-pulse rounded bg-[var(--color-page)]' />
              <div className='h-3 w-1/2 animate-pulse rounded bg-[var(--color-page)]' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className='rounded-lg border border-dashed border-[var(--color-border)] py-8 text-center text-sm text-[var(--color-muted)]'>
        Sin eventos registrados aún.
      </div>
    )
  }

  // Mostrar del más reciente al más antiguo
  const sorted = [...events].reverse()

  return (
    <div className='space-y-0'>
      {/* Indicador de estado actual */}
      <div className='mb-5 flex items-center gap-2'>
        <CheckCircle2 size={15} className='text-emerald-500' />
        <p className='text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider'>
          Historial de trazabilidad
        </p>
        <span className='ml-auto text-xs text-[var(--color-muted)]'>{events.length} evento{events.length !== 1 ? 's' : ''}</span>
      </div>
      {sorted.map((event, index) => (
        <TimelineEvent
          key={event.id}
          event={event}
          isLast={index === sorted.length - 1}
        />
      ))}
    </div>
  )
}

export default DocumentTimeline
