import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Block } from '../types';
import type { CommentRange } from '../types/comments';
import { commentRangeText, mapCommentAnchor, mapCommentRange } from './commentAnchors';

test('comment offsets track changes before and inside the range and detach after complete deletion', () => {
  const original = 'đầu nội dung cuối';
  const range = { blockId: 'note', start: 4, end: 12 };
  const before = mapCommentRange(range, original, `mới ${original}`);
  assert.deepEqual(before, { blockId: 'note', start: 8, end: 16 });
  const withInsertion = mapCommentRange(range, original, 'đầu nội đề dung cuối');
  assert.equal('đầu nội đề dung cuối'.slice(withInsertion.start, withInsertion.end), 'nội đề dung');
  const partial = mapCommentRange(range, original, 'đầu dung cuối');
  assert.equal('đầu dung cuối'.slice(partial.start, partial.end), 'dung');
  const detached = mapCommentRange(range, original, 'đầu  cuối');
  assert.equal(detached.detached, true);
  assert.equal(mapCommentRange(detached, '', original).detached, true);
});

test('multi-block anchors survive reordering and independently track stable list item IDs', () => {
  const first: Block = { id: 'root', type: 'paragraph', content: 'Nội dung' };
  const second: Block = { id: 'list', type: 'bullet', content: '', properties: {
    listItems: [{ id: 'not-selected', content: 'Nội dung' }, { id: 'selected', content: 'Nội dung' }],
  } };
  const anchor: CommentRange[] = [{ blockId: 'root', start: 0, end: 8 }, { blockId: 'list', itemId: 'selected', start: 0, end: 8 }];
  const next = { ...second, properties: { listItems: [{ id: 'selected', content: 'Mới Nội dung' }] } };
  const mapped = mapCommentAnchor(anchor, [first, second], [next]);
  assert.equal(mapped[0].detached, true);
  assert.equal(mapped[1].start, 4);
  assert.equal(commentRangeText(next, mapped[1]), 'Nội dung');
});
