import type { Block, BlockProperties, InlineMention, InlineMentionData } from '../../types';
import { employeeName } from './EmployeePicker';
import { replaceInlineRanges } from './LinkedTextarea';

export type MentionRange = { start: number; end: number; itemId?: string };
export type MentionTarget = { blockId: string; range: MentionRange };
export type MentionEntry = { name: string; data: InlineMentionData };
type Mention = NonNullable<BlockProperties['mention']>;

export const DEFAULT_MENTION_PERMISSION = 'edit';
export const inlineMentionTextTypes = ['paragraph', 'h1', 'h2', 'h3', 'h4', 'quote', 'callout', 'toggle'];

export function mentionBlockContent(mention: Mention, text: string) {
  const prefix = `@${mention.groupName || mention.emails.map(employeeName).join(', ')}`;
  return text ? `${prefix} ${text}` : prefix;
}

export const personMentionEntries = (mention: Mention): MentionEntry[] => mention.emails.map(email => ({
  name: employeeName(email),
  data: { email, permission: mention.permissions?.[email] ?? mention.permission, message: mention.message },
}));

export function insertMentionInBlocks(blocks: Block[], { blockId, range }: MentionTarget, entries: MentionEntry[]) {
  const source = blocks.find(block => block.id === blockId);
  if (!source) return null;
  const listItems = range.itemId ? source.properties?.listItems ?? [
    { id: `${source.id}-item`, content: source.content, checked: source.properties?.checked,
      inlineLinks: source.properties?.inlineLinks, inlineGroupMentions: source.properties?.inlineGroupMentions },
  ] : [];
  const listItem = listItems.find(item => item.id === range.itemId);
  if (range.itemId && !listItem) return null;
  const leadingMention = source.type === 'utility' ? source.properties?.mention : undefined;
  const inline = !!listItem || !!leadingMention || inlineMentionTextTypes.includes(source.type);
  const block: Block = inline ? source : { id: `blk_${crypto.randomUUID()}`, type: 'paragraph', content: '' };
  const { start, end } = inline ? range : { start: 0, end: 0 };
  const original = listItem ?? { content: leadingMention ? block.properties?.mentionTrailingText ?? '' : block.content, inlineLinks: block.properties?.inlineLinks,
    inlineGroupMentions: block.properties?.inlineGroupMentions };
  const label = entries.map(entry => `@${entry.name}`).join(' ');
  const before = original.content.slice(0, start);
  const after = original.content.slice(end);
  const prefix = before && !/\s$/.test(before) && !/[([{]$/.test(before) ? ' ' : '';
  const suffix = /^[\s.,!?;:)}\]]/.test(after) ? '' : ' ';
  const replacement = `${prefix}${label}${suffix}`;
  const content = `${before}${replacement}${after}`;
  let mentionStart = start + prefix.length;
  const mentions = entries.map(({ name, data }): InlineMention => {
    const end = mentionStart + name.length + 1;
    const mention = { ...data, start: mentionStart, end };
    mentionStart = end + 1;
    return mention;
  });
  const inlineLinks = replaceInlineRanges(original.inlineLinks, start, end, replacement.length);
  const inlineGroupMentions = [...replaceInlineRanges(original.inlineGroupMentions, start, end, replacement.length),
    ...mentions];
  const updatedItems = listItems.map(item => item.id === range.itemId ? { ...item, content, inlineLinks, inlineGroupMentions } : item);
  const inserted = listItem ? { ...block, content: updatedItems.map(item => item.content).join('\n'),
    properties: { ...block.properties, listItems: updatedItems } }
    : { ...block, content: leadingMention ? mentionBlockContent(leadingMention, content) : content,
      properties: { ...block.properties, inlineLinks, inlineGroupMentions, ...(leadingMention ? { mentionTrailingText: content } : {}) } };
  const nextBlocks = blocks.flatMap(item => item.id !== blockId ? [item] : inline ? [inserted] : [item, inserted]);
  return { blocks: nextBlocks, focus: { blockId: inserted.id, offset: start + replacement.length, itemId: range.itemId } };
}
