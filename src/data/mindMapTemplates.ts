import type { Block, MindMapNode } from '../types';

function node(id: string, label: string, children: MindMapNode[] = []): MindMapNode {
  return { id, label, children };
}

export function mindMapNodeText(node: MindMapNode): string {
  return node.note ? [node.label, node.note].filter(Boolean).join('\n') : node.label;
}

export function mindMapText(root: MindMapNode, depth = 0): string {
  return [
    ...mindMapNodeText(root).split('\n').map(line => `${'  '.repeat(depth)}${line}`),
    ...root.children.map(child => mindMapText(child, depth + 1)),
  ].join('\n');
}

const templates = [
  {
    id: 'mind-map-overview', title: 'Cuộc họp tổng quan', category: 'Cuộc họp',
    description: 'Tổng hợp nội dung chính, quyết định, việc cần làm, người phụ trách và thời hạn trong một sơ đồ.',
    diagram: node('overview', 'Chủ đề', [
      node('topics', 'Nội dung chính'), node('decisions', 'Quyết định'), node('tasks', 'Việc cần làm'),
      node('owners', 'Người phụ trách'), node('deadline', 'Thời hạn'),
    ]),
  },
  {
    id: 'mind-map-decisions', title: 'Quyết định & hành động', category: 'Hành động',
    description: 'Ghi lại những gì đã thống nhất và theo dõi các đầu việc cần triển khai sau cuộc họp.',
    diagram: node('decisions-actions', 'Chủ đề', [
      node('decisions', 'Quyết định', [node('details', 'Nội dung'), node('decision-owner', 'Người phụ trách')]),
      node('tasks', 'Việc cần làm', [node('task-owner', 'Người phụ trách'), node('deadline', 'Thời hạn')]),
    ]),
  },
  {
    id: 'mind-map-departments', title: 'Theo phòng ban', category: 'Phòng ban',
    description: 'Gom quyết định và việc cần làm theo từng phòng ban tham gia cuộc họp.',
    diagram: node('departments', 'Chủ đề', [
      node('sales', 'Phòng Kinh doanh', [node('sales-decision', 'Quyết định'), node('sales-task', 'Việc cần làm')]),
      node('operations', 'Phòng Sản xuất', [node('operations-decision', 'Quyết định'), node('operations-task', 'Việc cần làm')]),
      node('hr', 'Phòng Nhân sự', [node('hr-decision', 'Quyết định'), node('hr-task', 'Việc cần làm')]),
    ]),
  },
];

export const MIND_MAP_TEMPLATES = templates.map(template => ({
  ...template,
  space: 'personal' as const,
  type: 'meeting' as const,
  tags: ['Sơ đồ tư duy'],
  createBlocks: (): Block[] => [{
    id: template.id, type: 'mind_map', content: mindMapText(template.diagram),
    properties: { mindMap: structuredClone(template.diagram) },
  }],
}));
