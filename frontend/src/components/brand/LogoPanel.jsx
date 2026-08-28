import { useState } from 'react'

function LogoPanel({ appName, companyName, logoSrc }) {
  const [hasLogoError, setHasLogoError] = useState(false)

  return (
    <section className='grid min-h-[280px] grid-rows-[1fr_auto] bg-[var(--color-primary)] p-6 text-white md:min-h-full md:p-8'>
      <div className='flex items-center justify-center'>
        <div className='flex h-40 w-40 items-center justify-center rounded-lg bg-white/10 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64'>
          {!hasLogoError ? (
            <img
              className='max-h-full max-w-full object-contain p-2'
              src={logoSrc}
              alt={`Logo ${companyName}`}
              onError={() => setHasLogoError(true)}
            />
          ) : (
            <span className='text-xl font-bold'>DF</span>
          )}
        </div>
      </div>

      <div>
        <p className='text-sm font-medium uppercase tracking-[0.18em] text-white/70'>
          {companyName}
        </p>
        <h1 className='mt-3 text-4xl font-bold'>{appName}</h1>
        <p className='mt-4 max-w-sm text-base leading-7 text-white/75'>
          Gestion documental con seguimiento, responsables y trazabilidad.
        </p>
      </div>
    </section>
  )
}

export default LogoPanel
