import { ChevronRight, Folder, FileText, ExternalLink } from 'lucide-react'
import { useMemo, useState } from 'react'

function formatDate(value) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function buildTree(documents) {
  const root = {}

  documents.forEach((document) => {
    const path = document.drive_folder_path || 'Sin carpeta'
    const parts = path === 'Sin carpeta' ? ['Sin carpeta'] : path.split('/')
    let current = root
    let currentPath = []

    parts.forEach((part) => {
      currentPath.push(part)
      if (!current[part]) {
        current[part] = {
          name: part,
          path: currentPath.join('/'),
          children: {},
          documents: [],
        }
      }
      current = current[part].children
    })

    const leafName = parts[parts.length - 1]
    const leaf = root[parts[0]]
    let node = leaf
    parts.slice(1).forEach((part) => {
      node = node.children[part]
    })
    node.documents.push(document)
  })

  return root
}

function getNodeByPath(tree, path) {
  if (!path) {
    return null
  }

  const parts = path.split('/')
  let current = tree[parts[0]]
  if (!current) {
    return null
  }

  for (let index = 1; index < parts.length; index += 1) {
    current = current.children[parts[index]]
    if (!current) {
      return null
    }
  }

  return current
}

function FolderNode({ node, depth, expandedFolders, setExpandedFolders, selectedPath, onSelect }) {
  const isExpanded = expandedFolders.has(node.path)
  const hasChildren = Object.keys(node.children).length > 0
  const isSelected = selectedPath === node.path

  return (
    <div className="space-y-1">
      <button
        className={[
          'flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left transition',
          isSelected
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
            : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]',
        ].join(' ')}
        type="button"
        onClick={() => onSelect(node.path)}
      >
        {hasChildren ? (
          <span
            className={[
              'transition',
              isExpanded ? 'rotate-90' : 'rotate-0',
            ].join(' ')}
          >
            <ChevronRight size={16} />
          </span>
        ) : (
          <span className="w-4" />
        )}
        <Folder className="shrink-0 text-[var(--color-primary)]" size={18} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{node.name}</p>
          <p className="text-xs text-[var(--color-muted)]">{node.documents.length} documentos</p>
        </div>
      </button>

      {hasChildren && isExpanded ? (
        <div className="ml-5 space-y-1 border-l border-[var(--color-border)] pl-3">
          {Object.values(node.children).map((child) => (
            <FolderNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              setExpandedFolders={setExpandedFolders}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function DocumentsExplorer({ documents, loading }) {
  const tree = useMemo(() => buildTree(documents), [documents])
  const rootFolders = Object.values(tree)
  const [expandedFolders, setExpandedFolders] = useState(() => new Set())
  const [selectedPath, setSelectedPath] = useState(null)

  const selectedNode = useMemo(() => {
    if (!selectedPath) {
      return null
    }
    return getNodeByPath(tree, selectedPath)
  }, [selectedPath, tree])

  const selectedDocuments = selectedNode?.documents?.length
    ? selectedNode.documents
    : documents

  const toggleFolder = (path) => {
    setExpandedFolders((current) => {
      const next = new Set(current)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
    setSelectedPath(path)
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white shadow-[var(--shadow-app)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4">
        <p className="text-sm font-semibold text-[var(--color-primary)]">Explorador</p>
        <h2 className="mt-1 text-xl font-bold">Vista tipo Drive</h2>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-sm text-[var(--color-muted)]">Cargando documentos...</div>
      ) : documents.length === 0 ? (
        <div className="px-6 py-8 text-sm text-[var(--color-muted)]">Todavia no hay documentos registrados.</div>
      ) : (
        <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-[var(--color-border)] p-4 lg:border-b-0 lg:border-r">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Carpetas
            </p>
            <div className="mt-3 space-y-2">
              {rootFolders.map((node) => (
                <FolderNode
                  key={node.path}
                  node={node}
                  depth={0}
                  expandedFolders={expandedFolders}
                  setExpandedFolders={setExpandedFolders}
                  selectedPath={selectedPath}
                  onSelect={toggleFolder}
                />
              ))}
            </div>
          </aside>

          <section className="p-4">
            <div className="mb-4 rounded-md border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {selectedNode?.path || 'Todos los documentos'}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                {selectedNode ? `${selectedDocuments.length} documentos` : `${documents.length} documentos`}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {selectedDocuments.map((document) => (
                <article
                  key={document.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4 transition hover:border-[var(--color-primary)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-white p-2 text-[var(--color-primary)]">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{document.title}</p>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">{document.code}</p>
                      </div>
                    </div>
                    {document.drive_web_view_link ? (
                      <a
                        className="rounded-md p-1 text-[var(--color-primary)] transition hover:bg-white"
                        href={document.drive_web_view_link}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Abrir archivo"
                      >
                        <ExternalLink size={16} />
                      </a>
                    ) : null}
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm text-[var(--color-muted)]">
                    {document.description || 'Sin descripcion'}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
                    <span>{document.status}</span>
                    <span>{formatDate(document.created_at)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default DocumentsExplorer
