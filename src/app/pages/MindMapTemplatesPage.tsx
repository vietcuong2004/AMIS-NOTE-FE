import React from 'react';
import { Network } from 'lucide-react';
import { MindMap } from '../../components/editor/MindMapBlock';
import { MIND_MAP_TEMPLATES } from '../../data/mindMapTemplates';
import type { SpaceType } from '../../types';

export function MindMapTemplatesPage({ space, onBack, onUseTemplate }: {
  space: SpaceType; onBack: () => void; onUseTemplate: (id: string) => void;
}) {
  return <>
    <nav aria-label="Đường dẫn" className="flex min-h-12 shrink-0 items-center gap-2 border-b border-[var(--ui-border)] px-4 text-sm sm:px-7">
      <button type="button" onClick={onBack} className="rounded px-1 py-1 text-[var(--ui-muted)] hover:bg-[var(--ui-hover)] hover:text-[var(--ui-text)]">
        {space === 'company' ? 'Tài liệu công ty' : 'Ghi chép của tôi'}
      </button>
      <span aria-hidden="true" className="text-[var(--ui-tertiary)]">/</span>
      <span aria-current="page" className="font-semibold text-[var(--ui-text)]">Sơ đồ tư duy</span>
    </nav>
    <section aria-labelledby="mind-map-templates-title" className="flex-1 overflow-y-auto px-4 pb-10 pt-9 sm:px-7 sm:pt-14 lg:pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-11">
          <span className="mx-auto mb-4 flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-[1.5rem] bg-blue-500/10 text-[var(--ui-accent)]">
            <Network aria-hidden="true" className="h-10 w-10" strokeWidth={1.7} />
          </span>
          <h1 id="mind-map-templates-title" className="text-2xl font-bold tracking-tight text-[var(--ui-text)] sm:text-3xl">Chọn mẫu sơ đồ tư duy để ghi chép nhanh cuộc họp</h1>
          <p className="mt-3 text-base text-[var(--ui-muted)]">Ghi lại nội dung, quyết định và phân công công việc ngay trên sơ đồ.</p>
        </div>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))] lg:gap-x-5">
          {MIND_MAP_TEMPLATES.map(template => <article key={template.id} aria-labelledby={`${template.id}-title`}
            className="row-span-4 grid min-w-0 grid-rows-subgrid rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4">
            <div aria-hidden="true" className="grid min-w-0"><MindMap root={template.diagram} preview /></div>
            <h2 id={`${template.id}-title`} className="text-lg font-semibold text-[var(--ui-text)]">{template.title}</h2>
            <p className="text-base leading-relaxed text-[var(--ui-muted)]">{template.description}</p>
            <button type="button" onClick={() => onUseTemplate(template.id)}
              className="flex items-center gap-2 justify-self-center rounded-xl border border-[var(--ui-accent)] px-4 py-2 text-sm font-semibold text-[var(--ui-accent)] hover:bg-blue-500/10">
              <Network aria-hidden="true" className="h-4 w-4" />Sử dụng mẫu
            </button>
          </article>)}
        </div>
      </div>
    </section>
  </>;
}
