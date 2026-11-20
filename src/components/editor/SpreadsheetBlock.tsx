import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2 } from 'lucide-react';
import { spreadsheetText } from '../../data/excelTemplates';
import { cellPosition, changeSpreadsheetColumns, changeSpreadsheetRows, columnName, setSpreadsheetCell, spreadsheetValue } from '../../utils/spreadsheet';
import type { Block, BlockProperties, SpreadsheetData } from '../../types';

const statusColors: Record<string, string> = {
  'Hoàn thành': 'bg-green-100 text-green-900',
  'Đang thực hiện': 'bg-blue-100 text-blue-900',
  'Chưa bắt đầu': 'bg-slate-100 text-slate-700',
};

type SheetSelection = { axis: 'row' | 'column'; index: number; anchor: HTMLButtonElement; menuReady: boolean };

export function SpreadsheetGrid({ sheet, compact = false, minRows = 0, onChange, activeCell, onActiveCell, workbook = false, filter = '', zoom = 100 }: {
  sheet: SpreadsheetData; compact?: boolean; minRows?: number;
  onChange?: (sheet: SpreadsheetData) => void;
  activeCell?: string;
  onActiveCell?: (address: string) => void;
  workbook?: boolean;
  filter?: string;
  zoom?: number;
}) {
  const table = useRef<HTMLTableElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const [editingCell, setEditingCell] = useState<string>();
  const [selection, setSelection] = useState<SheetSelection | null>(null);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const editable = !!onChange;
  const selectedRow = selection?.axis === 'row' ? selection.index : undefined;
  const selectedColumn = selection?.axis === 'column' ? selection.index : undefined;
  const activePosition = activeCell ? cellPosition(activeCell) : undefined;
  const focusCell = (coordinate: string) => {
    const field = table.current?.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-sheet-cell="${coordinate}"]`);
    field?.focus();
    if (field instanceof HTMLInputElement) field.select();
  };
  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    focusCell(pendingFocus.current);
    pendingFocus.current = null;
  }, [sheet.headers.length, sheet.rows.length]);

  useEffect(() => {
    if (!selection || !editable) return;
    const { anchor } = selection;
    const closeOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!anchor.contains(target) && !menu.current?.contains(target)) setSelection(null);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, [selection, editable]);

  useEffect(() => {
    if (!selection || selection.menuReady || !editable) return;
    const timer = window.setTimeout(() => {
      setSelection(current => current === selection ? { ...selection, menuReady: true } : current);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [selection, editable]);

  useLayoutEffect(() => {
    const menuElement = menu.current;
    if (!selection?.menuReady || !editable || !menuElement) return;
    const { anchor, axis } = selection;
    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect();
      const { width, height } = menuElement.getBoundingClientRect();
      const left = axis === 'row' ? rect.right + 6 : rect.left;
      const top = axis === 'row' ? rect.top : rect.bottom + 6;
      setMenuPosition({ left: Math.max(8, Math.min(left, window.innerWidth - width - 8)),
        top: Math.max(8, Math.min(top, window.innerHeight - height - 8)) });
    };
    updatePosition();
    menuElement.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [selection, editable]);

  const rows = Array.from({ length: Math.max(minRows, compact ? Math.min(sheet.rows.length, 3) : sheet.rows.length) },
    (_, index) => sheet.rows[index] ?? []);
  const selectAxis = (axis: SheetSelection['axis'], index: number, anchor: HTMLButtonElement) => {
    setSelection(current => current?.axis === axis && current.index === index ? null : { axis, index, anchor, menuReady: false });
  };

  const addRow = (index: number) => {
    pendingFocus.current = `A${index + 2}`;
    setSelection(null);
    onChange?.(changeSpreadsheetRows(sheet, index));
  };
  const removeRow = () => {
    if (selectedRow === undefined) return;
    onChange?.(changeSpreadsheetRows(sheet, selectedRow - 1, true));
    setSelection(null);
  };
  const addColumn = (index: number) => {
    pendingFocus.current = `${columnName(index)}1`;
    setSelection(null);
    onChange?.(changeSpreadsheetColumns(sheet, index));
  };
  const removeColumn = () => {
    if (selectedColumn === undefined || sheet.headers.length <= 1) return;
    onChange?.(changeSpreadsheetColumns(sheet, selectedColumn, true));
    setSelection(null);
  };

  const renderRow = (row: string[], rowIndex: number) => {
    const Cell = rowIndex === 0 ? 'th' : 'td';
    return <tr key={rowIndex}>
      <th scope="row" data-sheet-coordinate-active={activePosition?.row === rowIndex || undefined}
        data-sheet-highlight={selectedRow === rowIndex ? 'row' : undefined}
        className="bg-[var(--ui-subtle)] text-center font-medium text-[var(--ui-muted)]">
        {onChange && rowIndex > 0 ? <>
          <button type="button" className="sheet-axis-button" aria-label={`Chọn hàng ${rowIndex + 1}`} aria-pressed={selectedRow === rowIndex}
            onClick={event => selectAxis('row', rowIndex, event.currentTarget)}>{rowIndex + 1}</button>
          <span className="hidden print:inline">{rowIndex + 1}</span>
        </> : rowIndex + 1}
      </th>
      {sheet.headers.map((_, column) => {
        const value = row[column] ?? '';
        const options = rowIndex > 0 ? sheet.columnOptions?.[column] : undefined;
        const status = options && value ? statusColors[value] : undefined;
        const coordinate = `${columnName(column)}${rowIndex + 1}`;
        const displayedValue = value.startsWith('=') ? String(spreadsheetValue(sheet, coordinate)) : value;
        const cellStyle = sheet.cellStyles?.[coordinate];
        const style: React.CSSProperties = {
          fontFamily: cellStyle?.font,
          fontSize: cellStyle?.fontSize ? `${cellStyle.fontSize}pt` : undefined,
          fontWeight: cellStyle?.bold === undefined ? undefined : cellStyle.bold ? 700 : 400,
          fontStyle: cellStyle?.italic ? 'italic' : undefined,
          textDecoration: cellStyle?.underline ? 'underline' : undefined,
          textAlign: cellStyle?.align,
        };
        const fieldProps = {
          'aria-label': `Ô ${coordinate}`,
          'data-sheet-cell': coordinate,
          value: options || editingCell === coordinate ? value : displayedValue,
          onFocus: () => {
            setSelection(null);
            setEditingCell(coordinate);
            onActiveCell?.(coordinate);
          },
          onBlur: () => setEditingCell(undefined),
          onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            onChange?.(setSpreadsheetCell(sheet, coordinate, event.currentTarget.value)),
        };
        return <Cell key={column} style={style} data-sheet-active={activeCell === coordinate || undefined} scope={rowIndex === 0 ? 'col' : undefined}
          tabIndex={workbook && !onChange ? 0 : undefined}
          onFocus={workbook && !onChange ? () => onActiveCell?.(coordinate) : undefined}
          data-sheet-highlight={selectedRow === rowIndex ? 'row' : selectedColumn === column ? 'column' : undefined} className={rowIndex === 0
          ? 'bg-green-100 text-left font-semibold text-green-950' : 'text-[var(--ui-text)]'}>
          {onChange ? <>
            {options
              ? <select {...fieldProps} style={style} className={`cell-field ${status ?? ''}`}><option value="">—</option>
                {value && !options.includes(value) && <option>{value}</option>}
                {options.map(option => <option key={option}>{option}</option>)}
              </select>
              : <input {...fieldProps} style={style} className="cell-field" autoComplete="off" />}
            <span className="hidden whitespace-pre-wrap px-2 py-1 print:block">{displayedValue}</span>
          </> : <span className={status ? `rounded px-1.5 py-0.5 ${status}` : undefined}>{displayedValue || '\u00a0'}</span>}
        </Cell>;
      })}
    </tr>;
  };

  const keepEditing = onChange ? (event: React.SyntheticEvent) => event.stopPropagation() : undefined;
  return <div data-spreadsheet className={`overflow-auto rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] ${compact ? 'overflow-hidden' : ''} ${workbook ? 'spreadsheet-workspace-grid' : ''}`}
    onKeyDown={onChange ? event => {
      event.stopPropagation();
      if (event.key === 'Escape' && selection) {
        selection.anchor.focus();
        setSelection(null);
        return;
      }
      if (event.key !== 'Enter' || event.nativeEvent.isComposing || !(event.target instanceof HTMLInputElement)) return;
      const field = event.target.dataset.sheetCell?.match(/^([A-Z]+)(\d+)$/);
      if (!field) return;
      event.preventDefault();
      const nextRow = Number(field[2]) + (event.shiftKey ? -1 : 1);
      table.current?.querySelector<HTMLElement>(`[data-sheet-cell="${field[1]}${nextRow}"]`)?.focus();
    } : undefined} onPaste={keepEditing} onCopy={keepEditing} onCut={keepEditing}>
    <table ref={table} aria-label="Bảng tính" style={zoom === 100 ? undefined : { zoom: zoom / 100 }}
      className={`spreadsheet-grid w-full border-collapse ${compact ? 'spreadsheet-grid--compact table-fixed' : 'min-w-[650px] text-sm'}`}>
      <thead>
        <tr className="bg-[var(--ui-subtle)] text-center text-[var(--ui-muted)]"><th aria-label="Số dòng" />
          {sheet.headers.map((_, index) => <th key={index} scope="col" className="font-medium"
            data-sheet-coordinate-active={activePosition?.column === index || undefined}
            data-sheet-highlight={selectedColumn === index ? 'column' : undefined}>
            {onChange ? <>
              <button type="button" className="sheet-axis-button" aria-label={`Chọn cột ${columnName(index)}`} aria-pressed={selectedColumn === index}
                onClick={event => selectAxis('column', index, event.currentTarget)}>{columnName(index)}</button>
              <span className="hidden print:inline">{columnName(index)}</span>
            </> : columnName(index)}
          </th>)}
        </tr>
      </thead>
      <tbody>{renderRow(sheet.headers, 0)}{rows.map((row, index) => !filter || row.some(value => value.toLowerCase().includes(filter))
        ? renderRow(row, index + 1) : null)}</tbody>
    </table>
    {onChange && !rows.length && <button type="button" className="sheet-action m-2 print:hidden" onClick={() => addRow(0)}>
      <Plus aria-hidden="true" className="h-4 w-4" />Thêm hàng
    </button>}
    {onChange && selection?.menuReady && createPortal(<div ref={menu} role="group" aria-label={selection.axis === 'row' ? 'Thao tác hàng' : 'Thao tác cột'}
      style={menuPosition} onMouseDown={event => event.stopPropagation()}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== selection.anchor) setSelection(null);
      }}
      className="fixed z-[100] flex w-52 max-w-[calc(100vw-16px)] flex-col rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-1.5 shadow-lg print:hidden">
      {selection.axis === 'row' ? <>
        <button type="button" className="sheet-action" onClick={() => addRow(selection.index - 1)}><Plus aria-hidden="true" className="h-4 w-4" />Thêm hàng phía trên</button>
        <button type="button" className="sheet-action" onClick={() => addRow(selection.index)}><Plus aria-hidden="true" className="h-4 w-4" />Thêm hàng bên dưới</button>
        <button type="button" className="sheet-action text-red-700" onClick={removeRow}><Trash2 aria-hidden="true" className="h-4 w-4" />Xóa hàng</button>
      </> : <>
        <button type="button" className="sheet-action" onClick={() => addColumn(selection.index)}><Plus aria-hidden="true" className="h-4 w-4" />Thêm cột bên trái</button>
        <button type="button" className="sheet-action" onClick={() => addColumn(selection.index + 1)}><Plus aria-hidden="true" className="h-4 w-4" />Thêm cột bên phải</button>
        <button type="button" className="sheet-action text-red-700" disabled={sheet.headers.length <= 1} onClick={removeColumn}><Trash2 aria-hidden="true" className="h-4 w-4" />Xóa cột</button>
      </>}
    </div>, document.body)}
  </div>;
}

export function SpreadsheetBlock({ block, readOnly, onChange }: {
  block: Block; readOnly: boolean; onChange: (content: string, props: BlockProperties) => void;
}) {
  const sheet = block.properties?.spreadsheet;
  if (!sheet) return null;
  return <SpreadsheetGrid sheet={sheet} onChange={readOnly ? undefined : spreadsheet => {
    onChange(spreadsheetText(spreadsheet), { ...block.properties, spreadsheet });
  }} />;
}
