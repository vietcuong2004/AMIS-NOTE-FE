import { Network } from 'lucide-react';
import { MindMap } from '../../components/editor/MindMapBlock';
import { MIND_MAP_TEMPLATES } from '../../data/mindMapTemplates';
import type { SpaceType } from '../../types';
import { TemplateGallery } from './TemplateGallery';

export function MindMapTemplatesPage({ space, onBack, onUseTemplate }: {
  space: SpaceType; onBack: () => void; onUseTemplate: (id: string) => void;
}) {
  return <TemplateGallery
    backLabel={space === 'company' ? 'Tài liệu công ty' : 'Ghi chép của tôi'}
    pageLabel="Sơ đồ tư duy" title="Tạo sơ đồ tư duy từ mẫu" templateLabel="mẫu sơ đồ tư duy"
    Icon={Network} tone="blue" templates={MIND_MAP_TEMPLATES}
    renderPreview={template => <MindMap root={template.diagram} preview />}
    onBack={onBack} onUseTemplate={onUseTemplate}
  />;
}
