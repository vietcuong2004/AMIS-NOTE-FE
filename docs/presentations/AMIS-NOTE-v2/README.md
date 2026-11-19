# AMIS NOTE V2 - Báo Cáo Chiến Lược Tái Phát Triển

Thư mục lưu trữ bộ tài liệu thuyết trình chiến lược phát triển sản phẩm **AMIS NOTE** (chuyển đổi từ AMIS Ghi chép).

---

## 1. Cấu trúc tệp tin

| Tệp tin | Định dạng | Vai trò |
|---|---|---|
| **[AMIS-NOTE-V2.md](./AMIS-NOTE-V2.md)** | Markdown | Toàn bộ kịch bản và nội dung chi tiết dạng văn bản của 27 slide. Dễ dàng đọc, chỉnh sửa nhanh câu chữ, số liệu và bảng biểu. |
| **[AMIS-NOTE-V2.pptx](./AMIS-NOTE-V2.pptx)** | PowerPoint | Bản trình chiếu đồ họa hoàn chỉnh (16:9), chứa layout chuẩn, hình ảnh giao diện thực tế và cấu trúc thẻ trực quan. |
| **[AMIS-NOTE-V2.pdf](./AMIS-NOTE-V2.pdf)** | PDF | Bản xuất tiêu chuẩn phục vụ trình chiếu, in ấn hoặc gửi báo cáo trực tiếp (không lỗi font, không tràn viền). |
| **[sync_deck.py](./sync_deck.py)** | Python Script | Công cụ tự động đồng bộ 2 chiều giữa Markdown, PowerPoint, PDF và Google Drive. |

---

## 2. Liên kết Google Drive chia sẻ cho Sếp (Cố định 100%)

> 🔗 **Đường dẫn xem & chỉnh sửa trực tuyến:**  
> [AMIS-NOTE-V2.pptx trên Google Drive](https://docs.google.com/presentation/d/16hDARXsNqahH2lxMbgMB6_4-6a1p3dQG/edit?usp=drivesdk&ouid=117114340087032101210&rtpof=true&sd=true)

- **Đặc điểm:** Tệp được chia sẻ ở chế độ **Anyone with the link (Bất kỳ ai có link đều xem được)**.
- **Tính bất biến:** Mọi thao tác cập nhật từ máy tính lên Drive đều dùng lệnh `in-place update` (giữ nguyên ID tệp `16hDARXsNqahH2lxMbgMB6_4-6a1p3dQG`), **đường dẫn trên sẽ không bao giờ thay đổi**.

---

## 3. Cơ chế hoạt động & Các lệnh ngắn đồng bộ 2 chiều

Bạn có thể chủ động chạy các lệnh sau từ thư mục gốc của dự án (hoặc trong thư mục này):

### 📥 Chiều 1: Kéo dữ liệu từ Google Drive về máy (Pull)
Khi bạn hoặc người khác đã chỉnh sửa trực tiếp trên Google Slides/Google Drive và muốn tải bản mới nhất về máy:

```bash
python3 docs/presentations/AMIS-NOTE-v2/sync_deck.py --pull
```

> **Hành động tự động:**
> 1. Tải bản mới nhất từ Google Drive ghi đè vào `AMIS-NOTE-V2.pptx`.
> 2. Dùng LibreOffice tự động biên dịch lại file `AMIS-NOTE-V2.pdf`.

---

### 📤 Chiều 2: Đẩy dữ liệu từ máy tính lên Google Drive (Push)
Khi bạn chỉnh sửa câu chữ trong `AMIS-NOTE-V2.md` hoặc chỉnh sửa đồ họa trong `AMIS-NOTE-V2.pptx` trên máy tính và muốn cập nhật lên Google Drive:

```bash
python3 docs/presentations/AMIS-NOTE-v2/sync_deck.py --push
```
*(hoặc chạy ngắn gọn: `python3 docs/presentations/AMIS-NOTE-v2/sync_deck.py`)*

> **Hành động tự động:**
> 1. Quét nội dung mới từ file `.md` cập nhật vào `.pptx`.
> 2. Biên dịch lại bản `.pdf` mới nhất.
> 3. Tự động đẩy đè lên Google Drive theo đúng link cũ.

---

### 🔄 (Tùy chọn) Chế độ theo dõi tự động liên tục (Watch)
Nếu trong một buổi làm việc, bạn muốn bất cứ khi nào bấm **Ctrl + S** lưu file trên máy thì Google Drive tự nhảy theo (không cần gõ lệnh thủ công):

```bash
python3 docs/presentations/AMIS-NOTE-v2/sync_deck.py --watch
```
*(Bấm `Ctrl + C` trong Terminal để dừng chế độ này)*
