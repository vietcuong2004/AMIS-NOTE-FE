import type { SpreadsheetData } from '../types';

export function columnName(index: number): string {
  let name = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    name = String.fromCharCode(65 + (n - 1) % 26) + name;
  }
  return name;
}

export function cellPosition(address: string) {
  const match = address.toUpperCase().match(/^([A-Z]{1,3})([1-9]\d{0,6})$/);
  if (!match) return;
  const column = [...match[1]].reduce((n, char) => n * 26 + char.charCodeAt(0) - 64, 0) - 1;
  const row = Number(match[2]) - 1;
  if (column < 16384 && row < 1048576) return { row, column };
}

export function spreadsheetCell(sheet: SpreadsheetData, address: string): string {
  const position = cellPosition(address);
  if (!position) return '';
  const { row, column } = position;
  return (row === 0 ? sheet.headers[column] : sheet.rows[row - 1]?.[column]) ?? '';
}

export function setSpreadsheetCell(sheet: SpreadsheetData, address: string, value: string): SpreadsheetData {
  const position = cellPosition(address);
  if (!position) return sheet;
  const { row, column } = position;
  if (column >= sheet.headers.length || row > sheet.rows.length || spreadsheetCell(sheet, address) === value) return sheet;
  return row === 0 ? { ...sheet, headers: sheet.headers.map((cell, index) => index === column ? value : cell) }
    : { ...sheet, rows: sheet.rows.map((cells, index) => index === row - 1
      ? sheet.headers.map((_, c) => c === column ? value : cells[c] ?? '') : cells) };
}

const cellReference = '[A-Z]{1,3}[1-9]\\d{0,6}';
const aggregateFormula = new RegExp(`^=(SUM|AVERAGE|MIN|MAX|COUNT)\\(\\s*(${cellReference})(?:\\s*:\\s*(${cellReference}))?\\s*\\)$`, 'i');
const directFormula = new RegExp(`^=(${cellReference})$`, 'i');

export function spreadsheetFormula(value: string) {
  const text = value.trim();
  if (text === '=#REF!') return { type: 'error' as const };
  const aggregate = aggregateFormula.exec(text);
  if (aggregate) return { type: 'aggregate' as const, operation: aggregate[1].toUpperCase(), start: aggregate[2].toUpperCase(), end: (aggregate[3] ?? aggregate[2]).toUpperCase() };
  const direct = directFormula.exec(text);
  if (direct) return { type: 'direct' as const, start: direct[1].toUpperCase() };
}

export function spreadsheetNumber(value: string): number | undefined {
  const text = value.trim();
  if (!/^-?(?:(?:0|[1-9]\d*)(?:\.\d+)?|\.\d+)%?$/.test(text) || text.replace(/\D/g, '').length > 15) return;
  const number = text.endsWith('%') ? Number(text.slice(0, -1)) / 100 : Number(text);
  return Number.isFinite(number) ? number : undefined;
}

