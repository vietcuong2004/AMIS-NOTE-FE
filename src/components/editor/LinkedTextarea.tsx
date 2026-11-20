import React, { forwardRef } from 'react';
import { InlineMention, InlineLink } from '../../types';

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
  links?: InlineLink[]; groupMentions?: InlineMention[]; onGroupMentionClick?: (groupId: string) => void;
}>(function LinkedTextarea({ links, groupMentions, onGroupMentionClick, ...props }, ref) {
  const text = String(props.value || '');
  const ranges = [...(links || []).filter(link => /^https?:\/\//i.test(link.url)), ...(groupMentions || [])]
    .filter(range => range.start >= 0 && range.end > range.start && range.end <= text.length)
    .sort((a, b) => a.start - b.start);
  const displayClass = props.className || '';
  if (!ranges.length) {
    const mirrorClass = displayClass.replace(/\b(?:block|inline-block|inline|hidden)\b/g, '').trim();
    return <>
      <textarea {...props} ref={ref} data-print-source="" className={`${displayClass} print:hidden`} />
      <div
        data-print-mirror=""
        aria-hidden="true"
        className={`hidden print:block whitespace-pre-wrap [overflow-wrap:anywhere] ${mirrorClass}`}
      >
        {formatMirrorText(text)}
      </div>
    </>;
  }
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    parts.push(text.slice(cursor, range.start));
    const label = text.slice(range.start, range.end);
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
  parts.push(text.slice(cursor));
  return <div className="relative min-w-0 flex-1">
    <textarea {...props} ref={ref} data-print-source=""
      className={`${displayClass} [overflow-wrap:anywhere] print:hidden`}
      style={{ ...props.style, color: 'transparent', WebkitTextFillColor: 'transparent', caretColor: 'var(--ui-text)' }} />
    <div data-linked-text className={`pointer-events-none absolute inset-0 print:static print:inset-auto print:h-auto whitespace-pre-wrap [overflow-wrap:anywhere] ${displayClass}`}>
      {parts}{text.endsWith('\n') ? '\u00a0' : null}
    </div>
  </div>;
});
