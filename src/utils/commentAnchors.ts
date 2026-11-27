import type { Block } from '../types/index.ts';
import type { CommentRange, CommentThread } from '../types/comments.ts';

const textBlockTypes = new Set(['paragraph', 'h1', 'h2', 'h3', 'h4', 'quote', 'callout', 'toggle', 'code']);
const listBlockTypes = new Set(['bullet', 'numbered', 'checklist']);

export function commentBlockFields(block: Block): { itemId?: string; text: string }[] {
  if (listBlockTypes.has(block.type)) {
    if (!block.properties?.listItems?.length) return [{ itemId: `${block.id}-item`, text: block.content }];
    return block.properties.listItems.map(item => ({ itemId: item.id, text: item.content }));
  }
  if (block.type === 'toggle') return [{ text: block.content }, { itemId: 'toggle-caption', text: block.properties?.caption ?? '' }];
  if (block.type === 'utility' && block.properties?.mention) return [{ text: block.properties.mentionTrailingText ?? '' }];
  return textBlockTypes.has(block.type) ? [{ text: block.content }] : [];
}

export function commentRangeText(block: Block | undefined, range: CommentRange): string | undefined {
  if (range.detached || !block) return;
  const field = commentBlockFields(block).find(item => item.itemId === range.itemId);
  if (!field || !Number.isSafeInteger(range.start) || !Number.isSafeInteger(range.end)
    || range.start < 0 || range.start >= range.end || range.end > field.text.length) return;
  return field.text.slice(range.start, range.end);
}

/** Map one contiguous edit. Insertions at the outer boundaries stay outside the anchor. */
export function mapCommentRange(range: CommentRange, before: string | undefined, after: string | undefined): CommentRange {
  if (range.detached || before === after && before !== undefined) return range;
  if (before === undefined || after === undefined || range.end > before.length) return { ...range, detached: true };

  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  let oldEnd = before.length;
  let newEnd = after.length;
  while (oldEnd > start && newEnd > start && before[oldEnd - 1] === after[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }

  const delta = newEnd - oldEnd;
  if (range.end <= start) return range;
  if (range.start >= oldEnd) return { ...range, start: range.start + delta, end: range.end + delta };
  if (start <= range.start && oldEnd >= range.end) return { ...range, detached: true };

  const mappedStart = range.start < start ? range.start : start;
  const mappedEnd = range.end > oldEnd ? range.end + delta : newEnd;
  return mappedStart < mappedEnd ? { ...range, start: mappedStart, end: mappedEnd } : { ...range, detached: true };
}

function commentRangeMapper(before: Block[], after: Block[]) {
  const oldBlocks = new Map(before.map(block => [block.id, block]));
  const newBlocks = new Map(after.map(block => [block.id, block]));
  return (range: CommentRange) => {
    if (range.detached) return range;
    const oldBlock = oldBlocks.get(range.blockId);
    const newBlock = newBlocks.get(range.blockId);
    if (oldBlock && oldBlock === newBlock) return range;
    const oldText = oldBlock && commentBlockFields(oldBlock).find(field => field.itemId === range.itemId)?.text;
    const newText = newBlock && commentBlockFields(newBlock).find(field => field.itemId === range.itemId)?.text;
    return mapCommentRange(range, oldText, newText);
  };
}

export function mapCommentAnchor(anchor: CommentRange[], before: Block[], after: Block[]): CommentRange[] {
  return before === after ? anchor : anchor.map(commentRangeMapper(before, after));
}

export function mapCommentAnchors(threads: CommentThread[], before: Block[], after: Block[]): CommentThread[] {
  if (before === after || !threads.length) return threads;
  const mapRange = commentRangeMapper(before, after);
  return threads.map(thread => {
    const anchor = thread.anchor.map(mapRange);
    return anchor.some((range, index) => range !== thread.anchor[index]) ? { ...thread, anchor } : thread;
  });
}

export function compareCommentPositions(a: CommentThread, b: CommentThread, blocks: Block[]): number {
  const first = (thread: CommentThread) => thread.anchor.flatMap(range => {
    const index = blocks.findIndex(block => block.id === range.blockId);
    const block = blocks[index];
    if (commentRangeText(block, range) === undefined) return [];
    const item = commentBlockFields(block).findIndex(field => field.itemId === range.itemId);
    return [{ index, item, start: range.start }];
  }).sort((a, b) => a.index - b.index || a.item - b.item || a.start - b.start)[0];
  const x = first(a);
  const y = first(b);
  if (!x || !y) return x ? -1 : y ? 1 : a.createdAt.localeCompare(b.createdAt);
  return x.index - y.index || x.item - y.item || x.start - y.start || a.createdAt.localeCompare(b.createdAt);
}
