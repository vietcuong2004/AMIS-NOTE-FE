import assert from 'node:assert/strict';
import test from 'node:test';
import { computeBlocksAfterExitListItem } from './blockBackspace';
import type { Block } from '../types';

for (const type of ['numbered', 'bullet', 'checklist'] as const) {
  for (const index of [0, 1, 2]) {
    test(`${type}: Backspace exits empty item ${index + 1} without losing adjacent items`, () => {
      const items = ['First', 'Middle', 'Last'].map((content, i) => ({
        id: `item-${i}`, content: i === index ? '' : content, checked: true, level: 2,
      }));
      const block: Block = { id: 'list', type, content: items.map(i => i.content).join('\n'), properties: { listItems: items } };
      let id = 0;
      const result = computeBlocksAfterExitListItem([block], block.id, () => `new-${++id}`, index)!;
      const paragraph = result.blocks.find(b => b.id === result.focus.blockId)!;
      assert.equal(paragraph.type, 'paragraph');
      assert.equal(paragraph.content, '');
      assert.equal(paragraph.properties?.listItems, undefined);
      assert.equal(result.focus.offset, 0);
      assert.deepEqual(result.blocks.flatMap(b => b.properties?.listItems || []), items.filter((_, i) => i !== index));
      assert.equal(result.blocks.indexOf(paragraph), index > 0 ? 1 : 0);
      assert.equal(new Set(result.blocks.map(b => b.id)).size, result.blocks.length);
    });
  }
  test(`${type}: sole empty marker becomes the same paragraph`, () => {
    const result = computeBlocksAfterExitListItem([{ id: 'list', type, content: '' }], 'list', () => 'new')!;
    assert.deepEqual(result.blocks.map(b => [b.id, b.type, b.content]), [['list', 'paragraph', '']]);
  });
}
