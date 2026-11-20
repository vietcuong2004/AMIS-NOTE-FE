import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import {
  Building2, ChevronDown, ChevronRight, FileSpreadsheet, FileText, FileType,
  Folder as FolderIcon, FolderInput, Home, LayoutGrid, List, Plus, Search, User, X,
} from 'lucide-react';
import type { Document, Folder, SpaceType } from '../../types';
import { formatDateTime } from '../../utils/dateTime';
import { getFolderAncestors } from '../../utils/folders';

interface MoveModalProps {
  document: Document;
  documents: Document[];
  folders: Folder[];
  onClose: () => void;
  onMove: (docId: string, targetFolderId: string | null, targetSpace: SpaceType) => boolean;
  onCreateFolder: (space: SpaceType, parentId: string | null, name: string) => Folder;
}

const spaces = [
  { id: 'company', label: 'Tài liệu công ty', Icon: Building2 },
  { id: 'personal', label: 'Ghi chép của tôi', Icon: User },
] as const;

const normalize = (value: string) => value.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();

function documentPreview(doc: Document) {
  const documentBlocks = doc.blocks.filter(block => block.type !== 'paragraph' || block.content.trim());
  const spreadsheet = /\.xlsx$/i.test(doc.title) || (documentBlocks.length === 1 && documentBlocks[0].type === 'spreadsheet');
  const word = /\.docx?$/i.test(doc.title);
  return {
    title: spreadsheet && !/\.xlsx$/i.test(doc.title) ? `${doc.title}.xlsx` : doc.title || 'Không có tiêu đề',
    Icon: spreadsheet ? FileSpreadsheet : word ? FileType : FileText,
    color: spreadsheet ? 'text-emerald-700' : word ? 'text-blue-600' : 'text-[var(--ui-muted)]',
  };
}

