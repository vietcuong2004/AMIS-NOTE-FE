import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Building2, Check, ChevronDown, ChevronRight, Folder as FolderIcon, FolderInput, Home, Info, Search, User, X } from 'lucide-react';
import type { Folder, SpaceType } from '../../types';
import { getFolderAncestors } from '../../utils/folders';
import { searchTerms, workspaceName } from '../../utils/workspaceSearch';

interface MoveFolderModalProps {
  folder: Folder | null;
  folders: Folder[];
  isOpen: boolean;
  onClose: () => void;
  onMove: (folderId: string, targetParentId: string | null, targetSpace: SpaceType) => boolean | void;
  onToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const spaces = [
  { id: 'personal', Icon: User },
  { id: 'company', Icon: Building2 },
] as const;

export function MoveFolderModal({ isOpen, folder, ...props }: MoveFolderModalProps) {
  return isOpen && folder ? <MoveFolderDialog key={folder.id} folder={folder} {...props} /> : null;
}

function MoveFolderDialog({ folder, folders, onClose, onMove, onToast }:
  Omit<MoveFolderModalProps, 'folder' | 'isOpen'> & { folder: Folder }) {
  const titleId = useId();
  const search = useRef<HTMLInputElement>(null);
  const [space, setSpace] = useState(folder.space);
  const [parentId, setParentId] = useState<string | null>(folder.parentId ?? null);
  const [expanded, setExpanded] = useState(() => new Set(getFolderAncestors(folder.parentId, folders).map(item => item.id)));
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const allowed = folders.filter(item => item.space === space &&
    !getFolderAncestors(item.id, folders).some(ancestor => ancestor.id === folder.id));
  const children = (id: string | null) => allowed.filter(item => (item.parentId ?? null) === id);
  const oldLocation = [workspaceName(folder.space), ...getFolderAncestors(folder.parentId, folders).map(item => item.name)].join(' / ');
  const newLocation = [workspaceName(space), ...getFolderAncestors(parentId, allowed).map(item => item.name)].join(' / ');
  const destinationExists = parentId === null || allowed.some(item => item.id === parentId);
  const unchanged = space === folder.space && parentId === (folder.parentId ?? null);
  const keyword = query.trim();
  const matches = keyword ? allowed.flatMap(item => {
    const path = getFolderAncestors(item.id, allowed).map(part => part.name);
    return searchTerms(path.join(' / '), keyword).length ? [{ item, breadcrumb: path.slice(0, -1).join(' / ') }] : [];
  }) : [];

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    search.current?.focus();
    return () => { if (previous?.isConnected) previous.focus(); };
  }, []);

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
    if (event.key !== 'Tab') return;
    const items = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input');
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  function selectParent(id: string | null) {
    setParentId(id);
    setError('');
  }

  function confirm() {
    if (unchanged || !destinationExists) return;
    try {
      if (onMove(folder.id, parentId, space) === false) {
        setError('Không thể di chuyển thư mục. Hãy kiểm tra lại vị trí đích.');
        return;
      }
      onToast?.(`Đã di chuyển thư mục “${folder.name}” vào ${newLocation}.`);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể di chuyển thư mục.');
    }
  }

  function destinationButton(id: string | null, name: string, breadcrumb?: string) {
    const Icon = id === null ? Home : FolderIcon;
    return <button type="button" aria-pressed={parentId === id} onClick={() => selectParent(id)} title={name}
      className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm hover:bg-[var(--ui-hover)] ${parentId === id ? 'border-blue-600 font-semibold' : 'border-transparent'}`}>
      <Icon aria-hidden="true" className="size-4 shrink-0 text-[var(--ui-muted)]" />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{name}</span>
        {breadcrumb && <span className="block truncate text-xs font-normal text-[var(--ui-muted)]">{breadcrumb}</span>}
      </span>
      {parentId === id && <Check aria-hidden="true" className="size-4 shrink-0 text-blue-600" />}
    </button>;
  }

  function renderTree(id: string | null, visited: Set<string>) {
    return <ul className="space-y-0.5">
      {children(id).filter(item => !visited.has(item.id)).map(item => {
        const hasChildren = children(item.id).some(child => child.id !== item.id && !visited.has(child.id));
        const open = expanded.has(item.id);
        return <li key={item.id}>
          <div className="flex min-w-0 items-center gap-0.5">
            {hasChildren ? <button type="button" aria-label={`${open ? 'Thu gọn' : 'Mở rộng'} ${item.name}`} aria-expanded={open}
              onClick={() => setExpanded(previous => {
                const next = new Set(previous);
                if (next.has(item.id)) next.delete(item.id);
                else next.add(item.id);
                return next;
              })} className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-[var(--ui-hover)]">
              {open ? <ChevronDown aria-hidden="true" className="size-4" /> : <ChevronRight aria-hidden="true" className="size-4" />}
            </button> : <span className="w-7 shrink-0" />}
            {destinationButton(item.id, item.name)}
          </div>
          {hasChildren && open && <div className="ml-3 border-l border-[var(--ui-border)] pl-1.5">
            {renderTree(item.id, new Set([...visited, item.id]))}
          </div>}
        </li>;
      })}
    </ul>;
  }

  return createPortal(<div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/30 p-3"
    onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={`${titleId}-description`}
      onKeyDown={handleKeys} className="flex h-[81dvh] max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-xl">
      <header className="flex shrink-0 items-start gap-3 border-b border-[var(--ui-border)] px-4 py-4 sm:px-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-600"><FolderIcon aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-lg font-bold">Di chuyển thư mục</h2>
          <p id={`${titleId}-description`} title={folder.name} className="truncate text-sm text-[var(--ui-muted)]">{folder.name}</p>
        </div>
        <button type="button" aria-label="Đóng" onClick={onClose} className="rounded-lg p-2 text-[var(--ui-muted)] hover:bg-[var(--ui-hover)]"><X aria-hidden="true" className="size-4" /></button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-4 sm:px-5">
        <div role="group" aria-label="Không gian đích" className="flex shrink-0 flex-wrap items-center gap-2">
          {spaces.map(({ id, Icon }) => <button key={id} type="button" aria-pressed={space === id} onClick={() => {
            if (space === id) return;
            setSpace(id);
            selectParent(id === folder.space ? folder.parentId ?? null : null);
            setQuery('');
            setExpanded(new Set(id === folder.space ? getFolderAncestors(folder.parentId, folders).map(item => item.id) : []));
          }} className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-sm font-medium hover:bg-[var(--ui-hover)] ${space === id ? 'border-blue-600' : 'border-[var(--ui-border)]'}`}>
            <Icon aria-hidden="true" className="size-4 shrink-0" />{workspaceName(id)}
          </button>)}
        </div>
        <label className="flex shrink-0 items-center gap-2 rounded-lg border border-[var(--ui-border)] px-3 focus-within:border-blue-600">
          <Search aria-hidden="true" className="size-4 shrink-0 text-[var(--ui-muted)]" />
          <input ref={search} type="search" value={query} aria-label="Tìm thư mục" placeholder="Tìm thư mục…"
            onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" />
        </label>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain rounded-xl border border-[var(--ui-border)] p-1.5" aria-label="Thư mục đích">
          <div className="flex">{destinationButton(null, 'Thư mục gốc')}</div>
          {keyword ? (matches.length ? <ul className="space-y-0.5">
            {matches.map(({ item, breadcrumb }) => <li key={item.id} className="flex">
              {destinationButton(item.id, item.name, breadcrumb)}
            </li>)}
          </ul> : <p role="status" className="px-3 py-4 text-sm text-[var(--ui-muted)]">Không tìm thấy thư mục phù hợp.</p>)
            : renderTree(null, new Set())}
        </div>
      </div>

      <footer className="shrink-0 space-y-2 border-t border-[var(--ui-border)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-2.5 sm:gap-3">
          <FolderIcon aria-hidden="true" className="size-5 shrink-0 text-blue-600" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--ui-muted)]" title={oldLocation}>Từ <span className="inline-block max-w-full truncate align-bottom">{oldLocation}</span></p>
            <p className="truncate text-sm font-semibold" aria-live="polite" title={newLocation}>
              {destinationExists ? `Đến ${newLocation}` : 'Chưa chọn vị trí đích hợp lệ'}
            </p>
          </div>
          <div className="flex shrink-0 gap-2 whitespace-nowrap">
            <button type="button" onClick={onClose} className="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-2.5 py-2 text-sm hover:bg-[var(--ui-hover)] sm:px-4">Hủy</button>
            <button type="button" disabled={unchanged || !destinationExists} onClick={confirm}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 sm:px-4">
              <FolderInput aria-hidden="true" className="hidden size-4 sm:block" />Di chuyển
            </button>
          </div>
        </div>
        <p aria-hidden={space === folder.space} className={`flex items-center gap-1.5 text-xs text-[var(--ui-muted)] ${space === folder.space ? 'invisible' : ''}`}>
          <Info aria-hidden="true" className="size-4 shrink-0 text-blue-600" />Các tài liệu và thư mục con cũng sẽ được chuyển sang không gian đích.
        </p>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </footer>
    </div>
  </div>, document.body);
}