export function spreadsheetValue(sheet: SpreadsheetData, address: string, trail = new Set<string>()): string | number {
  const raw = spreadsheetCell(sheet, address);
  if (!raw.startsWith('=')) return cellPosition(address)?.row === 0 ? raw : spreadsheetNumber(raw) ?? raw;
  if (trail.has(address) || trail.size >= 100) return '#VALUE!';
  const formula = spreadsheetFormula(raw);
  if (!formula) return '#NAME?';
  if (formula.type === 'error') return '#REF!';
  const start = cellPosition(formula.start);
  const end = formula.type === 'aggregate' ? cellPosition(formula.end) : start;
  if (!start || !end) return '#REF!';

  trail.add(address);
  try {
    if (formula.type === 'direct') return spreadsheetValue(sheet, formula.start, trail) || 0;
    let count = 0, sum = 0, minimum = Infinity, maximum = -Infinity;
    const lastRow = Math.min(sheet.rows.length, Math.max(start.row, end.row));
    const lastColumn = Math.min(sheet.headers.length - 1, Math.max(start.column, end.column));
    for (let row = Math.min(start.row, end.row); row <= lastRow; row++) {
      for (let column = Math.min(start.column, end.column); column <= lastColumn; column++) {
        const result = spreadsheetValue(sheet, `${columnName(column)}${row + 1}`, trail);
        if (typeof result === 'string' && /^#(?:VALUE!|REF!|NAME\?|DIV\/0!|NUM!)$/.test(result)) return result;
        if (typeof result !== 'number') continue;
        count++;
        sum += result;
        minimum = Math.min(minimum, result);
        maximum = Math.max(maximum, result);
      }
    }
    switch (formula.operation) {
      case 'COUNT': return count;
      case 'MIN': return count ? minimum : 0;
      case 'MAX': return count ? maximum : 0;
      case 'AVERAGE': return count ? (Number.isFinite(sum) ? sum / count : '#NUM!') : '#DIV/0!';
      default: return Number.isFinite(sum) ? sum : '#NUM!';
    }
  } finally {
    trail.delete(address);
  }
}

function remapCells(sheet: SpreadsheetData, target: (row: number, column: number) => string | undefined): SpreadsheetData {
  const mapAddress = (address: string) => {
    const cell = cellPosition(address);
    return cell ? target(cell.row, cell.column) : undefined;
  };
  const mapFormula = (value: string) => {
    const formula = spreadsheetFormula(value);
    if (!formula || formula.type === 'error') return value;
    const start = mapAddress(formula.start);
    if (formula.type === 'direct') return start ? `=${start}` : '=#REF!';
    const nearestSurvivingCell = (address: string, toward: string) => {
      const from = cellPosition(address);
      const to = cellPosition(toward);
      if (!from || !to) return;
      return target(from.row + Math.sign(to.row - from.row), from.column)
        ?? target(from.row, from.column + Math.sign(to.column - from.column));
    };
    const rangeStart = start ?? nearestSurvivingCell(formula.start, formula.end);
    const rangeEnd = mapAddress(formula.end) ?? nearestSurvivingCell(formula.end, formula.start);
    return rangeStart && rangeEnd ? `=${formula.operation}(${rangeStart}${rangeEnd === rangeStart ? '' : `:${rangeEnd}`})` : '=#REF!';
  };
  return {
    ...sheet,
    headers: sheet.headers.map(mapFormula),
    rows: sheet.rows.map(row => row.map(mapFormula)),
    cellStyles: sheet.cellStyles && Object.fromEntries(Object.entries(sheet.cellStyles).flatMap(([address, style]) => {
      const next = mapAddress(address);
      return next ? [[next, style]] : [];
    })),
  };
}

export function changeSpreadsheetRows(sheet: SpreadsheetData, index: number, remove = false): SpreadsheetData {
  const change = remove ? -1 : 1;
  const rows = remove ? sheet.rows.filter((_, position) => position !== index)
    : [...sheet.rows.slice(0, index), sheet.headers.map(() => ''), ...sheet.rows.slice(index)];
  return remapCells({ ...sheet, rows }, (row, column) => {
    if (remove && row === index + 1) return;
    return `${columnName(column)}${row + 1 + (row >= index + 1 ? change : 0)}`;
  });
}

export function changeSpreadsheetColumns(sheet: SpreadsheetData, index: number, remove = false): SpreadsheetData {
  const order: (number | null)[] = sheet.headers.map((_, column) => column);
  if (remove) order.splice(index, 1);
  else order.splice(index, 0, null);
  const next = {
    ...sheet,
    headers: order.map((column, target) => column === null ? `Cột ${columnName(target)}` : sheet.headers[column]),
    rows: sheet.rows.map(row => order.map(column => column === null ? '' : row[column] ?? '')),
    columnOptions: sheet.columnOptions && Object.fromEntries(order.flatMap((column, target) => {
      const options = column === null ? undefined : sheet.columnOptions?.[column];
      return options ? [[target, options]] : [];
    })),
    numericColumns: sheet.numericColumns && order.flatMap((column, target) =>
      column !== null && sheet.numericColumns?.includes(column) ? [target] : []),
  };
  return remapCells(next, (row, column) => {
    if (remove && column === index) return;
    const shifted = column >= index ? column + (remove ? -1 : 1) : column;
    return `${columnName(shifted)}${row + 1}`;
  });
}
