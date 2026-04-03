import React, { useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const TermsOfUsePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-medical-bg)] flex flex-col">
      <Header />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-[var(--color-medical-border)] overflow-hidden">
          {/* Header Area */}
          <div className="bg-[var(--color-brand-dark)] px-8 py-12 md:px-16 md:py-16 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Điều Khoản Dịch Vụ
            </h1>
            <p className="text-[var(--color-brand-primary)] font-medium tracking-widest uppercase">
              Terms of Service
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/20">
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
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-primary)]/20 px-4 py-2 text-sm font-medium text-[var(--color-brand-primary)] ring-1 ring-inset ring-[var(--color-brand-primary)]">
                Phiên bản: 1.0
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 py-10 md:px-16 md:py-14 space-y-12">
            <section className="bg-[var(--color-medical-bg)] p-6 md:p-8 rounded-2xl border border-[var(--color-medical-border)] text-center">
              <p className="text-lg text-[var(--color-brand-dark)] font-medium leading-relaxed">
                Chào mừng bạn đến với Hệ thống Sàng lọc Sức khỏe Mạch máu Võng
                mạc - AURA Eyes ("Hệ thống", "Chúng tôi", hoặc "AURA Eyes").
              </p>
              <div className="mt-4 text-base text-[var(--color-text-muted)] leading-relaxed">
                Bằng việc tạo tài khoản, truy cập và sử dụng nền tảng của chúng
                tôi, Người dùng (bao gồm Bệnh nhân, Bác sĩ và Cơ sở Y tế) đồng ý
                tuân thủ toàn bộ các điều khoản được quy định dưới đây.
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  1
                </span>
                Bản chất dịch vụ và Miễn trừ trách nhiệm y tế
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                AURA Eyes là nền tảng phần mềm dạng dịch vụ (SaaS) cung cấp công
                cụ Hỗ trợ Quyết định Lâm sàng (CDS). Trí tuệ nhân tạo (AI) của
                AURA Eyes hoạt động như một hệ thống phân loại sơ bộ, phân tích
                rủi ro dựa trên hình ảnh đáy mắt (hỗ trợ định dạng tiêu chuẩn
                như JPG, PNG, DICOM).
              </p>

              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                <h3 className="flex items-center gap-2 text-red-800 font-bold text-lg mb-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Khuyến cáo quan trọng
                </h3>
                <p className="text-red-700 leading-relaxed text-sm">
                  Mọi báo cáo, bản đồ nhiệt, lộ trình rủi ro hoặc điểm số được
                  tạo ra bởi AI của AURA Eyes{' '}
                  <strong className="font-bold">
                    KHÔNG mang giá trị chẩn đoán y khoa chính thức
                  </strong>
                  , không thay thế cho phác đồ điều trị hoặc đánh giá chuyên môn
                  của Bác sĩ. Chúng tôi miễn trừ mọi trách nhiệm pháp lý đối với
                  bất kỳ quyết định y tế nào được đưa ra chỉ dựa trên kết quả
                  phân tích của hệ thống AI mà không thông qua sự xác nhận của
                  Bác sĩ Nhãn khoa có chuyên môn.
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  2
                </span>
                Trách nhiệm của Người dùng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[var(--color-medical-border)] hover:border-[var(--color-brand-primary)] transition-colors shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-3">
                    Đối với Bệnh nhân / Cá nhân
                  </h3>
                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                    Cam kết cung cấp dữ liệu định danh và hình ảnh y tế trung
                    thực. Người dùng hoàn toàn chịu trách nhiệm về tính bảo mật
                    của tài khoản cá nhân, thông tin đăng nhập và mã xác thực
                    (OTP).
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[var(--color-medical-border)] hover:border-[var(--color-brand-primary)] transition-colors shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-3">
                    Đối với Chuyên gia Y tế
                  </h3>
                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                    Cam kết và chịu trách nhiệm pháp lý về tính hợp lệ của bằng
                    cấp. Khi tham gia Mạng lưới Chuyên gia, Bác sĩ có nghĩa vụ
                    tuân thủ nguyên tắc phi định danh (anonymization) tuyệt đối
                    mọi thông tin bệnh nhân.
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
                Giao dịch, Thanh toán và Ví điện tử
              </h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-dark)]"></div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      Cổng thanh toán:
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      Mọi giao dịch tài chính (nạp tiền, thanh toán phí AI, phí
                      tư vấn chuyên gia, yêu cầu rút tiền) được xử lý thông qua
                      ví điện tử tích hợp và các đối tác thanh toán được cấp
                      phép (ví dụ: PayOS).
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-dark)]"></div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      Minh bạch tài chính:
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      Bảng giá dịch vụ được niêm yết công khai trên nền tảng
                      trước khi phát sinh giao dịch. Người dùng nạp tiền vào ví
                      điện tử có thể sử dụng số dư cho mọi dịch vụ nội bộ của
                      AURA Eyes.
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-dark)]"></div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      Chính sách rút tiền:
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      Đối với Chuyên gia Y tế, các yêu cầu rút tiền từ ví điện
                      tử về tài khoản ngân hàng liên kết sẽ được đối soát và xử
                      lý trong vòng 03 - 05 ngày làm việc theo quy chế vận hành
                      tài chính của AURA Eyes.
                    </span>
                  </div>
                </li>
              </ul>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  4
                </span>
                Quyền Sở hữu Trí tuệ (Intellectual Property)
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                Toàn bộ mã nguồn, thuật toán AI, thiết kế giao diện, logo và tài
                liệu kỹ thuật thuộc quyền sở hữu độc quyền của AURA Eyes.
              </p>
              <div className="bg-[var(--color-medical-bg)] border border-[var(--color-medical-border)] rounded-xl p-4 text-center">
                <p className="text-[var(--color-brand-dark)] font-bold">
                  Nghiêm cấm mọi hành vi sao chép, dịch ngược mã (reverse
                  engineering) hoặc sử dụng thương mại trái phép.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfUsePage;
