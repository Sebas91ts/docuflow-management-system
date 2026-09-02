import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Inbox,
  Users,
  LogOut,
  Clock3,
  Menu,
  X
} from 'lucide-react'

import FeedbackToast from '../components/common/FeedbackToast'
import { useAuth } from '../hooks/useAuth'
import { usePendingNotifications } from '../hooks/usePendingNotifications'

const navigationItems = [
  { label: 'Resumen', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Crear documento', to: '/dashboard/documents/new', icon: FileText },
  { label: 'Ver documentos', to: '/dashboard/documents', icon: FileText },
  { label: 'Pendientes', to: '/dashboard/pending', icon: Inbox },
  { label: 'Trazabilidad', to: '/dashboard/trazabilidad', icon: Clock3 },
  // { label: 'Auditoria', to: '/dashboard/audit', icon: ScrollText }
]

const adminNavigationItems = [
  { label: 'Usuarios', to: '/dashboard/users', icon: Users }
]

function SidebarContent({ onNavigate }) {
  const { currentUser, logout } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  return (
    <>
      <div className='border-b border-[var(--color-border)] px-6 py-6'>
        <p className='text-sm font-semibold text-[var(--color-primary)]'>
          DocuFlow
        </p>
        <h2 className='mt-1 text-lg font-bold'>Panel principal</h2>
        <p className='mt-2 text-sm text-[var(--color-muted)]'>
          {currentUser?.full_name}
        </p>
      </div>

      <nav className='flex-1 px-3 py-4'>
        <div className='space-y-1'>
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={onNavigate}
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
                  onClick={onNavigate}
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
    </>
  )
}

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { toast, clearToast, handleAction } = usePendingNotifications()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className='flex h-screen overflow-hidden bg-[var(--color-page)] text-[var(--color-text)]'>
      {/* Sidebar desktop (lg+) */}
      <aside className='hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex'>
        <SidebarContent onNavigate={closeSidebar} />
      </aside>

      {/* Backdrop movil */}
      {sidebarOpen ? (
        <div
          className='fixed inset-0 z-40 bg-black/50 lg:hidden'
          onClick={closeSidebar}
          aria-hidden='true'
        />
      ) : null}

      {/* Drawer movil */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-app)] transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role='dialog'
        aria-modal='true'
        aria-label='Menu de navegacion'
      >
        <div className='flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 lg:hidden'>
          <p className='text-sm font-semibold text-[var(--color-primary)]'>
            DocuFlow
          </p>
          <button
            className='flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-muted)] transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]'
            type='button'
            onClick={closeSidebar}
            aria-label='Cerrar menu'
          >
            <X size={20} />
          </button>
        </div>
        <SidebarContent onNavigate={closeSidebar} />
      </aside>

      {/* Barra superior movil */}
      <div className='fixed top-16 right-4 left-4 z-50 flex justify-end pointer-events-none lg:top-6 lg:right-6 lg:left-auto'>
        <FeedbackToast toast={toast} onClose={clearToast} onAction={handleAction} />
      </div>

      <div className='flex flex-1 flex-col overflow-hidden'>
        <header className='flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:hidden'>
          <button
            className='flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text)] transition hover:bg-[var(--color-primary-soft)]'
            type='button'
            onClick={() => setSidebarOpen(true)}
            aria-label='Abrir menu'
          >
            <Menu size={22} />
          </button>
          <p className='text-sm font-semibold text-[var(--color-primary)]'>
            DocuFlow
          </p>
          <span className='w-9' />
        </header>

        <main className='flex-1 overflow-y-auto p-4 md:p-6 lg:p-8'>
          <div className='w-full'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout