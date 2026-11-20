import type { SpreadsheetCellStyle, SpreadsheetData, SpreadsheetTab } from '../types';
import { columnName, spreadsheetFormula, spreadsheetNumber, spreadsheetValue } from './spreadsheet';

const workbookMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const sheetNamespace = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const officeRelationships = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const packageRelationships = 'http://schemas.openxmlformats.org/package/2006/relationships';
const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';

function xmlText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function xmlAttribute(value: string): string {
  return xmlText(value).replace(/"/g, '&quot;');
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipTextEntries(files: Record<string, string>) {
  const encoder = new TextEncoder();
  const entries = Object.entries(files).map(([path, content]) => ({
    name: encoder.encode(path), content: encoder.encode(xmlDeclaration + content),
  }));
  const localSize = entries.reduce((size, entry) => size + 30 + entry.name.length + entry.content.length, 0);
  const directorySize = entries.reduce((size, entry) => size + 46 + entry.name.length, 0);
  const result = new Uint8Array(localSize + directorySize + 22);
  const bytes = new DataView(result.buffer);
  let local = 0;
  let central = localSize;

  // ZIP records use little-endian fields. Entries are stored without compression.
  for (const { name, content } of entries) {
    const checksum = crc32(content);
    bytes.setUint32(local, 0x04034b50, true);
    bytes.setUint16(local + 4, 20, true);
    bytes.setUint16(local + 12, 33, true); // DOS date for 1980-01-01.
    bytes.setUint32(local + 14, checksum, true);
    bytes.setUint32(local + 18, content.length, true);
    bytes.setUint32(local + 22, content.length, true);
    bytes.setUint16(local + 26, name.length, true);
    result.set(name, local + 30);
    result.set(content, local + 30 + name.length);

    bytes.setUint32(central, 0x02014b50, true);
    bytes.setUint16(central + 4, 20, true);
    bytes.setUint16(central + 6, 20, true);
    bytes.setUint16(central + 14, 33, true);
    bytes.setUint32(central + 16, checksum, true);
    bytes.setUint32(central + 20, content.length, true);
    bytes.setUint32(central + 24, content.length, true);
    bytes.setUint16(central + 28, name.length, true);
    bytes.setUint32(central + 42, local, true);
    result.set(name, central + 46);

    local += 30 + name.length + content.length;
    central += 46 + name.length;
  }

  bytes.setUint32(central, 0x06054b50, true);
  bytes.setUint16(central + 8, entries.length, true);
  bytes.setUint16(central + 10, entries.length, true);
  bytes.setUint32(central + 12, directorySize, true);
  bytes.setUint32(central + 16, localSize, true);
  return result;
}

type WorkbookStyle = SpreadsheetCellStyle & { header: boolean; percent?: boolean };

function workbookStyles(styles: WorkbookStyle[]): string {
  const fonts = styles.map(style => `<font>${(style.bold ?? style.header) ? '<b/>' : ''}${style.italic ? '<i/>' : ''}${style.underline ? '<u/>' : ''}<sz val="${Number(style.fontSize ?? 11)}"/><name val="${xmlAttribute(style.font ?? 'Arial')}"/></font>`).join('');
  const cells = styles.map((style, index) => `<xf numFmtId="${style.percent ? 10 : 0}" fontId="${index}" fillId="${style.header ? 2 : 0}" borderId="0" xfId="0" applyFont="1"${style.header ? ' applyFill="1"' : ''}${style.percent ? ' applyNumberFormat="1"' : ''}${style.align ? ` applyAlignment="1"><alignment horizontal="${style.align}"/></xf>` : '/>'}`).join('');
  return `<styleSheet xmlns="${sheetNamespace}"><fonts count="${styles.length}">${fonts}</fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDCECFF"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${styles.length}">${cells}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
}

function worksheetXml(sheet: SpreadsheetData, styleIndex: (style: WorkbookStyle) => number): string {
  const rows = [sheet.headers, ...sheet.rows].map((row, rowIndex) => {
    const cells = row.map((value, column) => {
      const address = `${columnName(column)}${rowIndex + 1}`;
      const style = sheet.cellStyles?.[address];
      if (!value && !style) return '';
      const number = rowIndex > 0 && !sheet.columnOptions?.[column] ? spreadsheetNumber(value) : undefined;
      const percent = number !== undefined && value.trim().endsWith('%');
      const index = styleIndex({ ...style, header: rowIndex === 0, percent });
      const attributes = `r="${address}"${index ? ` s="${index}"` : ''}`;
      if (spreadsheetFormula(value)) {
        const result = spreadsheetValue(sheet, address);
        const type = typeof result === 'number' ? '' : /^#(?:VALUE!|REF!|NAME\?|DIV\/0!|NUM!)$/.test(result) ? ' t="e"' : ' t="str"';
        return `<c ${attributes}${type}><f>${xmlText(value.trim().slice(1))}</f><v>${xmlText(String(result))}</v></c>`;
      }
      return number !== undefined ? `<c ${attributes}><v>${number}</v></c>`
        : `<c ${attributes} t="inlineStr"><is><t xml:space="preserve">${xmlText(value)}</t></is></c>`;
    }).join('');
    return cells ? `<row r="${rowIndex + 1}">${cells}</row>` : '';
  }).join('');
  const validationRules = Object.entries(sheet.columnOptions ?? {}).flatMap(([column, options]) => {
    const list = options.join(',');
    if (!list || list.length > 253 || options.some(option => /[",\r\n]/.test(option))) return [];
    const name = columnName(Number(column));
    return [`<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="${name}2:${name}${Math.max(2, sheet.rows.length + 1)}"><formula1>"${xmlText(list)}"</formula1></dataValidation>`];
  });
  const validations = validationRules.length ? `<dataValidations count="${validationRules.length}">${validationRules.join('')}</dataValidations>` : '';
  return `<worksheet xmlns="${sheetNamespace}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="${sheet.headers.length}" width="22" customWidth="1"/></cols><sheetData>${rows}</sheetData>${validations}</worksheet>`;
}

export function createSpreadsheetWorkbook(sheet: SpreadsheetData, additionalTabs: SpreadsheetTab[] = [], firstName = 'Bảng tính') {
  const tabs = [{ name: firstName, sheet }, ...additionalTabs];
  const styles: WorkbookStyle[] = [{ header: false }, { header: true }];
  const styleKey = ({ header, bold, italic, underline, align, percent, font, fontSize }: WorkbookStyle) =>
    `${+header}:${+(bold ?? header)}:${+!!italic}:${+!!underline}:${align ?? ''}:${+!!percent}:${font ?? 'Arial'}:${fontSize ?? 11}`;
  const styleIds = new Map(styles.map((style, index) => [styleKey(style), index]));
  const styleIndex = (style: WorkbookStyle) => {
    const key = styleKey(style);
    const existing = styleIds.get(key);
    if (existing !== undefined) return existing;
    const index = styles.length;
    styles.push(style);
    styleIds.set(key, index);
    return index;
  };
  const worksheetParts = Object.fromEntries(tabs.map((tab, i) => [`xl/worksheets/sheet${i + 1}.xml`, worksheetXml(tab.sheet, styleIndex)]));
  const sheets = tabs.map((tab, i) => {
    const name = tab.name.replace(/[\\/?*\[\]:]/g, '_').slice(0, 31);
    return `<sheet name="${xmlAttribute(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`;
  }).join('');
  const worksheets = tabs.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${officeRelationships}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('');
  const contentTypes = tabs.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');

  return zipTextEntries({
    '[Content_Types].xml': '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
      + '<Default Extension="xml" ContentType="application/xml"/>'
      + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
      + contentTypes + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    '_rels/.rels': `<Relationships xmlns="${packageRelationships}"><Relationship Id="rId1" Type="${officeRelationships}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': `<workbook xmlns="${sheetNamespace}" xmlns:r="${officeRelationships}"><bookViews><workbookView activeTab="0"/></bookViews><sheets>${sheets}</sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `<Relationships xmlns="${packageRelationships}">${worksheets}<Relationship Id="rId${tabs.length + 1}" Type="${officeRelationships}/styles" Target="styles.xml"/></Relationships>`,
    ...worksheetParts,
    'xl/styles.xml': workbookStyles(styles),
  });
}

export function downloadSpreadsheet(sheet: SpreadsheetData, title: string, additionalTabs: SpreadsheetTab[] = [], firstName?: string) {
  const archive = createSpreadsheetWorkbook(sheet, additionalTabs, firstName);
  const url = URL.createObjectURL(new Blob([archive], { type: workbookMime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/\.xlsx$/i, '').replace(/[<>:"/\\|?*]/g, '_').trim() || 'Bảng tính'}.xlsx`;
  document.body.appendChild(link);
  try { link.click(); }
  finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
