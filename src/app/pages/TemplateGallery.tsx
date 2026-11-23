import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

type GalleryTemplate = { id: string; title: string; description: string; category: string };

export function TemplateGallery<T extends GalleryTemplate>({
  backLabel, pageLabel, title, templateLabel, Icon, tone, templates, renderPreview, onBack, onUseTemplate,
}: {
  backLabel: string; pageLabel: string; title: string; templateLabel: string;
  Icon: LucideIcon; tone: 'green' | 'blue'; templates: T[]; renderPreview: (template: T) => ReactNode;
  onBack: () => void; onUseTemplate: (id: string) => void;
}) {
  const titleId = useId();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const categories = [...new Set(templates.map(template => template.category))];
  const keyword = normalize(query.trim());
  const filtered = templates.filter(template =>
    (category === 'Tất cả' || template.category === category) &&
    normalize(`${template.title} ${template.description} ${template.category}`).includes(keyword));
  const iconAccent = tone === 'green' ? 'text-green-700' : 'text-[var(--ui-accent)]';

  return <>
    <nav aria-label="Đường dẫn" className="flex min-h-12 shrink-0 items-center gap-2 border-b border-[var(--ui-border)] px-5 text-sm">
      <button type="button" onClick={onBack} className="text-[var(--ui-muted)] hover:underline">{backLabel}</button>
      <span aria-hidden="true" className="text-[var(--ui-tertiary)]">/</span>
      <span aria-current="page" className="font-semibold">{pageLabel}</span>
    </nav>
    <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--ui-bg)] px-[5vw] py-4">
      <section aria-labelledby={titleId} className="@container mx-auto w-full space-y-4 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 sm:p-5">
        <header className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${tone === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-500/10 text-[var(--ui-accent)]'}`}>
            <Icon aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 id={titleId} className="text-xl font-bold">{title}</h1>
        </header>
        <label className="flex max-w-lg items-center gap-2 rounded-lg border border-[var(--ui-border)] px-3 focus-within:border-[var(--ui-accent)]">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--ui-muted)]" />
          <input aria-label={`Tìm ${templateLabel}`} value={query} onChange={event => setQuery(event.target.value)}
            placeholder={`Tìm ${templateLabel}…`} className="w-full min-w-0 bg-transparent py-2.5 text-sm outline-none" />
        </label>
        <div role="group" className="flex flex-wrap gap-2" aria-label={`Chủ đề ${templateLabel}`}>
          {['Tất cả', ...categories].map(item => <button type="button" key={item} aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={`rounded-full border px-3 py-1.5 text-sm ${category === item ? 'theme-primary border-[var(--ui-primary)] bg-[var(--ui-primary)] text-white' : 'border-[var(--ui-border)] hover:bg-[var(--ui-hover)]'}`}>{item}</button>)}
        </div>
        <div className="grid grid-cols-1 gap-4 @min-[37rem]:grid-cols-2 @min-[56rem]:grid-cols-3">
          {filtered.map(template => <article key={template.id} aria-labelledby={`${template.id}-title`}
            className="flex min-w-0 flex-col rounded-xl border border-[var(--ui-border)]">
            <div className="flex-1 space-y-2 p-3">
              <div aria-hidden="true" className="template-gallery-preview grid h-48 min-w-0 place-items-center overflow-hidden rounded-lg border border-[var(--ui-border)] bg-[var(--ui-subtle)] p-2 [&>*]:w-full">
                {renderPreview(template)}
              </div>
              <h2 id={`${template.id}-title`} className="flex items-start gap-1.5 text-sm font-bold">
                <Icon aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${iconAccent}`} />
                <span className="truncate" title={template.title}>{template.title}</span>
              </h2>
              <p title={template.description} className="line-clamp-2 min-h-[2lh] text-xs leading-relaxed text-[var(--ui-muted)]">{template.description}</p>
            </div>
            <div className="px-3 pb-3">
              <button type="button" onClick={() => onUseTemplate(template.id)} aria-label={`Sử dụng mẫu ${template.title}`}
                className="theme-primary w-full rounded-lg bg-[var(--ui-primary)] px-2 py-2 text-xs font-semibold text-white hover:bg-[var(--ui-primary-hover)]">Sử dụng mẫu</button>
            </div>
          </article>)}
        </div>
        {!filtered.length && <p role="status" className="py-8 text-center text-sm text-[var(--ui-muted)]">Không tìm thấy {templateLabel} phù hợp.</p>}
      </section>
    </div>
  </>;
}
