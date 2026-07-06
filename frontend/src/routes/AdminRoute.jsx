import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

function AdminRoute() {
  const { currentUser, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-page)] text-[var(--color-text)]">
        <p className="text-sm font-medium text-[var(--color-muted)]">Cargando sesion...</p>
      </main>
    )
  }

  if (currentUser?.role !== 'admin') {
    return <Navigate replace to="/dashboard" state={{ from: location }} />
  }

  return <Outlet />
}

export default AdminRoute