export function MoveModal({ document: doc, documents, folders, onClose, onMove, onCreateFolder }: MoveModalProps) {
  const titleId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  const folderNameInput = useRef<HTMLInputElement>(null);
  const [space, setSpace] = useState(doc.space);
  const [folderId, setFolderId] = useState(doc.folderId ?? null);
  const [expanded, setExpanded] = useState(() => new Set<string | null>([null, ...getFolderAncestors(doc.folderId, folders).map(folder => folder.id)]));
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [newName, setNewName] = useState<string | null>(null);
  const [folderError, setFolderError] = useState('');
  const [moveError, setMoveError] = useState(false);

  useEffect(() => {
    const previous = window.document.activeElement as HTMLElement | null;
    searchInput.current?.focus();
    return () => { if (previous?.isConnected) previous.focus(); };
  }, []);

  const currentSpace = spaces.find(option => option.id === space)!;
  const spaceFolders = folders.filter(folder => folder.space === space);
  const spaceDocuments = documents.filter(item => !item.isTrash && item.space === space);
  const target = spaceFolders.find(folder => folder.id === folderId);
  const path = getFolderAncestors(target?.id, spaceFolders);
  const targetLabel = [currentSpace.label, ...path.map(folder => folder.name)].join(' / ');
  const targetExists = folderId === null || !!target;
  const unchanged = folderId === (doc.folderId ?? null) && space === doc.space;
  const childrenOf = (parentId: string | null) => spaceFolders.filter(folder => (folder.parentId || null) === parentId);
  const visibleFolders = targetExists ? childrenOf(folderId) : [];
  const visibleDocuments = targetExists ? spaceDocuments.filter(item => item.id !== doc.id && (item.folderId || null) === folderId) : [];
  const queryText = normalize(query);
  const matches = queryText ? spaceFolders.flatMap(folder => {
    const names = getFolderAncestors(folder.id, spaceFolders).map(item => item.name);
    return normalize(names.join(' / ')).includes(queryText) ? [{ folder, parent: names.slice(0, -1).join(' / ') }] : [];
  }) : [];
  const documentCounts = new Map<string, number>();
  for (const item of spaceDocuments) {
    for (const ancestor of getFolderAncestors(item.folderId, spaceFolders)) {
      documentCounts.set(ancestor.id, (documentCounts.get(ancestor.id) ?? 0) + 1);
    }
  }

  const selectFolder = (id: string | null) => {
    setFolderId(id);
    setExpanded(previous => new Set([...previous, null, ...getFolderAncestors(id, spaceFolders).map(folder => folder.id)]));
    setQuery('');
    setNewName(null);
    setMoveError(false);
  };
  const selectSpace = (next: SpaceType) => {
    if (next === space) return;
    setSpace(next);
    selectFolder(null);
  };
  const toggleFolder = (id: string | null) => setExpanded(previous => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const cancelNewFolder = () => { setNewName(null); setFolderError(''); createButton.current?.focus(); };
  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    const name = newName?.trim();
    if (!name || !targetExists) return;
    try {
      const folder = onCreateFolder(space, folderId, name);
      selectFolder(folder.id);
      setExpanded(previous => new Set([...previous, folder.parentId ?? null, folder.id]));
      searchInput.current?.focus();
    } catch (cause) {
      setFolderError(cause instanceof Error ? cause.message : 'Không tạo được thư mục.');
      folderNameInput.current?.focus();
    }
  };
  const handleKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.stopPropagation();
      if (newName !== null) cancelNewFolder();
      else onClose();
    }
    if (event.key !== 'Tab') return;
    const items = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)');
    if (!items?.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && window.document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && window.document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const renderTree = (parentId: string | null) => <ul className="ml-4 border-l border-[var(--ui-border)] pl-2">
    {childrenOf(parentId).map(folder => {
      const hasChildren = childrenOf(folder.id).length > 0;
      const open = expanded.has(folder.id);
      const selected = folderId === folder.id;
      return <li key={folder.id}>
        <div className={`flex min-w-0 items-center rounded-lg ${selected ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'hover:bg-[var(--ui-hover)]'}`}>
          {hasChildren ? <button type="button" aria-label={`${open ? 'Thu gọn' : 'Mở rộng'} ${folder.name}`} aria-expanded={open}
            className="shrink-0 rounded-md p-1 hover:bg-[var(--ui-hover-strong)]" onClick={() => toggleFolder(folder.id)}>
            {open ? <ChevronDown aria-hidden="true" className="h-4 w-4" /> : <ChevronRight aria-hidden="true" className="h-4 w-4" />}
          </button> : <span className="w-6 shrink-0" />}
          <button type="button" aria-current={selected ? 'location' : undefined} title={folder.name}
            className={`flex min-w-0 flex-1 items-center gap-2 py-2 pr-2 text-left text-sm ${selected ? 'font-semibold' : ''}`}
            onClick={() => selectFolder(folder.id)}>
            <FolderIcon aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="truncate">{folder.name}</span>
          </button>
        </div>
        {hasChildren && open && renderTree(folder.id)}
      </li>;
    })}
  </ul>;

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-2 sm:p-4"
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={`${titleId}-description`} onKeyDown={handleKeyboard}
      className="flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl">
      <header className="flex shrink-0 items-start gap-3 border-b border-[var(--ui-border)] px-4 py-4 sm:px-7 sm:py-5">
        <FileText aria-hidden="true" className="mt-1 h-8 w-8 shrink-0 text-blue-600" />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-xl font-bold sm:text-2xl">Di chuyển tài liệu</h2>
          <p id={`${titleId}-description`} className="mt-0.5 truncate text-sm text-[var(--ui-muted)]" title={doc.title}>Chọn thư mục đích để di chuyển “{doc.title || 'Không có tiêu đề'}”.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng" className="shrink-0 rounded-lg p-2 text-[var(--ui-muted)] hover:bg-[var(--ui-hover)]">
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </header>

      <div role="group" aria-label="Chuyển đến" className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--ui-border)] px-4 py-3 sm:gap-3 sm:px-7 sm:py-4">
        <span className="mr-2 hidden text-sm font-semibold sm:inline">Chuyển đến</span>
        {spaces.map(({ id, label, Icon }) => <button key={id} type="button" aria-pressed={space === id} onClick={() => selectSpace(id)}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm sm:px-5 sm:py-2.5 ${space === id ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'border-[var(--ui-border)] hover:bg-[var(--ui-hover)]'}`}>
          <Icon aria-hidden="true" className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />{label}
        </button>)}
      </div>

      <div className="grid min-h-0 flex-1 overflow-auto sm:h-[min(50dvh,29rem)] sm:grid-cols-[minmax(13rem,32%)_minmax(0,1fr)] sm:overflow-hidden">
        <aside aria-label="Cây thư mục đích" className="flex min-h-0 min-w-0 flex-col border-b border-[var(--ui-border)] bg-[var(--ui-subtle)] sm:border-r sm:border-b-0">
          <div className="shrink-0 px-3 pt-3 sm:px-4 sm:pt-4">
            <label className="flex items-center gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 focus-within:border-blue-500">
              <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--ui-muted)]" />
              <input ref={searchInput} type="search" aria-label="Tìm thư mục" placeholder="Tìm thư mục..." value={query} onChange={event => setQuery(event.target.value)}
                className="w-full min-w-0 bg-transparent py-2 text-sm outline-none" />
            </label>
          </div>

          <div className="max-h-44 min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:max-h-none sm:px-4">
            {queryText ? matches.length ? <ul aria-label="Kết quả tìm thư mục" className="space-y-0.5">
              {matches.map(({ folder, parent }) => <li key={folder.id}>
                <button type="button" onClick={() => { selectFolder(folder.id); searchInput.current?.focus(); }}
                  className="flex w-full min-w-0 items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-[var(--ui-hover)]">
                  <FolderIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span className="min-w-0"><span className="block truncate">{folder.name}</span>
                    {parent && <span className="block truncate text-xs text-[var(--ui-muted)]">{parent}</span>}</span>
                </button>
              </li>)}
            </ul> : <p role="status" className="px-2 py-3 text-sm text-[var(--ui-muted)]">Không tìm thấy thư mục.</p> : <>
              <div className={`flex items-center rounded-lg ${folderId === null ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : ''}`}>
                <button type="button" aria-label={`${expanded.has(null) ? 'Thu gọn' : 'Mở rộng'} ${currentSpace.label}`}
                  aria-expanded={expanded.has(null)} className="rounded-md p-1 hover:bg-[var(--ui-hover)]" onClick={() => toggleFolder(null)}>
                  {expanded.has(null) ? <ChevronDown aria-hidden="true" className="h-4 w-4" /> : <ChevronRight aria-hidden="true" className="h-4 w-4" />}
                </button>
                <button type="button" aria-current={folderId === null ? 'location' : undefined} onClick={() => selectFolder(null)}
                  className="flex flex-1 items-center gap-2 py-2 text-left text-sm font-semibold">
                  <currentSpace.Icon aria-hidden="true" className="h-4 w-4 shrink-0" />{currentSpace.label}
                </button>
              </div>
              {expanded.has(null) && renderTree(null)}
            </>}
          </div>

          <div className="shrink-0 border-t border-[var(--ui-border)] px-3 py-2 sm:px-4 sm:py-3">
            <button ref={createButton} type="button" disabled={!targetExists} aria-expanded={newName !== null}
              onClick={() => { setFolderError(''); setNewName(''); }}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-blue-600 hover:bg-[var(--ui-hover)] disabled:opacity-40">
              <Plus aria-hidden="true" className="h-5 w-5" />Tạo thư mục mới
            </button>
            {newName !== null && <form className="mt-2 space-y-2 px-2" onSubmit={handleCreate}>
              <input ref={folderNameInput} autoFocus aria-label="Tên thư mục mới" value={newName}
                onChange={event => { setNewName(event.target.value); setFolderError(''); }}
                className="w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2 py-1.5 text-sm outline-blue-500" />
              {folderError && <p role="alert" className="text-xs text-red-600">{folderError}</p>}
              <div className="flex flex-wrap justify-end gap-2 text-xs">
                <button type="button" onClick={cancelNewFolder} className="rounded-md border border-[var(--ui-border)] px-2.5 py-1.5 hover:bg-[var(--ui-hover)]">Hủy tạo</button>
                <button type="submit" disabled={!newName.trim()} className="rounded-md bg-blue-600 px-2.5 py-1.5 font-semibold text-white disabled:opacity-40">Tạo thư mục</button>
              </div>
            </form>}
          </div>
        </aside>

        <section aria-label="Nội dung thư mục đích" className="flex min-h-0 min-w-0 flex-col">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-4">
            <nav aria-label="Đường dẫn thư mục đích" className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-xs sm:text-sm">
              <button type="button" aria-current={folderId === null ? 'location' : undefined} onClick={() => selectFolder(null)}
                className="inline-flex items-center gap-1.5 rounded px-1 py-1 hover:bg-[var(--ui-hover)]">
                <Home aria-hidden="true" className="h-4 w-4 shrink-0" />{currentSpace.label}
              </button>
              {path.map(folder => <span key={folder.id} className="inline-flex min-w-0 items-center gap-1">
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[var(--ui-muted)]" />
                <button type="button" aria-current={folder.id === folderId ? 'location' : undefined} onClick={() => selectFolder(folder.id)}
                  title={folder.name} className={`truncate rounded px-1 py-1 hover:bg-[var(--ui-hover)] ${folder.id === folderId ? 'font-semibold' : ''}`}>{folder.name}</button>
              </span>)}
            </nav>
            <div role="group" aria-label="Kiểu hiển thị thư mục đích" className="inline-flex shrink-0 rounded-xl border border-[var(--ui-border)] p-0.5">
              {([{ id: 'grid', label: 'Dạng lưới', Icon: LayoutGrid }, { id: 'list', label: 'Dạng danh sách', Icon: List }] as const).map(({ id, label, Icon }) =>
                <button key={id} type="button" title={label} aria-label={label} aria-pressed={view === id} onClick={() => setView(id)}
                  className={`rounded-lg p-1.5 ${view === id ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' : 'hover:bg-[var(--ui-hover)]'}`}><Icon aria-hidden="true" className="h-4 w-4" /></button>)}
            </div>
          </div>

          <div className="min-h-36 flex-1 px-3 pb-4 sm:min-h-0 sm:overflow-y-auto sm:px-4">
            {!targetExists ? <p role="status" className="p-3 text-sm text-[var(--ui-muted)]">Thư mục đích không còn tồn tại. Hãy chọn vị trí khác.</p>
              : !visibleFolders.length && !visibleDocuments.length ? <p className="py-8 text-center text-sm text-[var(--ui-muted)]">Thư mục này chưa có nội dung.</p>
              : <ul className={view === 'grid' ? 'grid grid-cols-2 gap-3 lg:grid-cols-3' : 'space-y-1.5'}>
                {visibleFolders.map(folder => <li key={folder.id} className="min-w-0">
                  <button type="button" onClick={() => selectFolder(folder.id)}
                    className={`flex h-full w-full min-w-0 rounded-xl border border-[var(--ui-border)] text-left hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 ${view === 'grid' ? 'flex-col items-start gap-3 p-3 sm:p-4' : 'items-center gap-3 px-3 py-2'}`}>
                    <FolderIcon aria-hidden="true" className={`shrink-0 fill-amber-200 text-amber-500 ${view === 'grid' ? 'h-9 w-9' : 'h-5 w-5'}`} />
                    <span className={`flex min-w-0 flex-1 ${view === 'grid' ? 'w-full flex-col gap-1' : 'items-center justify-between gap-2'}`}>
                      <strong title={folder.name} className="truncate text-sm">{folder.name}</strong>
                      <span className="shrink-0 text-xs text-[var(--ui-muted)]">{documentCounts.get(folder.id) ?? 0} tài liệu</span>
                    </span>
                  </button>
                </li>)}
                {visibleDocuments.map(item => {
                  const { title, Icon, color } = documentPreview(item);
                  return <li key={item.id}
                    className={`flex min-w-0 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-subtle)] ${view === 'grid' ? 'flex-col items-start gap-3 p-3 sm:p-4' : 'items-center gap-3 px-3 py-2'}`}>
                    <Icon aria-hidden="true" className={`shrink-0 ${color} ${view === 'grid' ? 'h-9 w-9' : 'h-5 w-5'}`} />
                    <span className={`flex min-w-0 flex-1 ${view === 'grid' ? 'w-full flex-col gap-1' : 'flex-wrap items-center justify-between gap-1'}`}>
                      <strong title={title} className="truncate text-sm">{title}</strong>
                      <span className="text-xs text-[var(--ui-muted)]">Cập nhật {formatDateTime(item.updatedAt)}</span>
                    </span>
                  </li>;
                })}
              </ul>}
          </div>
        </section>
      </div>

      <footer className="shrink-0 space-y-2 border-t border-[var(--ui-border)] px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 dark:bg-blue-950/40 sm:gap-3 sm:px-4 sm:py-3">
          <FolderIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-500 sm:h-7 sm:w-7" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-[var(--ui-muted)]">Vị trí di chuyển đến</div>
            <div aria-live="polite" title={targetLabel} className="truncate text-sm font-semibold">{targetExists ? targetLabel : 'Chưa chọn vị trí hợp lệ'}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap sm:gap-2.5">
            <button type="button" onClick={onClose} className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2.5 py-2 text-sm font-medium hover:bg-[var(--ui-hover)] sm:px-5">Hủy</button>
            <button type="button" disabled={unchanged || !targetExists} onClick={() => {
              if (onMove(doc.id, folderId, space)) onClose();
              else setMoveError(true);
            }} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-2.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 sm:px-5">
              <FolderInput aria-hidden="true" className="hidden h-4 w-4 sm:block" />Di chuyển
            </button>
          </div>
        </div>
        {moveError && <p role="alert" className="text-sm text-red-600">Không thể di chuyển tài liệu. Hãy kiểm tra lại vị trí đích.</p>}
      </footer>
    </div>
  </div>;
}
