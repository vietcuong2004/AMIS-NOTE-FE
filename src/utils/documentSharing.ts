import { TEAM_MEMBERS } from '../data/mockData';
import { Document, EmployeeGroup, GroupAccess, UserRole } from '../types';
import { memoryStorage } from './memoryStorage';

export type ShareRole = Exclude<UserRole, 'owner'>;

export const DOCUMENT_ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Chủ sở hữu',
  viewer: 'Người xem',
  commenter: 'Người nhận xét',
  editor: 'Người chỉnh sửa',
};

export interface ShareSettings {
  members: { id: string; name: string; email: string; role: ShareRole; group?: boolean }[];
  general: 'restricted' | 'link';
  linkRole: ShareRole;
  groups: GroupAccess[];
}

const groupDirectoryKey = 'misa_employee_groups';
const initialGroups: EmployeeGroup[] = [
  { id: 'group-project', name: 'Nhóm dự án', emails: ['minhanh.nguyen@congty.vn', 'nam.le@congty.vn'] },
  { id: 'group-rollout', name: 'Nhóm triển khai', emails: ['ha.tran@congty.vn', 'kiet.dang@congty.vn'] },
];

export function getEmployeeGroups(): EmployeeGroup[] {
  const saved = memoryStorage.getItem(groupDirectoryKey);
  return saved ? JSON.parse(saved) : initialGroups;
}

export function getShareSettings(doc: Document): ShareSettings {
  const saved = memoryStorage.getItem(`misa_share_${doc.id}`);
  if (saved) {
    try { return { groups: [], ...JSON.parse(saved) }; } catch { /* Fall back to document defaults. */ }
  }
  return {
    members: TEAM_MEMBERS.filter(person => person.id !== doc.author.id).slice(0, 2)
      .map(person => ({ id: person.id, name: person.name, email: person.email, role: 'editor' })),
    general: doc.isPrivate ? 'restricted' : 'link',
    linkRole: 'viewer',
    groups: [],
  };
}

export function saveShareSettings(documentId: string, settings: ShareSettings) {
  memoryStorage.setItem(`misa_share_${documentId}`, JSON.stringify(settings));
}

export function grantGroupAccess(doc: Document, access: GroupAccess) {
  const settings = getShareSettings(doc);
  const directory = getEmployeeGroups();
  if (!directory.some(group => group.id === access.group.id)) {
    memoryStorage.setItem(groupDirectoryKey, JSON.stringify([...directory, access.group]));
  }
  saveShareSettings(doc.id, { ...settings, groups: [...settings.groups.filter(item => item.group.id !== access.group.id), access] });
}
