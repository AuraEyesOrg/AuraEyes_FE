import React, { useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const SecurityPage = () => {
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
              Tiêu chuẩn An toàn & Bảo mật
            </h1>
            <p className="text-[var(--color-brand-primary)] font-medium tracking-widest uppercase">
              Security Policy
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
            <section className="bg-[var(--color-medical-bg)] p-6 md:p-8 rounded-2xl border border-[var(--color-medical-border)] text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <p className="text-lg text-[var(--color-brand-dark)] font-medium leading-relaxed">
                Bảo mật là ưu tiên cốt lõi trong thiết kế kiến trúc phần mềm của
                AURA Eyes.
              </p>
              <p className="mt-4 text-base text-[var(--color-text-muted)] leading-relaxed">
                Tài liệu này minh bạch hóa các biện pháp kỹ thuật và tổ chức
                được chúng tôi áp dụng để bảo vệ cơ sở hạ tầng, API và dữ liệu
                người dùng khỏi các mối đe dọa không gian mạng.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  1
                </span>
                Tiêu chuẩn Mã hóa Dữ liệu (Data Encryption)
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                Mọi dữ liệu đi qua và lưu trữ trên hệ thống AURA Eyes đều bị áp
                đặt các tiêu chuẩn mã hóa quân sự/doanh nghiệp:
              </p>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[var(--color-brand-primary)] transition-colors shadow-sm">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[var(--color-brand-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    Mã hóa khi lưu trữ (Data at Rest)
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Toàn bộ cơ sở dữ liệu cốt lõi (Bao gồm CSDL quan hệ lưu
                    thông tin người dùng và Vector Database lưu tài liệu nội
                    bộ/AI) và hệ thống lưu trữ tệp (File Storage chứa ảnh võng
                    mạc, file DICOM) đều được mã hóa bằng chuẩn AES-256.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[var(--color-brand-primary)] transition-colors shadow-sm">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[var(--color-brand-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Mã hóa đường truyền (Data in Transit)
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Mọi giao tiếp giữa trình duyệt/ứng dụng của người dùng với
                    máy chủ AURA Eyes, cũng như giao tiếp nội bộ giữa các
                    microservices, đều được bắt buộc thực hiện qua giao thức
                    HTTPS với chuẩn mã hóa TLS 1.2 hoặc TLS 1.3.
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
                Quản lý Định danh & Kiểm soát Truy cập (IAM & Access Control)
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Kiểm soát truy cập dựa trên vai trò (RBAC)
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Hệ thống phân quyền chặt chẽ theo nguyên tắc Đặc quyền tối
                    thiểu (Principle of Least Privilege). Bác sĩ hoặc nhân viên
                    phòng khám chỉ được cấp quyền truy cập (Read/Write) vào hồ
                    sơ bệnh án của đúng bệnh nhân mà họ phụ trách.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Xác thực đa yếu tố (MFA / 2FA)
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Bắt buộc áp dụng phương thức xác thực qua mã OTP (gửi qua
                    Email hoặc SMS) đối với các hành động nhạy cảm như: Rút tiền
                    từ ví điện tử, thay đổi thông tin định danh chuyên gia, hoặc
                    tải xuống hàng loạt hồ sơ y tế.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Bảo mật phiên làm việc (Session Management)
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Sử dụng JSON Web Token (JWT) với thời gian sống (expiration
                    time) ngắn và cơ chế thu hồi token (Revocation) để chống lại
                    các cuộc tấn công chiếm đoạt phiên làm việc.
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
                An ninh Hạ tầng Đám mây (Cloud & Infrastructure Security)
              </h2>
              <ul className="space-y-4 text-[var(--color-text-muted)] leading-relaxed list-disc pl-5">
                <li>
                  <strong className="text-[var(--color-brand-dark)]">
                    Chứng chỉ bảo mật:
                  </strong>{' '}
                  Hệ thống được triển khai trên nền tảng điện toán đám mây đạt
                  chuẩn quốc tế, đảm bảo các chứng chỉ bảo mật vật lý và logic.
                </li>
                <li>
                  <strong className="text-[var(--color-brand-dark)]">
                    Tường lửa ứng dụng web (WAF):
                  </strong>{' '}
                  Tích hợp WAF để chủ động đánh chặn các cuộc tấn công phổ biến
                  như SQL Injection, Cross-Site Scripting (XSS) và phân luồng
                  phòng chống tấn công từ chối dịch vụ (DDoS).
                </li>
                <li>
                  <strong className="text-[var(--color-brand-dark)]">
                    Cô lập dữ liệu:
                  </strong>{' '}
                  Kiến trúc cơ sở dữ liệu được cô lập hoàn toàn trong Mạng nội
                  bộ ảo (VPC), không tiếp xúc trực tiếp với internet công cộng.
                </li>
              </ul>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  4
                </span>
                Giám sát, Nhật ký và Kiểm toán (Monitoring & Logging)
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Nhật ký truy cập (Audit Logs)
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Mọi thao tác tạo, đọc, sửa, xóa (CRUD) đối với Dữ liệu y tế
                    nhạy cảm (PHI) đều được hệ thống tự động ghi nhật ký không
                    thể chối bỏ (immutable logs) bao gồm: Dấu thời gian, IP truy
                    cập và Định danh tài khoản thực hiện.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Hệ thống giám sát 24/7
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Hệ thống giám sát liên tục giúp phát hiện sớm các lưu lượng
                    truy cập bất thường và tự động cảnh báo cho đội ngũ kỹ sư
                    bảo mật của nền tảng để có phương án phản ứng kịp thời.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SecurityPage;
