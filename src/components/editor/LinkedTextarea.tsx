import React, { forwardRef, useContext } from 'react';
import { InlineMention, InlineLink } from '../../types';
import { CommentHighlights } from './commentHighlights';

export const mentionPillClassName = 'rounded bg-blue-500/15 text-[var(--ui-accent)] enabled:hover:bg-blue-500/25';

export function replaceInlineRanges<T extends { start: number; end: number }>(ranges: T[] | undefined, start: number, end: number, length: number): T[] {
  const delta = length - (end - start);
  return (ranges || []).flatMap(range => range.end <= start ? [range] : range.start >= end
    ? [{ ...range, start: range.start + delta, end: range.end + delta }] : []);
}

export function shiftInlineRanges<T extends { start: number; end: number }>(ranges: T[] | undefined, before: string, after: string): T[] {
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  let oldEnd = before.length, newEnd = after.length;
  while (oldEnd > start && newEnd > start && before[oldEnd - 1] === after[newEnd - 1]) { oldEnd--; newEnd--; }
  return replaceInlineRanges(ranges, start, oldEnd, newEnd - start);
}

export function getMentionTrigger(text: string, end: number, existing?: InlineMention[]) {
  const before = text.slice(0, end);
  const start = before.lastIndexOf('@');
  if (start < 0 || start < before.lastIndexOf('\n')) return;
  if (existing?.some(mention => mention.start <= start && start < mention.end)) return;
  return { query: before.slice(start), start, end };
}

function formatMirrorText(text: string): string {
  if (!text) return '\u00a0';
  return text.endsWith('\n') ? `${text}\u00a0` : text;
}

export const LinkedTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  links?: InlineLink[]; groupMentions?: InlineMention[]; onGroupMentionClick?: (groupId: string) => void; commentItemId?: string;
}>(function LinkedTextarea({ links, groupMentions, onGroupMentionClick, commentItemId, ...props }, ref) {
  const comments = useContext(CommentHighlights);
  if (comments?.allowReadOnlySelection && props.disabled) {
    props = { ...props, disabled: false, readOnly: true, onKeyDown: undefined, onChange: undefined };
    onGroupMentionClick = undefined;
  }
  const text = String(props.value || '');
  const highlights = comments?.ranges.filter(range => range.itemId === commentItemId && range.end <= text.length) ?? [];
  const ranges = [...(links || []).filter(link => /^https?:\/\//i.test(link.url)), ...(groupMentions || [])]
    .filter(range => range.start >= 0 && range.end > range.start && range.end <= text.length)
    .sort((a, b) => a.start - b.start);
  const displayClass = props.className || '';
  if (!ranges.length && !highlights.length) {
    const mirrorClass = displayClass.replace(/\b(?:block|inline-block|inline|hidden)\b/g, '').trim();
    return <>
      <textarea {...props} ref={ref} data-comment-item={commentItemId} data-print-source="" className={`${displayClass} print:hidden`} />
      <div
        data-print-mirror=""
        aria-hidden="true"
        className={`hidden print:block whitespace-pre-wrap [overflow-wrap:anywhere] ${mirrorClass}`}
      >
        {formatMirrorText(text)}
      </div>
    </>;
  }
  const displayText = (start: number, end: number) => {
    if (!highlights.length) return text.slice(start, end);
    const positions = [...new Set([start, end, ...highlights.flatMap(range => [range.start, range.end]).filter(position => start < position && position < end)])].sort((a, b) => a - b);
    return positions.slice(0, -1).map((from, index) => {
      const to = positions[index + 1];
      const matching = highlights.filter(range => range.start < to && range.end > from);
      const content = text.slice(from, to);
      if (!matching.length) return content;
      return <mark key={from} data-comment-highlight={JSON.stringify(matching.map(range => range.threadId))}
        data-comment-tooltip={matching.map(range => range.title).join('\n')}
        className={`rounded-sm text-inherit print:bg-transparent ${matching.some(range => range.active) ? 'bg-amber-400/65' : matching.every(range => range.resolved) ? 'bg-amber-400/10' : 'bg-amber-400/30'}`}>{content}</mark>;
    });
  };
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    parts.push(<React.Fragment key={`text-${cursor}`}>{displayText(cursor, range.start)}</React.Fragment>);
    const label = displayText(range.start, range.end);
    const key = `${range.start}-${range.end}`;
    parts.push('url' in range
      ? <a key={key} href={range.url} target="_blank" rel="noopener noreferrer" title={range.url}
          onMouseDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}
          className="pointer-events-auto text-[#0563c1] underline decoration-1 underline-offset-2 hover:text-blue-800">{label}</a>
      : 'email' in range
        ? <span key={key} data-person-mention={range.email} className={mentionPillClassName}>{label}</span>
      : onGroupMentionClick && !props.disabled
        ? <button key={key} type="button" data-group-mention={range.groupId} title="Mời và phân quyền nhóm"
            onMouseDown={event => { event.preventDefault(); event.stopPropagation(); }}
            onClick={event => { event.stopPropagation(); onGroupMentionClick(range.groupId); }}
            className={`pointer-events-auto inline p-0 align-baseline [font:inherit] ${mentionPillClassName}`}>{label}</button>
        : <span key={key} data-group-mention={range.groupId} className={mentionPillClassName}>{label}</span>);
    cursor = range.end;
  }
  parts.push(<React.Fragment key="tail">{displayText(cursor, text.length)}</React.Fragment>);
  const highlightAt = (field: HTMLTextAreaElement, x: number, y: number) => Array.from(field.nextElementSibling?.querySelectorAll<HTMLElement>('[data-comment-highlight]') ?? [])
    .find(mark => Array.from(mark.getClientRects()).some(rect => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom));
  return <div className="relative min-w-0 flex-1">
    <textarea {...props} ref={ref} data-print-source="" data-comment-item={commentItemId}
      onClick={event => {
        props.onClick?.(event);
        const field = event.currentTarget;
        if (event.defaultPrevented || event.detail !== 1 || field.selectionStart !== field.selectionEnd) return;
        const ids = highlightAt(field, event.clientX, event.clientY)?.dataset.commentHighlight;
        if (ids) comments?.onActivate(JSON.parse(ids));
      }}
      onMouseMove={event => {
        props.onMouseMove?.(event);
        const field = event.currentTarget;
        field.title = highlightAt(field, event.clientX, event.clientY)?.dataset.commentTooltip ?? props.title ?? '';
      }}
      onScroll={event => {
        props.onScroll?.(event);
        const field = event.currentTarget;
        const mirror = field.nextElementSibling;
        if (mirror) { mirror.scrollTop = field.scrollTop; mirror.scrollLeft = field.scrollLeft; }
      }}
      className={`${displayClass} [overflow-wrap:anywhere] print:hidden`}
      style={{ ...props.style, color: 'transparent', WebkitTextFillColor: 'transparent', caretColor: 'var(--ui-text)' }} />
    <div data-linked-text className={`pointer-events-none absolute inset-0 overflow-hidden print:static print:inset-auto print:h-auto print:overflow-visible whitespace-pre-wrap [overflow-wrap:anywhere] ${displayClass}`}>
      {parts}{text.endsWith('\n') ? '\u00a0' : null}
    </div>
  </div>;
});
