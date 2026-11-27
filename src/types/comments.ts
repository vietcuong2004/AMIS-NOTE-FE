import type { UserRole } from './index.ts';

export interface CommentRange {
  blockId: string;
  itemId?: string;
  start: number;
  end: number;
  detached?: true;
}

export interface CommentAuthor {
  id: string;
  name: string;
}

export interface CommentMessage {
  id: string;
  authorId: string;
  author: CommentAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentThread extends CommentMessage {
  documentId: string;
  anchor: CommentRange[];
  quotedText: string;
  status: 'OPEN' | 'RESOLVED';
  resolvedAt: string | null;
  resolvedBy: CommentAuthor | null;
  replies: CommentMessage[];
}

export function canWriteComments(role: UserRole): boolean {
  return role !== 'viewer';
}

export function canManageComment(role: UserRole, userId: string, authorId: string): boolean {
  return canWriteComments(role) && (role === 'owner' || userId === authorId);
}

export function canResolveComment(role: UserRole, userId: string, authorId: string): boolean {
  return role === 'editor' || canManageComment(role, userId, authorId);
}
