import React, { useState } from 'react';
import { CheckSquare, FileSpreadsheet, FileText, Network, Search } from 'lucide-react';
import { TEMPLATES } from '../../data/mockData';
import { MIND_MAP_TEMPLATES } from '../../data/mindMapTemplates';
import { EXCEL_TEMPLATES } from '../../data/excelTemplates';
import { MindMap } from '../../components/editor/MindMapBlock';
import { SpreadsheetGrid } from '../../components/editor/SpreadsheetBlock';
import { Block } from '../../types';
import { TemplateCard, templateCardGridClass } from './TemplateCard';

const templates = [...TEMPLATES, ...MIND_MAP_TEMPLATES, ...EXCEL_TEMPLATES].map(template => ({
  ...template, displayTitle: 'sheet' in template ? `${template.title} (Excel)` : template.title, blocks: template.createBlocks(),
}));
const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

function NoteTemplatePreview({ blocks, compact = false }: { blocks: Block[]; compact?: boolean }) {
  return <div className={`bg-[var(--ui-surface)] rounded-lg border border-[var(--ui-border)] text-left overflow-hidden ${compact ? 'max-h-full p-3 space-y-2 text-[10px]' : 'p-5 space-y-4 text-xs'}`}>
    {blocks.slice(0, compact ? 5 : undefined).map(block => {
      if (block.type === 'divider') return <hr key={block.id} className="border-[var(--ui-border)]" />;
      if (block.type === 'table') return <div key={block.id} className="overflow-hidden">
        <table className="w-full text-[10px] border-collapse"><thead><tr>{block.properties?.tableData?.headers.slice(0, 3).map((header, index) => <th key={index} className="border border-[var(--ui-border)] p-1 font-medium">{header}</th>)}</tr></thead>
          <tbody>{block.properties?.tableData?.rows.slice(0, 3).map((row, index) => <tr key={index}>{row.slice(0, 3).map((cell, index) => <td key={index} className="border border-[var(--ui-border)] p-1">{cell}</td>)}</tr>)}</tbody></table>
      </div>;
      if (block.type === 'meeting_info') return <div key={block.id} className="space-y-1"><p className="font-semibold">Thông tin cuộc họp</p><p>Ngày: __________</p><p>Thành phần: __________</p><p>Mục tiêu: __________</p></div>;
      if (block.type === 'meeting_attendees') return <div key={block.id}><p className="font-semibold mb-1">Thành phần tham dự</p>{block.properties?.attendees?.slice(0, 3).map((attendee, index) => <p key={index}>{attendee.name} · {attendee.role}</p>)}</div>;
      if (block.type === 'meeting_agenda') return <div key={block.id}>{block.properties?.agenda?.map(item => <p key={item.id} className="mb-1">• {item.title}</p>)}</div>;
      if (block.type === 'meeting_action_items') return <div key={block.id}>{block.properties?.actionItems?.map(item => <p key={item.id} className="flex gap-1 mb-1"><CheckSquare className="w-3 h-3 shrink-0" />{item.task}</p>)}</div>;
      return <p key={block.id} className={`${/^h[1-4]$/.test(block.type) ? 'font-semibold' : 'text-[var(--ui-muted)]'} ${block.type === 'h1' && !compact ? 'text-base' : ''} ${compact ? 'line-clamp-2' : ''}`}>
        {block.type === 'checklist' ? '☐ ' : block.type === 'bullet' ? '• ' : ''}{block.content}
      </p>;
    })}
  </div>;
}

