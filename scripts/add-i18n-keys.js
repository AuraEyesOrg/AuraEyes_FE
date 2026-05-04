const fs = require('fs');

const files = [
  { path: 'src/i18n/messages/en.json', lang: 'en' },
  { path: 'src/i18n/messages/vi.json', lang: 'vi' },
];

const keysToAdd = {
  en: {
    'Ophthalmologist.caseSnapshot': {
      alt: 'AI annotated retinal image',
      noImage: 'No AI image',
      openReview: 'Open full AI screening review',
    },
    'Ophthalmologist.urgentAIAlerts': {
      title: 'Urgent AI Alerts',
      viewAll: 'View all',
      aiConfidence: 'AI Confidence',
      reviewNow: 'Review Now',
      verify: 'Verify',
    },
    'Ophthalmologist.screeningQueue': {
      title: 'Screening Queue',
      filter: 'Filter',
      sort: 'Sort',
      patientDetails: 'Patient Details',
      scanDate: 'Scan Date',
      aiPrediction: 'AI Prediction',
      confidence: 'Confidence',
      status: 'Status',
      action: 'Action',
      aiAnalyzed: 'AI Analyzed',
      flaggedForReview: 'Flagged for Review',
      reviewed: 'Reviewed',
      pending: 'Pending',
      check: 'Check',
      quickApprove: 'Quick Approve',
      startReview: 'Start Review',
      pagination: 'Showing {{showing}} of {{total}} pending reviews',
      previous: 'Previous',
      next: 'Next',
    },
    'Ophthalmologist.patients.noPatients': 'No patients',
    'Ophthalmologist.patients.noSearchResults': 'No results found for "{{query}}"',
    'Ophthalmologist.patients.carePlan': 'Care plan',
    'Ophthalmologist.patients.latestVisit': 'Latest visit',
    'Ophthalmologist.patients.nextAppointment': 'Next appointment',
    'Ophthalmologist.profile.toast.profileUpdated': 'Profile updated successfully',
    'Ophthalmologist.profile.toast.profileUpdateFailed': 'Failed to update profile',
    'Ophthalmologist.profile.toast.chooseImage': 'Please choose an image file',
    'Ophthalmologist.profile.toast.imageSize': 'Image must be smaller than 5MB',
    'Ophthalmologist.profile.toast.avatarUpdated': 'Avatar updated successfully',
    'Ophthalmologist.profile.toast.avatarUploadFailed': 'Failed to upload avatar',
    'Ophthalmologist.profile.toast.certificateDeleted': 'Certificate deleted successfully',
    'Ophthalmologist.profile.toast.certificateDeleteFailed': 'Failed to delete certificate',
    'Ophthalmologist.profile.confirm.deleteCertificate': 'Are you sure you want to delete "{{certName}}"?',
    'Ophthalmologist.settings.title': 'Settings',
    'Ophthalmologist.settings.appearance': 'Appearance',
    'Ophthalmologist.settings.displayOptions': 'Display Options',
    'Ophthalmologist.settings.language': 'Language',
    'Ophthalmologist.settings.theme': 'Theme',
    'Ophthalmologist.settings.autoSaveDraft': 'Auto-save Draft',
    'Ophthalmologist.settings.compactMode': 'Compact Mode',
    'Ophthalmologist.settings.showTooltips': 'Show Tooltips',
    'Ophthalmologist.settings.darkMode': 'Dark Mode',
    'Ophthalmologist.settings.lightMode': 'Light Mode',
    'Ophthalmologist.settings.accentColor': 'Accent Color',
    'Ophthalmologist.settings.notifications': 'Notifications',
    'Ophthalmologist.settings.emailNotifications': 'Email Notifications',
    'Ophthalmologist.settings.pushNotifications': 'Push Notifications',
    'Ophthalmologist.settings.appointmentReminders': 'Appointment Reminders',
    'Ophthalmologist.settings.weeklyDigest': 'Weekly Digest',
    'Ophthalmologist.settings.toast.updateSuccess': 'Settings updated successfully',
    'Ophthalmologist.settings.toast.updateFailed': 'Failed to update settings',
    'Ophthalmologist.appointments.toggleView': 'Toggle View',
    'Ophthalmologist.appointments.print': 'Print',
    'Ophthalmologist.appointments.export': 'Export',
  },
  vi: {
    'Ophthalmologist.caseSnapshot': {
      alt: 'Hình ảnh võng mạc được AI chú thích',
      noImage: 'Không có hình ảnh AI',
      openReview: 'Mở đánh giá AI sàng lọc đầy đủ',
    },
    'Ophthalmologist.urgentAIAlerts': {
      title: 'Cảnh báo AI khẩn cấp',
      viewAll: 'Xem tất cả',
      aiConfidence: 'Độ tin cậy AI',
      reviewNow: 'Đánh giá ngay',
      verify: 'Xác minh',
    },
    'Ophthalmologist.screeningQueue': {
      title: 'Hàng đợi sàng lọc',
      filter: 'Lọc',
      sort: 'Sắp xếp',
      patientDetails: 'Chi tiết bệnh nhân',
      scanDate: 'Ngày quét',
      aiPrediction: 'Dự đoán AI',
      confidence: 'Độ tin cậy',
      status: 'Trạng thái',
      action: 'Hành động',
      aiAnalyzed: 'AI đã phân tích',
      flaggedForReview: 'Đánh dấu để xem xét',
      reviewed: 'Đã xem xét',
      pending: 'Đang chờ',
      check: 'Kiểm tra',
      quickApprove: 'Phê duyệt nhanh',
      startReview: 'Bắt đầu xem xét',
      pagination: 'Hiển thị {{showing}} trong {{total}} đánh giá đang chờ',
      previous: 'Trước',
      next: 'Tiếp',
    },
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
  },
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

files.forEach(({ path, lang }) => {
  const fullPath = require('path').join(__dirname, '..', path);
  const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  const keys = keysToAdd[lang];

  for (const [key, value] of Object.entries(keys)) {
    setDeep(content, key, value);
  }

  fs.writeFileSync(fullPath, JSON.stringify(content, null, 2) + '\n');
  console.log(`Updated ${path}`);
});
