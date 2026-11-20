import React, { useLayoutEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { MindMapConnector, type NodeBounds } from './MindMapConnector';
import { mindMapNodeText, mindMapText } from '../../data/mindMapTemplates';
import type { Block, BlockProperties, MindMapNode } from '../../types';

type Point = NonNullable<MindMapNode['position']>;
type NodeSize = NonNullable<MindMapNode['size']>;
type NodeResize = { id: string; size: NodeSize; position: Point };
interface PlacedNode {
  node: MindMapNode;
  parentId?: string;
  position: Point;
  width: number;
  height: number;
}

const rootWidth = 184;
const nodeWidth = 150;
const boardInset = 24;
const columnGap = 48;
const rowGap = 14;
const directions: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
};

function layoutMindMap(root: MindMapNode, heights: Map<string, number>, resizing: NodeResize | null): PlacedNode[] {
  const placed: PlacedNode[] = [];
  function place(node: MindMapNode, x: number, y: number, parentId?: string): number {
    const active = resizing?.id === node.id ? resizing : undefined;
    const size = active?.size ?? node.size;
    const width = size?.width ?? (parentId ? nodeWidth : rootWidth);
    const height = Math.max(heights.get(node.id) ?? 32, size?.height ?? 32);
    const defaultPosition = { x, y };
    placed.push({ node, parentId, width, height, position: active?.position ?? node.position ?? defaultPosition });
    let nextY = y;
    for (const child of node.children) nextY = place(child, x + width + columnGap, nextY, node.id) + rowGap;
    const branchHeight = Math.max(height, nextY - y - rowGap);
    defaultPosition.y += (branchHeight - height) / 2;
    return y + branchHeight;
  }
  place(root, boardInset, boardInset);
  return placed;
}

function nodeBounds(entry: PlacedNode): NodeBounds {
  return { ...entry.position, width: entry.width, height: entry.height };
}

