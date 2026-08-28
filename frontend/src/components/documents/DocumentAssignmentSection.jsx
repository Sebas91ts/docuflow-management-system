function DocumentAssignmentSection({ value, onChange, users, loading }) {
  return (
    <div className='w-full space-y-4 rounded-lg border border-[var(--color-border)] bg-(--color-page) p-4'>
      <div className='space-y-1'>
        <p className='text-sm font-semibold text-[var(--color-text)]'>
          Derivación
        </p>
        <p className='text-sm text-[var(--color-muted)]'>
          Completa los datos para guardar el documento y dejarlo asignado a otra
          persona.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-1'>
          <label
            className='text-xs font-medium text-[var(--color-muted)]'
            htmlFor='assigned_to_id'
          >
            Responsable
          </label>
          <select
            id='assigned_to_id'
            className='h-11 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none transition focus:border-[var(--color-primary)]'
            value={value.assignedToId}
            onChange={(event) => onChange('assignedToId', event.target.value)}
            disabled={loading}
          >
            <option value=''>Selecciona un usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.username})
              </option>
            ))}
          </select>
        </div>

        <div className='space-y-1'>
          <label
            className='text-xs font-medium text-[var(--color-muted)]'
            htmlFor='assignment_due_date'
          >
            Fecha de vencimiento (Opcional)
          </label>
          <input
            id='assignment_due_date'
            className='h-11 w-full rounded-md border border-[var(--color-border)] px-3 text-sm outline-none transition focus:border-[var(--color-primary)]'
            type='date'
            value={value.dueDate}
            onChange={(event) => onChange('dueDate', event.target.value)}
          />
        </div>

        <div className='md:col-span-2 space-y-1'>
          <label
            className='text-xs font-medium text-[var(--color-muted)]'
            htmlFor='assignment_message'
          >
            Mensaje de derivación
          </label>
          <textarea
            id='assignment_message'
            className='min-h-24 w-full bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]'
            value={value.message}
            onChange={(event) => onChange('message', event.target.value)}
            placeholder='Agrega una indicación breve para la persona responsable'
          />
        </div>
      </div>
    </div>
  )
}

export default DocumentAssignmentSection
