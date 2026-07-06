import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

function PublicRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-page)] text-[var(--color-text)]">
        <p className="text-sm font-medium text-[var(--color-muted)]">Cargando sesion...</p>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  return <Outlet />
}

export default PublicRoute
