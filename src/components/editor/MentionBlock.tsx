import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Info, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { Block, BlockProperties, EmployeeGroup, GroupAccess } from '../../types';
import { getEmployeeGroups } from '../../utils/documentSharing';
import { EmployeePicker, employeeName } from './EmployeePicker';
import { getMentionTrigger, LinkedTextarea, mentionPillClassName, shiftInlineRanges } from './LinkedTextarea';
import { DEFAULT_MENTION_PERMISSION, mentionBlockContent } from './inlineMentions';

const permissions = [
  { id: 'view', label: 'Người xem' },
  { id: 'comment', label: 'Người bình luận' },
  { id: 'edit', label: 'Người chỉnh sửa' },
] as const;
type Mention = NonNullable<BlockProperties['mention']>;
type InvitationPermission = typeof permissions[number]['id'];
const GROUP_MEMBER_PREVIEW_LIMIT = 5;

function employeeInitials(name: string) {
  return (name.includes('@') ? name.slice(0, 2) : name.split(' ').slice(-2).map(part => part[0]).join('')).toUpperCase();
}

function invitationPermission(permission: Mention['permission'] | undefined): InvitationPermission {
  return permission === 'view' || permission === 'comment' ? permission : DEFAULT_MENTION_PERMISSION;
}

function dialogKeys(event: React.KeyboardEvent<HTMLDivElement>, onClose: () => void) {
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
  if (event.key !== 'Tab') return;
  const items = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea,select');
  const first = items[0], last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

export function MentionDialog({ kind, value, group, onSave, onClose }: {
  kind: Mention['kind']; value?: Mention; group?: EmployeeGroup | null; onSave: (value: Mention) => void; onClose: () => void;
}) {
  const [emails, setEmails] = useState<string[]>(value?.emails || group?.emails || []);
  const [groupName, setGroupName] = useState(value?.groupName || group?.name || '');
  const [groupPermission, setGroupPermission] = useState(() => invitationPermission(value?.permission));
  const [message, setMessage] = useState(value?.message || '');
  const [roles, setRoles] = useState<Record<string, InvitationPermission>>(() => Object.fromEntries(
    emails.map(email => [email, invitationPermission(value?.permissions?.[email] ?? value?.permission)])
  ));
  const [error, setError] = useState('');
  const initial = useRef<HTMLInputElement>(null);
  const savedRef = useRef(false);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    if (kind === 'group') initial.current?.focus();
    return () => { if (!savedRef.current && previous?.isConnected) previous.focus(); };
  }, []);

  return createPortal(<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4"
    onMouseDown={event => { if (event.currentTarget === event.target) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label={kind === 'group' ? 'Mời và phân quyền nhóm' : 'Mời và phân quyền'}
      onKeyDown={event => dialogKeys(event, onClose)}
      className="flex w-full max-w-4xl max-h-[calc(100dvh-32px)] flex-col rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-2xl">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--ui-border)] px-6 py-5">
        <h2 className="text-2xl font-bold tracking-tight">Mời và phân quyền</h2>
        <button type="button" aria-label="Đóng hộp thoại mời" onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--ui-hover)]"><X className="h-5 w-5" /></button>
      </header>
      <form className="flex min-h-0 flex-col" onSubmit={event => {
        event.preventDefault();
        if (kind === 'group' && !groupName.trim()) { setError('Nhập tên nhóm.'); return; }
        if (group === null && getEmployeeGroups().some(item => normalizeGroupName(item.name) === normalizeGroupName(groupName))) {
          setError('Tên nhóm đã có trong danh sách.'); return;
        }
        if (!emails.length) { setError('Thêm ít nhất một nhân viên vào danh sách được mời.'); return; }
        savedRef.current = true;
        onSave({ kind, emails, groupName: kind === 'group' ? groupName.trim() : undefined,
          message: message.trim(), permission: kind === 'group' ? groupPermission : roles[emails[0]] ?? DEFAULT_MENTION_PERMISSION,
          permissions: Object.fromEntries(emails.map(email => [email, roles[email] || groupPermission])), scope: 'page' });
        onClose();
      }}>
        <div className="min-h-0 overflow-y-auto px-6 py-5 space-y-5">
          {kind === 'group' && <label className="block text-sm font-semibold">Tên nhóm
            <input ref={initial} aria-label="Tên nhóm" placeholder="Tên nhóm..." value={groupName} readOnly={!!group} onChange={event => setGroupName(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--ui-border)] bg-transparent px-3 py-2.5 text-sm font-normal" /></label>}
          {kind === 'group' && <label className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">Quyền truy cập của nhóm
            <select aria-label="Quyền truy cập của nhóm" value={groupPermission} onChange={event => {
              const permission = event.target.value as InvitationPermission;
              setRoles(previous => Object.fromEntries(Object.entries(previous).map(([email, role]) => [email, role === groupPermission ? permission : role])));
              setGroupPermission(permission);
            }} className="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-sm font-normal">
              {permissions.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>}
          <section className="border-b border-[var(--ui-border)] pb-5 space-y-3">
            <h3 className="text-lg font-semibold">Thêm người</h3>
            <div className="flex flex-wrap items-end gap-3">
              <EmployeePicker exclude={emails} invitationLayout autoFocus={kind === 'person'} onSelect={email => {
                setEmails(previous => previous.includes(email) ? previous : [...previous, email]);
                setRoles(previous => ({ ...previous, [email]: kind === 'group' ? groupPermission : DEFAULT_MENTION_PERMISSION }));
                setError('');
              }} />
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Danh sách người được mời ({emails.length})</h3>
            <div className="divide-y divide-[var(--ui-border)] rounded-lg border border-[var(--ui-border)]">
              {!emails.length && <p className="px-4 py-8 text-center text-sm text-[var(--ui-tertiary)]">Chưa có người được mời.</p>}
              {emails.map((email, index) => {
                const name = employeeName(email);
                return <div key={email} data-invite-email={email} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700'][index % 3]}`}>{employeeInitials(name)}</span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{name}</p><p className="text-xs text-[var(--ui-muted)] break-all mt-0.5">{email}</p></div>
                  <select aria-label={`Quyền của ${name}`} value={roles[email] || groupPermission}
                    onChange={event => setRoles(previous => ({ ...previous, [email]: event.target.value as InvitationPermission }))}
                    className="w-44 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2.5 text-sm">
                    {permissions.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                  <button type="button" aria-label={`Xóa ${name} khỏi danh sách mời`} onClick={() => setEmails(previous => previous.filter(item => item !== email))}
                    className="rounded-lg p-2 text-[var(--ui-muted)] hover:bg-[var(--ui-hover)] hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>;
              })}
            </div>
          </section>
          <label className="block text-sm font-semibold">Lời nhắn <span className="font-normal">(không bắt buộc)</span>
            <textarea aria-label="Lời nhắn" placeholder="Nhập lời nhắn gửi đến người được mời" value={message} onChange={event => setMessage(event.target.value)} rows={3}
              className="mt-2 w-full rounded-lg border border-[var(--ui-border)] bg-transparent px-3 py-2.5 text-sm font-normal resize-y" />
          </label>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        </div>
        <footer className="flex shrink-0 justify-end gap-3 border-t border-[var(--ui-border)] px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-[var(--ui-border)] px-6 py-2.5 text-sm hover:bg-[var(--ui-hover)]">Hủy</button>
          <button type="submit" className="rounded-lg bg-[#087cfa] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#066bda]">{value ? 'Lưu thay đổi' : 'Gửi lời mời'} ({emails.length})</button>
        </footer>
      </form>
    </div>
  </div>, document.body);
}

const normalizeGroupName = (name: string) => name.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();

export function GroupInvitationDialog({ group, onSave, onClose }: {
  group: EmployeeGroup | null; onSave: (access: GroupAccess) => void; onClose: () => void;
}) {
  return <MentionDialog kind="group" group={group} onClose={onClose} onSave={mention => {
    const invitedGroup = { id: group?.id ?? crypto.randomUUID(), name: mention.groupName!, emails: mention.emails };
    onSave({ group: invitedGroup, permission: mention.permission, permissions: mention.permissions ?? {}, message: mention.message });
  }} />;
}

function GroupPickerRow({ group, onSelect }: { group: EmployeeGroup; onSelect: (group: EmployeeGroup) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const membersId = useId();
  const countId = useId();
  const memberList = useRef<HTMLUListElement>(null);
  const memberCount = group.emails.length;
  const visibleEmails = showAll ? group.emails : group.emails.slice(0, GROUP_MEMBER_PREVIEW_LIMIT);
  useLayoutEffect(() => {
    if (showAll) memberList.current?.focus({ preventScroll: true });
  }, [showAll]);

  return <div>
    <div className="flex items-center gap-2 rounded-lg pr-1">
      <button type="button" onClick={() => onSelect(group)} aria-describedby={countId}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--ui-hover)]">
        <span className="shrink-0 rounded-full bg-blue-100 p-2 text-blue-700"><Users aria-hidden="true" className="h-4 w-4" /></span>
        <span className="break-words min-w-0 font-medium">{group.name}</span>
      </button>
      <span id={countId} className="shrink-0 text-xs text-[var(--ui-muted)]">{memberCount} thành viên</span>
      <button type="button" aria-label={`${expanded ? 'Thu gọn' : 'Mở rộng'} thành viên ${group.name}`}
        aria-expanded={expanded} aria-controls={membersId} onClick={() => {
          setExpanded(!expanded);
          setShowAll(false);
        }} className="shrink-0 rounded-lg p-2 text-[var(--ui-muted)] hover:bg-[var(--ui-hover)] hover:text-[var(--ui-accent)]">
        <ChevronDown aria-hidden="true" className={`h-4 w-4 ${expanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
    <div id={membersId} hidden={!expanded} className="mb-2 ml-7 border-l border-[var(--ui-border)] pl-3 pr-1">
      {expanded && (memberCount ? <>
        <ul ref={memberList} role="list" aria-label={`Thành viên ${group.name}`} tabIndex={showAll ? 0 : undefined}
          className={showAll ? 'max-h-56 overflow-y-auto overscroll-contain' : undefined}>
          {visibleEmails.map(email => {
            const name = employeeName(email);
            return <li key={email} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">{employeeInitials(name)}</span>
              <div className="min-w-0">
                <p className="break-words text-sm font-medium">{name}</p>
                <p className="break-all text-xs text-[var(--ui-muted)]">{email}</p>
              </div>
            </li>;
          })}
        </ul>
        {!showAll && memberCount > GROUP_MEMBER_PREVIEW_LIMIT && <button type="button" onClick={() => setShowAll(true)}
          className="mt-1 rounded-md px-2 py-1.5 text-sm font-semibold text-[var(--ui-accent)] hover:bg-[var(--ui-hover)]">Xem tất cả</button>}
      </> : <p className="px-2 py-1.5 text-sm text-[var(--ui-muted)]">Chưa có thành viên.</p>)}
    </div>
  </div>;
}

export function GroupMentionFlow({ onConfirm, onClose }: {
  onConfirm: (group: EmployeeGroup, grant?: GroupAccess) => void; onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => { search.current?.focus(); }, []);
  if (creating) {
    return <GroupInvitationDialog group={null} onClose={onClose} onSave={access => onConfirm(access.group, access)} />;
  }

  const matches = getEmployeeGroups().filter(group => normalizeGroupName(group.name).includes(normalizeGroupName(query)));
  return createPortal(<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4"
    onMouseDown={event => { if (event.currentTarget === event.target) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label="Chọn nhóm" onKeyDown={event => dialogKeys(event, onClose)}
      className="flex max-h-[calc(100dvh-32px)] w-full max-w-md flex-col gap-3 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 text-[var(--ui-text)] shadow-2xl">
      <header className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold">Chọn nhóm</h2>
        <button type="button" aria-label="Đóng chọn nhóm" onClick={onClose} className="rounded p-1 hover:bg-[var(--ui-hover)]"><X className="h-5 w-5" /></button>
      </header>
      <label className="flex items-center gap-2 rounded-lg border border-[var(--ui-border)] px-3 focus-within:border-[var(--ui-accent)]">
        <Search aria-hidden="true" className="h-4 w-4 text-[var(--ui-muted)]" />
        <input ref={search} type="search" aria-label="Tìm nhóm" placeholder="Tìm nhóm..." value={query}
          onChange={event => setQuery(event.target.value)} onKeyDown={event => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing && matches.length) { event.preventDefault(); onConfirm(matches[0]); }
          }} className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" />
      </label>
      <div className="min-h-0 overflow-y-auto" aria-label="Danh sách nhóm">
        {matches.map(group => <GroupPickerRow key={group.id} group={group} onSelect={onConfirm} />)}
        {!matches.length && <p role="status" className="px-3 py-2 text-sm text-[var(--ui-muted)]">Không tìm thấy nhóm phù hợp.</p>}
      </div>
      <button type="button" onClick={() => setCreating(true)} className="flex items-center gap-2 border-t border-[var(--ui-border)] px-3 py-2 text-left text-sm font-semibold text-[var(--ui-accent)] hover:bg-[var(--ui-hover)]">
        <Plus aria-hidden="true" className="h-4 w-4" />Tạo nhóm mới
      </button>
      <p className="flex items-start gap-2 rounded-lg bg-blue-500/10 p-3 text-xs leading-5"><Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ui-accent)]" />
        Bấm vào thẻ nhóm trong tài liệu để mời và cấp quyền truy cập.
      </p>
    </div>
  </div>, document.body);
}

export function MentionBlock({
  block,
  readOnly,
  autoFocus,
  autoFocusPosition = 'start',
  onKeyDown,
  onChange,
  onMentionTrigger,
  onGroupMentionClick,
}: {
  block: Block;
  readOnly: boolean;
  autoFocus?: boolean;
  autoFocusPosition?: 'start' | 'end';
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onChange: (content: string, properties: BlockProperties) => void;
  onMentionTrigger?: (mention: ReturnType<typeof getMentionTrigger>, rect: DOMRect | null) => void;
  onGroupMentionClick?: (groupId: string) => void;
}) {
  const value = block.properties?.mention;
  const kind = value?.kind || (block.properties?.utilityKind === 'Nhắc đến một nhóm' ? 'group' : 'person');
  const [open, setOpen] = useState(!value && !readOnly);
  const continuation = useRef<HTMLTextAreaElement>(null);
  const trailingText = block.properties?.mentionTrailingText ?? '';
  const trailingMentions = block.properties?.inlineGroupMentions;
  const labels = value ? (value.groupName ? [value.groupName] : value.emails.map(employeeName)) : [];
  const updateMention = (mention: Mention, text: string, ranges = trailingMentions) => {
    onChange(mentionBlockContent(mention, text), { ...block.properties, mention, mentionTrailingText: text || undefined,
      inlineGroupMentions: ranges?.length ? ranges : undefined });
  };

  useLayoutEffect(() => {
    if (!autoFocus || readOnly || !continuation.current) return;
    continuation.current.focus();
    const pos = autoFocusPosition === 'end' ? continuation.current.value.length : 0;
    continuation.current.setSelectionRange(pos, pos);
  }, [autoFocus, autoFocusPosition, readOnly]);

  return <div data-mention-row className="flex min-h-6 flex-wrap items-start gap-x-1 gap-y-0"
    onMouseDown={event => {
      if (event.target === event.currentTarget && event.button === 0 && !event.shiftKey && continuation.current) event.stopPropagation();
    }}
    onClick={event => {
      if (event.target !== event.currentTarget || event.shiftKey || !continuation.current) return;
      continuation.current.focus();
      continuation.current.setSelectionRange(trailingText.length, trailingText.length);
    }}>
    {labels.map(label => <button key={label} type="button" disabled={readOnly} onClick={() => setOpen(true)}
      className={`inline-flex max-w-full items-center px-1 text-sm leading-6 disabled:cursor-default ${mentionPillClassName}`}>
      <span className="break-words min-w-0">@{label}</span>
    </button>)}
    {!value && !open && !readOnly && <button type="button" aria-label="Mời và đề cập" onClick={() => setOpen(true)}
      className="rounded bg-[var(--ui-hover)] px-1 text-sm leading-6">@</button>}
    {value && (readOnly && !trailingMentions?.length
      ? trailingText && <span className="whitespace-pre-wrap break-words text-sm leading-6">{trailingText}</span>
      : <LinkedTextarea ref={continuation} aria-label="Nội dung sau thẻ nhắc đến" rows={1} value={trailingText} disabled={readOnly}
          groupMentions={trailingMentions} onGroupMentionClick={onGroupMentionClick}
          onKeyDown={onKeyDown}
          onChange={event => {
            const input = event.currentTarget;
            const text = input.value;
            const ranges = shiftInlineRanges(trailingMentions, trailingText, text);
            updateMention(value, text, ranges);
            const mention = getMentionTrigger(text, input.selectionStart, ranges);
            onMentionTrigger?.(mention, mention ? input.getBoundingClientRect() : null);
          }}
          className="min-h-6 min-w-12 flex-1 resize-none bg-transparent p-0 text-sm leading-6 text-[var(--ui-text)] outline-none [field-sizing:content]" />)}
    {open && !readOnly && <MentionDialog kind={kind} value={value} onClose={() => setOpen(false)}
      onSave={mention => {
        updateMention(mention, trailingText);
        setOpen(false);
        (typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame : setTimeout)(() => {
          continuation.current?.focus();
          continuation.current?.setSelectionRange(trailingText.length, trailingText.length);
        });
      }} />}
  </div>;
}
