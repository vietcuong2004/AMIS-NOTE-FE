# Nghiên cứu tính năng Notion — Capture / Find / Automate

**Phạm vi:** 9 slide, 3 nhóm × 3 slide; phục vụ giới thiệu tính năng cho Ban lãnh đạo MISA. Không bao gồm so sánh đối thủ, giá, doanh thu hoặc lộ trình AMIS Note.

Ngày kiểm tra: 16/11/2026. Mốc tính năng và tên giao diện được đối chiếu với tài liệu chính thức, không dựa vào khả năng của tài khoản cá nhân.

## Slide 01 — Notion Capture — Thu thập và tạo lập thông tin

Ghi lại kiến thức: tài liệu, dữ liệu và nội dung cuộc họp trong cùng một không gian.

| Tính năng | Cách hoạt động / tình huống | Nguồn |
| --- | --- | --- |
| Tài liệu (Docs) | Soạn bằng các khối nội dung. Từ ghi nhanh đến đặc tả sản phẩm. | [Notion](https://www.notion.com/help/writing-and-editing-basics) |
| Cơ sở dữ liệu | Mỗi mục là một trang có thuộc tính. Theo dõi việc và tài liệu theo cấu trúc. | [Notion](https://www.notion.com/help/intro-to-databases) |
| AI Meeting Notes | Chép lời và tổng hợp cuộc họp. Giữ ý chính và đầu việc sau họp. | [Notion](https://www.notion.com/help/ai-meeting-notes) |
| Phối hợp thời gian thực | Cùng sửa, bình luận và @nhắc. Phản hồi ngay tại nội dung cần xử lý. | [Notion](https://www.notion.com/help/collaborate-with-people) |
| Đồng bộ dữ liệu | Đưa dữ liệu Jira, Salesforce vào Notion. Xem dữ liệu nguồn cạnh kế hoạch nhóm. | [Notion](https://www.notion.com/help/sync-data-from-other-tools-to-notion) |
| Biểu mẫu (Forms) | Câu trả lời đi vào cơ sở dữ liệu. Thu phản hồi mà không nhập lại. | [Notion](https://www.notion.com/help/forms) |
| Nhập dữ liệu | Nhập tệp và nội dung từ công cụ khác. Tập trung tài liệu đã có vào một nơi. | [Notion](https://www.notion.com/help/import-data-into-notion) |
| Ứng dụng di động | Ghi và đọc trên iOS, Android. Tiếp tục công việc khi rời máy tính. | [Notion](https://www.notion.com/help/notion-for-mobile) |
| Web Clipper | Lưu trang web vào trang đích. Tạo thư viện tham khảo khi nghiên cứu. | [Notion](https://www.notion.com/help/web-clipper) |

### Điều kiện và cách hiểu

Giữ nguyên chín tính năng Capture từ trang Features. “Phối hợp thời gian thực” tương ứng mục Collaboration. Đồng bộ dữ liệu khác với Synced Blocks: managed sync lấy dữ liệu từ công cụ nguồn vào cơ sở dữ liệu Notion; các thuộc tính đồng bộ là chỉ đọc. Không mô tả là đồng bộ hai chiều.

Đồng bộ dữ liệu hiện hành là một chiều từ Jira, GitHub hoặc Salesforce vào Notion; sửa thuộc tính nguồn ở ứng dụng gốc. Legacy sync đã dừng cập nhật ngày 30/10/2026, không dùng hướng dẫn cũ để cấu hình mới. Import là chuyển nội dung, không phải đồng bộ liên tục. Synced Blocks thuộc Docs, khác managed database sync.

Nguồn: [Notion 1](https://www.notion.com/vi/product/features), [Notion 2](https://www.notion.com/help/writing-and-editing-basics), [Notion 3](https://www.notion.com/help/intro-to-databases), [Notion 4](https://www.notion.com/help/ai-meeting-notes), [Notion 5](https://www.notion.com/help/collaborate-with-people), [Notion 6](https://www.notion.com/help/sync-data-from-other-tools-to-notion), [Notion 7](https://www.notion.com/help/forms), [Notion 8](https://www.notion.com/help/import-data-into-notion), [Notion 9](https://www.notion.com/help/notion-for-mobile), [Notion 10](https://www.notion.com/help/web-clipper).

## Slide 02 — Notion Docs — Một trình soạn thảo, nhiều loại tài liệu

Nội dung là các block có thể ghép, di chuyển và tái sử dụng.

### Cách sử dụng

Tạo trang → Gõ / chọn block → Sắp xếp nội dung → Liên kết & chia sẻ

### Ví dụ nghiệp vụ

Đặc tả sản phẩm: bối cảnh → yêu cầu → bảng tiêu chí; nhúng thiết kế, tách phụ lục và đồng bộ nguyên tắc chung.

### Giá trị mang lại

Giữ mô tả, thiết kế và yêu cầu trong một tài liệu; giảm sao chép cùng nội dung sang nhiều nơi.

### Chi tiết và điều kiện

Ví dụ đặc tả do người nghiên cứu xây dựng từ khả năng đã xác nhận; không phải quy trình mẫu nguyên văn của Notion. Các block cơ bản, đa phương tiện và embeds dùng chung trên một trang. Trang con tổ chức phần chi tiết. Synced Blocks chia sẻ cùng nội dung ở nhiều nơi; người xem cần có quyền với trang chứa block gốc. Không đồng nhất Synced Blocks với managed database sync.

Nguồn: [Notion 1](https://www.notion.com/help/writing-and-editing-basics), [Notion 2](https://www.notion.com/help/create-a-subpage), [Notion 3](https://www.notion.com/help/synced-blocks).

## Slide 03 — AI Meeting Notes — Từ cuộc họp đến việc cần làm

Giữ ghi chú thủ công và nội dung AI trong cùng biên bản.

### Cách sử dụng

Bắt đầu ghi chép → Ghi nhận cuộc họp → AI xử lý → Tóm tắt → Chia sẻ & lưu

### Ví dụ nghiệp vụ

Họp chốt yêu cầu: BA ghi điều kiện đặc biệt trong Notes; AI tổng hợp thảo luận và đầu việc để nhóm kiểm tra.

### Giá trị mang lại

Giảm vừa nghe vừa gõ và viết lại biên bản; quyết định, đầu việc có nơi để theo dõi lại.

### Chi tiết và điều kiện

Cần sự đồng ý của người tham dự và quyền ghi âm. Desktop thu được âm thanh hệ thống và mic; web chỉ mic. AI Meeting Notes không mặc định là kho lưu bản ghi âm lâu dài. Người dùng kiểm tra quyết định, người phụ trách và đầu việc; không coi tóm tắt là biên bản đã được duyệt. Kho biên bản và tìm kiếm là cách tổ chức trang trong Notion, không phải AI tự gửi hoặc tự giao việc trong ví dụ.

Nguồn: [Notion 1](https://www.notion.com/help/ai-meeting-notes), [Notion 2](https://www.notion.com/help/guides/preserve-perfect-meeting-memory-with-ai-meeting-notes).

## Slide 04 — Notion Find — Tổ chức và khai thác tri thức

Tìm câu trả lời: kết nối nguồn, nhận biết độ tin cậy và lần theo ngữ cảnh.

| Tính năng | Cách hoạt động / tình huống | Nguồn |
| --- | --- | --- |
| Tìm kiếm cấp tổ chức | Hỏi trên Notion và ứng dụng kết nối. Nhận câu trả lời có nguồn tham khảo. | [Notion](https://www.notion.com/help/enterprise-search) |
| Wiki | Tập trung tri thức trong trang chung. Có điểm bắt đầu để tra cứu nội bộ. | [Notion](https://www.notion.com/help/wikis-and-verified-pages) |
| Không gian nhóm | Tổ chức nội dung theo teamspace. Mỗi nhóm có nơi làm việc riêng. | [Notion](https://www.notion.com/help/intro-to-teamspaces) |
| Trang đã xác minh | Gắn người phụ trách và hạn xác minh. Biết nội dung nào cần rà soát lại. | [Notion](https://www.notion.com/help/wikis-and-verified-pages) |
| Biểu đồ & bảng tổng quan | Trực quan hóa dữ liệu cơ sở dữ liệu. Theo dõi chỉ số và tiến độ tập trung. | [Notion](https://www.notion.com/help/charts) |
| Kanban & Gantt | Xem cùng dữ liệu bằng board, timeline. Theo dõi trạng thái và lịch triển khai. | [Notion](https://www.notion.com/help/views-filters-and-sorts) |
| Lịch sử phiên bản | Xem và khôi phục nội dung trước đó. Truy vết thay đổi, sửa nhầm có đường lui. | [Notion](https://www.notion.com/help/duplicate-delete-and-restore-content) |
| Liên kết ngược | Xem các trang đang nhắc đến trang này. Lần theo bối cảnh tài liệu liên quan. | [Notion](https://www.notion.com/help/create-links-and-backlinks) |
| Xem trước liên kết | Hiển thị nội dung từ ứng dụng khác. Xem ngữ cảnh ngay trong trang. | [Notion](https://www.notion.com/help/link-previews) |

### Điều kiện và cách hiểu

Giữ chín tính năng Find. Bảng tổng quan có thể tập hợp biểu đồ và các chế độ xem cơ sở dữ liệu. Gantt tương ứng góc nhìn timeline; không khẳng định một sản phẩm Gantt độc lập. Lịch sử phiên bản và khả năng khôi phục phụ thuộc điều kiện tài khoản; ghi trong tài liệu thay vì đưa bảng giá.

Wiki tổ chức kiến thức; dấu xác minh thể hiện trách nhiệm cập nhật, không bảo đảm nội dung đúng về nghiệp vụ. Chế độ xem board/timeline hiển thị cùng bộ dữ liệu. Quyền xem trang vẫn cần được thiết lập riêng, không có nghĩa ai tìm kiếm cũng thấy mọi tài liệu.

Nguồn: [Notion 1](https://www.notion.com/vi/product/features), [Notion 2](https://www.notion.com/help/enterprise-search), [Notion 3](https://www.notion.com/help/wikis-and-verified-pages), [Notion 4](https://www.notion.com/help/intro-to-teamspaces), [Notion 5](https://www.notion.com/help/wikis-and-verified-pages), [Notion 6](https://www.notion.com/help/charts), [Notion 7](https://www.notion.com/help/views-filters-and-sorts), [Notion 8](https://www.notion.com/help/duplicate-delete-and-restore-content), [Notion 9](https://www.notion.com/help/create-links-and-backlinks), [Notion 10](https://www.notion.com/help/link-previews).

## Slide 05 — Enterprise Search — Hỏi một lần, tìm trên nhiều nguồn

Notion AI tìm trong workspace và các ứng dụng đã kết nối.

### Cách sử dụng

Nhập câu hỏi → Chọn phạm vi → AI tổng hợp → Mở nguồn kiểm tra

### Ví dụ nghiệp vụ

“Các quyết định mới nhất của dự án A là gì?” → tìm tài liệu và trao đổi được cấp quyền, trả lời kèm trích dẫn.

### Giá trị mang lại

Giảm mở từng ứng dụng và dò từng đoạn trao đổi; có đường dẫn để kiểm tra kết luận.

### Chi tiết và điều kiện

Đây là ví dụ minh họa nghiệp vụ; ảnh là ví dụ gốc của Notion, không chỉnh thành dự án A. AI Connectors cần thiết lập và có thời gian nạp dữ liệu; kết quả bị giới hạn bởi quyền của nguồn. Có thể tắt web để tập trung thông tin nội bộ. Không dùng kết quả tìm kiếm như bằng chứng bao phủ đầy đủ hoặc thay cho tính toán dữ liệu phức tạp.

Nguồn: [Notion 1](https://www.notion.com/help/enterprise-search), [Notion 2](https://www.notion.com/help/notion-ai-connectors).

## Slide 06 — Wiki & Verified Pages — Kho tri thức có người chăm sóc

Kết hợp tổ chức tài liệu với trách nhiệm cập nhật.

### Cách sử dụng

Tạo Wiki → Gán Owner → Xác minh → Rà soát & cập nhật

### Ví dụ nghiệp vụ

Nhân sự xây kho chính sách: gán người sở hữu → xác minh → rà soát định kỳ → cập nhật và xác minh lại.

### Giá trị mang lại

Giảm hỏi “bản nào còn hiệu lực?”; việc cập nhật có đầu mối và nhắc hạn rõ ràng.

### Chi tiết và điều kiện

Wiki có Home, All pages và Pages I own. Có thể đặt thời hạn hoặc vô thời hạn; hết hạn, chủ trang nhận thông báo trong Inbox và email. Dấu xác minh cũng hiện trong tìm kiếm và khi nhắc trang. Đó là tín hiệu người quản lý nội dung đã xác nhận, không phải AI bảo đảm sự đúng đắn. Trang phải đáp ứng quyền và điều kiện tài khoản phù hợp. Ví dụ HR là tình huống phân tích, không phải ảnh quy trình được sửa giả.

Nguồn: [Notion 1](https://www.notion.com/help/wikis-and-verified-pages).

## Slide 07 — Notion Automate — AI và tự động hóa quy trình

Tự động hóa công việc: kết nối chỉ dẫn, dữ liệu và hành động.

| Tính năng | Cách hoạt động / tình huống | Nguồn |
| --- | --- | --- |
| Notion Agent | Nhận yêu cầu và thao tác trong workspace. Từ hỏi đáp sang tạo, cập nhật kết quả. | [Notion](https://www.notion.com/help/notion-agent) |
| Custom Agents | Thiết lập trợ lý chạy nền cho nhóm. Xử lý việc lặp lại theo chỉ dẫn. | [Notion](https://www.notion.com/help/custom-agents) |
| Soạn & sửa với AI | Viết nháp, tóm tắt, chỉnh văn phong. Giảm biên soạn lại nội dung. | [Notion](https://www.notion.com/help/notion-ai-faqs) |
| Kỹ năng trợ lý | Lưu chỉ dẫn thành kỹ năng tái sử dụng. Lặp lại cách làm việc nhất quán. | [Notion](https://www.notion.com/help/create-and-manage-skills) |
| Điều kiện kích hoạt động | Chạy theo sự kiện đã cấu hình. Phản hồi khi dữ liệu thay đổi. | [Notion](https://www.notion.com/help/custom-agents) |
| Điều phối trợ lý | Làm việc với trợ lý ngoài trong Notion. Giao việc, nhận kết quả tại workspace. | [Notion](https://www.notion.com/help/use-claude-agents-in-notion) |
| API | Kết nối Notion với hệ thống riêng. Đọc, ghi dữ liệu qua tích hợp. | [Notion](https://www.notion.com/help/guides/connect-tools-to-notion-api) |
| MCP | Cho công cụ AI truy cập Notion. AI dùng ngữ cảnh và cập nhật trang. | [Notion](https://www.notion.com/help/notion-mcp) |
| Tự động hóa Database | Kích hoạt → hành động trên dữ liệu. Đổi trạng thái, phân việc, gửi thông báo. | [Notion](https://www.notion.com/help/database-automations) |

### Điều kiện và cách hiểu

Giữ chín mục Automate của Features. Notion Agent do người dùng yêu cầu; Custom Agents được cấu hình chạy nền. Database automations là quy tắc trigger–action, khác suy luận của AI. MCP là giao thức kết nối công cụ AI với Notion. Mục điều phối trợ lý được minh họa bằng tài liệu Claude agents hiện hành; khả năng beta và triển khai dần cần được kiểm tra theo workspace.

Notion Agent chạy theo yêu cầu; Custom Agents chạy theo triggers hoặc lịch sau cấu hình. Tự động hóa database là trigger–action, không đồng nghĩa Agent suy luận. “Điều phối trợ lý” của Features được dẫn tới tài liệu Claude agents hiện hành; đang beta/triển khai dần, không khẳng định mọi trợ lý bên ngoài đã có cùng khả năng. API cần tích hợp, MCP cần xác thực và cấp quyền.

Nguồn: [Notion 1](https://www.notion.com/vi/product/features), [Notion 2](https://www.notion.com/help/notion-agent), [Notion 3](https://www.notion.com/help/custom-agents), [Notion 4](https://www.notion.com/help/notion-ai-faqs), [Notion 5](https://www.notion.com/help/create-and-manage-skills), [Notion 6](https://www.notion.com/help/custom-agents), [Notion 7](https://www.notion.com/help/use-claude-agents-in-notion), [Notion 8](https://www.notion.com/help/guides/connect-tools-to-notion-api), [Notion 9](https://www.notion.com/help/notion-mcp), [Notion 10](https://www.notion.com/help/database-automations).

## Slide 08 — Notion Agent — AI thực hiện công việc trong workspace

Một yêu cầu có thể dẫn đến nhiều hành động và kết quả được lưu.

### Cách sử dụng

Nêu nhiệm vụ → Chọn dữ liệu → Agent thực hiện → Kiểm tra kết quả

### Ví dụ nghiệp vụ

“Tổng hợp việc chưa hoàn thành, tạo báo cáo tuần và đề xuất ưu tiên.” → người dùng kiểm tra báo cáo đã tạo.

### Giá trị mang lại

AI hỏi đáp trả về thông tin; Agent còn thao tác trên trang và dữ liệu, giảm chép kết quả rồi cập nhật thủ công.

### Chi tiết và điều kiện

Ví dụ là yêu cầu nghiệp vụ có thể thực hiện từ khả năng đã nêu; không cam kết luôn hoàn tất mọi bước. Agent tạo/sửa trang và database nhưng không tự thay quyền chia sẻ hoặc khởi động AI Meeting Notes. “Đề xuất ưu tiên” là đầu ra để người dùng đánh giá, không phải Agent tự quyết định thay nhóm. Ngữ cảnh nguồn và quyền chỉnh sửa quyết định những gì Agent có thể làm.

Nguồn: [Notion 1](https://www.notion.com/help/notion-agent), [Notion 2](https://www.notion.com/help/notion-ai-connectors), [Notion 3](https://www.notion.com/help/guides/get-started-with-your-personal-agent-in-notion).

## Slide 09 — Custom Agents — Thiết lập một lần, xử lý việc lặp lại

Chỉ dẫn + nguồn tri thức + công cụ + điều kiện kích hoạt.

### Cách sử dụng

Forms → Database → Agent phân loại → Báo cáo → Người kiểm tra

### Ví dụ nghiệp vụ

Phản hồi khách hàng: Forms → Database → Agent phân loại → báo cáo → người phụ trách kiểm tra.

### Giá trị mang lại

Giảm phân loại và gom báo cáo bằng tay; quy trình có chỉ dẫn chung và nhật ký để rà soát.

### Chi tiết và điều kiện

Quy trình Forms là thiết kế minh họa kết hợp khả năng được xác nhận: Form ghi phản hồi vào database, sự kiện thêm trang kích hoạt Custom Agent, chỉ dẫn yêu cầu phân loại và tổng hợp. Cần tự cấu hình, cấp quyền, thử và xuất bản; không phải mẫu tích hợp sẵn mặc định. Có thể dùng trigger theo lịch cho báo cáo định kỳ. Người phụ trách rà soát trước sử dụng. Không khẳng định ảnh gốc mô tả chính xác ví dụ Forms này.

Nguồn: [Notion 1](https://www.notion.com/help/custom-agents), [Notion 2](https://www.notion.com/help/forms), [Notion 3](https://www.notion.com/help/guides/automate-project-updates-and-reporting-with-custom-agents), [Notion 4](https://www.notion.com/help/guides/build-your-first-custom-agent).

## Kết quả kiểm chứng và giới hạn

- Đã xác minh cả 27 tính năng ở trang Features và đọc các Help Center liên quan; sáu trang chuyên sâu đều có ảnh UI chính thức riêng.
- Không đo năng suất thực tế, không đưa tỷ lệ hoặc số phút tiết kiệm chưa được xác nhận.
- Các ví dụ đặc tả, dự án A, chính sách HR, báo cáo tuần và Forms → Agent là tình huống nghiệp vụ đề xuất để giải thích tính năng. Chúng cần cấu hình dữ liệu/quyền phù hợp, không phải kết quả đã chạy trên tài khoản thật.
- Không dùng lại một ảnh giữa nhiều slide. Slide 5 dùng hai crop từ hai thời điểm cùng video gốc để thể hiện câu hỏi và câu trả lời; slide 9 dùng ảnh tạo Agent và ảnh cấu hình sự kiện.
- Giao diện trong ảnh có thể là tiếng Anh hoặc phiên bản trước; tài liệu nội dung được đối chiếu ngày nêu trên. Không chỉnh sửa nhãn trong ảnh để giả làm bản tiếng Việt.
- Quyền lợi phụ thuộc cấu hình workspace và điều kiện tài khoản; không phân tích bảng giá. AI Meeting Notes, Enterprise Search và Custom Agents yêu cầu quyền sử dụng tính năng phù hợp.
- Khi render trên máy Ubuntu, Arial có thể được thay thế bằng Liberation Sans tương thích chỉ số; thuộc tính font trong PPTX vẫn là Arial.
- Câu trả lời AI, action items và phân loại cần người dùng rà soát. Không khẳng định Agent có quyền thay đổi quyền chia sẻ, khởi động AI Meeting Notes hoặc làm mọi tác vụ.
- Tài liệu hiện có một số thay đổi/khác biệt giữa phiên bản ngôn ngữ; không đưa chi tiết mâu thuẫn hoặc chưa xác minh vào slide.

