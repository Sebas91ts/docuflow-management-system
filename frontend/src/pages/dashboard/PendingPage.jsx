import { useState } from 'react'

import {
  attendAssignment,
  archiveAssignment,
  deriveAssignment,
} from '../../api/documents'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FeedbackToast from '../../components/common/FeedbackToast'
import ArchiveModal from '../../components/pending/ArchiveModal'
import DeriveModal from '../../components/pending/DeriveModal'
import PendingCard from '../../components/pending/PendingCard'
import { usePendingAssignments } from '../../hooks/usePendingAssignments'
import { useUsers } from '../../hooks/useUsers'
import { useFeedbackToast } from '../../hooks/useFeedbackToast'
import { getApiErrorMessage } from '../../utils/apiError'

function PendingPage() {
  const { assignments, loading, error, reload } = usePendingAssignments()
  const usersState = useUsers()
  const { toast, showSuccess, showError, clearToast } = useFeedbackToast()

  const [busyId, setBusyId] = useState(null)

  const [deriveModal, setDeriveModal] = useState({ isOpen: false, assignment: null })
  const [archiveModal, setArchiveModal] = useState({ isOpen: false, assignment: null })

  // ── Atender ────────────────────────────────────────────────────────────────
  const handleAttend = async (assignmentId) => {
    setBusyId(assignmentId)
    try {
      await attendAssignment(assignmentId)
      showSuccess('Documento marcado como "En atención"')
      await reload()
    } catch (err) {
      showError(getApiErrorMessage(err, 'No se pudo marcar en atención'))
    } finally {
      setBusyId(null)
    }
  }

  // ── Abrir modal derivar ────────────────────────────────────────────────────
  const handleOpenDerive = (assignment) => {
    setDeriveModal({ isOpen: true, assignment })
  }

  // ── Confirmar derivar ──────────────────────────────────────────────────────
  const handleConfirmDerive = async (payload) => {
    const { assignment } = deriveModal
    setBusyId(assignment.id)
    try {
      await deriveAssignment(assignment.id, payload)
      showSuccess('Documento derivado correctamente')
      setDeriveModal({ isOpen: false, assignment: null })
      await reload()
    } catch (err) {
      showError(getApiErrorMessage(err, 'No se pudo derivar el documento'))
    } finally {
      setBusyId(null)
    }
  }

  // ── Abrir modal archivar ───────────────────────────────────────────────────
  const handleOpenArchive = (assignment) => {
    setArchiveModal({ isOpen: true, assignment })
  }

  // ── Confirmar archivar ─────────────────────────────────────────────────────
  const handleConfirmArchive = async (comment) => {
    const { assignment } = archiveModal
    setBusyId(assignment.id)
    try {
      await archiveAssignment(assignment.id, comment)
      showSuccess('Documento finalizado y archivado correctamente')
      setArchiveModal({ isOpen: false, assignment: null })
      await reload()
    } catch (err) {
      showError(getApiErrorMessage(err, 'No se pudo archivar el documento'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className='space-y-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-app)]'>
      {/* Toast de feedback local (acciones en esta página) */}
      <div className='fixed right-4 top-16 z-50 pointer-events-none lg:right-6 lg:top-6'>
        <FeedbackToast toast={toast} onClose={clearToast} />
      </div>

      {/* Header */}
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
          disabled={loading}
        >
          Refrescar
        </button>
      </div>

      {/* Error de carga */}
      {error ? (
        <div className='rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]'>
          {error}
        </div>
      ) : null}

      {/* Contenido */}
      {loading ? (
        <div className='flex min-h-40 items-center justify-center'>
          <LoadingSpinner size={32} />
        </div>
      ) : assignments.length === 0 ? (
        <div className='rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-page)] px-4 py-10 text-center text-sm text-[var(--color-muted)]'>
          No tienes pendientes asignados por ahora.
        </div>
      ) : (
        <div className='grid gap-4'>
          {assignments.map((assignment) => (
            <PendingCard
              key={assignment.id}
              assignment={assignment}
              busy={busyId === assignment.id}
              onAttend={handleAttend}
              onDerive={handleOpenDerive}
              onArchive={handleOpenArchive}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <DeriveModal
        isOpen={deriveModal.isOpen}
        onClose={() => setDeriveModal({ isOpen: false, assignment: null })}
        onConfirm={handleConfirmDerive}
        users={usersState.users}
        loading={usersState.loading}
      />

      <ArchiveModal
        isOpen={archiveModal.isOpen}
        onClose={() => setArchiveModal({ isOpen: false, assignment: null })}
        onConfirm={handleConfirmArchive}
        documentTitle={archiveModal.assignment?.document?.title ?? ''}
      />
    </section>
  )
}

export default PendingPage
