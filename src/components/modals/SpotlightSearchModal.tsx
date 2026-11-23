import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, FileText, Folder as FolderIcon, Search, X } from 'lucide-react';
import type { Document, Folder, ViewState } from '../../types';
import { findWorkspaceResults, searchTerms, workspaceName, type SearchResult, type SearchScope } from '../../utils/workspaceSearch';
import { getFolderAncestors } from '../../utils/folders';
import { DocumentRolePill } from '../DocumentRolePill';

const RESULT_ROW_HEIGHT_REM = 5;
const VISIBLE_RESULT_ROWS = 5;

export function SearchResultRows({ results, query, selected, listId, onSelect }: {
  results: SearchResult[]; query: string; selected?: number; listId?: string; onSelect: (result: SearchResult) => void;
}) {
  function highlight(text: string) {
    const ranges = searchTerms(text, query);
    if (!ranges.length) return text;
    let previous = 0;
    return <>{ranges.map(([start, end]) => {
      const before = text.slice(previous, start);
      previous = end;
      return <span key={start}>{before}<mark className="rounded-sm bg-amber-200 px-px text-slate-900">{text.slice(start, end)}</mark></span>;
    })}{text.slice(previous)}</>;
  }

  return <ul id={listId} role={listId ? 'listbox' : undefined} aria-label="Kết quả tìm kiếm" className="divide-y divide-[var(--ui-border)]">
    {results.map((result, index) => {
      const Icon = result.type === 'folder' ? FolderIcon : FileText;
      const path = <span className="flex items-center gap-1.5 text-xs text-[var(--ui-muted)]">
        <FolderIcon aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="truncate" title={result.path}>{highlight(result.path)}</span>
      </span>;
      const snippet = result.snippet && <span className="block truncate text-sm text-[var(--ui-muted)]">{highlight(result.snippet)}</span>;
      return <li key={`${result.type}-${result.id}`} role={listId ? 'presentation' : undefined}
        style={listId ? { height: `${RESULT_ROW_HEIGHT_REM}rem` } : undefined}>
        <button type="button" id={listId ? `${listId}-${index}` : undefined} role={listId ? 'option' : undefined}
          aria-selected={listId ? selected === index : undefined} onClick={() => onSelect(result)}
          className={`flex w-full items-start gap-3 rounded-lg px-1 text-left hover:bg-[var(--ui-hover)] focus-visible:outline-[var(--ui-accent)] ${listId ? 'h-full py-2' : 'py-3'} ${selected === index ? 'bg-[var(--ui-selected)]' : ''}`}>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--ui-border)]">
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <span className="min-w-0 flex-1 space-y-0.5">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-semibold" title={result.title}>{highlight(result.title)}</span>
              {!listId && result.type === 'document' && <DocumentRolePill role={result.permission} />}
            </span>
            {listId ? <>{snippet}{path}</> : <>{path}{snippet}</>}
          </span>
        </button>
      </li>;
    })}
  </ul>;
}

interface Props {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  documents: Document[];
  folders: Folder[];
  currentScope?: SearchScope;
  onNavigate: (view: ViewState) => void;
}

