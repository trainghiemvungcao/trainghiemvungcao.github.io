# Nhận lời nhắn từ website vào Google Sheet

Website là trang tĩnh nên không thể tự ghi vào Google Sheet. Cần một đoạn script nhỏ chạy trên Google (Apps Script) làm "cầu nối". Chỉ cài một lần.

## Cài đặt (khoảng 3 phút)

1. Mở Google Sheet nhận phản hồi, đăng nhập bằng tài khoản **sở hữu** sheet này.
2. Menu **Tiện ích mở rộng (Extensions) → Apps Script**.
3. Xóa code mẫu, dán toàn bộ nội dung file `Code.gs` (cùng thư mục này) vào, bấm **Lưu**.
4. Bấm **Triển khai (Deploy) → Tùy chọn triển khai mới (New deployment)**.
   - Loại: bấm biểu tượng bánh răng, chọn **Ứng dụng web (Web app)**.
   - **Thực thi bằng tư cách (Execute as):** Tôi (Me).
   - **Người có quyền truy cập (Who has access):** Bất kỳ ai (Anyone).
   - Bấm **Triển khai**, cấp quyền khi Google hỏi (chọn tài khoản → Nâng cao → Cho phép).
5. Copy **URL ứng dụng web** (dạng `https://script.google.com/macros/s/.../exec`).
6. Mở `assets/js/main.js`, dán URL vào dòng:
   ```js
   var GOOGLE_SCRIPT_URL = "";
   ```
7. Thử gửi một lời nhắn ở trang Liên hệ, kiểm tra Sheet có thêm một dòng.

## Lưu ý

- Mỗi lần **sửa `Code.gs`**, phải vào **Triển khai → Quản lý triển khai → Sửa (biểu tượng bút) → Phiên bản: Phiên bản mới → Triển khai** thì thay đổi mới có hiệu lực. URL giữ nguyên.
- Dòng tiêu đề (Thời gian, Họ và tên, ...) được script tự tạo ở dòng 1 nếu sheet còn trống.
- URL web app công khai là bình thường: ai có link chỉ có thể *thêm dòng*, không đọc được dữ liệu trong Sheet.
- Script ghi vào **tab đầu tiên** của Sheet.
- Google Sheet không tự gửi email báo có lời nhắn mới (quy tắc thông báo của Sheets có thể không kích hoạt với dòng do script thêm). Muốn nhận email mỗi khi có lời nhắn, cần thêm một lệnh `MailApp.sendEmail` vào `Code.gs`.
