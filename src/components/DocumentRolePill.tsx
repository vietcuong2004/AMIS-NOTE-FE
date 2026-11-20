import { Eye, MessageSquareText, Pencil, ShieldCheck } from 'lucide-react';
import type { UserRole } from '../types';
import { DOCUMENT_ROLE_LABELS } from '../utils/documentSharing';

const DOCUMENT_ROLE_ICONS = {
  owner: ShieldCheck,
  viewer: Eye,
  commenter: MessageSquareText,
  editor: Pencil,
};

export function DocumentRolePill({ role }: { role: UserRole }) {
  const Icon = DOCUMENT_ROLE_ICONS[role];
  return <span data-document-role={role} title="Quyền truy cập tài liệu"
    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--ui-border)] bg-[var(--ui-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--ui-text)]">
    <Icon aria-hidden="true" className="h-3.5 w-3.5 text-[var(--ui-accent)]" />
    {DOCUMENT_ROLE_LABELS[role]}
  </span>;
}
