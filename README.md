# MISA Note 📝

> **Hệ thống quản lý ghi chú cá nhân, tài liệu công ty và biên bản cuộc họp tối giản chuẩn Notion & Lark.**

[![Live Demo](https://img.shields.io/badge/Demo-misa--note.vercel.app-blue?style=for-the-badge&logo=vercel)](https://misa-note.vercel.app/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Giới thiệu tổng quan

**MISA Note** (tiền thân là giải pháp AMIS Ghi chép) được định hướng và tái thiết kế toàn diện để trở thành **nền tảng quản lý tri thức và ghi chú thế hệ mới** dành cho doanh nghiệp và người dùng cá nhân.

Lấy cảm hứng từ sự linh hoạt của **Notion**, tính trực quan của **Lark Base** cùng phong cách giao diện thanh lịch chuẩn **Apple iOS**, MISA Note giải quyết trọn vẹn bài toán từ việc ghi chép ý tưởng thường nhật đến việc tập trung hóa, phân quyền và bàn giao tri thức doanh nghiệp một cách khoa học.

### 🎯 Hai mục tiêu trọng tâm

| Mục tiêu Doanh nghiệp                                                                                                                                                         | Mục tiêu Cá nhân                                                                                                                     |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Kho tri thức tập trung:** Quản lý quy định, chính sách, tài liệu hướng dẫn và quy trình vận hành toàn công ty.                                        | **Soạn thảo nhanh chóng:** Ghi lại tức thời các ý tưởng, công việc cần làm, ghi chú học tập và nghiên cứu.     |
| **Phân quyền & Bàn giao:** Kiểm soát chặt chẽ quyền truy cập (Owner, Editor, Viewer), tự động hóa việc bàn giao tài liệu khi có luân chuyển nhân sự. | **Tổ chức khoa học:** Phân loại tài liệu theo cây thư mục nhiều cấp, gắn nhãn (tags) và đánh dấu yêu thích.    |
| **Biên bản cuộc họp chuẩn hóa:** Quản lý lịch họp, điểm danh nhân sự, nghị sự và phân công công việc (Action Items) có kỳ hạn.                     | **Ghi chú nhanh (Quick Note):** Mở cửa sổ ghi chú tức thì từ bất kỳ màn hình nào mà không gián đoạn công việc. |

---

## ✨ Tính năng nổi bật

### 1. Trình soạn thảo Block-based Editor mạnh mẽ

- **Hơn 20 loại Block chuyên dụng:**
  - *Văn bản:* Đoạn văn chuẩn, Tiêu đề linh hoạt (H1, H2, H3, H4).
  - *Danh sách:* Bullet list, Numbered list (tự động phân cấp thông minh), Checklist (việc cần làm), Toggle list (thu gọn/mở rộng).
  - *Định dạng chuyên sâu:* Code block (kèm chọn ngôn ngữ), Quote (trích dẫn), Callout (khối nổi bật với icon & màu sắc), Đường kẻ phân cách (Divider).
  - *Dữ liệu & Media:* Bảng (Table) tùy biến thêm/bớt hàng cột trực quan, Ảnh, Video, Audio, File đính kèm, Liên kết xem trước (Link preview).
  - *Khối Cuộc họp (Meeting Blocks):* Thông tin cuộc họp, Danh sách thành viên (Attendees kèm trạng thái điểm danh), Chương trình nghị sự (Agenda), Danh sách hành động (Action Items phân công người phụ trách, thời hạn và mức ưu tiên).
- **Phím tắt thông minh Slash Command (`/`):** Gõ `/` để tìm kiếm và chèn block siêu tốc, hỗ trợ ghi nhớ và đề xuất 5 thao tác gần nhất.
- **Tương tác trực quan:** Kéo thả sắp xếp block (Drag & Drop), chọn nhiều block (Multi-block selection), phím tắt điều hướng bàn phím tự nhiên.
- **@Mention & Phân quyền:** Gắn thẻ đồng nghiệp hoặc nhóm làm việc trực tiếp trong ngữ cảnh tài liệu kèm phân quyền truy cập.

### 2. Quản lý Không gian Kép (Dual Workspace)

- **Ghi chép của tôi (`/private`):** Không gian bảo mật cá nhân của từng nhân sự.
- **Tài liệu công ty (`/company`):** Không gian tri thức chung của tổ chức và các phòng ban.

### 3. Cây thư mục đa tầng (Infinite Nested Folders)

- Hỗ trợ tạo thư mục lồng nhau vô hạn cấp (`parentId`).
- Tạo nhanh thư mục con bằng nút `+` trực tiếp trên Sidebar, hỗ trợ đổi tên tại chỗ (Inline rename).
- Cơ chế xóa thư mục an toàn: Khi xóa một thư mục, toàn bộ tài liệu và thư mục con tự động được đưa về cấp cha hoặc thư mục gốc, bảo toàn dữ liệu tuyệt đối.
- Kéo thả di chuyển tài liệu linh hoạt giữa các thư mục và không gian.

### 4. Tìm kiếm & Chế độ xem linh hoạt

- **Spotlight Search (Ctrl + K / Cmd + K):** Tìm kiếm tức thì theo từ khóa, nội dung, thẻ tag và không gian làm việc.
- **Chế độ xem phân loại đa dạng:**
  - *Gần đây (`/recent`):* Sắp xếp theo thứ tự chỉnh sửa mới nhất.
  - *Yêu thích (`/favorites`):* Truy cập nhanh các tài liệu quan trọng.
  - *Chưa phân loại (`/unclassified`):* Quản lý các ghi chép tự do chưa gán thư mục.
  - *Được chia sẻ (`/shared`):* Danh sách tài liệu được đồng nghiệp cấp quyền.
  - *Biên bản cuộc họp (`/meetings`):* Quản lý chuyên biệt các buổi họp.
  - *Thư viện mẫu (`/templates`):* Bộ mẫu sẵn có (Biên bản họp, Kế hoạch tuần, Onboarding,...).
  - *Thùng rác (`/trash`):* Lưu trữ tài liệu đã xóa với tùy chọn khôi phục hoặc xóa vĩnh viễn.

### 5. Trợ lý Trí tuệ nhân tạo (One AI / Gemini API Ready)

- Cửa sổ trợ lý One AI Assistant hỗ trợ tăng tốc công việc:
  - Tóm tắt ý chính và kết luận trong tài liệu.
  - Trích xuất toàn bộ đầu việc (Action Items) kèm người chịu trách nhiệm.
  - Đề xuất khung chương trình họp chuẩn.
  - Chỉnh sửa câu từ, chuẩn hóa văn phong công sở.

### 6. Đa dạng Giao diện (Theme System)

Tùy biến phong cách làm việc qua menu cá nhân:

- **Mặc định (Clean Modern):** Tối giản, thanh lịch, tập trung vào nội dung.
- **Giao diện 1 (Blue & Yellow):** Hiện đại, năng động, đậm chất nhận diện thương hiệu.
- **Giao diện 2 (Graphite & Champagne):** Sidebar tối kết hợp nền soạn thảo sáng, giảm mỏi mắt khi làm việc ban đêm.

### 7. Nhập / Xuất dữ liệu đa định dạng

- Nhập tài liệu (Import) từ các tệp: **Markdown (.md)**, **Plain Text (.txt)**, **Word (.docx)**, **OpenDocument (.odt)**.
- Chia sẻ liên kết tài liệu trực tiếp, hỗ trợ tạo bản sao và in ấn chuẩn layout trang in.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

| Thành phần                   | Công nghệ                                                                                                            |
| :----------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Core Framework**       | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)                                           |
| **Bundler & Build Tool** | [Vite 8](https://vitejs.dev/)                                                                                           |
| **Styling**              | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Design Tokens                                                      |
| **Animations**           | [Motion](https://motion.dev/) (Framer Motion)                                                                           |
| **Iconography**          | [Lucide React](https://lucide.dev/)                                                                                     |
| **AI Integration**       | [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini SDK)                                        |
| **State & Persistence**  | Client-side In-memory & LocalStorage Engine                                                                            |
| **Testing**              | Node.js Test Runner + [tsx](https://github.com/privatenumber/tsx) + [jsdom](https://github.com/jsdom/jsdom) (100+ tests) |

---

## 🧭 Cấu trúc Định tuyến (Routing & Navigation)

Hệ thống sử dụng HTML5 History API để đem lại trải nghiệm Single Page Application (SPA) mượt mà không cần tải lại trang:

| URL                        | Trang hiển thị                               |
| :------------------------- | :--------------------------------------------- |
| `/private`               | Không gian ghi chép cá nhân                |
| `/company`               | Kho tài liệu dùng chung công ty            |
| `/templates`             | Bộ sưu tập mẫu tài liệu chuẩn           |
| `/unclassified`          | Tài liệu chưa phân loại thư mục         |
| `/private/unclassified`  | Chưa phân loại — Ghi chép cá nhân       |
| `/company/unclassified`  | Chưa phân loại — Tài liệu công ty       |
| `/recent`                | Tài liệu vừa thao tác gần đây           |
| `/favorites`             | Danh sách tài liệu yêu thích              |
| `/library`               | Thư viện tài liệu tổng quan               |
| `/shared`                | Tài liệu được chia sẻ từ đồng nghiệp |
| `/meetings`              | Danh mục biên bản cuộc họp                |
| `/trash`                 | Thùng rác                                    |
| `/documents/:documentId` | Trình soạn thảo tài liệu chi tiết        |
| `/folders/:folderId`     | Xem nội dung bên trong thư mục             |

---

## 🚀 Hướng dẫn Cài đặt & Chạy ứng dụng

### Yêu cầu tiên quyết

- **Node.js**: Phiên bản 18.x trở lên (khuyên dùng Node.js 20 hoặc 22)
- **Trình quản lý gói**: npm / pnpm / yarn / bun

### Các bước thực hiện

1. **Clone mã nguồn dự án:**

   ```bash
   git clone https://github.com/vietcuong2004/MISA-Note.git
   cd MISA-Note
   ```
2. **Cài đặt các gói phụ thuộc:**

   ```bash
   npm install
   ```
3. **Cấu hình biến môi trường (Tùy chọn cho tính năng AI):**
   Sao chép file `.env.example` thành `.env.local` và điền khóa API Gemini:

   ```bash
   cp .env.example .env.local
   ```

   Nội dung file `.env.local`:

   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   ```
4. **Khởi chạy môi trường phát triển (Dev Server):**

   ```bash
   npm run dev
   ```

   Truy cập vào ứng dụng tại: `http://localhost:3000`

---

## Nhận xét trực tiếp trên tài liệu

Chọn **⋯ → Tiện ích → Nhận xét** để mở sidebar, hoặc bôi đen văn bản và chọn **Thêm nhận xét**. Có thể trả lời, sửa, xóa, đánh dấu hoàn thành và mở lại nhận xét. Nhận xét được lưu trong bộ nhớ theo từng tài liệu. Bạn có thể chuyển trang rồi quay lại trong cùng phiên chạy. Tải lại trang sẽ xóa toàn bộ nhận xét của phiên đó.

## 📋 Danh sách Lệnh Scripts

| Lệnh                    | Chức năng                                                                         |
| :----------------------- | :---------------------------------------------------------------------------------- |
| `npm run dev`          | Khởi chạy máy chủ phát triển Vite tại cổng 3000                             |
| `npm run build`        | Đóng gói mã nguồn phục vụ môi trường Production (`dist/`)               |
| `npm run preview`      | Chạy thử bản build production trên môi trường local                          |
| `npm run lint`         | Kiểm tra lỗi TypeScript với `tsc --noEmit`                                     |
| `npm test`             | Chạy toàn bộ bộ kiểm thử tự động (Unit test, Route resolution, DOM events) |
| `npm run clean`        | Dọn dẹp thư mục `dist/`                                                       |
| `npm run slides:build` | Xuất tài liệu thuyết trình định dạng PDF/Slide                              |

---

## 📂 Cấu trúc Thư mục Dự án

```plaintext
MISA-Note/
├── public/                 # Tài nguyên tĩnh (ảnh, biểu tượng, logo)
├── src/
│   ├── app/                # Cấu hình ứng dụng chính
│   │   ├── pages/          # Các trang nghiệp vụ (Private, Company, Trash,...)
│   │   ├── router/         # Trình điều hướng History API & đường dẫn
│   │   ├── theme/          # Hệ thống giao diện (Default, Theme 1, Theme 2)
│   │   ├── App.tsx         # Root Layout, State & Điều phối hành vi
│   │   └── AppPages.tsx    # Bộ chọn hiển thị trang theo router
│   ├── components/         # Các thành phần giao diện tái sử dụng
│   │   ├── editor/         # Block Editor, Slash Commands, Mentions, Tables,...
│   │   ├── layout/         # Header, Sidebar, FolderTree, ThemePicker,...
│   │   ├── modals/         # Modal Quick Note, One AI, Share, Move, Import,...
│   │   └── views/          # Overview, LibraryView,...
│   ├── data/               # Dữ liệu mẫu (Mock data, ODT sample)
│   ├── types/              # Định nghĩa kiểu dữ liệu TypeScript
│   └── utils/              # Tiện ích (Import, Storage, DateTime, DnD, Keyboard,...)
├── scripts/                # Kịch bản hỗ trợ build slide thuyết trình (Python)
├── package.json            # Thông tin dự án và danh sách dependencies
├── tsconfig.json           # Cấu hình TypeScript
├── vite.config.ts          # Cấu hình Vite & Tailwind v4
└── README.md               # Tài liệu giới thiệu dự án
```
