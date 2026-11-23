import { SearchResultRows } from '../../components/modals/SpotlightSearchModal';
import type { Document, Folder, ViewState } from '../../types';
import { findWorkspaceResults, workspaceName } from '../../utils/workspaceSearch';

export function SearchPage({ view, documents, folders, onNavigate }: {
  view: Extract<ViewState, { type: 'search' }>; documents: Document[]; folders: Folder[]; onNavigate: (view: ViewState) => void;
}) {
  const results = view.query.trim() ? findWorkspaceResults(documents, folders, view.query, view.scope) : [];
  const scopeName = view.scope?.folderId ? folders.find(folder => folder.id === view.scope?.folderId)?.name
    : view.scope ? workspaceName(view.scope.space) : undefined;

  return <section className="min-h-0 flex-1 overflow-y-auto px-[5%] py-6">
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Kết quả tìm kiếm</h1>
      <p className="mt-2 text-sm text-[var(--ui-muted)]">
        {results.length} kết quả{view.query && <> cho “{view.query}”</>}{scopeName && <> trong {scopeName}</>}
      </p>
      {results.length > 0 ? <div className="mt-4 rounded-xl border border-[var(--ui-border)] px-4">
        <SearchResultRows results={results} query={view.query} onSelect={result => onNavigate(result.type === 'document'
          ? { type: 'document', documentId: result.id } : { type: 'folder', folderId: result.id })} />
      </div> : <p className="mt-8 text-sm text-[var(--ui-muted)]">Không tìm thấy tài liệu hoặc thư mục phù hợp.</p>}
    </div>
  </section>;
}
