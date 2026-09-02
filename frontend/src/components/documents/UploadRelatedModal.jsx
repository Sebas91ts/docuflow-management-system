import { useState, useRef } from 'react'
import { X, Upload, Send } from 'lucide-react'

const RELATION_TYPES = [
  { value: 'attachment', label: 'Anexo / Adjunto' },
  { value: 'response', label: 'Respuesta Oficial' },
  { value: 'backup', label: 'Respaldo / Antecedente' },
]

function UploadRelatedModal({ isOpen, onClose, onConfirm }) {
  const [file, setFile] = useState(null)
  const [relationType, setRelationType] = useState('attachment')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null
    if (selected) {
      setFile(selected)
      setTitle(selected.name)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const selected = e.dataTransfer.files?.[0] || null
    if (selected) {
      setFile(selected)
      setTitle(selected.name)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setBusy(true)
    try {
      await onConfirm({
        file,
        relation_type: relationType,
        title: title.trim() || file.name,
        description: description.trim() || null,
      })
      handleClose()
    } finally {
      setBusy(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setRelationType('attachment')
    setTitle('')
    setDescription('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button className='absolute inset-0 bg-black/45 backdrop-blur-sm' onClick={handleClose} />
      <div className='relative w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl transition-all duration-200'>
        <div className='flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]'>
              Documentos Relacionados
            </p>
            <h2 className='mt-0.5 text-base font-bold text-[var(--color-text)]'>
              Adjuntar nuevo archivo
            </h2>
          </div>
          <button
            className='rounded-md p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-page)] hover:text-[var(--color-text)]'
            type='button'
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        <form className='space-y-4 px-6 py-5' onSubmit={handleSubmit}>
          {/* Zona Dropzone */}
          <div className='space-y-1.5'>
            <label className='text-sm font-medium'>Archivo <span className='text-[var(--color-danger)]'>*</span></label>
            <input
              ref={fileInputRef}
              className='hidden'
              type='file'
              onChange={handleFileChange}
              required={!file}
            />
            <button
              type='button'
              className={[
                'flex w-full flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed p-6 text-center transition',
                isDragging
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                  : file
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)]',
              ].join(' ')}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={() => setIsDragging(true)}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              disabled={busy}
            >
              <div className={['flex h-10 w-10 items-center justify-center rounded-full text-white', file ? 'bg-emerald-500' : 'bg-[var(--color-primary)]'].join(' ')}>
                <Upload size={18} />
              </div>
              <div className='min-w-0 max-w-xs'>
                {file ? (
                  <>
                    <p className='text-xs font-semibold text-emerald-800 truncate'>{file.name}</p>
                    <p className='text-[10px] text-emerald-600/80 mt-0.5'>{(file.size / 1024).toFixed(1)} KB · Cambiar archivo</p>
                  </>
                ) : (
                  <>
                    <p className='text-xs font-semibold'>Suelta el archivo aquí o haz clic para buscar</p>
                    <p className='text-[10px] text-[var(--color-muted)] mt-0.5'>PDF, imágenes o documentos de oficina</p>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Tipo de relación */}
          <div className='space-y-1.5'>
            <label className='text-sm font-medium' htmlFor='rel-type'>
              Tipo de relación / Vinculación
            </label>
            <select
              id='rel-type'
              className='h-11 w-full rounded-md border border-[var(--color-border)] px-3 text-sm outline-none transition focus:border-[var(--color-primary)] bg-[var(--color-surface)]'
              value={relationType}
              onChange={(e) => setRelationType(e.target.value)}
              disabled={busy}
            >
              {RELATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre / Título */}
          <div className='space-y-1.5'>
            <label className='text-sm font-medium' htmlFor='rel-title'>
              Nombre visible
            </label>
            <input
              id='rel-title'
              type='text'
              className='h-11 w-full rounded-md border border-[var(--color-border)] px-3 text-sm outline-none transition focus:border-[var(--color-primary)]'
              placeholder='Ej: Informe de conformidad'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
              required
            />
          </div>

          {/* Comentario / Descripción */}
          <div className='space-y-1.5'>
            <label className='text-sm font-medium' htmlFor='rel-desc'>
              Descripción o comentario (opcional)
            </label>
            <textarea
              id='rel-desc'
              className='min-h-16 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] resize-none'
              placeholder='Describe brevemente el contenido de este adjunto...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className='flex justify-end gap-3 border-t border-[var(--color-border)] pt-4'>
            <button
              className='rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-page)]'
              type='button'
              onClick={handleClose}
              disabled={busy}
            >
              Cancelar
            </button>
            <button
              className='inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed'
              type='submit'
              disabled={busy || !file}
            >
              <Send size={14} />
              {busy ? 'Adjuntando...' : 'Adjuntar archivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadRelatedModal
