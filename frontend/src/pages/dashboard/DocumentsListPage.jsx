import DocumentsExplorer from '../../components/documents/DocumentsExplorer'
import DocumentsFilters from '../../components/documents/DocumentsFilters'
import DocumentsHeader from '../../components/documents/DocumentsHeader'
import { useDocumentExplorer } from '../../hooks/useDocumentExplorer'
import { FolderUp } from 'lucide-react'

function DocumentsListPage() {
  const explorer = useDocumentExplorer()

  return (
    <section className="mx-auto space-y-6">
      <DocumentsHeader mode="list" />
      <DocumentsFilters
        filters={explorer.filters}
        onChange={explorer.updateFilter}
        onApply={explorer.applyFilters}
        onClear={explorer.clearFilters}
      />
      <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 shadow-[var(--shadow-app)]">
        <p className="text-sm text-[var(--color-muted)]">
          {explorer.searchMode === 'search'
            ? 'La búsqueda y los filtros se aplican en toda la base de documentos.'
            : 'Navega carpetas como explorador o usa filtros para buscar en todo el repositorio.'}
        </p>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-sm font-semibold transition hover:border-[var(--color-primary)]"
          onClick={() => {
            explorer.setActiveFolderId('')
            explorer.setExpandedFolders(new Set())
          }}
        >
          <FolderUp size={16} />
          Ir a inicio
        </button>
      </div>
      <DocumentsExplorer
        folders={explorer.folders}
        folderTree={explorer.folderTree}
        documents={explorer.documents}
        loading={explorer.loading}
        activeFolderId={explorer.activeFolderId}
        expandedFolders={explorer.expandedFolders}
        hasActiveFilters={explorer.hasActiveFilters}
        searchMode={explorer.searchMode}
        onToggleFolder={(folder) => {
          explorer.setExpandedFolders((current) => {
            const next = new Set(current)
            if (next.has(folder.id)) {
              next.delete(folder.id)
            } else {
              next.add(folder.id)
            }
            return next
          })
          explorer.setActiveFolderId(folder.id)
        }}
      />
    </section>
  )
}

export default DocumentsListPage
