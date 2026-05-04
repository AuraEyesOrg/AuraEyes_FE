import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filePath = path.join(__dirname, '..', 'src', 'i18n', 'messages', 'vi.json');
const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const keys = {
  'Ophthalmologist.caseSnapshot': { alt: 'Hình ảnh võng mạc được AI chú thích', noImage: 'Không có hình ảnh AI', openReview: 'Mở đánh giá AI sàng lọc đầy đủ' },
  'Ophthalmologist.urgentAIAlerts': { title: 'Cảnh báo AI khẩn cấp', viewAll: 'Xem tất cả', aiConfidence: 'Độ tin cậy AI', reviewNow: 'Đánh giá ngay', verify: 'Xác minh' },
  'Ophthalmologist.screeningQueue': { title: 'Hàng đợi sàng lọc', filter: 'Lọc', sort: 'Sắp xếp', patientDetails: 'Chi tiết bệnh nhân', scanDate: 'Ngày quét', aiPrediction: 'Dự đoán AI', confidence: 'Độ tin cậy', status: 'Trạng thái', action: 'Hành động', aiAnalyzed: 'AI đã phân tích', flaggedForReview: 'Đánh dấu để xem xét', reviewed: 'Đã xem xét', pending: 'Đang chờ', check: 'Kiểm tra', quickApprove: 'Phê duyệt nhanh', startReview: 'Bắt đầu xem xét', pagination: 'Hiển thị {{showing}} trong {{total}} đánh giá đang chờ', previous: 'Trước', next: 'Tiếp' },
  'Ophthalmologist.patients.noPatients': 'Không có bệnh nhân',
  'Ophthalmologist.patients.noSearchResults': 'Không tìm thấy kết quả cho "{{query}}"',
  'Ophthalmologist.patients.carePlan': 'Kế hoạch chăm sóc',
  'Ophthalmologist.patients.latestVisit': 'Lần khám gần nhất',
  'Ophthalmologist.patients.nextAppointment': 'Lịch hẹn tiếp theo',
  'Ophthalmologist.profile.toast.profileUpdated': 'Cập nhật hồ sơ thành công',
  'Ophthalmologist.profile.toast.profileUpdateFailed': 'Cập nhật hồ sơ thất bại',
  'Ophthalmologist.profile.toast.chooseImage': 'Vui lòng chọn tệp hình ảnh',
  'Ophthalmologist.profile.toast.imageSize': 'Hình ảnh phải nhỏ hơn 5MB',
  'Ophthalmologist.profile.toast.avatarUpdated': 'Cập nhật ảnh đại diện thành công',
  'Ophthalmologist.profile.toast.avatarUploadFailed': 'Tải ảnh đại diện thất bại',
  'Ophthalmologist.profile.toast.certificateDeleted': 'Đã xóa chứng chỉ thành công',
  'Ophthalmologist.profile.toast.certificateDeleteFailed': 'Xóa chứng chỉ thất bại',
  'Ophthalmologist.profile.confirm.deleteCertificate': 'Bạn có chắc muốn xóa "{{certName}}"?',
  'Ophthalmologist.settings.title': 'Cài đặt',
  'Ophthalmologist.settings.appearance': 'Giao diện',
  'Ophthalmologist.settings.displayOptions': 'Tùy chọn hiển thị',
  'Ophthalmologist.settings.language': 'Ngôn ngữ',
  'Ophthalmologist.settings.theme': 'Chủ đề',
  'Ophthalmologist.settings.autoSaveDraft': 'Tự động lưu bản nháp',
  'Ophthalmologist.settings.compactMode': 'Chế độ thu gọn',
  'Ophthalmologist.settings.showTooltips': 'Hiển thị chú thích',
  'Ophthalmologist.settings.darkMode': 'Chế độ tối',
  'Ophthalmologist.settings.lightMode': 'Chế độ sáng',
  'Ophthalmologist.settings.accentColor': 'Màu nhấn',
  'Ophthalmologist.settings.notifications': 'Thông báo',
  'Ophthalmologist.settings.emailNotifications': 'Thông báo email',
  'Ophthalmologist.settings.pushNotifications': 'Thông báo đẩy',
  'Ophthalmologist.settings.appointmentReminders': 'Nhắc lịch hẹn',
  'Ophthalmologist.settings.weeklyDigest': 'Tóm tắt hàng tuần',
  'Ophthalmologist.settings.toast.updateSuccess': 'Cập nhật cài đặt thành công',
  'Ophthalmologist.settings.toast.updateFailed': 'Cập nhật cài đặt thất bại',
  'Ophthalmologist.appointments.toggleView': 'Chuyển đổi chế độ xem',
  'Ophthalmologist.appointments.print': 'In',
  'Ophthalmologist.appointments.export': 'Xuất',
};

function setDeep(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

for (const [key, value] of Object.entries(keys)) {
  setDeep(content, key, value);
}

fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
console.log('Updated vi.json');
