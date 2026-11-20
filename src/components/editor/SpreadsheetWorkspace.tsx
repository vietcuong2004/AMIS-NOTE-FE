import React, { useState } from 'react';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Check, Download, FileSpreadsheet,
  Filter, Grid2X2, Italic, Minus, Plus, Printer, Redo2, Underline, Undo2,
} from 'lucide-react';
import { spreadsheetText } from '../../data/excelTemplates';
import {
  cellPosition, changeSpreadsheetColumns, changeSpreadsheetRows, columnName,
  setSpreadsheetCell, spreadsheetCell, spreadsheetNumber, spreadsheetValue,
} from '../../utils/spreadsheet';
import type { Block, BlockProperties, SpreadsheetCellStyle, SpreadsheetData, SpreadsheetTab } from '../../types';
import { SpreadsheetGrid } from './SpreadsheetBlock';

const categories = ['Tệp', 'Trang chủ', 'Chèn', 'Công thức', 'Dữ liệu', 'Xem'] as const;
const fonts = ['Arial', 'Calibri', 'Times New Roman', 'Verdana'] as const;
const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32];
const sheetTitle = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

export function spreadsheetTabs(block: Block): SpreadsheetTab[] {
  const sheet = block.properties?.spreadsheet;
  if (!sheet) return [];
  return [{ id: 'primary', name: block.properties?.spreadsheetName || 'Bảng 1', sheet }, ...(block.properties?.spreadsheetTabs ?? [])];
}