function StaticMindMap({ root }: { root: MindMapNode }) {
  const tree = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<React.ComponentProps<typeof MindMapConnector>[]>([]);
  useLayoutEffect(() => {
    const element = tree.current;
    if (!element) return;
    const cards = Array.from(element.querySelectorAll<HTMLElement>('[data-preview-node]'));
    const measure = () => {
      const origin = element.getBoundingClientRect();
      if (!origin.width || !origin.height) return;
      const bounds = new Map(cards.map(card => {
        const rect = card.getBoundingClientRect();
        return [card.dataset.previewNode!, { x: rect.left - origin.left, y: rect.top - origin.top, width: rect.width, height: rect.height }];
      }));
      setEdges(cards.flatMap(card => {
        const id = card.dataset.previewNode!;
        const parentId = card.dataset.previewParent;
        const parent = parentId ? bounds.get(parentId) : undefined;
        const child = bounds.get(id);
        return parent && child ? [{ id, parent, child, primary: parentId === root.id }] : [];
      }));
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : undefined;
    observer?.observe(element);
    cards.forEach(card => observer?.observe(card));
    window.addEventListener('resize', measure);
    window.addEventListener('beforeprint', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('beforeprint', measure);
    };
  }, [root]);

  const renderNode = (node: MindMapNode, parentId?: string): React.ReactNode => (
    <div className="mind-map-node">
      <div className="mind-map-card" data-preview-node={node.id} data-preview-parent={parentId}>
        <span className="mind-map-text">{mindMapNodeText(node)}</span>
      </div>
      {node.children.length > 0 && <ul className="mind-map-children">
        {node.children.map(child => <li key={child.id}>{renderNode(child, node.id)}</li>)}
      </ul>}
    </div>
  );
  return <div ref={tree} className="mind-map-tree" data-mind-map={root.id}>
    {edges.map(edge => <MindMapConnector key={edge.id} {...edge} />)}
    {renderNode(root)}
  </div>;
}

interface MindMapProps {
  root: MindMapNode;
  preview?: boolean;
  fullscreen?: boolean;
  onChange?: (root: MindMapNode) => void;
}

export function MindMap({ root, preview = false, fullscreen = false, onChange }: MindMapProps) {
  if (preview) return <div className="mind-map-preview"><StaticMindMap root={root} /></div>;
  return <MindMapBoard root={root} fullscreen={fullscreen} onChange={onChange} />;
}

function MindMapBoard({ root, fullscreen, onChange }: Omit<MindMapProps, 'preview'>) {
  const board = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: string; pointerId: number; grip: Point; start: Point; moving: boolean } | null>(null);
  const resizeGesture = useRef<(NodeResize & { pointerId: number; start: Point }) | null>(null);
  const [dragged, setDragged] = useState<{ id: string; position: Point } | null>(null);
  const [resizing, setResizing] = useState<NodeResize | null>(null);
  const [heights, setHeights] = useState<Map<string, number>>(() => new Map());
  useLayoutEffect(() => {
    const nodes = Array.from(board.current?.querySelectorAll<HTMLElement>('[data-mind-map-node]') ?? []);
    const measure = () => {
      const next = new Map(nodes.filter(node => node.offsetHeight).map(node => [node.dataset.mindMapNode!, node.offsetHeight]));
      setHeights(previous => previous.size === next.size && [...next].every(([id, height]) => previous.get(id) === height) ? previous : next);
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : undefined;
    nodes.forEach(node => observer?.observe(node));
    return () => observer?.disconnect();
  }, [root]);

  const placed = layoutMindMap(root, heights, resizing);
  const positions = new Map(placed.map(entry => [entry.node.id, dragged?.id === entry.node.id ? { ...entry, position: dragged.position } : entry]));
  const width = Math.max(...placed.map(entry => Math.max(entry.position.x, positions.get(entry.node.id)!.position.x) + entry.width)) + boardInset;
  const height = Math.max(...placed.map(entry => Math.max(entry.position.y, positions.get(entry.node.id)!.position.y) + entry.height)) + boardInset;

  const keepNativeEditing = onChange ? (event: React.SyntheticEvent) => event.stopPropagation() : undefined;
  const update = (id: string, apply: (node: MindMapNode) => MindMapNode) => onChange?.(updateNode(root, id, apply));
  const savePosition = (id: string, position: Point) => update(id, current => ({ ...current, position }));
  const saveSize = ({ id, size, position }: NodeResize) => update(id, current => ({ ...current, size, position }));
  const limitPosition = ({ x, y }: Point): Point => ({ x: Math.max(boardInset, Math.round(x)), y: Math.max(boardInset, Math.round(y)) });
  const limitSize = ({ width, height }: NodeSize): NodeSize => ({ width: Math.max(96, Math.round(width)), height: Math.max(32, Math.round(height)) });

  const pointerResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    const active = resizeGesture.current;
    const rect = board.current?.getBoundingClientRect();
    if (!active || active.pointerId !== event.pointerId || !rect) return;
    return { id: active.id, position: active.position, size: limitSize({
      width: active.size.width + event.clientX - rect.left - active.start.x,
      height: active.size.height + event.clientY - rect.top - active.start.y,
    }) };
  };
  const cancelResize = () => {
    resizeGesture.current = null;
    setResizing(null);
  };

  const pointerPosition = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = gesture.current;
    const rect = board.current?.getBoundingClientRect();
    if (!active || active.pointerId !== event.pointerId || !rect) return;
    return limitPosition({ x: event.clientX - rect.left - active.grip.x, y: event.clientY - rect.top - active.grip.y });
  };
  const cancelDrag = () => {
    gesture.current = null;
    setDragged(null);
  };

  return <div className={`mind-map-canvas${fullscreen ? ' mind-map-canvas--page' : ''}`} aria-label={fullscreen ? 'Vùng vẽ sơ đồ tư duy' : undefined}>
    <div ref={board} className="mind-map-board print:hidden" data-mind-map={root.id}
      style={{ width, height }}
      onKeyDown={keepNativeEditing} onCopy={keepNativeEditing} onCut={keepNativeEditing} onPaste={keepNativeEditing}>
      {placed.map(({ node, parentId }) => {
        if (!parentId) return null;
        return <MindMapConnector key={node.id} id={node.id} parent={nodeBounds(positions.get(parentId)!)}
          child={nodeBounds(positions.get(node.id)!)} primary={parentId === root.id} />;
      })}
      {placed.map(({ node, parentId, position, width, height }) => {
        const isRoot = !parentId;
        const visiblePosition = positions.get(node.id)!.position;
        const text = mindMapNodeText(node);
        const name = node.label.split('\n')[0] || 'nhánh';
        return <div key={node.id} className="mind-map-board-node" data-mind-map-node={node.id}
          data-map-root={isRoot || undefined} data-dragging={dragged?.id === node.id || undefined}
          data-resizing={resizing?.id === node.id || undefined} data-movable={!!onChange || undefined}
          onPointerDown={event => {
            const target = event.target;
            const rect = board.current?.getBoundingClientRect();
            if (!onChange || event.button !== 0 || gesture.current || resizeGesture.current || !rect || !(target instanceof HTMLElement) || target.closest('button')) return;
            if (event.shiftKey && target instanceof HTMLTextAreaElement) return;
            target.setPointerCapture?.(event.pointerId);
            gesture.current = { id: node.id, pointerId: event.pointerId, moving: false,
              start: { x: event.clientX, y: event.clientY },
              grip: { x: event.clientX - rect.left - position.x, y: event.clientY - rect.top - position.y } };
          }}
          onPointerMove={event => {
            const active = gesture.current;
            const next = pointerPosition(event);
            if (!active || active.id !== node.id || !next) return;
            if (!active.moving) {
              if (Math.hypot(event.clientX - active.start.x, event.clientY - active.start.y) < 4) return;
              active.moving = true;
              const field = event.currentTarget.querySelector('textarea');
              if (field && document.activeElement === field) {
                field.setSelectionRange(field.selectionEnd, field.selectionEnd);
                field.blur();
              }
            }
            event.preventDefault();
            setDragged({ id: node.id, position: next });
          }}
          onPointerUp={event => {
            const active = gesture.current;
            const next = pointerPosition(event);
            if (!active || active.id !== node.id || !next) return;
            cancelDrag();
            if (active.moving) savePosition(node.id, next);
            else if (!(event.target instanceof HTMLTextAreaElement)) event.currentTarget.querySelector('textarea')?.focus();
          }}
          onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag}
          onDragStart={event => event.preventDefault()}
          style={{ left: visiblePosition.x, top: visiblePosition.y, width }}>
          <div className="mind-map-card" style={{ minHeight: resizing?.id === node.id ? resizing.size.height : node.size?.height }}>
            {onChange ? <div className="mind-map-textbox" data-content={text}>
              <textarea value={text} rows={1} placeholder="Nhập nội dung…"
                aria-label={isRoot ? 'Chủ đề cuộc họp' : `Nội dung ${name}`}
                onKeyDown={event => {
                  const direction = directions[event.key];
                  if (!event.altKey || !direction) return;
                  event.preventDefault();
                  const step = event.shiftKey ? 32 : 8;
                  savePosition(node.id, limitPosition({ x: position.x + direction.x * step, y: position.y + direction.y * step }));
                }}
                onChange={event => {
                  const label = event.currentTarget.value;
                  update(node.id, current => ({ ...current, label, note: undefined }));
                }} className="mind-map-text" />
            </div> : <div className="mind-map-text">{text}</div>}
          </div>
          {onChange && <><div className="mind-map-node-actions">
            <button type="button" aria-label={`Thêm nhánh con vào ${name}`} title="Thêm nhánh con"
              onClick={() => {
                const child = { id: crypto.randomUUID(), label: 'Nhánh mới', children: [] };
                update(node.id, current => ({ ...current, children: [...current.children, child] }));
              }}><Plus aria-hidden="true" className="h-4 w-4" /></button>
            <button type="button" aria-label={`Xóa node ${name}`} title={isRoot && !node.children.length ? 'Sơ đồ cần ít nhất một node' : 'Xóa node'}
              disabled={isRoot && !node.children.length} onClick={() => onChange(removeNode(root, node.id))}>
              <Trash2 aria-hidden="true" className="h-4 w-4" /></button>
          </div>
          <button type="button" aria-label={`Đổi kích thước ${name}`} title="Kéo góc để đổi kích thước" className="mind-map-resize"
            onPointerDown={event => {
              const rect = board.current?.getBoundingClientRect();
              if (event.button !== 0 || gesture.current || resizeGesture.current || !rect) return;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              resizeGesture.current = { id: node.id, pointerId: event.pointerId, position, size: { width, height },
                start: { x: event.clientX - rect.left, y: event.clientY - rect.top } };
            }}
            onPointerMove={event => {
              const next = pointerResize(event);
              if (next?.id === node.id) setResizing(next);
            }}
            onPointerUp={event => {
              const next = pointerResize(event);
              const initial = resizeGesture.current?.size;
              if (next?.id !== node.id || !initial) return;
              cancelResize();
              if (next.size.width !== initial.width || next.size.height !== initial.height) saveSize(next);
            }}
            onPointerCancel={cancelResize} onLostPointerCapture={cancelResize}
            onKeyDown={event => {
              const direction = directions[event.key];
              if (!direction) return;
              event.preventDefault();
              const step = event.shiftKey ? 32 : 8;
              saveSize({ id: node.id, position, size: limitSize({ width: width + direction.x * step, height: height + direction.y * step }) });
            }} />
          </>}
        </div>;
      })}
    </div>
    <div className="hidden print:block"><StaticMindMap root={root} /></div>
  </div>;
}

function updateNode(node: MindMapNode, id: string, update: (node: MindMapNode) => MindMapNode): MindMapNode {
  if (node.id === id) return update(node);
  return { ...node, children: node.children.map(child => updateNode(child, id, update)) };
}

function removeNode(root: MindMapNode, id: string): MindMapNode {
  if (root.id === id) {
    const [nextRoot, ...siblings] = root.children;
    return nextRoot ? { ...nextRoot, children: [...nextRoot.children, ...siblings] } : root;
  }
  return { ...root, children: root.children.flatMap(child => child.id === id ? child.children : [removeNode(child, id)]) };
}

export function MindMapBlock({ block, readOnly, fullscreen = false, onChange }: {
  block: Block; readOnly: boolean; fullscreen?: boolean; onChange: (content: string, properties: BlockProperties) => void;
}) {
  const root = block.properties?.mindMap;
  if (!root) return null;
  return <MindMap root={root} fullscreen={fullscreen} onChange={readOnly ? undefined : mindMap => {
    onChange(mindMapText(mindMap), { ...block.properties, mindMap });
  }} />;
}
