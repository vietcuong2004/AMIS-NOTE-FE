import { Document, SpaceType, ViewState } from '../../types';

const pagePaths = {
  private: '/library/private', company: '/library/company', templates: '/templates',
  recent: '/recent', favorite: '/favorites', library: '/library/all',
  trash: '/trash', meeting_notes: '/library/recents', shared: '/library/shared',
} as const;

export function pathForView(view: ViewState): string {
  switch (view.type) {
    case 'space_root': return view.space === 'personal' ? '/private' : '/company';
    case 'mind_maps': return view.space === 'personal' ? '/private/mind-maps' : '/company/mind-maps';
    case 'excel_templates': return `/${view.space === 'personal' ? 'private' : 'company'}/excel-templates${view.folderId ? `?folder=${encodeURIComponent(view.folderId)}` : ''}`;
    case 'unclassified': return view.space ? `/library/${view.space === 'personal' ? 'private' : 'company'}/unclassified` : '/unclassified';
    case 'document': return `/documents/${encodeURIComponent(view.documentId)}`;
    case 'folder': return `/folders/${encodeURIComponent(view.folderId)}`;
    case 'not_found': return view.path.startsWith('/') && !view.path.startsWith('//') ? view.path : '/404';
    default: return pagePaths[view.type];
  }
}

/** Resolve both new page URLs and links shared by earlier app versions. */
export function viewForLocation(location: string): ViewState {
  const url = new URL(location, 'http://app.local');
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const legacyDocument = new URLSearchParams(url.hash.slice(1)).get('doc');
  if ((path === '/' || path === '/Notes') && legacyDocument) return { type: 'document', documentId: legacyDocument };
  if (path === '/' || path === '/Notes') return { type: 'space_root', space: 'personal' };
  const aliases: Record<string, ViewState> = {
    '/library': { type: 'library' }, '/private': { type: 'space_root', space: 'personal' }, '/company': { type: 'space_root', space: 'company' },
    '/library/meetings': { type: 'meeting_notes' }, '/libary/recents': { type: 'meeting_notes' },
    '/shared': { type: 'shared' }, '/meetings': { type: 'meeting_notes' },
  };
  if (aliases[path]) return aliases[path];
  if (path === '/private/mind-maps' || path === '/company/mind-maps') {
    return { type: 'mind_maps', space: path.startsWith('/company') ? 'company' : 'personal' };
  }
  if (path === '/private/excel-templates' || path === '/company/excel-templates') {
    const folderId = url.searchParams.get('folder');
    return { type: 'excel_templates', space: path.startsWith('/company') ? 'company' : 'personal', ...(folderId ? { folderId } : {}) };
  }
  if (path === '/recent') return { type: 'recent' };
  if (path === '/unclassified') return { type: 'unclassified' };
  if (path === '/private/unclassified' || path === '/library/private/unclassified') return { type: 'unclassified', space: 'personal' };
  if (path === '/company/unclassified' || path === '/library/company/unclassified') return { type: 'unclassified', space: 'company' };
  for (const [type, pagePath] of Object.entries(pagePaths)) {
    if (pagePath === path) return { type } as ViewState;
  }
  const match = path.match(/^\/(documents|folders)\/([^/]+)$/);
  if (match) {
    try {
      const id = decodeURIComponent(match[2]);
      if (id) return match[1] === 'documents' ? { type: 'document', documentId: id } : { type: 'folder', folderId: id };
    } catch { /* Invalid URL encoding belongs on the not-found page. */ }
  }
  return { type: 'not_found', path: url.pathname };
}

export function excelTemplatesView(space: SpaceType, current: ViewState, documents: Document[]): ViewState {
  const folderId = current.type === 'folder' || current.type === 'excel_templates' ? current.folderId : current.type === 'document'
    ? documents.find(doc => doc.id === current.documentId)?.folderId : undefined;
  return { type: 'excel_templates', space, ...(folderId ? { folderId } : {}) };
}

export const documentUrl = (origin: string, documentId: string) =>
  `${origin}${pathForView({ type: 'document', documentId })}`;
