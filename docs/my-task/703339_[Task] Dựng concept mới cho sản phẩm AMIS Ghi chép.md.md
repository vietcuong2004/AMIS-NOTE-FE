# [Task] Dựng concept mới cho sản phẩm AMIS Ghi chép

## 1. Thông tin task và link theo dõi

Xây dựng web demo thể hiện concept giao diện, cách tổ chức thông tin và các luồng thao tác của AMIS Ghi chép, phục vụ trình diễn, lấy ý kiến và thống nhất định hướng trải nghiệm sản phẩm.

Concept demo:

https://misa-note.vercel.app/


## 2. Danh sách tính năng

### 2.1. Không gian làm việc và điều hướng

- Phân chia hai không gian: Ghi chép của tôi và Tài liệu công ty.
- Chuyển không gian bằng bộ chọn trên sidebar.
- Hiển thị tài liệu và thư mục theo cây phân cấp.
- Bấm tên thư mục để mở trang thư mục; bấm mũi tên để bung hoặc thu nội dung con.
- Hiển thị đường dẫn vị trí hiện tại và cho phép chọn cấp cha để quay lại.
- Làm nổi bật tài liệu hoặc thư mục đang được chọn trên sidebar.

### 2.2. Quản lý tài liệu

- Tạo tài liệu tại gốc không gian hoặc trong thư mục đang mở.
- Tạo nhanh bằng Ctrl+Alt+N; khi đang xem tài liệu, tài liệu mới được tạo cùng thư mục và không gian.
- Tiện ích - Đổi tên tài liệu.
- Tiện ích - Di chuyển tài liệu đến thư mục hoặc không gian khác.
- Kéo thả tài liệu vào thư mục đích, bao gồm Chưa phân loại.
- Tiện ích - Nhân bản tài liệu cùng cấp, tạo bản sao có nội dung độc lập với bản gốc.

### 2.3. Quản lý thư mục

- Tạo thư mục và thư mục con nhiều cấp.
- Tạo nhanh bằng Ctrl+Alt+F tại vị trí tương ứng với thư mục hoặc tài liệu đang mở.
- Tiện ích - Đổi tên thư mục.
- Tiện ích - Di chuyển thư mục cùng cấu trúc bên trong, hỗ trợ kéo thả.
- Ngăn di chuyển thư mục vào chính nó hoặc thư mục con của nó.
- Tiện ích - Nhân bản cây thư mục cùng tài liệu bên trong tại cùng cấp.
- Tiện ích - Xóa thư mục và chuyển nội dung bên trong về vị trí được thông báo trong hộp xác nhận.
- Hiển thị menu tạo tài liệu hoặc thư mục khi bấm dấu +; gợi ý phím tắt khi hover lựa chọn.

### 2.4. Thư viện và tìm kiếm

- Hiển thị các tab Tất cả, Của tôi, Công ty, Được chia sẻ và Gần đây trong trang Thư viện.
- Chuyển tab Của tôi hoặc Công ty trong thư viện không làm thay đổi không gian đang chọn trên sidebar.
- Hỗ trợ bố cục cây thư mục, danh sách và lưới; tab Được chia sẻ và Gần đây chỉ dùng danh sách hoặc lưới.
- Tìm kiếm tài liệu trong danh sách.
- Lọc theo không gian tài liệu, thư mục và người tạo.
- Sắp xếp kết quả theo các lựa chọn trên giao diện.
- Tìm kiếm toàn cục để tìm và mở tài liệu nhanh.

### 2.5. Soạn thảo và thao tác nội dung

- Chỉnh sửa tiêu đề và nội dung tài liệu; tiêu đề dài tự xuống dòng.
- Định dạng đậm, nghiêng, gạch chân; chọn font và cỡ chữ.
- Hiển thị cỡ chữ theo vùng văn bản được chọn.
- Nhân bản, xóa và sắp xếp các khối nội dung bằng menu hoặc kéo thả.
- Chọn nhiều khối bằng thao tác kéo chuột, bao gồm bắt đầu chọn từ khoảng trống quanh các ô văn bản.
- Sao chép, cắt và dán các khối theo vùng chọn, giữ định dạng được hỗ trợ.
- Chuyển giữa chế độ Vừa đọc với nội dung căn giữa và chế độ mở rộng với lề 5% mỗi bên vùng nội dung.