export function SpotlightSearchModal({
  isOpen, onOpen, onClose, documents, folders, currentScope, onNavigate,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const resultViewport = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<number>();
  const [scope, setScope] = useState<SearchScope>();
  const [scopePickerOpen, setScopePickerOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => new Set());
  const [position, setPosition] = useState({ top: 48, left: 12, width: 600 });
  const keyword = query.trim();
  const folder = folders.find(item => item.id === scope?.folderId && item.space === scope?.space);
  const currentFolder = folders.find(item => item.id === currentScope?.folderId && item.space === currentScope?.space);
  const effectiveScope = scope && (!scope.folderId || folder) ? scope : undefined;
  const scopeLabel = effectiveScope ? folder?.name ?? workspaceName(effectiveScope.space)
    : currentScope ? currentFolder?.name ?? workspaceName(currentScope.space) : '';
  const pickerScope = effectiveScope ?? currentScope;
  const pickerFolderId = effectiveScope ? folder?.id : currentFolder?.id;
  const pickerAncestors = getFolderAncestors(pickerFolderId, folders);
  const childrenByParent = new Map<string | undefined, Folder[]>();
  if (scopePickerOpen && pickerScope) {
    for (const child of folders) {
      if (child.space !== pickerScope.space) continue;
      const parentId = child.parentId || undefined;
      const siblings = childrenByParent.get(parentId);
      if (siblings) siblings.push(child);
      else childrenByParent.set(parentId, [child]);
    }
  }
  const results = useMemo(() => findWorkspaceResults(documents, folders, keyword, effectiveScope),
    [documents, folders, keyword, effectiveScope]);
  const shown = keyword ? results : results.slice(0, 6);

  useEffect(() => {
    setScope(undefined);
    setScopePickerOpen(false);
    setSelected(undefined);
  }, [currentScope?.space, currentScope?.folderId]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const place = () => {
      const bounds = root.current?.getBoundingClientRect();
      const width = Math.min(664, window.innerWidth - 24);
      const left = Math.max(12, Math.min(bounds?.left ?? 12, window.innerWidth - width - 12));
      setPosition({ top: (bounds?.bottom || 42) + 6, left, width });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelected(undefined);
      setScopePickerOpen(false);
      return;
    }
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) onClose();
    };
    window.document.addEventListener('pointerdown', outside);
    return () => window.document.removeEventListener('pointerdown', outside);
  }, [isOpen, onClose]);

  function selectResult(result: SearchResult) {
    onClose();
    onNavigate(result.type === 'document' ? { type: 'document', documentId: result.id } : { type: 'folder', folderId: result.id });
  }
  function viewAll() {
    onClose();
    onNavigate({ type: 'search', query: keyword, scope: effectiveScope });
  }
  function applyScope(next?: SearchScope) {
    setScope(next);
    setScopePickerOpen(false);
    setSelected(undefined);
    inputRef.current?.focus();
  }
  function renderScopePath(scope: SearchScope) {
    const trail = [{ name: workspaceName(scope.space), scope: { space: scope.space, folderId: undefined } },
      ...pickerAncestors.map(item => ({ name: item.name, scope: { space: item.space, folderId: item.id } }))];
    return trail.map((item, index) => <span key={item.scope.folderId ?? item.scope.space} className="inline-flex min-w-0 items-center gap-1">
      {index > 0 && <span aria-hidden="true" className="shrink-0 text-[var(--ui-tertiary)]">/</span>}
      <button type="button" aria-current={index === trail.length - 1 ? 'location' : undefined} title={item.name}
        onClick={() => applyScope(item.scope)}
        className="truncate rounded px-1 py-1 hover:bg-[var(--ui-hover)] hover:underline aria-[current=location]:font-semibold">{item.name}</button>
    </span>);
  }
  function renderFolders(parentId: string | undefined, visited: Set<string>) {
    return <ul className="space-y-0.5">
      {childrenByParent.get(parentId)?.filter(child => !visited.has(child.id)).map(child => {
        const canExpand = !!childrenByParent.get(child.id)?.some(item => !visited.has(item.id) && item.id !== child.id);
        const expanded = expandedFolders.has(child.id);
        return <li key={child.id}>
          <div className="flex items-center">
            {canExpand ? <button type="button" aria-label={`${expanded ? 'Thu gọn' : 'Mở rộng'} ${child.name}`}
              aria-expanded={expanded} onClick={() => setExpandedFolders(previous => {
                const next = new Set(previous);
                if (next.has(child.id)) next.delete(child.id);
                else next.add(child.id);
                return next;
              })} className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-[var(--ui-hover)]">
              {expanded ? <ChevronDown aria-hidden="true" className="size-3.5" /> : <ChevronRight aria-hidden="true" className="size-3.5" />}
            </button> : <span className="w-7 shrink-0" />}
            <button type="button" onClick={() => applyScope({ space: child.space, folderId: child.id })} title={child.name}
              className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 py-1.5 text-left text-sm hover:bg-[var(--ui-hover)]">
              <FolderIcon aria-hidden="true" className="size-4 shrink-0 text-[var(--ui-muted)]" />
              <span className="truncate">{child.name}</span>
            </button>
          </div>
          {canExpand && expanded && <div className="ml-3 border-l border-[var(--ui-border)] pl-1.5">
            {renderFolders(child.id, new Set([...visited, child.id]))}
          </div>}
        </li>;
      })}
    </ul>;
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      if (scopePickerOpen) setScopePickerOpen(false);
      else onClose();
      inputRef.current?.focus();
      return;
    }
    if (event.target !== inputRef.current) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) onOpen();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      if (shown.length) setSelected(previous => ((previous ?? (direction === 1 ? -1 : 0)) + direction + shown.length) % shown.length);
    } else if (isOpen && event.key === 'Enter') {
      event.preventDefault();
      if (selected !== undefined && shown[selected]) selectResult(shown[selected]);
      else if (keyword) viewAll();
      else if (shown[0]) selectResult(shown[0]);
    }
  }
  useLayoutEffect(() => {
    if (resultViewport.current) resultViewport.current.scrollTop = 0;
  }, [isOpen, keyword, effectiveScope]);
  useEffect(() => {
    if (selected !== undefined) resultViewport.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  return <div ref={root} onKeyDown={keyboard} className="relative min-w-0">
    <div className={`flex h-8 items-center gap-2 rounded-lg border bg-white/15 px-2.5 text-white ${isOpen ? 'border-white' : 'border-white/25'}`}>
      <Search aria-hidden="true" className="size-4 shrink-0" />
      <input ref={inputRef} id="top-search" type="text" role="combobox" aria-label="Tìm kiếm tài liệu" autoComplete="off"
        aria-autocomplete="list" aria-expanded={isOpen} aria-controls={isOpen && shown.length ? listId : undefined}
        aria-activedescendant={isOpen && selected !== undefined && shown[selected] ? `${listId}-${selected}` : undefined}
        value={query} placeholder="Nhập từ khóa tìm kiếm ..." onClick={onOpen}
        onChange={event => { setQuery(event.target.value); setSelected(undefined); onOpen(); }}
        className="min-w-0 flex-1 select-text bg-transparent text-sm text-white outline-none placeholder:text-white/80" />
      {query && <button type="button" aria-label="Xóa từ khóa tìm kiếm" onClick={() => {
        setQuery(''); setSelected(undefined); inputRef.current?.focus(); onOpen();
      }} className="rounded-full bg-white/25 p-0.5 hover:bg-white/40"><X aria-hidden="true" className="size-3.5" /></button>}
    </div>

    {isOpen && <div role="region" aria-label="Hộp kết quả tìm kiếm"
      style={{ ...position, maxHeight: `calc(100dvh - ${position.top + 12}px)` }}
      className="fixed z-50 flex select-text flex-col rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3 text-[var(--ui-text)] shadow-xl sm:p-4">
      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
        <button type="button" aria-pressed={!effectiveScope} onClick={() => applyScope()}
          className={`inline-flex min-w-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-sm font-medium hover:bg-[var(--ui-hover)] ${effectiveScope ? 'border-[var(--ui-border)]' : 'border-blue-600'}`}>
          <FileText aria-hidden="true" className="size-4 shrink-0" />Tất cả tài liệu
        </button>
        {currentScope && <div className={`relative flex max-w-full items-stretch rounded-xl border ${effectiveScope ? 'border-blue-600' : 'border-[var(--ui-border)]'}`}>
          <button type="button" aria-pressed={!!effectiveScope} onClick={() => applyScope(effectiveScope ?? currentScope)}
            className="inline-flex min-w-0 items-center gap-1.5 rounded-l-xl py-1.5 pl-2.5 text-sm font-medium hover:bg-[var(--ui-hover)]">
            <FolderIcon aria-hidden="true" className="size-4 shrink-0" /><span className="truncate">Trong {scopeLabel}</span>
          </button>
          <button type="button" aria-label="Chọn phạm vi tìm kiếm" aria-expanded={scopePickerOpen} onClick={() => {
            if (!scopePickerOpen) setExpandedFolders(new Set());
            setScopePickerOpen(!scopePickerOpen);
          }}
          className="rounded-r-xl px-2 hover:bg-[var(--ui-hover)]"><ChevronDown aria-hidden="true" className="size-3.5" /></button>
          {scopePickerOpen && pickerScope && <div role="region" aria-label="Phạm vi tìm kiếm"
            className="absolute top-full right-0 z-10 mt-1 max-h-[min(21rem,55dvh)] w-[min(19rem,calc(100vw-3rem))] overflow-y-auto overscroll-contain rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] p-2 text-[var(--ui-text)] shadow-lg sm:right-auto sm:left-0">
            <nav aria-label="Đường dẫn phạm vi" className="mb-1 flex flex-wrap items-center gap-x-1 border-b border-[var(--ui-border)] pb-1 text-xs">
              {renderScopePath(pickerScope)}
            </nav>
            {childrenByParent.get(pickerFolderId)?.length ? renderFolders(pickerFolderId, new Set(pickerAncestors.map(item => item.id)))
              : <p className="px-2 py-2 text-xs text-[var(--ui-muted)]">Không có thư mục con.</p>}
          </div>}
        </div>}
        <button type="button" aria-label="Đóng tìm kiếm" onClick={() => { onClose(); inputRef.current?.focus(); }}
          className="ml-auto shrink-0 rounded-lg bg-[var(--ui-subtle)] px-2.5 py-1.5 text-xs text-[var(--ui-muted)] hover:bg-[var(--ui-hover)]"><kbd>ESC</kbd> đóng</button>
      </div>
      <nav aria-label="Vị trí tìm kiếm" className="mb-3 flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm text-[var(--ui-muted)]">
        <FolderIcon aria-hidden="true" className="size-4 shrink-0 text-[var(--ui-accent)]" />
        {effectiveScope ? <div className="flex min-w-0 flex-wrap items-center gap-x-1">{renderScopePath(effectiveScope)}</div>
          : <span className="px-1 py-1">Tất cả tài liệu</span>}
      </nav>
      <div className="flex min-h-0 flex-col px-0.5">
        <div className="flex shrink-0 items-center justify-between gap-2 py-1">
          <h2 className="text-sm font-bold">{keyword ? 'Kết quả phù hợp' : 'Kết quả tìm kiếm'}</h2>
          {keyword && <span role="status" className="text-xs text-[var(--ui-muted)]">{results.length} kết quả</span>}
        </div>
        {shown.length ? <div ref={resultViewport} aria-label="Vùng cuộn kết quả" className="min-h-0 overflow-y-auto overscroll-contain"
          style={keyword ? { maxHeight: `${VISIBLE_RESULT_ROWS * RESULT_ROW_HEIGHT_REM}rem` } : undefined}>
          <SearchResultRows results={shown} query={keyword} selected={selected} listId={listId} onSelect={selectResult} />
        </div>
          : <p className="py-8 text-center text-sm text-[var(--ui-muted)]">Không tìm thấy tài liệu hoặc thư mục phù hợp.</p>}
      </div>
      {keyword && results.length > 0 && <button type="button" onClick={viewAll}
        className="mt-3 flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500/15 px-3 py-2.5 text-sm font-semibold text-[var(--ui-accent)] hover:bg-blue-500/25">
        Xem tất cả kết quả <ArrowRight aria-hidden="true" className="size-4" />
      </button>}
    </div>}
  </div>;
}
