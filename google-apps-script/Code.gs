/**
 * Nhận lời nhắn từ form liên hệ của website và ghi vào Google Sheet.
 * Cách cài đặt xem file HUONG-DAN.md cùng thư mục.
 */
var SPREADSHEET_ID = "1Dt_0Cipt0K4eGzkT1MT4WjuLJL1xSOXHOGpfnuaxLVk";
var HEADERS = ["Thời gian", "Họ và tên", "Số điện thoại", "Email", "Quan tâm đến", "Nội dung"];
var MAX_LEN = 3000;

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      clean(data.name),
      clean(data.phone),
      clean(data.email),
      clean(data.topic),
      clean(data.message)
    ]);

    return json({ success: true });
  } catch (err) {
    return json({ success: false, message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Mở link web app bằng trình duyệt sẽ hiện dòng này để biết script đang chạy.
function doGet() {
  return json({ success: true, message: "Form endpoint đang hoạt động" });
}

// Cắt độ dài và chặn công thức (=, +, -, @) để Google Sheet không chạy nội dung người lạ gửi.
function clean(value) {
  var s = String(value == null ? "" : value).trim().slice(0, MAX_LEN);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
