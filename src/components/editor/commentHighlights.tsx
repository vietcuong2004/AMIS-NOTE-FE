import { createContext } from 'react';
import type { CommentRange } from '../../types/comments';

export interface CommentHighlight extends CommentRange {
  threadId: string;
  title: string;
  active: boolean;
  resolved: boolean;
}

export const CommentHighlights = createContext<{
  ranges: CommentHighlight[];
  allowReadOnlySelection: boolean;
  onActivate: (ids: string[]) => void;
} | null>(null);
