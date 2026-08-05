import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Inbox,
  Users,
  ScrollText,
  LogOut
} from 'lucide-react'

import { useAuth } from '../hooks/useAuth'

const navigationItems = [
  { label: 'Resumen', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Crear documento', to: '/dashboard/documents/new', icon: FileText },
  { label: 'Ver documentos', to: '/dashboard/documents', icon: FileText },
  { label: 'Pendientes', to: '/dashboard/pending', icon: Inbox },
  { label: 'Auditoria', to: '/dashboard/audit', icon: ScrollText }
]

const adminNavigationItems = [
  { label: 'Usuarios', to: '/dashboard/users', icon: Users }
]

function DashboardLayout() {
  const { currentUser, logout } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  return (
    <div className='flex h-screen overflow-hidden bg-[var(--color-page)] text-[var(--color-text)]'>
      <aside className='flex h-screen w-72 shrink-0 flex-col border-r border-[var(--color-border)] bg-white'>
        <div className='border-b border-[var(--color-border)] px-6 py-6'>
          <p className='text-sm font-semibold text-[var(--color-primary)]'>
            DocuFlow
          </p>
          <h2 className='mt-1 text-lg font-bold'>Panel principal</h2>
          <p className='mt-2 text-sm text-[var(--color-muted)]'>
            {currentUser.full_name}
          </p>
        </div>

        <nav className='flex-1 px-3 py-4'>
          <div className='space-y-1'>
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-primary-soft)]'
                  ].join(' ')
                }
              >
                <item.icon size={18} strokeWidth={2.2} className='shrink-0' />
                {item.label}
              </NavLink>
            ))}
          </div>

          {isAdmin ? (
            <div className='mt-6'>
              <p className='px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]'>
                Administracion
              </p>
              <div className='mt-2 space-y-1'>
                {adminNavigationItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                        isActive
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-primary-soft)]'
                      ].join(' ')
                    }
                  >
                    <item.icon
                      size={18}
                      strokeWidth={2.2}
                      className='shrink-0'
                    />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ) : null}
        </nav>

        <div className='border-t border-[var(--color-border)] px-4 py-4'>
          <button
            className='flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            type='button'
            onClick={logout}
          >
            <LogOut size={16} strokeWidth={2.2} />
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className='flex-1 overflow-y-auto p-8'>
        <div className='w-full'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
