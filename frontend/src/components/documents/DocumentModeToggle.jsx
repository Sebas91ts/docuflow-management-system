function DocumentModeToggle({ value, onChange }) {
  const options = [
    {
      value: 'archive',
      label: 'Guardar y archivar',
      description: 'El documento se registra y queda archivado.',
    },
    {
      value: 'derive',
      label: 'Derivar después',
      description: 'Se registra el documento y queda listo para el flujo de derivación.',
    },
  ]

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Acción inicial</label>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Decide qué hacer con el documento apenas se registre.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isActive = value === option.value

          return (
            <label
              key={option.value}
              className={[
                'cursor-pointer rounded-lg border p-4 transition',
                isActive
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                  : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]',
              ].join(' ')}
            >
              <input
                className="sr-only"
                type="radio"
                name="submissionMode"
                value={option.value}
                checked={isActive}
                onChange={onChange}
              />
              <div className="text-sm font-semibold">{option.label}</div>
              <div className="mt-1 text-sm text-[var(--color-muted)]">{option.description}</div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default DocumentModeToggle
