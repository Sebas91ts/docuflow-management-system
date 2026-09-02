import {
  ChevronRight,
  Filter,
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
  Clock3
} from 'lucide-react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../common/LoadingSpinner'

const STATUS_META = {
  REGISTERED: {
    label: 'Pendiente',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  ARCHIVED: {
    label: 'Finalizado',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  IN_PROGRESS: {
    label: 'En atención',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  LOGICALLY_DELETED: {
    label: 'Eliminado lógicamente',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value))
}

function getChildren(folderTree, parentId) {
  return folderTree.get(parentId ?? 'root') || []
}

function getDirectChildren(folders, parentId) {
  return folders.filter((folder) => (folder.parent_id ?? null) === (parentId ?? null))
}

function FolderChip({ folder, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(folder)}
      className={[
        'flex min-h-24 flex-col justify-between rounded-lg border px-4 py-3 text-left transition',
        isActive
          ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Folder size={18} className="shrink-0 text-[var(--color-primary)]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{folder.name}</p>
            <p className="truncate text-xs text-[var(--color-muted)]">{folder.path}</p>
          </div>
        </div>
      </div>
    </button>
  )
}

function FolderTreeNode({
  folder,
  folderTree,
  level,
  activeFolderId,
  expanded,
  onToggleFolder
}) {
  const children = getChildren(folderTree, folder.id)
  const hasChildren = children.length > 0
  const isExpanded = expanded.has(folder.id)
  const isActive = activeFolderId === folder.id

  return (
    <div>
      <button
        type='button'
        onClick={() => onToggleFolder(folder)}
        className={[
          'flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left transition',
          isActive
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'
        ].join(' ')}
        style={{ paddingLeft: `${12 + level * 14}px` }}
      >
        {hasChildren ? (
          <span className={isExpanded ? 'rotate-90 transition' : 'transition'}>
            <ChevronRight size={16} />
          </span>
        ) : (
          <span className='w-4' />
        )}
        {isExpanded ? (
          <FolderOpen size={18} className='text-[var(--color-primary)]' />
        ) : (
          <Folder size={18} className='text-[var(--color-primary)]' />
        )}
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold'>{folder.name}</p>
          <p className='text-xs text-[var(--color-muted)]'>{folder.path}</p>
        </div>
      </button>

      {hasChildren && isExpanded ? (
        <div className='mt-2 space-y-2'>
          {children.map((child) => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              folderTree={folderTree}
              level={level + 1}
              activeFolderId={activeFolderId}
              expanded={expanded}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function DocumentsExplorer({
  folders,
  folderTree,
  documents,
  loading,
  activeFolderId,
  expandedFolders,
  hasActiveFilters,
  searchMode,
  onNavigateFolder,
  onToggleFolder,
  limit = 10,
  onLoadMore,
}) {
  const rootFolders = getChildren(folderTree, 'root')

  const activeFolder =
    folders.find((folder) => folder.id === activeFolderId) || null
  const childFolders = activeFolderId
    ? getDirectChildren(folders, activeFolderId)
    : getChildren(folderTree, 'root')
  const showFolderContext = !searchMode

  return (
    <div className='rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-app)]'>
      <div className='border-b border-[var(--color-border)] px-6 py-4'>
        <p className='text-sm font-semibold text-[var(--color-primary)]'>
          Explorador
        </p>
        <h2 className='mt-1 text-xl font-bold'>Vista de Archivos</h2>
      </div>

      {loading ? (
        <div className='flex min-h-[320px] items-center justify-center px-6 py-8 text-sm text-[var(--color-muted)]'>
          <div className='flex flex-col items-center gap-3'>
            <LoadingSpinner size={32} />
            <p>Cargando documentos...</p>
          </div>
        </div>
      ) : (
        <div className='grid gap-0 lg:grid-cols-[320px_1fr]'>
          <aside className='border-b border-[var(--color-border)] p-4 lg:border-b-0 lg:border-r'>
            <p className='px-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]'>
              Carpetas
            </p>
            <div className='mt-3 space-y-2 overflow-hidden'>
              {rootFolders.map((folder) => (
                <FolderTreeNode
                  key={folder.id}
                  folder={folder}
                  folderTree={folderTree}
                  level={0}
                  activeFolderId={activeFolderId}
                  expanded={expandedFolders}
                  onToggleFolder={onToggleFolder}
                />
              ))}
            </div>
          </aside>

          <section className='p-4'>
            {showFolderContext ? (
              <div className='mb-4 rounded-md border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-[var(--color-text)]'>
                      {activeFolder?.path || 'Todos los documentos'}
                    </p>
                    <p className='text-xs text-[var(--color-muted)]'>
                      {documents.length} documentos
                    </p>
                  </div>
                  <div className='flex items-center gap-2 text-xs'>
                    <span className='inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[var(--color-muted)]'>
                      <Folder size={14} />
                      {activeFolder ? 'Carpeta activa' : 'Vista general'}
                    </span>
                    {hasActiveFilters ? (
                      <span className='inline-flex items-center gap-1 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary-soft)] px-3 py-1 text-[var(--color-primary)]'>
                        <Filter size={14} />
                        Filtros activos
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className='mb-4 rounded-md border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3'>
                <p className='text-sm font-semibold text-[var(--color-text)]'>
                  Búsqueda global
                </p>
                <p className='text-xs text-[var(--color-muted)]'>
                  {documents.length} documentos encontrados
                </p>
              </div>
            )}

            <div className="space-y-6">
              {childFolders.length > 0 ? (
                <div>
                  <div className='mb-3 flex items-center justify-between gap-3'>
                    <p className='text-sm font-semibold text-[var(--color-text)]'>
                      {activeFolder ? 'Subcarpetas' : 'Carpetas'}
                    </p>
                    <p className='text-xs text-[var(--color-muted)]'>
                      Haz click para sincronizar el árbol
                    </p>
                  </div>
                  <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
                    {childFolders.map((folder) => (
                      <FolderChip
                        key={folder.id}
                        folder={folder}
                        isActive={activeFolderId === folder.id}
                        onClick={onNavigateFolder}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {documents.length === 0 ? (
                childFolders.length > 0 ? null : (
                  <div className='rounded-md border border-dashed border-[var(--color-border)] px-4 py-8 text-sm text-[var(--color-muted)]'>
                    {showFolderContext && activeFolder
                      ? 'No hay documentos en esta carpeta.'
                      : 'No hay documentos para los filtros seleccionados.'}
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
                    {documents.map((document) => (
                      <article
                        key={document.id}
                        className='rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4 transition hover:border-[var(--color-primary)]'
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='flex min-w-0 items-start gap-3'>
                            <div className='rounded-md bg-[var(--color-surface)] p-2 text-[var(--color-primary)]'>
                              <FileText size={18} />
                            </div>
                            <div className='min-w-0'>
                              <p className='truncate text-sm font-semibold'>
                                {document.title}
                              </p>
                              <p className='mt-1 text-xs text-[var(--color-muted)]'>
                                {document.code}
                              </p>
                              <p className='mt-1 truncate text-xs text-[var(--color-muted)]'>
                                {document.folder?.path ||
                                  document.drive_folder_path ||
                                  'Sin carpeta'}
                              </p>
                            </div>
                          </div>
                          {document.drive_web_view_link ? (
                            <a
                              className='rounded-md p-1 text-[var(--color-primary)] transition hover:bg-[var(--color-surface)]'
                              href={document.drive_web_view_link}
                              target='_blank'
                              rel='noreferrer'
                              aria-label='Abrir archivo'
                            >
                              <ExternalLink size={16} />
                            </a>
                          ) : null}
                        </div>

                        <p className='mt-4 line-clamp-3 text-sm text-[var(--color-muted)]'>
                          {document.description || 'Sin descripcion'}
                        </p>

                        <div className='mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted)]'>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 font-semibold ${
                              (STATUS_META[document.status] || STATUS_META.REGISTERED).className
                            }`}
                          >
                            {(STATUS_META[document.status] || STATUS_META.REGISTERED).label}
                          </span>
                          <span>{formatDate(document.created_at)}</span>
                        </div>

                        <div className='mt-4 flex flex-wrap items-center gap-2'>
                          <Link
                            className='inline-flex h-9 items-center gap-2 rounded-md border border-[var(--color-border)] px-3 text-sm font-semibold transition hover:border-[var(--color-primary)] bg-[var(--color-surface)] hover:text-[var(--color-primary)]'
                            to={`/dashboard/documents/${document.id}`}
                          >
                            Ver detalle
                          </Link>
                          <Link
                            className='inline-flex h-9 items-center gap-2 rounded-md border border-[var(--color-border)] px-3 text-sm font-semibold transition hover:border-[var(--color-primary)] bg-[var(--color-surface)] hover:text-[var(--color-primary)]'
                            to={`/dashboard/trazabilidad/${document.id}`}
                          >
                            <Clock3 size={14} />
                            Ver trazabilidad
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>

                  {documents.length >= limit ? (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={onLoadMore}
                        className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--color-primary)] bg-[var(--color-primary-soft)] px-6 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                      >
                        Cargar más documentos
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default DocumentsExplorer
