import { FileSpreadsheet } from 'lucide-react';
import { EXCEL_TEMPLATES } from '../../data/excelTemplates';
import { SpreadsheetGrid } from '../../components/editor/SpreadsheetBlock';
import type { Folder, SpaceType } from '../../types';
import { TemplateGallery } from './TemplateGallery';

export function ExcelTemplatesPage({ space, folder, onBack, onUseTemplate }: {
  space: SpaceType; folder?: Folder; onBack: () => void; onUseTemplate: (id: string) => void;
}) {
  return <TemplateGallery
    backLabel={folder?.name ?? (space === 'company' ? 'Tài liệu công ty' : 'Ghi chép của tôi')}
    pageLabel="Tạo mẫu Excel" title="Tạo file Excel từ mẫu" templateLabel="mẫu Excel"
    Icon={FileSpreadsheet} tone="green" templates={EXCEL_TEMPLATES}
    renderPreview={template => <SpreadsheetGrid sheet={template.sheet} compact minRows={8} />}
    onBack={onBack} onUseTemplate={onUseTemplate}
  />;
}
