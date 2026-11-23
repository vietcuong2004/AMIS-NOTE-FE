export type UserRole = 'owner' | 'viewer' | 'commenter' | 'editor';

export type DocumentType = 'note' | 'meeting' | 'plan' | 'internal_doc';

export type SpaceType = 'personal' | 'company';

export type BlockType =
  // 1. Văn bản
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'video'
  | 'audio'
  | 'embed'
  | 'utility'
  // 2. Danh sách
  | 'bullet'
  | 'numbered'
  | 'checklist'
  | 'toggle'
  // 3. Chèn
  | 'image'
  | 'file'
  | 'link'
  | 'table'
  // 4. Trình bày
  | 'quote'
  | 'callout'
  | 'divider'
  | 'code'
  // 5. Cuộc họp
  | 'meeting_info'
  | 'meeting_attendees'
  | 'meeting_agenda'
  | 'meeting_action_items'
  | 'mind_map'
  | 'spreadsheet';

export interface BlockActionItem {
  id: string;
  task: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export interface BlockAttendee {
  name: string;
  role: string;
  status: 'present' | 'absent' | 'excused';
}

export interface BlockAgendaItem {
  id: string;
  title: string;
  duration: string;
  speaker: string;
  notes?: string;
}

export interface BlockTableData {
  headers: string[];
  rows: string[][];
}

export interface SpreadsheetData extends BlockTableData {
  columnOptions?: Record<number, string[]>;
  numericColumns?: number[];
  cellStyles?: Record<string, SpreadsheetCellStyle>;
}

export interface SpreadsheetCellStyle {
  font?: 'Arial' | 'Calibri' | 'Times New Roman' | 'Verdana';
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface SpreadsheetTab {
  id: string;
  name: string;
  sheet: SpreadsheetData;
}

export interface MindMapNode {
  id: string;
  label: string;
  note?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  children: MindMapNode[];
}

export interface InlineLink { start: number; end: number; url: string }
export type DocumentPermission = 'full' | 'edit' | 'comment' | 'view';
export type InlineMentionData = { groupId: string } | { email: string; permission: DocumentPermission; message: string };
export type InlineMention = { start: number; end: number } & InlineMentionData;

export interface EmployeeGroup {
  id: string;
  name: string;
  emails: string[];
}

export interface GroupAccess {
  group: EmployeeGroup;
  permission: DocumentPermission;
  permissions: Record<string, DocumentPermission>;
  message: string;
}

export interface BlockProperties {
  inlineLinks?: InlineLink[];
  /** Stored under the existing key so previously saved group mentions still load. */
  inlineGroupMentions?: InlineMention[];
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontFamily?: string;
  fontSize?: number;
  listItems?: { id: string; content: string; checked?: boolean; level?: number; inlineLinks?: InlineLink[]; inlineGroupMentions?: InlineMention[] }[];
  textColor?: string;
  backgroundColor?: string;
  mention?: {
    kind: 'person' | 'group';
    groupName?: string;
    emails: string[];
    permission: DocumentPermission;
    permissions?: Record<string, DocumentPermission>;
    scope: 'workspace' | 'page';
    message: string;
  };
  mentionTrailingText?: string;
  commandTitle?: string;
  utilityKind?: string;
  provider?: string;
  view?: string;
  columns?: number;
  headingLevel?: number;
  columnContents?: string[];
  checked?: boolean; // for checklist
  open?: boolean; // for toggle list
  language?: string; // for code block
  calloutIcon?: string; // for callout block
  calloutType?: 'info' | 'warning' | 'tip' | 'success';
  url?: string; // for link & image
  fileName?: string; // for file attachment
  attachmentId?: string;
  fileSize?: string;
  caption?: string;
  // Meeting specific properties
  meetingDate?: string;
  meetingTime?: string;
  meetingLocation?: string;
  meetingLink?: string;
  attendees?: BlockAttendee[];
  agenda?: BlockAgendaItem[];
  actionItems?: BlockActionItem[];
  tableData?: BlockTableData;
  mindMap?: MindMapNode;
  spreadsheet?: SpreadsheetData;
  spreadsheetName?: string;
  spreadsheetTabs?: SpreadsheetTab[];
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: BlockProperties;
}

export interface Folder {
  id: string;
  parentId?: string | null;
  name: string;
  space: SpaceType;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  space: SpaceType;
  folderId: string | null;
  type: DocumentType;
  tags: string[];
  blocks: Block[];
  permission: UserRole;
  isPrivate: boolean;
  author: {
    id: string;
    name: string;
    avatar: string;
    email: string;
    department?: string;
  };
  isFavorite?: boolean;
  isTrash?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuickNote {
  id: string;
  title: string;
  icon?: string;
  blocks: Block[];
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  department: string;
  currentRole: UserRole;
}

export type ViewState =
  | { type: 'space_root'; space: SpaceType }
  | { type: 'mind_maps'; space: SpaceType }
  | { type: 'excel_templates'; space: SpaceType; folderId?: string }
  | { type: 'private' }
  | { type: 'company' }
  | { type: 'shared' }
  | { type: 'not_found'; path: string }
  | { type: 'document'; documentId: string }
  | { type: 'recent' }
  | { type: 'search'; query: string; scope?: { space: SpaceType; folderId?: string } }
  | { type: 'unclassified'; space?: SpaceType }
  | { type: 'favorite' }
  | { type: 'meeting_notes' }
  | { type: 'library' }
  | { type: 'templates' }
  | { type: 'trash' }
  | { type: 'folder'; folderId: string };