export const TemplatesPage: React.FC<{ onUseTemplate: (templateId: string) => void }> = ({ onUseTemplate }) => {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [sort, setSort] = useState('default');
  const [selectedId, setSelectedId] = useState('tpl_meeting_minutes');
  const tags = [...new Set(templates.flatMap(template => template.tags))];
  const filtered = templates.filter(template =>
    (!topic || template.tags.includes(topic)) && normalize([template.title, template.description, ...template.tags].join(' ')).includes(normalize(query.trim())));
  if (sort === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
  const selected = filtered.find(template => template.id === selectedId) || filtered[0];
  const controlClass = 'rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-xs focus:outline-none focus:border-[#86868B]';

  return <div className="flex-1 min-h-0 overflow-y-auto bg-[var(--ui-surface)] p-5 md:p-8 space-y-6">
    <div><h1 className="text-2xl font-bold tracking-tight">Mẫu ghi chú</h1>
      <p className="text-sm text-[var(--ui-muted)] mt-1">Bắt đầu nhanh với cấu trúc ghi chú có sẵn.</p></div>
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative flex-1 min-w-44 max-w-sm"><Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--ui-tertiary)]" />
        <input aria-label="Tìm kiếm mẫu" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm kiếm mẫu..." className={`${controlClass} w-full pl-9`} />
      </label>
      <select aria-label="Chủ đề mẫu" className={controlClass} value={topic} onChange={event => setTopic(event.target.value)}><option value="">Tất cả chủ đề</option>{tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}</select>
      <select aria-label="Sắp xếp mẫu" className={controlClass} value={sort} onChange={event => setSort(event.target.value)}><option value="default">Sắp xếp mặc định</option><option value="name">Tên A–Z</option></select>
    </div>
    {!filtered.length ? <div className="py-16 text-center space-y-3"><p className="text-sm text-[var(--ui-muted)]">Không tìm thấy mẫu phù hợp.</p><button type="button" className="text-xs underline" onClick={() => { setQuery(''); setTopic(''); }}>Xóa bộ lọc</button></div> :
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="@container min-w-0">
          <div className={templateCardGridClass}>
            {filtered.map(template => {
              const icon = 'diagram' in template ? Network : 'sheet' in template ? FileSpreadsheet : FileText;
              const tone = 'diagram' in template ? 'blue' : 'sheet' in template ? 'green' : undefined;
              const preview = 'diagram' in template ? <MindMap root={template.diagram} preview />
                : 'sheet' in template ? <SpreadsheetGrid sheet={template.sheet} compact minRows={8} />
                : <NoteTemplatePreview blocks={template.blocks} compact />;
              return <TemplateCard key={template.id} id={template.id} title={template.displayTitle} description={template.description}
                Icon={icon} tone={tone} preview={preview} selected={selected?.id === template.id}
                onPreview={() => setSelectedId(template.id)} onUse={() => onUseTemplate(template.id)} />;
            })}
          </div>
        </div>
        {selected && <aside aria-label={`Xem trước ${selected.displayTitle}`} className="lg:sticky lg:top-0 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-panel)] p-4 space-y-4">
          <div className="max-h-80 overflow-y-auto">
            {'diagram' in selected ? <MindMap root={selected.diagram} preview /> : 'sheet' in selected
              ? <SpreadsheetGrid sheet={selected.sheet} minRows={8} /> : <NoteTemplatePreview blocks={selected.blocks} />}
          </div>
          <div><h2 className="text-lg font-semibold">{selected.displayTitle}</h2><p className="text-xs text-[var(--ui-muted)] mt-1 leading-relaxed">{selected.description}</p></div>
          {!('diagram' in selected) && !('sheet' in selected) && <div className="space-y-2"><p className="text-xs font-medium">Bao gồm các phần:</p>
            {selected.blocks.filter(block => /^h[1-4]$/.test(block.type) || block.type.startsWith('meeting_')).map(block => <p key={block.id} className="flex items-center gap-2 text-xs text-[var(--ui-muted)]"><FileText className="w-4 h-4 shrink-0" />{block.type === 'meeting_info' ? 'Thông tin cuộc họp' : block.content}</p>)}
          </div>}
          <button type="button" onClick={() => onUseTemplate(selected.id)} className="w-full rounded-lg theme-primary bg-[var(--ui-primary)] text-white py-3 text-sm font-semibold hover:bg-[var(--ui-primary-hover)]">Sử dụng mẫu</button>
        </aside>}
      </div>}
  </div>;
};
