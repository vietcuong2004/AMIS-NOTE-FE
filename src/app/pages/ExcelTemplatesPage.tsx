import React, { useState } from 'react';
import { FileSpreadsheet, Search } from 'lucide-react';
import { EXCEL_CATEGORIES, EXCEL_TEMPLATES } from '../../data/excelTemplates';
import { SpreadsheetGrid } from '../../components/editor/SpreadsheetBlock';
import type { Folder, SpaceType } from '../../types';

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

export function ExcelTemplatesPage({ space, folder, onBack, onUseTemplate }: {
  space: SpaceType; folder?: Folder; onBack: () => void; onUseTemplate: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('Tất cả');
  const filtered = EXCEL_TEMPLATES.filter(template =>
    (category === 'Tất cả' || template.category === category) &&
    normalize(`${template.title} ${template.description} ${template.category}`).includes(normalize(query.trim())));

  return <>
    <nav aria-label="Đường dẫn" className="flex min-h-12 shrink-0 items-center gap-2 border-b border-[var(--ui-border)] px-5 text-sm">
      <button type="button" onClick={onBack} className="text-[var(--ui-muted)] hover:underline">
        {folder?.name ?? (space === 'company' ? 'Tài liệu công ty' : 'Ghi chép của tôi')}
      </button>
      <span aria-hidden="true" className="text-[var(--ui-tertiary)]">/</span>
      <span aria-current="page" className="font-semibold">Tạo mẫu Excel</span>
    </nav>
    <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--ui-bg)] p-4">
      <section aria-labelledby="excel-template-title" className="mx-auto w-full max-w-6xl space-y-4 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 sm:p-5">
        <header className="flex items-center gap-3">
          <div className="rounded-xl bg-green-100 p-2.5 text-green-800"><FileSpreadsheet aria-hidden="true" className="h-6 w-6" /></div>
          <h1 id="excel-template-title" className="text-xl font-bold">Tạo file Excel từ mẫu</h1>
        </header>
        <label className="flex max-w-lg items-center gap-2 rounded-lg border border-[var(--ui-border)] px-3 focus-within:border-[var(--ui-accent)]">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--ui-muted)]" />
          <input aria-label="Tìm mẫu Excel" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="Tìm mẫu Excel…" className="w-full min-w-0 bg-transparent py-2.5 text-sm outline-none" />
        </label>
        <div className="flex flex-wrap gap-2" aria-label="Chủ đề mẫu Excel">
          {['Tất cả', ...EXCEL_CATEGORIES].map(item => <button type="button" key={item} aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={`rounded-full border px-3 py-1.5 text-sm ${category === item ? 'theme-primary border-[var(--ui-primary)] bg-[var(--ui-primary)] text-white' : 'border-[var(--ui-border)] hover:bg-[var(--ui-hover)]'}`}>{item}</button>)}
        </div>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
          {filtered.map(template => <article key={template.id} aria-label={template.title}
            className="flex min-w-0 flex-col rounded-xl border border-[var(--ui-border)]">
            <div className="flex-1 space-y-2 p-3">
              <div aria-hidden="true"><SpreadsheetGrid sheet={template.sheet} compact /></div>
              <strong className="flex items-start gap-1.5 text-sm"><FileSpreadsheet aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />{template.title}</strong>
              <span className="block text-xs leading-relaxed text-[var(--ui-muted)]">{template.description}</span>
            </div>
            <div className="px-3 pb-3">
              <button type="button" onClick={() => onUseTemplate(template.id)} aria-label={`Sử dụng mẫu ${template.title}`}
                className="theme-primary w-full rounded-lg bg-[var(--ui-primary)] px-2 py-2 text-xs font-semibold text-white hover:bg-[var(--ui-primary-hover)]">Sử dụng mẫu</button>
            </div>
          </article>)}
        </div>
        {filtered.length === 0 && <p role="status" className="py-8 text-center text-sm text-[var(--ui-muted)]">Không tìm thấy mẫu Excel phù hợp.</p>}
      </section>
    </div>
  </>;
}
