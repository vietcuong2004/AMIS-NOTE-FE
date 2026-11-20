import React, { useLayoutEffect, useRef } from 'react';

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

function connectionPoints(parent: NodeBounds, child: NodeBounds) {
  const parentCenter = { x: parent.x + parent.width / 2, y: parent.y + parent.height / 2 };
  const childCenter = { x: child.x + child.width / 2, y: child.y + child.height / 2 };
  const from = { ...parentCenter };
  const to = { ...childCenter };
  const right = childCenter.x >= parentCenter.x;
  const below = childCenter.y >= parentCenter.y;
  const sideFrom = right ? parent.x + parent.width : parent.x;
  const sideTo = right ? child.x : child.x + child.width;
  const verticalFrom = below ? parent.y + parent.height : parent.y;
  const verticalTo = below ? child.y : child.y + child.height;

  const sideGap = (sideTo - sideFrom) * (right ? 1 : -1);
  const verticalGap = (verticalTo - verticalFrom) * (below ? 1 : -1);
  const horizontal = sideGap > 0 || (verticalGap <= 0 && Math.abs(to.x - from.x) >= Math.abs(to.y - from.y));

  if (horizontal && sideGap >= 0) {
    from.x = sideFrom;
    to.x = sideTo;
  } else if (!horizontal && verticalGap >= 0) {
    from.y = verticalFrom;
    to.y = verticalTo;
  }

  const axis = horizontal ? 'x' : 'y';
  const bend = (to[axis] - from[axis]) * 0.6;
  return { from, to, control1: { ...from, [axis]: from[axis] + bend }, control2: { ...to, [axis]: to[axis] - bend } };
}

export function MindMapConnector({ id, parent, child, primary = false }: {
  id: string; parent: NodeBounds; child: NodeBounds; primary?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { from, to, control1, control2 } = connectionPoints(parent, child);
  const left = Math.min(from.x, to.x) - 2;
  const top = Math.min(from.y, to.y) - 2;
  const width = Math.abs(to.x - from.x) + 4;
  const height = Math.abs(to.y - from.y) + 4;
  const startX = from.x - left, startY = from.y - top;
  const endX = to.x - left, endY = to.y - top;
  const control1X = control1.x - left, control1Y = control1.y - top;
  const control2X = control2.x - left, control2Y = control2.y - top;

  useLayoutEffect(() => {
    const element = canvas.current;
    if (!element || typeof window.CanvasRenderingContext2D === 'undefined') return;
    const context = element.getContext('2d');
    if (!context) return;

    const scale = Math.min(window.devicePixelRatio || 1, 2, 4096 / Math.max(width, height));
    const pixelsWide = Math.max(1, Math.ceil(width * scale));
    const pixelsHigh = Math.max(1, Math.ceil(height * scale));
    if (element.width !== pixelsWide) element.width = pixelsWide;
    if (element.height !== pixelsHigh) element.height = pixelsHigh;

    context.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0);
    context.clearRect(0, 0, width, height);
    context.strokeStyle = window.getComputedStyle(element).color;
    context.lineWidth = primary ? 1.75 : 1.25;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(startX, startY);
    context.bezierCurveTo(control1X, control1Y, control2X, control2Y, endX, endY);
    context.stroke();
  }, [width, height, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY, primary]);

  return <canvas ref={canvas} className="mind-map-edge" aria-hidden="true" data-mind-map-edge={id}
    style={{ left, top, width, height }} />;
}
