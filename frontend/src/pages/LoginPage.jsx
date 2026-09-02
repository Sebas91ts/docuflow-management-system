import { branding } from '../config/branding'
import LogoPanel from '../components/brand/LogoPanel'
import LoginForm from '../components/auth/LoginForm'

function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--color-page)] px-4 py-6 text-[var(--color-text)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-5xl overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-app)] md:grid-cols-[0.95fr_1.05fr]">
        <LogoPanel
          appName={branding.appName}
          companyName={branding.companyName}
          logoSrc={branding.logoSrc}
        />

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <p className="text-sm font-semibold text-[var(--color-primary)]">
                Acceso interno
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                Iniciar sesion
              </h2>
            </div>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
