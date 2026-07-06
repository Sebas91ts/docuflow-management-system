import { useAuth } from '../../hooks/useAuth'

function DashboardHomePage() {
  const { currentUser } = useAuth()

  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-app)]">
      <p className="text-sm font-semibold text-[var(--color-primary)]">Resumen</p>
      <h1 className="mt-2 text-2xl font-bold">Bienvenido, {currentUser.full_name}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
        Desde aqui vamos a organizar documentos, pendientes, usuarios y auditoria.
      </p>
    </section>
  )
}

export default DashboardHomePage
