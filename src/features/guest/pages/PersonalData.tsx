import React, { useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const PersonalDataPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-medical-bg)] flex flex-col pt-16">
      <Header />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-[var(--color-medical-border)] overflow-hidden">
          {/* Header Area */}
          <div className="bg-[var(--color-brand-dark)] px-8 py-12 md:px-16 md:py-16 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Quy định Xử lý Dữ liệu Cá nhân
            </h1>
            <p className="text-[var(--color-brand-primary)] font-medium tracking-widest uppercase">
              Personal Data Policy
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/20">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Cập nhật lần cuối: 02/04/2026
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 py-10 md:px-16 md:py-14 space-y-12">
            <section className="bg-[var(--color-medical-bg)] p-6 rounded-2xl border border-[var(--color-medical-border)]">
              <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
                <strong className="text-[var(--color-brand-dark)]">
                  Tài liệu tham chiếu:
                </strong>{' '}
                Căn cứ theo các tiêu chuẩn bảo vệ dữ liệu cá nhân hiện hành.
              </p>
              <div className="my-4 w-12 h-1 bg-[var(--color-brand-primary)] rounded-full"></div>
              <p className="text-lg text-[var(--color-brand-dark)] font-medium leading-relaxed">
                Tài liệu này quy định chi tiết về quyền hạn của người dùng (Chủ
                thể dữ liệu) và các cam kết của AURA Eyes trong tư cách là đơn
                vị Kiểm soát và Xử lý dữ liệu.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  1
                </span>
                Quyền của Chủ thể Dữ liệu
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                Người dùng trên nền tảng AURA Eyes có các quyền nhân thân tuyệt
                đối đối với hồ sơ số của mình, bao gồm:
              </p>
              <div className="space-y-6">
                <div className="pl-6 border-l-2 border-[var(--color-medical-border)]">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Quyền truy cập và trích xuất (Right to Access &
                    Portability):
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Người dùng có quyền xem, tải xuống toàn bộ dữ liệu định
                    danh, lịch sử giao dịch và hồ sơ hình ảnh y tế cá nhân dưới
                    định dạng máy tính có thể đọc được (ví dụ: JSON, PDF).
                  </p>
                </div>
                <div className="pl-6 border-l-2 border-[var(--color-medical-border)]">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Quyền chỉnh sửa (Right to Rectification):
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Người dùng có quyền tự cập nhật hoặc yêu cầu hệ thống đính
                    chính các thông tin cá nhân sai lệch thông qua giao diện
                    quản lý tài khoản.
                  </p>
                </div>
                <div className="pl-6 border-l-2 border-[var(--color-medical-border)]">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Quyền xóa bỏ (Right to Erasure / Right to be Forgotten):
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Người dùng có quyền yêu cầu xóa vĩnh viễn tài khoản và toàn
                    bộ dữ liệu cá nhân/y tế liên quan khỏi hệ thống máy chủ tĩnh
                    của AURA Eyes.
                  </p>
                </div>
                <div className="pl-6 border-l-2 border-[var(--color-medical-border)]">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Quyền rút lại sự đồng ý (Right to Withdraw Consent):
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Bất cứ lúc nào, người dùng có thể vô hiệu hóa quyền truy cập
                    hồ sơ của Bác sĩ/Phòng khám hoặc từ chối việc sử dụng dữ
                    liệu hình ảnh (dù đã ẩn danh) cho mục đích huấn luyện AI.
                  </p>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  2
                </span>
                Vòng đời và Thời hạn Lưu trữ Dữ liệu (Data Retention)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    Dữ liệu Hoạt động
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Dữ liệu cá nhân và hồ sơ y tế được lưu trữ và duy trì liên
                    tục trong suốt thời gian tài khoản của người dùng còn ở
                    trạng thái kích hoạt (Active).
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    Dữ liệu Xóa/Hủy
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Khi có yêu cầu xóa tài khoản, toàn bộ dữ liệu định danh
                    (PII) và Dữ liệu y tế nhạy cảm (PHI) sẽ tự động xóa: 30 ngày
                    (CSDL chính), 90 ngày (Backup).
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    Dữ liệu Pháp lý & Tài chính
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Bản ghi về giao dịch tài chính và chứng nhận đồng ý điều
                    khoản dịch vụ có thể lưu trữ tối đa 05 năm phục vụ kiểm toán
                    và giải quyết tranh chấp.
                  </p>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  3
                </span>
                Quy trình phản hồi sự cố Dữ liệu (Data Breach Notification)
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                Trong trường hợp phát hiện hệ thống bị xâm nhập trái phép có
                nguy cơ gây rò rỉ dữ liệu, AURA Eyes cam kết:
              </p>
              <ul className="space-y-4 text-[var(--color-text-muted)] leading-relaxed">
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <span>
                    Kích hoạt quy trình phong tỏa hệ thống ngay lập tức
                    (Incident Response Plan).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <span>
                    Thông báo chính thức đến người dùng bị ảnh hưởng qua
                    Email/SMS trong vòng 72 giờ kể từ khi xác nhận sự cố, kèm
                    theo các biện pháp khắc phục và hướng dẫn bảo vệ tài khoản.
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalDataPage;
