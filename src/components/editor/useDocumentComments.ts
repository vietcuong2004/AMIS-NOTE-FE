import { useLayoutEffect, useMemo, useState } from 'react';
import { CURRENT_USER } from '../../data/mockData';
import type { Block, UserRole } from '../../types';
import { canManageComment, canResolveComment, canWriteComments } from '../../types/comments';
import type { CommentRange, CommentThread } from '../../types/comments';
import { commentRangeText, mapCommentAnchors } from '../../utils/commentAnchors';
import { memoryStorage } from '../../utils/memoryStorage';

interface Snapshot { blocks: Block[]; threads: CommentThread[] }
export type CommentMutation = 'edit' | 'delete' | 'reply' | 'resolve' | 'reopen';
const user = { id: CURRENT_USER.id, name: CURRENT_USER.name };

function message(content: string) {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), authorId: user.id, author: user, content, createdAt: now, updatedAt: now };
}

export function useDocumentComments(documentId: string, blocks: Block[], role: UserRole) {
  const key = `misa_document_comments_${documentId}`;
  const [snapshot, setSnapshot] = useState<Snapshot>(() => {
    const stored = memoryStorage.getItem(key);
    return stored ? JSON.parse(stored) : { blocks, threads: [] };
  });
  const threads = useMemo(() => mapCommentAnchors(snapshot.threads, snapshot.blocks, blocks), [snapshot, blocks]);

  useLayoutEffect(() => {
    if (snapshot.blocks !== blocks && threads.length) {
      const next = { blocks, threads };
      memoryStorage.setItem(key, JSON.stringify(next));
      setSnapshot(next);
    }
  }, [blocks, key, snapshot.blocks, threads]);

  const save = (nextThreads: CommentThread[]) => {
    const next = { blocks, threads: nextThreads };
    if (nextThreads.length) memoryStorage.setItem(key, JSON.stringify(next));
    else memoryStorage.removeItem(key);
    setSnapshot(next);
  };

  const create = (anchor: CommentRange[], input: string) => {
    const content = input.trim();
    const quotedText = anchor.map(range => commentRangeText(blocks.find(block => block.id === range.blockId), range) ?? '').join('\n');
    if (!canWriteComments(role) || !content || !quotedText.trim()) return;
    const thread: CommentThread = {
      ...message(content), documentId, anchor, quotedText, status: 'OPEN', resolvedAt: null, resolvedBy: null, replies: [],
    };
    save([...threads, thread]);
    return thread.id;
  };

  const mutate = (id: string, action: CommentMutation, input?: string, replyId?: string): boolean => {
    const thread = threads.find(item => item.id === id);
    if (!thread || !canWriteComments(role)) return false;
    const replace = (next: CommentThread) => save(threads.map(item => item.id === id ? next : item));
    const content = input?.trim();
    if (action === 'reply') {
      if (thread.status !== 'OPEN' || !content) return false;
      replace({ ...thread, replies: [...thread.replies, message(content)] });
    } else if (action === 'resolve' || action === 'reopen') {
      if (!canResolveComment(role, user.id, thread.authorId)) return false;
      const resolved = action === 'resolve';
      replace({ ...thread, status: resolved ? 'RESOLVED' : 'OPEN', resolvedAt: resolved ? new Date().toISOString() : null,
        resolvedBy: resolved ? user : null });
    } else {
      const target = replyId ? thread.replies.find(reply => reply.id === replyId) : thread;
      if (!target || !canManageComment(role, user.id, target.authorId)) return false;
      if (action === 'edit') {
        if (!content) return false;
        const updated = { ...target, content, updatedAt: new Date().toISOString() };
        replace(replyId ? { ...thread, replies: thread.replies.map(reply => reply.id === replyId ? updated : reply) }
          : { ...thread, content: updated.content, updatedAt: updated.updatedAt });
      } else if (replyId) {
        replace({ ...thread, replies: thread.replies.filter(reply => reply.id !== replyId) });
      } else {
        save(threads.filter(item => item.id !== id));
      }
    }
    return true;
  };

  return { threads, user, create, mutate };
}
