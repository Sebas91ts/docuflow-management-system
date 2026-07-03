import { useState } from 'react'

function LogoPanel({ appName, companyName, logoSrc, logoBoxSize, logoImageSize }) {
  const [hasLogoError, setHasLogoError] = useState(false)

  return (
    <section className='grid min-h-[320px] grid-rows-[1fr_auto] bg-[var(--color-primary)] p-8 text-white md:min-h-full'>
      <div className='flex items-center justify-center'>
        <div
          className='flex items-center justify-center rounded-lg bg-white/10'
          style={{
            height: logoBoxSize,
            width: logoBoxSize,
          }}
        >
          {!hasLogoError ? (
            <img
              className='object-contain'
              style={{
                maxHeight: logoImageSize,
                maxWidth: logoImageSize,
              }}
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
