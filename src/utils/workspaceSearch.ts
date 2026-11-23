import type { Document, Folder, SpaceType } from '../types';
import { blocksToPlainText } from './blockClipboard';
import { getFolderAncestors } from './folders';

export type SearchScope = { space: SpaceType; folderId?: string };
export type SearchResult = { id: string; type: 'document' | 'folder'; title: string; path: string; snippet: string };

export const workspaceName = (space: SpaceType) => space === 'company' ? 'Tài liệu công ty' : 'Ghi chép của tôi';
const fold = (text: string) => text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd');

export function searchTerms(text: string, query: string): [number, number][] {
  const needle = fold(query.trim());
  if (!needle) return [];
  let normalized = '';
  const starts: number[] = [], ends: number[] = [];
  let offset = 0;
  for (const character of text) {
    const next = offset + character.length;
    const token = fold(character);
    for (let index = 0; index < token.length; index++) {
      starts.push(offset);
      ends.push(next);
    }
    if (!token && ends.length) ends[ends.length - 1] = next;
    normalized += token;
    offset = next;
  }
  const ranges: [number, number][] = [];
  for (let index = normalized.indexOf(needle); index !== -1; index = normalized.indexOf(needle, index + needle.length)) {
    ranges.push([starts[index], ends[index + needle.length - 1]]);
  }
  return ranges;
}

function excerpt(text: string, query: string) {
  const [start, end] = searchTerms(text, query)[0] ?? [0, 0];
  const from = Math.max(0, start - 34);
  const to = Math.min(text.length, Math.max(end + 45, from + 135));
  return (from ? '…' : '') + text.slice(from, to).trim() + (to < text.length ? '…' : '');
}

export function findWorkspaceResults(documents: Document[], folders: Folder[], query: string, scope?: SearchScope): SearchResult[] {
  const needle = fold(query.trim());
  const inScope = (space: SpaceType, path: Folder[]) =>
    !scope || (space === scope.space && (!scope.folderId || path.some(folder => folder.id === scope.folderId)));
  const pathLabel = (space: SpaceType, path: Folder[]) => [workspaceName(space), ...path.map(folder => folder.name)].join(' / ');
  const ranked: { result: SearchResult; rank: number; date: string }[] = [];
  for (const doc of documents) {
    if (doc.isTrash) continue;
    const ancestors = getFolderAncestors(doc.folderId, folders);
    if (!inScope(doc.space, ancestors)) continue;
    const path = pathLabel(doc.space, ancestors);
    const title = doc.title.trim() || 'Không có tiêu đề';
    const content = blocksToPlainText(doc.blocks).replace(/\s+/g, ' ').trim();
    const tags = doc.tags.join(' · ');
    const contentMatches = !!needle && fold(content).includes(needle);
    const tagMatches = !!needle && fold(tags).includes(needle);
    const rank = !needle || fold(title).includes(needle) ? 0 : contentMatches || tagMatches ? 1 : fold(path).includes(needle) ? 2 : -1;
    if (rank < 0) continue;
    ranked.push({ result: { id: doc.id, type: 'document', title, path,
      snippet: excerpt(tagMatches && !contentMatches ? tags : content, query) }, rank, date: doc.updatedAt });
  }
  if (needle) {
    for (const folder of folders) {
      const path = getFolderAncestors(folder.id, folders);
      if (!inScope(folder.space, path) || !fold(folder.name).includes(needle)) continue;
      ranked.push({ result: { id: folder.id, type: 'folder', title: folder.name, path: pathLabel(folder.space, path.slice(0, -1)), snippet: '' },
        rank: 0, date: folder.updatedAt });
    }
  }
  return ranked.sort((a, b) => a.rank - b.rank || Date.parse(b.date) - Date.parse(a.date)).map(item => item.result);
}
