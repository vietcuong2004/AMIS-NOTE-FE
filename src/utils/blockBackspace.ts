import { Block, BlockProperties } from '../types';

const TEXT_EDITABLE_TYPES = new Set([
  'paragraph',
  'h1',
  'h2',
  'h3',
  'h4',
  'bullet',
  'numbered',
  'checklist',
  'quote',
  'callout',
  'toggle',
  'code',
]);

const MERGEABLE_TEXT_TYPES = new Set(['paragraph', 'h1', 'h2', 'h3', 'h4', 'quote', 'callout']);
const LIST_TYPES = new Set(['bullet', 'numbered', 'checklist']);

export interface BlockFocusTarget {
  blockId: string;
  offset: number;
  itemId?: string;
}

export function mergeInlineRanges<T extends { start: number; end: number }>(
  baseRanges: T[] | undefined,
  appendedRanges: T[] | undefined,
  offset: number
): T[] | undefined {
  const combined = [
    ...(baseRanges || []),
    ...(appendedRanges || []).map((range) => ({
      ...range,
      start: range.start + offset,
      end: range.end + offset,
    })),
  ];
  return combined.length > 0 ? combined : undefined;
}

/** Focus the last enabled textarea inside target block and place the caret at offset. */
export function focusBlockAtOffset(
  container: HTMLElement | null,
  blockId: string,
  offset = Number.MAX_SAFE_INTEGER,
  itemId?: string,
): boolean {
  if (!container) return false;
  const blockEl = container.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`);
  if (!blockEl) return false;
  const textareas = blockEl.querySelectorAll<HTMLTextAreaElement>('textarea:not([disabled])');
  const input = itemId ? Array.from(textareas).find(textarea => textarea.closest<HTMLElement>('[data-list-item]')?.dataset.listItem === itemId)
    : textareas[textareas.length - 1];
  if (!input) return false;

  const clamped = Math.max(0, Math.min(offset, input.value.length));
  input.focus();
  try {
    input.setSelectionRange(clamped, clamped);
  } catch {
    // Ignore non-selectable inputs in synthetic environments.
  }
  input.scrollIntoView?.({ block: 'nearest' });
  return true;
}

/** Compute next block array and focus target after deleting a block (e.g. Backspace on empty line). */
export function computeBlocksAfterDelete(
  blocks: Block[],
  blockId: string
): { blocks: Block[]; focus: BlockFocusTarget } | null {
  const idx = blocks.findIndex((block) => block.id === blockId);
  if (idx === -1) return null;

  if (blocks.length <= 1) {
    const only = blocks[0];
    if (only.type === 'paragraph') return null;
    const reset: Block = {
      ...only,
      type: 'paragraph',
      content: '',
      properties: only.properties ? { ...only.properties, checked: undefined, listItems: undefined } : undefined,
    };
    return { blocks: [reset], focus: { blockId: only.id, offset: 0 } };
  }

  const next = blocks.filter((_, index) => index !== idx);
  let target: Block | undefined;
  for (let i = idx - 1; i >= 0; i -= 1) {
    if (TEXT_EDITABLE_TYPES.has(next[i].type)) {
      target = next[i];
      break;
    }
  }
  if (!target) {
    target = idx > 0 ? next[idx - 1] : next[0];
  }

  return {
    blocks: next,
    focus: {
      blockId: target.id,
      offset: idx > 0 ? Number.MAX_SAFE_INTEGER : 0,
    },
  };
}

/** Merge a non-empty text block at cursor offset 0 onto the end of the previous text block. */
export function computeBlocksAfterMergeWithPrevious(
  blocks: Block[],
  blockId: string
): { blocks: Block[]; focus: BlockFocusTarget } | null {
  const idx = blocks.findIndex((block) => block.id === blockId);
  if (idx <= 0) return null;

  const prev = blocks[idx - 1];
  const curr = blocks[idx];

  if (MERGEABLE_TEXT_TYPES.has(prev.type)) {
    const offset = prev.content.length;
    const mergedLinks = mergeInlineRanges(prev.properties?.inlineLinks, curr.properties?.inlineLinks, offset);
    const mergedMentions = mergeInlineRanges(prev.properties?.inlineGroupMentions, curr.properties?.inlineGroupMentions, offset);
    const mergedProps: BlockProperties | undefined =
      prev.properties || mergedLinks || mergedMentions
        ? {
            ...prev.properties,
            inlineLinks: mergedLinks,
            ...(mergedMentions ? { inlineGroupMentions: mergedMentions } : {}),
          }
        : undefined;
    const merged: Block = {
      ...prev,
      content: prev.content + curr.content,
      properties: mergedProps,
    };
    const next = [...blocks];
    next.splice(idx - 1, 2, merged);
    return { blocks: next, focus: { blockId: prev.id, offset } };
  }

  if (LIST_TYPES.has(prev.type)) {
    const prevItems = prev.properties?.listItems?.length
      ? prev.properties.listItems
      : [
          {
            id: `${prev.id}-item`,
            content: prev.content,
            checked: !!prev.properties?.checked,
            inlineLinks: prev.properties?.inlineLinks,
            inlineGroupMentions: prev.properties?.inlineGroupMentions,
          },
        ];
    const lastIndex = prevItems.length - 1;
    const lastItem = prevItems[lastIndex];
    const offset = lastItem.content.length;
    const inlineGroupMentions = mergeInlineRanges(lastItem.inlineGroupMentions, curr.properties?.inlineGroupMentions, offset);
    const updatedLast = {
      ...lastItem,
      content: lastItem.content + curr.content,
      inlineLinks: mergeInlineRanges(lastItem.inlineLinks, curr.properties?.inlineLinks, offset),
      ...(inlineGroupMentions ? { inlineGroupMentions } : {}),
    };
    const nextItems = prevItems.map((item, i) => (i === lastIndex ? updatedLast : item));
    const mergedList: Block = {
      ...prev,
      content: nextItems.map((item) => item.content).join('\n'),
      properties: { ...prev.properties, listItems: nextItems },
    };
    const next = [...blocks];
    next.splice(idx - 1, 2, mergedList);
    return { blocks: next, focus: { blockId: prev.id, offset } };
  }

  if (prev.type === 'divider') {
    const next = blocks.filter((_, index) => index !== idx - 1);
    return { blocks: next, focus: { blockId: curr.id, offset: 0 } };
  }

  return null;
}

/** Exit an item into a paragraph, preserving the lists before and after it. */
export function computeBlocksAfterExitListItem(
  blocks: Block[],
  blockId: string,
  createNewBlockId: () => string,
  itemIndex = 0
): { blocks: Block[]; focus: BlockFocusTarget } | null {
  const idx = blocks.findIndex((block) => block.id === blockId);
  if (idx === -1) return null;
  const block = blocks[idx];
  if (!LIST_TYPES.has(block.type)) return null;

  const items = block.properties?.listItems?.length
    ? block.properties.listItems
    : [
        {
          id: `${block.id}-item`,
          content: block.content,
          checked: !!block.properties?.checked,
          inlineLinks: block.properties?.inlineLinks,
          inlineGroupMentions: block.properties?.inlineGroupMentions,
        },
      ];
  const first = items[itemIndex];
  if (!first) return null;
  const paragraphProps: BlockProperties | undefined = block.properties
    ? {
        ...block.properties,
        listItems: undefined,
        checked: undefined,
        inlineLinks: first.inlineLinks,
        ...(first.inlineGroupMentions || block.properties.inlineGroupMentions ? { inlineGroupMentions: first.inlineGroupMentions } : {}),
      }
    : first.inlineLinks
      ? { inlineLinks: first.inlineLinks }
      : undefined;

  const exitedParagraph: Block = {
    id: items.length === 1 ? block.id : createNewBlockId(),
    type: 'paragraph',
    content: first.content,
    properties: paragraphProps,
  };

  const before = items.slice(0, itemIndex);
  const after = items.slice(itemIndex + 1);
  const listSegment = (segment: typeof items, id: string): Block => ({
    ...block,
    id,
    content: segment.map((item) => item.content).join('\n'),
    properties: { ...block.properties, listItems: segment },
  });
  const replacement: Block[] = [];
  if (before.length) replacement.push(listSegment(before, block.id));
  replacement.push(exitedParagraph);
  if (after.length) replacement.push(listSegment(after, before.length ? createNewBlockId() : block.id));
  const next = [...blocks];
  next.splice(idx, 1, ...replacement);

  return { blocks: next, focus: { blockId: exitedParagraph.id, offset: 0 } };
}