### 2.6. Menu chèn nhanh `/` — Slash menu

#### 2.6.1. Điều khiển menu

- Gõ `/` để mở menu, nhập từ khóa để tìm tính năng.
- Dùng chuột hoặc phím mũi tên để chọn, Enter để áp dụng và Esc để đóng.
- Hiển thị mô tả và phím tắt của các mục được hỗ trợ.
- Hiển thị preview cạnh mục đang hover hoặc được chọn bằng bàn phím.
- Cho phép di chuyển chuột vào preview và cuộn xem nội dung; ẩn khi rời vùng tương tác.

#### 2.6.2. Được đề xuất

- Hiển thị tối đa 5 tính năng được sử dụng gần đây nhất.
- Đặt mục Ghi chép cuộc họp với AI ở đầu nhóm; có nhãn Đang phát triển và chưa cho phép bấm sử dụng.

#### 2.6.3. Thành phần nội dung cơ bản

- Văn bản: chèn đoạn văn bản thường.
- Đề mục 1: chèn tiêu đề cấp 1.
- Đề mục 2: chèn tiêu đề cấp 2.
- Đề mục 3: chèn tiêu đề cấp 3.
- Đề mục 4: chèn tiêu đề cấp 4.
- Nhấn Enter sau văn bản hoặc đề mục để tạo dòng tiếp theo và chuyển con trỏ xuống nhập nội dung.

#### 2.6.4. Tiện ích

- Danh sách gạch đầu dòng: hỗ trợ 4 cấp với ký hiệu gạch ngang, tròn đen, tròn rỗng và vuông.
- Danh sách đánh số: hỗ trợ phân cấp dạng 1 → 1.1 → 1.1.1 → 1.1.1.1.
- Danh sách việc cần làm: nhập các công việc và đánh dấu hoàn thành.
- Thao tác danh sách: Enter tạo mục tiếp theo; Tab/Shift+Tab tăng hoặc giảm cấp; phím mũi tên di chuyển giữa các dòng.
- Nhấn Backspace tại mục danh sách rỗng để chuyển về đoạn văn bản thường, giữ các mục còn lại.
- Khung chú thích: làm nổi bật nội dung cần lưu ý.
- Bảng biểu: tạo bảng và nhập dữ liệu theo hàng, cột.
- Chọn hàng để xóa hàng, thêm hàng phía trên hoặc phía dưới.
- Chọn cột để xóa cột, thêm cột bên trái hoặc bên phải.
- Hiển thị menu thao tác bảng ngay cạnh hàng hoặc cột được chọn.

#### 2.6.5. Phương tiện

- Hình ảnh: tải từ máy tính hoặc nhập URL, thêm chú thích căn giữa; hiển thị thao tác thay ảnh và tải xuống khi hover.
- Video: tải từ máy tính hoặc nhập URL; hỗ trợ các thao tác thay thế và tải xuống tương ứng.
- Âm thanh: chọn tệp từ máy tính, không có lựa chọn nhập URL.
- Tệp: đính kèm từ máy tính, hỗ trợ thay thế và tải xuống.
- Liên kết đến trang (URL): nhập địa chỉ và nội dung hiển thị trong hộp thoại; chèn dưới dạng chữ xanh gạch chân thay cho khối thẻ liên kết.

#### 2.6.6. Nội tuyến

- Nhắc đến một người bằng `@`.
- Nhắc đến một nhóm bằng `@`.
- Tìm người theo tên/email hoặc mở danh sách nhân viên từ nút Danh bạ.
- Hiển thị danh sách ngay dưới nút Danh bạ và cho phép chọn người để thêm.
- Hiển thị tên người hoặc nhóm đã thêm trong tài liệu; có thể chọn lại từ danh sách nội tuyến.
- Các thao tác nhắc tên, mời và phân quyền hiện ở mức mô phỏng.

#### 2.6.7. Màu chữ

- Các lựa chọn: mặc định, xám, nâu, cam, vàng, xanh lá, xanh lam, tím, hồng và đỏ.
- Áp dụng màu chữ cho khối đang chọn.

#### 2.6.8. Màu nền