export function SpreadsheetWorkspace({ block, title, readOnly, saved, onChange, onDownload, onPrint }: {
  block: Block; title: string; readOnly: boolean; saved: boolean;
  onChange: (content: string, properties: BlockProperties) => void;
  onDownload: () => void; onPrint: () => void;
}) {
  const tabs = spreadsheetTabs(block);
  const [tabId, setTabId] = useState('primary');
  const [category, setCategory] = useState<typeof categories[number]>('Trang chủ');
  const [address, setAddress] = useState('A1');
  const [filter, setFilter] = useState('');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<{ past: SpreadsheetTab[][]; future: SpreadsheetTab[][] }>({ past: [], future: [] });
  const active = tabs.find(tab => tab.id === tabId) ?? tabs[0];
  const sheet = active.sheet;
  const selected = cellPosition(address);
  const activeAddress = selected && selected.column < sheet.headers.length && selected.row <= sheet.rows.length ? address : 'A1';
  const position = cellPosition(activeAddress)!;
  const style = sheet.cellStyles?.[activeAddress];

  const persist = ([first, ...rest]: SpreadsheetTab[]) => onChange(
    [first, ...rest].map(tab => spreadsheetText(tab.sheet)).join('\n\n'),
    { ...block.properties, spreadsheet: first.sheet, spreadsheetName: first.name, spreadsheetTabs: rest },
  );
  const replace = (next: SpreadsheetTab[]) => {
    if (readOnly) return;
    setHistory(previous => ({ past: [...previous.past.slice(-39), tabs], future: [] }));
    persist(next);
  };
  const edit = (next: SpreadsheetData) => {
    if (next !== sheet) replace(tabs.map(tab => tab.id === active.id ? { ...tab, sheet: next } : tab));
  };
  const editFormat = (format: Partial<SpreadsheetCellStyle>) => edit({ ...sheet,
    cellStyles: { ...sheet.cellStyles, [activeAddress]: { ...style, ...format } },
  });
  const addTab = () => {
    let index = tabs.length + 1;
    while (tabs.some(tab => tab.name === `Bảng ${index}`)) index++;
    const next: SpreadsheetTab = {
      id: crypto.randomUUID(), name: `Bảng ${index}`,
      sheet: { headers: ['Cột A', 'Cột B', 'Cột C', 'Cột D', 'Cột E', 'Cột F'], rows: Array.from({ length: 8 }, () => ['', '', '', '', '', '']) },
    };
    replace([...tabs, next]);
    setTabId(next.id);
    setAddress('A1');
    setFilter('');
  };
  const undo = () => {
    const previous = history.past.at(-1);
    if (!previous || readOnly) return;
    setHistory({ past: history.past.slice(0, -1), future: [tabs, ...history.future] });
    persist(previous);
  };
  const redo = () => {
    const next = history.future[0];
    if (!next || readOnly) return;
    setHistory({ past: [...history.past, tabs], future: history.future.slice(1) });
    persist(next);
  };
  const addFormula = (operation: string) => {
    const column = columnName(position.column);
    const above = position.row > 1;
    const first = above ? 2 : position.row + 2;
    const last = above ? position.row : sheet.rows.length + 1;
    if (first <= last) edit(setSpreadsheetCell(sheet, activeAddress, `=${operation}(${column}${first}:${column}${last})`));
  };
  const numericValues = sheet.rows.flatMap((row, index) => row.flatMap((value, column) => {
    const result = value.startsWith('=') ? spreadsheetValue(sheet, `${columnName(column)}${index + 2}`) : value;
    const number = typeof result === 'number' ? result : spreadsheetNumber(result);
    return number === undefined ? [] : [number];
  }));
  const sum = numericValues.reduce((total, value) => total + value, 0);

  return <section className="spreadsheet-workspace flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--ui-surface)] print:overflow-visible" aria-label="Trình chỉnh sửa bảng tính Excel">
    <header className="flex min-w-0 shrink-0 items-center gap-3 border-b border-[var(--ui-border)] px-4 py-3 sm:px-6">
      <span className="rounded-lg bg-green-100 p-2 text-green-800 print:hidden"><FileSpreadsheet aria-hidden="true" className="h-5 w-5" /></span>
      <h1 className="truncate text-xl font-bold sm:text-2xl" title={title}>{title}</h1>
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 print:hidden" role="status">
        {saved && <Check aria-hidden="true" className="h-3.5 w-3.5" />}{saved ? 'Đã lưu' : 'Đang lưu…'}
      </span>
    </header>

    <div className="shrink-0 overflow-x-auto border-b border-[var(--ui-border)] bg-[var(--ui-subtle)] px-3 print:hidden" role="group" aria-label="Nhóm công cụ bảng tính">
      <div className="flex w-max gap-1">
        {categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}
          className={`border-b-2 px-3 py-2 text-sm hover:bg-[var(--ui-hover)] ${category === item ? 'border-blue-600 font-semibold text-blue-700' : 'border-transparent text-[var(--ui-text)]'}`}>{item}</button>)}
      </div>
    </div>
    <div className="shrink-0 overflow-x-auto border-b border-[var(--ui-border)] px-3 py-1.5 print:hidden" role="group" aria-label="Thanh công cụ bảng tính">
      <div className="flex min-h-8 w-max items-center gap-1.5">
        {category === 'Tệp' && <>
          <button type="button" className="sheet-action" onClick={onDownload}><Download aria-hidden="true" className="h-4 w-4" />Xuất .xlsx</button>
          <button type="button" className="sheet-action" onClick={onPrint}><Printer aria-hidden="true" className="h-4 w-4" />In bảng tính</button>
        </>}
        {category === 'Trang chủ' && <>
          <button type="button" className="sheet-action" title="Hoàn tác" aria-label="Hoàn tác" onClick={undo} disabled={readOnly || !history.past.length}><Undo2 aria-hidden="true" className="h-4 w-4" /></button>
          <button type="button" className="sheet-action" title="Làm lại" aria-label="Làm lại" onClick={redo} disabled={readOnly || !history.future.length}><Redo2 aria-hidden="true" className="h-4 w-4" /></button>
          <span aria-hidden="true" className="mx-1 h-5 border-l border-[var(--ui-border)]" />
          <select className="sheet-action min-w-28" aria-label="Phông chữ" value={style?.font ?? 'Arial'} disabled={readOnly}
            onChange={event => editFormat({ font: fonts[event.currentTarget.selectedIndex] })}>
            {fonts.map(font => <option key={font}>{font}</option>)}
          </select>
          <select className="sheet-action" aria-label="Cỡ chữ" value={style?.fontSize ?? 11} disabled={readOnly}
            onChange={event => editFormat({ fontSize: Number(event.currentTarget.value) })}>
            {fontSizes.map(size => <option key={size}>{size}</option>)}
          </select>
          {([{ key: 'bold', label: 'In đậm', Icon: Bold }, { key: 'italic', label: 'In nghiêng', Icon: Italic }, { key: 'underline', label: 'Gạch chân', Icon: Underline }] as const)
            .map(({ key, label, Icon }) => <button key={key} type="button" className="sheet-action spreadsheet-format" aria-label={label} title={label} disabled={readOnly}
              aria-pressed={style?.[key] ?? (key === 'bold' && position.row === 0)}
              onClick={() => editFormat({ [key]: !(style?.[key] ?? (key === 'bold' && position.row === 0)) })}><Icon aria-hidden="true" className="h-4 w-4" /></button>)}
          <span aria-hidden="true" className="mx-1 h-5 border-l border-[var(--ui-border)]" />
          {([{ key: 'left', label: 'Căn trái', Icon: AlignLeft }, { key: 'center', label: 'Căn giữa', Icon: AlignCenter }, { key: 'right', label: 'Căn phải', Icon: AlignRight }] as const)
            .map(({ key, label, Icon }) => <button key={key} type="button" className="sheet-action spreadsheet-format" aria-label={label} title={label} disabled={readOnly}
              aria-pressed={style?.align === key} onClick={() => editFormat({ align: key })}><Icon aria-hidden="true" className="h-4 w-4" /></button>)}
        </>}
        {category === 'Chèn' && <>
          <button type="button" className="sheet-action" disabled={readOnly} onClick={() => edit(changeSpreadsheetRows(sheet, position.row))}>Chèn hàng bên dưới</button>
          <button type="button" className="sheet-action" disabled={readOnly} onClick={() => edit(changeSpreadsheetColumns(sheet, position.column + 1))}>Chèn cột bên phải</button>
          <button type="button" className="sheet-action" disabled={readOnly} onClick={addTab}>Thêm trang tính</button>
        </>}
        {category === 'Công thức' && ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT'].map(operation =>
          <button key={operation} type="button" className="sheet-action" disabled={readOnly} onClick={() => addFormula(operation)}>{operation}</button>)}
        {category === 'Dữ liệu' && <label className="flex items-center gap-2 px-2 text-sm"><Filter aria-hidden="true" className="h-4 w-4" />
          <input type="search" aria-label="Lọc hàng theo nội dung" placeholder="Lọc theo nội dung…" value={filter}
            onChange={event => setFilter(event.target.value)} className="rounded border border-[var(--ui-border)] px-2 py-1" /></label>}
        {category === 'Xem' && <button type="button" className="sheet-action spreadsheet-format" aria-pressed={showGrid} onClick={() => setShowGrid(value => !value)}>
          <Grid2X2 aria-hidden="true" className="h-4 w-4" />Đường lưới</button>}
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-2 border-b border-[var(--ui-border)] px-3 py-1.5 print:hidden">
      <output className="min-w-16 rounded-md border border-[var(--ui-border)] px-2 py-1.5 text-center text-sm font-medium" aria-label="Ô đang chọn">{activeAddress}</output>
      <span aria-hidden="true" className="px-1 font-serif text-lg italic text-[var(--ui-muted)]">fx</span>
      <input aria-label="Thanh công thức" value={spreadsheetCell(sheet, activeAddress)} readOnly={readOnly}
        onChange={event => edit(setSpreadsheetCell(sheet, activeAddress, event.target.value))}
        className="min-w-0 flex-1 rounded-md border border-[var(--ui-border)] px-2.5 py-1.5 text-sm outline-none focus:border-blue-600" />
    </div>

    <div className={`flex min-h-0 min-w-0 flex-1 flex-col px-2 pt-2 print:overflow-visible ${showGrid ? '' : 'spreadsheet-gridlines-hidden'}`}>
      <SpreadsheetGrid key={active.id} workbook sheet={sheet} activeCell={activeAddress} onActiveCell={setAddress} zoom={zoom}
        filter={filter.trim().toLowerCase()} onChange={readOnly ? undefined : edit} />
    </div>

    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-y border-[var(--ui-border)] bg-[var(--ui-subtle)] px-3 print:hidden" role="group" aria-label="Trang tính">
      {tabs.map(tab => <button type="button" key={tab.id} aria-pressed={active.id === tab.id} onClick={() => { setTabId(tab.id); setAddress('A1'); setFilter(''); }}
        className={`shrink-0 border-b-2 px-3 py-2 text-sm ${active.id === tab.id ? 'border-blue-600 bg-[var(--ui-surface)] font-semibold text-blue-700' : 'border-transparent hover:bg-[var(--ui-hover)]'}`}>{tab.name}</button>)}
      {!readOnly && <button type="button" className="sheet-action" onClick={addTab} aria-label="Thêm trang tính" title="Thêm trang tính"><Plus aria-hidden="true" className="h-4 w-4" /></button>}
    </div>
    <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-1 text-xs text-[var(--ui-muted)] print:hidden">
      <span>Sẵn sàng</span>
      <div className="flex flex-wrap items-center gap-3">
        {numericValues.length > 0 && <span className="hidden sm:inline">Tổng {sheetTitle.format(sum)} · Trung bình {sheetTitle.format(sum / numericValues.length)} · Đếm {numericValues.length}</span>}
        <button type="button" className="sheet-action" aria-label="Thu nhỏ bảng tính" disabled={zoom <= 60} onClick={() => setZoom(value => Math.max(60, value - 10))}><Minus aria-hidden="true" className="h-3.5 w-3.5" /></button>
        <input type="range" min={60} max={160} step={10} value={zoom} aria-label="Mức thu phóng" onChange={event => setZoom(Number(event.target.value))} className="w-20 accent-blue-600" />
        <button type="button" className="sheet-action" aria-label="Phóng to bảng tính" disabled={zoom >= 160} onClick={() => setZoom(value => Math.min(160, value + 10))}><Plus aria-hidden="true" className="h-3.5 w-3.5" /></button>
        <output aria-label="Tỷ lệ hiển thị">{zoom}%</output>
      </div>
    </footer>
  </section>;
}
