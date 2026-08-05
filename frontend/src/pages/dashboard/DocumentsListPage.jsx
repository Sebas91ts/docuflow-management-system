import DocumentsExplorer from '../../components/documents/DocumentsExplorer'
import DocumentsHeader from '../../components/documents/DocumentsHeader'
import { useDocuments } from '../../hooks/useDocuments'

function DocumentsListPage() {
  const documentsState = useDocuments()

  return (
    <section className="mx-auto space-y-6">
      <DocumentsHeader mode="list" />
      <DocumentsExplorer documents={documentsState.documents} loading={documentsState.loading} />
    </section>
  )
}

export default DocumentsListPage
