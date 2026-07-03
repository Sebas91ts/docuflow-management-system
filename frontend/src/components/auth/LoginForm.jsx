import { useState } from 'react'

import { useAuth } from '../../hooks/useAuth'

function LoginForm() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(formData)
    } catch (requestError) {
      const detail = requestError.response?.data?.detail
      setError(detail ?? 'No se pudo iniciar sesion')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--color-text)]" htmlFor="username">
          Usuario
        </label>
        <input
          className="h-11 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary-soft)]"
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--color-text)]" htmlFor="password">
          Contrasena
        </label>
        <input
          className="h-11 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary-soft)]"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      {error ? (
        <p className="rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      <button
        className="flex h-11 w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}

export default LoginForm
