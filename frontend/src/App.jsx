import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'

function App() {
  const { currentUser, isBootstrapping, logout } = useAuth()

  if (isBootstrapping) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-page)] text-[var(--color-text)]">
        <p className="text-sm font-medium text-[var(--color-muted)]">Cargando sesion...</p>
      </main>
    )
  }

  if (currentUser) {
    return (
      <main className="min-h-screen bg-[var(--color-page)] p-8 text-[var(--color-text)]">
        <section className="mx-auto max-w-5xl rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-primary)]">Sesion activa</p>
              <h1 className="mt-2 text-2xl font-bold">Bienvenido, {currentUser.full_name}</h1>
            </div>
            <button
              className="h-10 rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              type="button"
              onClick={logout}
            >
              Cerrar sesion
            </button>
          </div>
        </section>
      </main>
    )
  }

  return <LoginPage />
}

export default App
