import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, MouseEvent } from 'react';
import { Check, MoreHorizontal, Trash2, X } from 'lucide-react';
import type { Block, UserRole } from '../../types';
import { canManageComment, canResolveComment, canWriteComments } from '../../types/comments';
import type { CommentAuthor, CommentMessage, CommentThread } from '../../types/comments';
import type { CommentMutation } from './useDocumentComments';
import { commentRangeText, compareCommentPositions } from '../../utils/commentAnchors';
import { formatDateTime } from '../../utils/dateTime';
import { memoryStorage } from '../../utils/memoryStorage';

const secondary = 'rounded-lg border border-[var(--ui-border)] px-3 py-1.5 text-sm hover:bg-[var(--ui-hover)] disabled:opacity-50';
const primary = 'rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50';
const field = 'w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-sm focus-visible:outline-blue-600';
const widthKey = 'misa_comments_sidebar_width';
const defaultWidth = 384;
const minWidth = 280;
const maxWidth = 600;

function CommentForm({ label, initial = '', onSubmit, onCancel, autoFocus = false }: {
  label: string; initial?: string; onSubmit: (content: string) => boolean; onCancel?: () => void; autoFocus?: boolean;
}) {
  const [content, setContent] = useState(initial);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (autoFocus) input.current?.focus(); }, [autoFocus]);
  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const text = content.trim();
    if (text && onSubmit(text)) setContent('');
  };

  return <form onSubmit={submit} className="space-y-2">
    <textarea ref={input} rows={autoFocus ? 3 : 2} maxLength={10000} value={content} onChange={event => setContent(event.target.value)}
      className={field} aria-label={label} placeholder={label} onKeyDown={event => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); submit(); }
        if (event.key === 'Escape' && onCancel) { event.stopPropagation(); onCancel(); }
      }} />
    <div className="flex items-center justify-end gap-2">
      {autoFocus && <span className="mr-auto text-xs text-[var(--ui-muted)]">Ctrl + Enter để gửi</span>}
      {onCancel && <button type="button" className={secondary} onClick={onCancel}>Hủy</button>}
      <button type="submit" className={primary} disabled={!content.trim()}>Gửi</button>
    </div>
  </form>;
}

interface PanelProps {
  blocks: Block[];
  threads: CommentThread[];
  viewer: { user: CommentAuthor; role: UserRole };
  activeId?: string;
  draft?: { quote: string };
  onClose: () => void;
  onSelect: (thread: CommentThread) => void;
  onCancelDraft: () => void;
  onCreate: (content: string) => boolean;
  onMutate: (id: string, action: CommentMutation, content?: string, replyId?: string) => boolean;
}

const filters = [{ value: 'OPEN', label: 'Chưa hoàn thành' }, { value: 'ALL', label: 'Tất cả' }, { value: 'RESOLVED', label: 'Đã hoàn thành' }] as const;