- Các lựa chọn: mặc định, xám, nâu, cam, vàng, xanh lá, xanh lam, tím, hồng và đỏ.
- Áp dụng màu nền cho khối đang chọn.

### 2.7. Mẫu tài liệu

- Cung cấp 5 mẫu: Ghi chú cá nhân, Biên bản cuộc họp, Kế hoạch công việc, Kế hoạch tuần và Tài liệu nội bộ.
- Tạo tài liệu từ trang mẫu.
- Hiển thị dòng Tạo nhanh bằng các mẫu và các pill gợi ý trên tài liệu trống.
- Hover pill để xem trước; cho phép cuộn preview và bấm preview hoặc pill để áp dụng mẫu.
- Cho phép ẩn riêng từng pill bằng dấu ×.
- Ẩn các gợi ý sau khi áp dụng mẫu hoặc khi tài liệu đã có nội dung.
- Mẫu tài liệu là nhóm riêng, không nằm trong slash menu.

### 2.8. Ghi chú nhanh — Quick Note

- Mở bằng icon Quick Note hoặc Ctrl+/; bấm lại icon để đóng.
- Soạn tiêu đề, nội dung, định dạng và danh sách; tự động lưu trong phiên.
- Áp dụng thao tác chọn nhiều khối và thoát danh sách rỗng bằng Backspace tương tự editor tài liệu.
- Xem lại, tìm kiếm và tiếp tục chỉnh sửa ghi chú đã lưu.
- Kéo di chuyển cửa sổ, phóng to hoặc thu nhỏ vùng làm việc.
- Lưu ghi chú nhanh thành tài liệu trong không gian cá nhân.
- Sao chép nội dung để dán sang tài liệu, giữ định dạng được hỗ trợ.

### 2.9. Yêu thích

- Tiện ích - Đánh dấu hoặc bỏ yêu thích tài liệu cá nhân.
- Hiển thị tài liệu yêu thích trên sidebar và trang Yêu thích.
- Hiển thị cấu trúc thư mục liên quan trên trang Yêu thích.
- Sidebar hiển thị tối đa 5 mục trong vùng nhìn; cuộn để xem các mục còn lại.
- Không áp dụng yêu thích cho tài liệu công ty trong phạm vi demo hiện tại.

### 2.10. Chia sẻ và phân quyền — mô phỏng

- Tiện ích - Mở hộp chia sẻ và sao chép URL tài liệu.
- Tìm nhân viên theo tên/email hoặc chọn từ danh sách nhân viên dưới nút Danh bạ.
- Thêm người vào danh sách có quyền truy cập mô phỏng.
- Chọn vai trò Người xem, Người nhận xét hoặc Người chỉnh sửa; xóa quyền thành viên.
- Cấu hình quyền truy cập chung: hạn chế hoặc bất kỳ ai có liên kết, kèm vai trò tương ứng.
- Giữ cấu hình đã chọn trong phiên làm việc.

### 2.11. Thùng rác

- Tiện ích - Đưa tài liệu vào thùng rác.
- Xem danh sách tài liệu đã xóa.
- Khôi phục tài liệu để tiếp tục sử dụng.
- Xóa vĩnh viễn từng tài liệu sau bước xác nhận.
- Dọn toàn bộ thùng rác sau bước xác nhận.

### 2.12. In và lưu PDF

- In tài liệu hoặc lưu PDF qua hộp in của trình duyệt.
- Hiển thị nội dung dành cho bản in, ẩn các thanh công cụ, menu và gợi ý nhập liệu.

### 2.13. Dữ liệu mẫu và cơ chế lưu

- Chuẩn bị dữ liệu mẫu phục vụ trình diễn các luồng tính năng.
- Tự động lưu thay đổi vào bộ nhớ trong phiên trang, cho phép chuyển trang rồi mở lại nội dung vừa sửa.
- Không lưu dữ liệu nghiệp vụ vào local storage; refresh sẽ khởi tạo lại dữ liệu mẫu và điều hướng về `/private`.
- Chia sẻ, phân quyền và nhắc tên là mô phỏng; chưa có lưu trữ máy chủ, gửi lời mời thật hoặc phối hợp chỉnh sửa thời gian thực.
- Mục Ghi chép cuộc họp với AI chưa tích hợp xử lý AI thật.
