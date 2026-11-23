import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export const templateCardGridClass = 'grid grid-cols-1 gap-4 @min-[37rem]:grid-cols-2 @min-[56rem]:grid-cols-3';

export function TemplateCard({ id, title, description, Icon, tone, preview, onUse, onPreview, selected }: {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  tone?: 'blue' | 'green';
  preview: ReactNode;
  onUse: () => void;
  onPreview?: () => void;
  selected?: boolean;
}) {
  const titleId = `${id}-title`;
  const iconAccent = tone === 'green' ? 'text-green-700' : tone === 'blue' ? 'text-[var(--ui-accent)]' : 'text-[var(--ui-muted)]';

  return <article aria-labelledby={titleId} data-selected={selected ? '' : undefined}
    className="flex min-w-0 flex-col rounded-xl border border-[var(--ui-border)] data-selected:border-[var(--ui-accent)] has-[.template-preview-trigger:focus-visible]:outline-2 has-[.template-preview-trigger:focus-visible]:outline-offset-2 has-[.template-preview-trigger:focus-visible]:outline-[var(--ui-accent)]">
    <div className="relative grid flex-1 content-start gap-2 p-3">
      <div aria-hidden="true" className="template-gallery-preview grid h-48 min-w-0 place-items-center overflow-hidden rounded-lg border border-[var(--ui-border)] bg-[var(--ui-subtle)] p-2 [&>*]:w-full">
        {preview}
      </div>
      <h2 id={titleId} className="flex items-start gap-1.5 text-sm font-bold">
        <Icon aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${iconAccent}`} />
        <span className="truncate" title={title}>{title}</span>
      </h2>
      <p title={description} className="line-clamp-2 min-h-[2lh] text-xs leading-relaxed text-[var(--ui-muted)]">{description}</p>
      {onPreview && <button type="button" aria-label={`Xem trước ${title}`} aria-pressed={selected} onClick={onPreview}
        className="template-preview-trigger absolute inset-0 cursor-pointer rounded-t-xl hover:bg-[var(--ui-accent)]/5 focus-visible:outline-none" />}
    </div>
    <div className="px-3 pb-3">
      <button type="button" onClick={onUse} aria-label={`Sử dụng mẫu ${title}`}
        className="theme-primary w-full rounded-lg bg-[var(--ui-primary)] px-2 py-2 text-xs font-semibold text-white hover:bg-[var(--ui-primary-hover)]">Sử dụng mẫu</button>
    </div>
  </article>;
}