export function CommentsPanel(props: PanelProps) {
  const { threads, blocks, activeId, draft, onClose, onSelect, onCreate, onMutate, onCancelDraft, viewer } = props;
  const [width, setWidth] = useState(() => Number(memoryStorage.getItem(widthKey)) || defaultWidth);
  const [resizing, setResizing] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const endResize = useRef<(() => void) | null>(null);
  const [filter, setFilter] = useState<typeof filters[number]['value']>('OPEN');
  const [editing, setEditing] = useState<string>();
  const [confirm, setConfirm] = useState<{ threadId: string; replyId?: string }>();
  const rows = useRef<HTMLDivElement>(null);
  const cancelConfirmation = useRef<HTMLButtonElement>(null);
  const active = threads.find(thread => thread.id === activeId);
  useEffect(() => () => endResize.current?.(), []);
  useEffect(() => { if (confirm) cancelConfirmation.current?.focus(); }, [confirm]);
  useEffect(() => {
    if (active && filter !== 'ALL' && filter !== active.status) setFilter(active.status);
  }, [activeId]);
  useEffect(() => {
    if (!activeId) return;
    const card = Array.from(rows.current?.querySelectorAll<HTMLElement>('[data-comment-thread]') ?? []).find(el => el.dataset.commentThread === activeId);
    card?.scrollIntoView?.({ block: 'nearest' });
    card?.querySelector('button')?.focus({ preventScroll: true });
  }, [activeId, filter]);

  const openCount = threads.filter(thread => thread.status === 'OPEN').length;
  const visible = threads.filter(thread => filter === 'ALL' || thread.status === filter).sort((a, b) => compareCommentPositions(a, b, blocks));
  const canWrite = canWriteComments(viewer.role);

  const resizeLimit = () => {
    const available = panel.current?.parentElement?.clientWidth;
    return available ? Math.max(minWidth, Math.min(maxWidth, Math.floor(available * 0.6))) : maxWidth;
  };
  const changeWidth = (next: number) => {
    const value = Math.max(minWidth, Math.min(resizeLimit(), Math.round(next)));
    setWidth(value);
    memoryStorage.setItem(widthKey, String(value));
  };
  const resetWidth = () => {
    setWidth(defaultWidth);
    memoryStorage.removeItem(widthKey);
  };
  const startResize = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    endResize.current?.();
    const startX = event.clientX;
    const startWidth = panel.current?.getBoundingClientRect().width || width;
    const { cursor, userSelect } = document.body.style;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    setResizing(true);
    const move = (next: globalThis.MouseEvent) => changeWidth(startWidth + startX - next.clientX);
    const stop = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('blur', stop);
      document.body.style.cursor = cursor;
      document.body.style.userSelect = userSelect;
      endResize.current = null;
      setResizing(false);
    };
    endResize.current = stop;
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    window.addEventListener('blur', stop);
  };

  function renderMessage(thread: CommentThread, message: CommentMessage) {
    const replyId = message === thread ? undefined : message.id;
    const mayManage = canManageComment(viewer.role, viewer.user.id, message.authorId);
    const initials = message.author.name.trim().split(/\s+/).slice(-2).map(part => part[0]).join('').toUpperCase();
    return <div key={message.id} className="min-w-0 space-y-2">
      <div className="flex items-start gap-2">
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-800">{initials}</span>
        <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{message.author.name}</p>
          <time dateTime={message.createdAt} className="text-xs text-[var(--ui-muted)]">{formatDateTime(message.createdAt)}{message.updatedAt !== message.createdAt && ' · Đã sửa'}</time></div>
        {mayManage && <details className="relative">
          <summary aria-label="Thao tác nhận xét" title="Thao tác nhận xét" className="list-none rounded-md p-1 hover:bg-[var(--ui-hover)]"><MoreHorizontal className="size-4" /></summary>
          <div className="absolute right-0 z-10 grid min-w-24 gap-0.5 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] p-1 shadow-lg">
            <button type="button" className="rounded px-2 py-1 text-left text-sm hover:bg-[var(--ui-hover)]" onClick={event => {
              event.currentTarget.closest('details')?.removeAttribute('open'); setEditing(message.id);
            }}>Sửa</button>
            <button type="button" className="rounded px-2 py-1 text-left text-sm text-red-600 hover:bg-[var(--ui-hover)]" onClick={event => {
              event.currentTarget.closest('details')?.removeAttribute('open'); setConfirm({ threadId: thread.id, replyId });
            }}>Xóa</button>
          </div>
        </details>}
      </div>
      {editing === message.id ? <CommentForm autoFocus label="Sửa nội dung nhận xét" initial={message.content} onCancel={() => setEditing(undefined)}
        onSubmit={content => { const ok = onMutate(thread.id, 'edit', content, replyId); if (ok) setEditing(undefined); return ok; }} />
        : <p className="whitespace-pre-wrap break-words pl-10 text-sm">{message.content}</p>}
    </div>;
  }

  return <aside ref={panel} aria-label="Nhận xét tài liệu" style={{ '--comments-width': `${width}px` } as CSSProperties}
    className="no-print absolute inset-y-0 right-0 z-30 flex w-full max-w-96 shrink-0 flex-col border-l border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-xl lg:relative lg:w-[var(--comments-width)] lg:max-w-[60%] lg:shadow-none">
    <div role="separator" aria-label="Chỉnh chiều rộng sidebar nhận xét" aria-orientation="vertical"
      aria-valuemin={minWidth} aria-valuemax={maxWidth} aria-valuenow={width} tabIndex={0}
      title="Kéo để đổi chiều rộng. Nhấp đúp để đặt lại."
      onMouseDown={startResize} onDoubleClick={resetWidth} onKeyDown={event => {
        if (event.key === 'Enter') resetWidth();
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          const currentWidth = panel.current?.getBoundingClientRect().width || width;
          changeWidth(currentWidth + (event.key === 'ArrowLeft' ? 16 : -16));
        } else return;
        event.preventDefault();
      }} className="group absolute inset-y-0 -left-1 z-10 hidden w-2.5 cursor-col-resize select-none justify-center lg:flex">
      <span aria-hidden="true" className={`h-full w-0.5 transition-colors ${resizing ? 'bg-[var(--ui-primary)]' : 'bg-transparent group-hover:bg-[var(--ui-primary)]/30'}`} />
    </div>
    <header className="flex shrink-0 items-center justify-between gap-2 px-4 pt-4">
      <h2 className="text-lg font-semibold">Nhận xét <span className="text-sm text-[var(--ui-muted)]" aria-label={`${openCount} nhận xét chưa hoàn thành`}>({openCount})</span></h2>
      <button aria-label="Đóng nhận xét" title="Đóng nhận xét" type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--ui-hover)]"><X className="size-5" /></button>
    </header>
    <div role="group" aria-label="Lọc nhận xét" className="flex shrink-0 flex-wrap gap-1.5 border-b border-[var(--ui-border)] p-3">
      {filters.map(item => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}
        className={`rounded-full border px-2.5 py-1.5 text-xs ${filter === item.value ? 'border-blue-300 bg-blue-500/10 text-[var(--ui-accent)]' : 'border-[var(--ui-border)] hover:bg-[var(--ui-hover)]'}`}>{item.label}</button>)}
    </div>
    <div ref={rows} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
      {draft && canWrite && <section aria-label="Thêm nhận xét" className="space-y-3 rounded-xl border border-blue-300 p-3">
        <h3 className="font-semibold">Thêm nhận xét</h3>
        <blockquote className="max-h-28 overflow-auto whitespace-pre-wrap break-words rounded bg-amber-400/15 p-2 text-sm">{draft.quote}</blockquote>
        <CommentForm label="Nhập nhận xét của bạn..." onSubmit={onCreate} onCancel={onCancelDraft} autoFocus />
      </section>}
      {!draft && !visible.length && <p className="px-2 py-6 text-sm text-[var(--ui-muted)]">{threads.length ? 'Không có nhận xét trong bộ lọc này.' : 'Chưa có nhận xét nào. Bôi đen nội dung trong tài liệu để thêm nhận xét.'}</p>}
      {visible.map(thread => {
        const hasLocation = thread.anchor.some(range => commentRangeText(blocks.find(block => block.id === range.blockId), range) !== undefined);
        const mayResolve = canResolveComment(viewer.role, viewer.user.id, thread.authorId);
        return <article key={thread.id} data-comment-thread={thread.id} className={`space-y-3 rounded-xl border p-3 ${thread.id === activeId ? 'border-blue-400' : 'border-[var(--ui-border)]'}`}>
          <button type="button" title="Đến nội dung được nhận xét" aria-current={thread.id === activeId ? 'true' : undefined} onClick={() => onSelect(thread)}
            className="w-full whitespace-pre-wrap break-words rounded bg-amber-400/15 p-2 text-left text-xs">{thread.quotedText}</button>
          {!hasLocation && <p className="text-xs text-[var(--ui-muted)]">Nội dung gốc đã bị xóa</p>}
          {thread.status === 'RESOLVED' && <p className="flex items-start gap-1.5 text-xs text-green-700"><Check className="size-4 shrink-0" />Đã hoàn thành · {thread.resolvedBy?.name} · {formatDateTime(thread.resolvedAt)}</p>}
          {renderMessage(thread, thread)}
          {!!thread.replies.length && <div className="ml-3 space-y-3 border-l border-[var(--ui-border)] pl-3">{thread.replies.map(reply => renderMessage(thread, reply))}</div>}
          {canWrite && thread.status === 'OPEN' && <CommentForm label="Trả lời..."
            onSubmit={content => onMutate(thread.id, 'reply', content)} />}
          {mayResolve && <button type="button" className={secondary} onClick={() => {
            onMutate(thread.id, thread.status === 'OPEN' ? 'resolve' : 'reopen');
          }}>{thread.status === 'OPEN' ? 'Đã hoàn thành' : 'Mở lại'}</button>}
        </article>;
      })}
    </div>
    {confirm && <div className="shrink-0 space-y-2 border-t border-[var(--ui-border)] bg-[var(--ui-subtle)] p-3" role="alertdialog" aria-label="Xác nhận xóa nhận xét"
      onKeyDown={event => { if (event.key === 'Escape') setConfirm(undefined); }}>
      <p className="text-sm">{confirm.replyId ? 'Xóa câu trả lời này?' : 'Xóa nhận xét này và tất cả câu trả lời?'}</p>
      <div className="flex justify-end gap-2"><button ref={cancelConfirmation} type="button" className={secondary} onClick={() => setConfirm(undefined)}>Hủy</button>
        <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          onClick={() => { if (onMutate(confirm.threadId, 'delete', undefined, confirm.replyId)) setConfirm(undefined); }}><Trash2 className="size-3" />Xóa</button></div>
    </div>}
  </aside>;
}
