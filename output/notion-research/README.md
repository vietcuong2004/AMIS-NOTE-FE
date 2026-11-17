# Notion — Nghiên cứu tính năng, 9 slide

- `Notion_Feature_Research_9_Slides.pptx`: bài trình bày, tỷ lệ 16:9, chữ và sơ đồ chỉnh sửa được, ảnh UI nhúng trực tiếp.
- `Notion_Feature_Research_9_Slides.pdf`: bản xem nhanh xuất bằng LibreOffice.
- `images/slide-01` đến `images/slide-09`: ảnh gốc và các crop/khung hình dùng trong bài.
- `sources.md`: nguồn tài liệu và URL từng ảnh đã nhúng, cách thu thập.
- `research-notes.md`: phân tích, ví dụ nghiệp vụ và điều kiện sử dụng.
- `content.json`: nội dung tiếng Việt để bảo trì.
- `asset-manifest.json`: thông tin nguồn, khung hình và crop.
- `preview/`: render của toàn bộ 9 slide, ảnh tổng hợp và báo cáo kiểm tra.

## Dựng lại

Cài gói trong `requirements.txt` vào môi trường Python riêng, rồi chạy:

```bash
python build_deck.py
```

Chạy từ bất kỳ thư mục nào; script đọc tài nguyên cạnh nó. Script chỉ dựng bài 9 slide riêng này, không thay thế `docs/presentations/misa-note-strategy.pptx` hoặc bộ dựng bài cũ.

Font được đặt là Arial. Ảnh giao diện được lấy từ tài liệu Notion chính thức; không dùng ảnh AI. Sơ đồ quy trình, biểu tượng và khung nội dung dùng đối tượng PowerPoint gốc. Ví dụ nghiệp vụ là nội dung phân tích, không chỉnh sửa vào giao diện gốc.
