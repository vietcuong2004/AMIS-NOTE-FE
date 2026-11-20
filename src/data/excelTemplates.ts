import type { Block, SpreadsheetData } from '../types';

const statuses = ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành'];
export const EXCEL_CATEGORIES = ['Kế hoạch', 'Theo dõi', 'Thống kê', 'Báo cáo'] as const;

interface ExcelTemplate {
  id: string;
  title: string;
  description: string;
  category: typeof EXCEL_CATEGORIES[number];
  sheet: SpreadsheetData;
}

const templates: ExcelTemplate[] = [
  {
    id: 'excel-work-plan', title: 'Kế hoạch công việc', category: 'Kế hoạch',
    description: 'Lập danh sách công việc, phân công người thực hiện và theo dõi thời hạn.',
    sheet: {
      headers: ['STT', 'Nội dung công việc', 'Người thực hiện', 'Thời hạn', 'Trạng thái', 'Ghi chú'],
      rows: [['1', 'Chuẩn bị tài liệu', 'Nguyễn Văn A', '26/11/2026', 'Hoàn thành', ''], ['2', 'Tổ chức cuộc họp', 'Trần Thị B', '27/11/2026', 'Đang thực hiện', ''], ['3', 'Tổng hợp và báo cáo', 'Lê Văn C', '28/11/2026', 'Chưa bắt đầu', '']],
      columnOptions: { 4: statuses }, numericColumns: [0],
    },
  },
  {
    id: 'excel-project-plan', title: 'Kế hoạch dự án', category: 'Kế hoạch',
    description: 'Sắp xếp các mốc, đầu việc và người phụ trách theo từng giai đoạn.',
    sheet: {
      headers: ['Giai đoạn', 'Đầu việc', 'Người phụ trách', 'Bắt đầu', 'Kết thúc', 'Trạng thái'],
      rows: [['Khởi động', 'Xác định phạm vi', 'Nhóm dự án', '', '', 'Hoàn thành'], ['Triển khai', 'Thực hiện kế hoạch', 'Nhóm triển khai', '', '', 'Đang thực hiện'], ['Nghiệm thu', 'Bàn giao kết quả', '', '', '', 'Chưa bắt đầu']],
      columnOptions: { 5: statuses },
    },
  },
  {
    id: 'excel-progress', title: 'Theo dõi tiến độ', category: 'Theo dõi',
    description: 'Cập nhật trạng thái, phần trăm hoàn thành và các vướng mắc của từng đầu việc.',
    sheet: {
      headers: ['Đầu việc', 'Người phụ trách', 'Tiến độ (%)', 'Hạn hoàn thành', 'Trạng thái', 'Vướng mắc'],
      rows: [['Thu thập yêu cầu', 'Minh Anh', '100', '', 'Hoàn thành', ''], ['Chuẩn bị bản nháp', 'Hoàng Nam', '60', '', 'Đang thực hiện', ''], ['Duyệt kết quả', '', '0', '', 'Chưa bắt đầu', '']],
      columnOptions: { 4: statuses }, numericColumns: [2],
    },
  },
  {
    id: 'excel-expenses', title: 'Theo dõi chi phí', category: 'Theo dõi',
    description: 'So sánh dự toán với chi phí thực tế theo từng khoản.',
    sheet: {
      headers: ['Ngày', 'Khoản chi', 'Nhóm chi phí', 'Dự toán (đ)', 'Thực chi (đ)', 'Ghi chú'],
      rows: [['', 'Văn phòng phẩm', 'Vận hành', '1500000', '1200000', ''], ['', 'Tổ chức cuộc họp', 'Sự kiện', '3000000', '2800000', ''], ['', 'Thiết bị', 'Đầu tư', '5000000', '', '']],
      numericColumns: [3, 4],
    },
  },
  {
    id: 'excel-inventory', title: 'Quản lý tồn kho', category: 'Thống kê',
    description: 'Theo dõi lượng nhập, xuất và tồn của từng mặt hàng.',
    sheet: {
      headers: ['Mã hàng', 'Tên hàng', 'Tồn đầu kỳ', 'Nhập', 'Xuất', 'Tồn cuối kỳ'],
      rows: [['VT001', 'Giấy A4', '50', '25', '18', '57'], ['VT002', 'Bút bi', '120', '40', '35', '125'], ['VT003', 'Bìa hồ sơ', '35', '10', '12', '33']],
      numericColumns: [2, 3, 4, 5],
    },
  },
  {
    id: 'excel-summary', title: 'Báo cáo tổng hợp', category: 'Báo cáo',
    description: 'Tổng hợp chỉ tiêu, kết quả thực tế và nhận xét theo kỳ báo cáo.',
    sheet: {
      headers: ['Kỳ báo cáo', 'Chỉ tiêu', 'Kế hoạch', 'Thực tế', 'Đơn vị', 'Nhận xét'],
      rows: [['Tháng 1', 'Doanh thu', '150', '142', 'Triệu đồng', ''], ['Tháng 1', 'Khách hàng mới', '40', '43', 'Khách hàng', ''], ['Tháng 1', 'Đơn hoàn thành', '120', '118', 'Đơn hàng', '']],
      numericColumns: [2, 3],
    },
  },
];

export function spreadsheetText(sheet: SpreadsheetData): string {
  return [sheet.headers, ...sheet.rows].filter(row => row.some(Boolean)).map(row => row.join('\t')).join('\n');
}

export const EXCEL_TEMPLATES = templates.map(template => ({
  ...template,
  space: 'personal' as const,
  type: 'plan' as const,
  tags: ['Excel', template.category],
  createBlocks: (): Block[] => {
    const spreadsheet = structuredClone(template.sheet);
    spreadsheet.rows.push(...Array.from({ length: 5 }, () => spreadsheet.headers.map(() => '')));
    const progressTemplate = template.id === 'excel-work-plan' ? templates.find(item => item.id === 'excel-progress') : undefined;
    const spreadsheetTabs = progressTemplate ? [{ id: 'progress', name: progressTemplate.title, sheet: structuredClone(progressTemplate.sheet) }] : [];
    return [{ id: template.id, type: 'spreadsheet', content: [spreadsheet, ...spreadsheetTabs.map(tab => tab.sheet)].map(spreadsheetText).join('\n\n'),
      properties: { spreadsheet, spreadsheetName: progressTemplate ? 'Kế hoạch' : 'Bảng 1', spreadsheetTabs } }];
  },
}));
