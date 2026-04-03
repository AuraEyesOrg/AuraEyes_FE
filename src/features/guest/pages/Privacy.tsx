import React, { useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const PrivacyPage = () => {
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
              Chính Sách Bảo Mật
            </h1>
            <p className="text-[var(--color-brand-primary)] font-medium tracking-widest uppercase">
              Privacy Policy
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
              Cập nhật lần cuối: 13/03/2026
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 py-10 md:px-16 md:py-14 space-y-12">
            <section className="bg-[var(--color-medical-bg)] p-6 rounded-2xl border border-[var(--color-medical-border)]">
              <p className="text-base text-[var(--color-text-muted)] leading-relaxed mb-4">
                <strong className="text-[var(--color-brand-dark)]">
                  Tiêu chuẩn tuân thủ:
                </strong>{' '}
                Áp dụng các nguyên tắc bảo vệ dữ liệu theo tiêu chuẩn Y tế số và
                quy định pháp luật sở tại (bao gồm yêu cầu bảo vệ Dữ liệu cá
                nhân nhạy cảm).
              </p>
              <div className="w-12 h-1 bg-[var(--color-brand-primary)] rounded-full mb-4"></div>
              <p className="text-lg text-[var(--color-brand-dark)] font-medium leading-relaxed">
                AURA Eyes nhận thức rõ tầm quan trọng và tính nhạy cảm của Dữ
                liệu Y tế (Protected Health Information - PHI). Chúng tôi cam
                kết thiết lập các lớp bảo mật cấp độ doanh nghiệp
                (Enterprise-grade Security) để bảo vệ quyền riêng tư của bạn.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  1
                </span>
                Phân loại dữ liệu thu thập
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                Chúng tôi chỉ thu thập các dữ liệu cần thiết phục vụ cho quá
                trình cung cấp dịch vụ:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-[var(--color-medical-border)]">
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    Dữ liệu Định danh (PII)
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Họ tên, địa chỉ email, số điện thoại, ảnh đại diện, thông
                    tin xác thực tài khoản.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[var(--color-medical-border)]">
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    Dữ liệu Y tế Nhạy cảm (PHI)
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Hình ảnh võng mạc được đăng tải (DICOM/JPG/PNG), kết quả
                    phân tích hệ thống (bản đồ nhiệt, chỉ số rủi ro), ghi chú
                    chẩn đoán của bác sĩ, tiền sử khám bệnh và hồ sơ bệnh án
                    điện tử (EMR) được lưu trữ trên nền tảng.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[var(--color-medical-border)]">
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    Dữ liệu Chuyên môn
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    (Dành cho Bác sĩ) Văn bằng y khoa, chứng chỉ hành nghề, hợp
                    đồng hợp tác dịch vụ số.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[var(--color-medical-border)]">
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    Dữ liệu Tài chính
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Lịch sử giao dịch ví điện tử, thông tin thẻ/tài khoản ngân
                    hàng đã mã hóa (phục vụ đối soát và rút tiền).
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
                Mục đích và Phạm vi sử dụng dữ liệu
              </h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      Vận hành cốt lõi:
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      Phân tích hình ảnh võng mạc qua mô hình AI để cảnh báo rủi
                      ro lâm sàng.
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      Điều phối Y tế:
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      Cấp quyền truy cập hồ sơ bệnh án cho Bác sĩ/Cơ sở Y tế cụ
                      thể chỉ khi có sự đồng ý hoặc yêu cầu đặt lịch
                      (booking/request) trực tiếp từ Bệnh nhân.
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
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
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      Huấn luyện Mô hình AI (Machine Learning):
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      AURA Eyes có thể sử dụng dữ liệu hình ảnh đáy mắt để cải
                      thiện độ chính xác của AI. Điều kiện tiên quyết: Toàn bộ
                      dữ liệu này phải trải qua quy trình Phi định danh hoàn
                      toàn (De-identification/Anonymization), loại bỏ mọi thông
                      tin có thể truy vết ngược lại danh tính Bệnh nhân.
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
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
                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      Giao tiếp & Hệ thống:
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      Xử lý thanh toán, gửi thông báo hệ thống (SMS/Email), OTP
                      bảo mật.
                    </span>
                  </div>
                </li>
              </ul>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  3
                </span>
                Cam kết lưu trữ, Chia sẻ và Bảo mật
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Không thương mại hóa dữ liệu
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Chúng tôi tuyệt đối{' '}
                    <span className="font-bold text-red-500">KHÔNG</span> bán,
                    cho thuê Dữ liệu Định danh hoặc Dữ liệu Y tế của người dùng
                    cho bất kỳ bên thứ ba nào vì mục đích quảng cáo.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Tiêu chuẩn lưu trữ
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Dữ liệu được lưu trữ trên hệ thống điện toán đám mây với cơ
                    chế mã hóa dữ liệu tại chỗ (Data at rest) và mã hóa đường
                    truyền (Data in transit) qua giao thức SSL/TLS.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Quyền của chủ thể dữ liệu
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Người dùng có quyền truy cập, trích xuất (export), yêu cầu
                    chỉnh sửa hoặc xóa bỏ hoàn toàn dữ liệu cá nhân/hồ sơ y tế
                    của mình khỏi hệ thống AURA Eyes bằng cách gửi yêu cầu thông
                    qua bộ phận hỗ trợ.
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

export default PrivacyPage;
