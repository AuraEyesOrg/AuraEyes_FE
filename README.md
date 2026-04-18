# AuraEyes Frontend — React 19 · TypeScript · Vite · TanStack Query · Zustand

> **AuraEyes** là nền tảng chăm sóc sức khoẻ nhãn khoa trực tuyến. Frontend được xây dựng theo kiến trúc **Feature-Sliced Design**, tích hợp AI sàng lọc võng mạc, tư vấn trực tuyến qua Google Meet, thanh toán PayOS và real-time SignalR.

---

## 📋 Mục lục

- [Tech Stack](#-tech-stack)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Feature Modules](#-feature-modules)
- [State Management](#-state-management)
- [Data Fetching Flow](#-data-fetching-flow)
- [Routing & Authorization](#-routing--authorization)
- [Real-time (SignalR)](#-real-time-signalr)
- [Internationalization (i18n)](#-internationalization-i18n)
- [Build & Performance](#-build--performance)
- [Cấu hình môi trường](#-cấu-hình-môi-trường)
- [Chạy local](#-chạy-local)
- [Scripts](#-scripts)
- [Testing](#-testing)

---

## 🛠 Tech Stack

### Core

| Thư viện         | Phiên bản | Mục đích                  |
| ---------------- | --------- | ------------------------- |
| React            | 19.x      | UI framework              |
| TypeScript       | 5.8       | Type safety               |
| Vite             | 7.x       | Build tool (SWC compiler) |
| React Router DOM | 7.x       | Client-side routing       |

### State & Data

| Thư viện              | Phiên bản | Mục đích                               |
| --------------------- | --------- | -------------------------------------- |
| TanStack React Query  | 5.x       | Server state, caching, mutations       |
| Zustand               | 5.x       | Client state (auth, UI, notifications) |
| Axios                 | 1.x       | HTTP client (với interceptors JWT)     |
| React Hook Form       | 7.x       | Form management                        |
| Yup                   | 1.x       | Schema validation                      |
| `@hookform/resolvers` | 5.x       | Kết nối Yup ↔ React Hook Form          |

### UI & Styling

| Thư viện                       | Mục đích                          |
| ------------------------------ | --------------------------------- |
| Tailwind CSS 4                 | Utility-first CSS                 |
| Lucide React                   | Icon system                       |
| Framer Motion                  | Animation                         |
| GSAP + `@gsap/react`           | Phức tạp animation (landing page) |
| `@lottiefiles/dotlottie-react` | Lottie animation                  |
| React Toastify                 | Toast notifications               |
| Recharts                       | Charts / Dashboard                |

### Tích hợp bên thứ ba

| Thư viện                    | Mục đích                         |
| --------------------------- | -------------------------------- |
| `@microsoft/signalr`        | Real-time (Chat + Notifications) |
| `@react-oauth/google`       | Google OAuth2 Login              |
| `react-google-recaptcha`    | reCAPTCHA v2                     |
| `@google/genai`             | Google Gemini AI                 |
| `@n8n/chat`                 | n8n chatbot widget               |
| `jspdf` + `jspdf-autotable` | Export PDF                       |
| `xlsx`                      | Export Excel                     |
| `html5-qrcode`              | QR Code scanner                  |
| `date-fns`                  | Date utilities                   |
| `react-joyride`             | Guided onboarding tour           |

### Dev & Tooling

| Công cụ                                        | Mục đích                                 |
| ---------------------------------------------- | ---------------------------------------- |
| Husky + lint-staged                            | Git hooks (auto lint/format)             |
| ESLint 9                                       | Linting (react-hooks, a11y, import-sort) |
| Prettier                                       | Code formatting                          |
| Commitlint + Commitizen                        | Conventional commits                     |
| Jest + `@testing-library`                      | Unit tests                               |
| Playwright                                     | E2E tests                                |
| `rollup-plugin-visualizer`                     | Bundle analysis                          |
| `vite-plugin-pwa`                              | Progressive Web App                      |
| `vite-plugin-compression`                      | Brotli + Gzip nén output                 |
| `@vercel/analytics` + `@vercel/speed-insights` | Vercel monitoring                        |

---

## 📁 Cấu trúc thư mục

```
AuraEyes_FE/
├── public/                     # Static assets
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root component + router
│   ├── provider.tsx            # AppProvider (QueryClient, Google OAuth, Theme, SignalR)
│   │
│   ├── features/               # Feature modules (core)
│   │   ├── auth/               # Đăng nhập, đăng ký, 2FA, Google login
│   │   ├── patient/            # Dashboard, sàng lọc AI, đặt lịch, ví, bác sĩ, ...
│   │   ├── ophthalmologist/    # Dashboard, lịch hẹn, slot, screening review, ví, ...
│   │   ├── organisation/       # Dashboard, bệnh nhân, lịch, screening, hợp đồng, ...
│   │   ├── system-admin/       # Quản trị toàn hệ thống
│   │   ├── consultation/       # Chat + phiên tư vấn (API + hooks)
│   │   ├── professional-network/ # Mạng lưới bác sĩ, bài đăng
│   │   ├── notifications/      # Trung tâm thông báo
│   │   └── guest/              # Trang công khai (landing, about, ...)
│   │
│   ├── components/
│   │   ├── layouts/            # Layout wrapper (patient, doctor, org, admin)
│   │   └── ui/                 # Shared UI components (Button, Modal, Table, ...)
│   │
│   ├── hooks/                  # Shared custom hooks
│   │   ├── useSignalRChat.ts
│   │   ├── useSignalRNotification.ts
│   │   ├── use-debounce.ts
│   │   └── use-permissions.ts
│   │
│   ├── store/                  # Zustand global stores
│   │   ├── auth-store.ts       # Auth state (user, tokens, roles)
│   │   ├── global-store.ts     # Global UI state
│   │   ├── useNotificationStore.ts
│   │   ├── useLanguageStore.ts
│   │   └── logger.ts           # Zustand middleware logger
│   │
│   ├── lib/                    # Shared utilities & config
│   │   ├── axios.ts            # Axios instance
│   │   ├── interceptors.ts     # JWT interceptor + refresh token logic
│   │   ├── api.ts              # Generic API helpers
│   │   ├── endpoints.ts        # Tất cả API endpoint constants
│   │   ├── react-query.ts      # QueryClient config
│   │   ├── date-utils.ts       # Date formatting helpers
│   │   ├── file-export.ts      # PDF / Excel export helpers
│   │   ├── api-error.ts        # Error message extraction (FluentValidation)
│   │   ├── config.ts           # PWA config
│   │   ├── router.ts           # Router helpers
│   │   ├── toast-dedupe.ts     # Toast deduplication
│   │   └── ...
│   │
│   ├── contexts/
│   │   └── ThemeContext.tsx    # Dark / Light mode context
│   │
│   ├── i18n/                   # Internationalization
│   │   ├── i18n.ts             # i18next config
│   │   ├── I18nProvider.tsx
│   │   ├── locales.ts          # Supported locales (vi, en)
│   │   ├── useSafeTranslation.ts
│   │   ├── messages.generated.d.ts  # Auto-generated type-safe keys
│   │   └── messages/           # Translation JSON files
│   │
│   ├── routes/
│   │   ├── index.tsx           # Route definitions (React Router v7)
│   │   ├── private-route.tsx   # Protected route guard
│   │   └── public-route.tsx    # Public route guard
│   │
│   ├── types/                  # Shared TypeScript types
│   ├── constants/              # App-wide constants
│   ├── utils/                  # Shared utility functions
│   ├── data/                   # Static mock/seed data
│   └── styles/                 # Global CSS / Sass
│
├── tests/                      # Playwright E2E tests
├── scripts/                    # Helper scripts (i18n type gen, audit)
├── docs/                       # Documentation
├── vercel.json                 # Vercel deployment config (SPA rewrite rules)
├── vite.config.mjs             # Vite config
├── tsconfig.json
├── playwright.config.ts
├── jest.config.ts
├── eslint.config.js
└── package.json
```

### Cấu trúc nội bộ mỗi Feature

```
src/features/<feature>/
├── api/          # TanStack Query hooks (useQuery, useMutation) + API calls
├── components/   # Feature-specific UI components
├── hooks/        # Feature-specific hooks
├── pages/        # Page components (map 1:1 với routes)
├── types/        # TypeScript interfaces & types
├── schemas/      # Yup validation schemas (nếu có)
├── stores/       # Feature-level Zustand stores (nếu có)
├── lib/          # Feature-local utilities
├── utils/        # Helper functions
└── index.ts      # Public exports
```

---

## 🗂 Feature Modules

### 👤 Auth (`/features/auth`)

- Đăng nhập (email/password + Google OAuth2)
- Đăng ký tài khoản
- Xác thực email (OTP)
- Quên mật khẩu, đặt lại mật khẩu
- Two-Factor Authentication (2FA)
- reCAPTCHA v2

### 🧑‍⚕️ Patient (`/features/patient`) — 20 pages

| Page                       | Mô tả                                |
| -------------------------- | ------------------------------------ |
| `dashboard.tsx`            | Tổng quan sức khoẻ, lịch sử sàng lọc |
| `screening.tsx`            | Danh sách lịch sử AI screening       |
| `screening-new.tsx`        | Tạo phiên sàng lọc mới               |
| `retinal-analysis.tsx`     | Phân tích ảnh võng mạc bằng AI       |
| `analysis-detail.tsx`      | Chi tiết kết quả phân tích           |
| `roadmap.tsx`              | Lộ trình điều trị do AI sinh         |
| `doctors.tsx`              | Tìm kiếm & xem hồ sơ bác sĩ          |
| `book-appointment.tsx`     | Đặt lịch hẹn với bác sĩ              |
| `booking-confirmation.tsx` | Xác nhận đặt lịch                    |
| `appointments.tsx`         | Lịch hẹn của tôi                     |
| `clinics.tsx`              | Danh sách phòng khám / tổ chức       |
| `wallet.tsx`               | Ví điện tử, lịch sử giao dịch        |
| `payment-callback.tsx`     | Callback sau thanh toán PayOS        |
| `chat.tsx`                 | Chat với bác sĩ (SignalR)            |
| `review.tsx`               | Đánh giá sau phiên tư vấn            |
| `profile.tsx`              | Hồ sơ cá nhân bệnh nhân              |
| `settings.tsx`             | Cài đặt tài khoản                    |
| `notifications.tsx`        | Thông báo                            |
| `help-feedback.tsx`        | Trợ giúp & Phản hồi                  |

### 👁 Ophthalmologist (`/features/ophthalmologist`) — 15 pages

| Page                                  | Mô tả                          |
| ------------------------------------- | ------------------------------ |
| `dashboard.tsx`                       | Tổng quan hoạt động            |
| `appointments.tsx`                    | Quản lý lịch hẹn               |
| `slot-management.tsx`                 | Quản lý slot giờ khám          |
| `schedules.tsx`                       | Lịch làm việc mẫu              |
| `leave-requests.tsx`                  | Yêu cầu nghỉ phép              |
| `screenings.tsx`                      | Danh sách screening cần duyệt  |
| `screening-review.tsx`                | Duyệt & nhận xét kết quả AI    |
| `patients.tsx`                        | Danh sách bệnh nhân của tôi    |
| `ConsultationsChatView.tsx`           | Chat + phiên tư vấn trực tuyến |
| `consultations.tsx`                   | Danh sách phiên tư vấn         |
| `wallet.tsx`                          | Ví & thu nhập                  |
| `contract.tsx`                        | Hợp đồng hành nghề             |
| `employment-type-change-requests.tsx` | Yêu cầu đổi loại hình HĐ       |
| `settings.tsx`                        | Profile & chứng chỉ            |

### 🏥 Organisation (`/features/organisation`) — 14 pages

| Page                   | Mô tả                         |
| ---------------------- | ----------------------------- |
| `dashboard.tsx`        | Tổng quan tổ chức             |
| `analytics.tsx`        | Phân tích số liệu             |
| `patients.tsx`         | Bệnh nhân thuộc tổ chức       |
| `patient-history.tsx`  | Lịch sử bệnh nhân             |
| `screening.tsx`        | Sàng lọc do tổ chức thực hiện |
| `screening-result.tsx` | Kết quả sàng lọc (PDF export) |
| `reports.tsx`          | Báo cáo tổng hợp              |
| `calendar.tsx`         | Lịch làm việc tổ chức         |
| `slot-management.tsx`  | Quản lý slot                  |
| `wallet.tsx`           | Thu chi tài chính             |
| `contract.tsx`         | Hợp đồng với bác sĩ           |
| `settings.tsx`         | Cấu hình tổ chức              |

### 🔧 System Admin (`/features/system-admin`) — 18 pages

| Page                                  | Mô tả                                   |
| ------------------------------------- | --------------------------------------- |
| `dashboard.tsx`                       | Dashboard tổng hợp toàn hệ thống        |
| `ophthalmologists.tsx`                | Quản lý bác sĩ + xét duyệt              |
| `organisations.tsx`                   | Quản lý tổ chức + onboarding            |
| `patients.tsx`                        | Quản lý bệnh nhân                       |
| `users.tsx`                           | Quản lý tất cả tài khoản                |
| `permissions.tsx`                     | RBAC — phân quyền granular              |
| `verification-requests.tsx`           | Duyệt yêu cầu xác thực bác sĩ           |
| `employment-type-change-requests.tsx` | Duyệt đổi hợp đồng                      |
| `leave-requests.tsx`                  | Duyệt nghỉ phép                         |
| `contracts.tsx`                       | Toàn bộ hợp đồng                        |
| `contract-templates.tsx`              | Mẫu hợp đồng                            |
| `contract-template-editor.tsx`        | Soạn thảo mẫu hợp đồng                  |
| `cashflow.tsx`                        | Dòng tiền hệ thống                      |
| `withdrawal-requests.tsx`             | Duyệt yêu cầu rút tiền                  |
| `audit-logs.tsx`                      | Nhật ký thao tác                        |
| `settings.tsx`                        | Cấu hình hệ thống                       |
| `status.tsx`                          | Trạng thái hệ thống (BetterStack embed) |

### 🌐 Professional Network (`/features/professional-network`)

- Feed bài đăng của bác sĩ
- Tạo / chỉnh sửa bài đăng
- Tương tác mạng lưới y tế

### 💬 Consultation (`/features/consultation`)

- API hooks cho phiên tư vấn
- Chat real-time qua SignalR

---

## 🗃 State Management

### Zustand Stores

| Store                     | Nội dung                                                          |
| ------------------------- | ----------------------------------------------------------------- |
| `auth-store.ts`           | `user`, `accessToken`, `refreshToken`, `roles`, `isAuthenticated` |
| `global-store.ts`         | Global UI flags                                                   |
| `useNotificationStore.ts` | Danh sách thông báo real-time, badge count                        |
| `useLanguageStore.ts`     | Locale hiện tại (vi/en)                                           |

### TanStack Query

- Tất cả **server state** (danh sách, chi tiết, phân trang) đều dùng `useQuery`
- Tất cả **mutations** (tạo, cập nhật, xoá) dùng `useMutation` + `invalidateQueries`
- QueryClient được cấu hình tập trung tại `src/lib/react-query.ts`

---

## 🔄 Data Fetching Flow

```
Component
    │
    ├── useQuery / useMutation (TanStack Query)
    │       │
    │       ▼
    │   Feature API hook  (src/features/<f>/api/*.ts)
    │       │
    │       ▼
    │   lib/axios.ts  (Axios instance với Base URL)
    │       │
    │       ├── Request  →  lib/interceptors.ts
    │       │                └── Inject Authorization: Bearer <token>
    │       │
    │       └── Response →  lib/interceptors.ts
    │                        ├── 401 → auto refresh token
    │                        └── Error → lib/api-error.ts (parse FluentValidation errors)
    │       │
    │       ▼
    │   ASP.NET Core API
    │
    └── Zustand store (read/write client state)
```

---

## 🛣 Routing & Authorization

### Cấu trúc Routes (`src/routes/index.tsx`)

```
/                           → Guest (Landing page)
/auth/*                     → Public routes (login, register, forgot-password, ...)
/patient/*                  → PrivateRoute [role: Patient]
/ophthalmologist/*          → PrivateRoute [role: Ophthalmologist]
/organisation/*             → PrivateRoute [role: OrgAdmin]
/admin/*                    → PrivateRoute [role: SystemAdmin]
/network/*                  → PrivateRoute [authenticated]
/notifications              → PrivateRoute [authenticated]
```

### Route Guards

| Component      | Mô tả                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| `PrivateRoute` | Kiểm tra `isAuthenticated` + role từ `auth-store`. Redirect `/auth/login` nếu chưa đăng nhập |
| `PublicRoute`  | Redirect về dashboard nếu đã đăng nhập                                                       |

### Permission Hook

`usePermissions` — đọc permissions granular từ JWT claims, dùng để ẩn/hiện UI elements.

---

## ⚡ Real-time (SignalR)

Được khởi tạo tự động khi user đã xác thực, thông qua `SignalRProvider` trong `AppProvider`.

| Hook                     | Hub               | Chức năng                     |
| ------------------------ | ----------------- | ----------------------------- |
| `useSignalRNotification` | `NotificationHub` | Nhận thông báo push real-time |
| `useSignalRChat`         | `ChatHub`         | Chat giữa bệnh nhân ↔ bác sĩ  |

**Kết nối:** JWT token được truyền qua query string `?access_token=...` khi connect WebSocket.

---

## 🌍 Internationalization (i18n)

- **Thư viện**: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- **Ngôn ngữ hỗ trợ**: `vi` (Tiếng Việt) · `en` (English)
- **Type-safe keys**: Script `npm run i18n:types` tự động sinh `messages.generated.d.ts`
- **Hook an toàn**: `useSafeTranslation` wrapper tránh key undefined

```bash
# Sinh lại TypeScript types cho i18n keys
npm run i18n:types

# Audit key chưa dùng trong patient feature
npm run i18n:audit:patient
```

---

## 🏗 Build & Performance

### Vite Build Optimizations

| Tính năng           | Chi tiết                                               |
| ------------------- | ------------------------------------------------------ |
| **Compiler**        | SWC (thay Babel, nhanh hơn ~5–20x)                     |
| **Code splitting**  | `react-core`, `ui-icons`, `n8n-widget` chunks thủ công |
| **CSS split**       | `cssCodeSplit: true`                                   |
| **Compression**     | Brotli (`.br`) + Gzip (`.gz`) cho assets > 10KB        |
| **Console strip**   | `drop: ['console', 'debugger']` trong production       |
| **PWA**             | `vite-plugin-pwa` — service worker + offline support   |
| **Bundle analysis** | `dist/stats.html` (Rollup Visualizer)                  |
| **Path alias**      | `@/` → `src/`                                          |

### Dev Server

```
Port dev:      3000
Port preview:  8080
```

---

## ⚙️ Cấu hình môi trường

```bash
cp .env.example .env
```

```env
# URL của backend API
VITE_API_END_POINT=https://api.auraeyes.site

# Google reCAPTCHA v2 Site Key
VITE_RECAPTCHA_SITE_KEY=

# Google OAuth2 Client ID
VITE_GOOGLE_CLIENT_ID=
```

---

## 💻 Chạy local

### Yêu cầu

- Node.js ≥ 18
- npm ≥ 9 (hoặc pnpm / yarn)

```bash
# 1. Clone repo
git clone https://github.com/AuraEyesOrg/AuraEyes_FE.git
cd AuraEyes_FE

# 2. Cài dependencies
npm install

# 3. Tạo file .env
cp .env.example .env
# Điền VITE_API_END_POINT, VITE_RECAPTCHA_SITE_KEY, VITE_GOOGLE_CLIENT_ID

# 4. Chạy dev server
npm run dev
# → http://localhost:3000

# 5. Build production
npm run build

# 6. Preview production build
npm run preview
# → http://localhost:8080
```

---

## 📜 Scripts

| Script                                 | Mô tả                                           |
| -------------------------------------- | ----------------------------------------------- |
| `npm run dev`                          | Chạy dev server (port 3000)                     |
| `npm run dev:test`                     | Dev server mode test (port 3001)                |
| `npm run build`                        | TypeScript check → sinh i18n types → Vite build |
| `npm run preview`                      | Preview production build                        |
| `npm run lint`                         | ESLint toàn bộ dự án                            |
| `npm run lint:fix`                     | Auto-fix lint errors                            |
| `npm run format`                       | Prettier format toàn bộ file                    |
| `npm run test`                         | Jest unit tests                                 |
| `npm run test:e2e`                     | Playwright E2E (toàn bộ)                        |
| `npm run test:e2e:module:auth`         | E2E — Auth module                               |
| `npm run test:e2e:module:screening`    | E2E — Screening module                          |
| `npm run test:e2e:module:consultation` | E2E — Consultation module                       |
| `npm run test:e2e:module:wallet`       | E2E — Wallet module                             |
| `npm run test:e2e:module:booking`      | E2E — Booking module                            |
| `npm run test:e2e:round1`              | E2E tagged `@round-1`                           |
| `npm run test:e2e:ui`                  | Playwright UI mode                              |
| `npm run i18n:types`                   | Sinh TypeScript types cho i18n keys             |
| `npm run commit`                       | Commitizen (conventional commits)               |
| `npm run release`                      | standard-version (changelog + tag)              |

---

## 🧪 Testing

### Unit Tests — Jest

```bash
npm run test
```

- Framework: **Jest** + `ts-jest` + `jest-environment-jsdom`
- Testing library: `@testing-library/jest-dom`
- Config: `jest.config.ts`

### E2E Tests — Playwright

```bash
# Toàn bộ
npm run test:e2e

# Chạy theo module
npm run test:e2e:module:auth
npm run test:e2e:module:screening
npm run test:e2e:module:consultation
npm run test:e2e:module:booking
npm run test:e2e:module:wallet
npm run test:e2e:module:feedback
npm run test:e2e:module:profile
npm run test:e2e:module:network
npm run test:e2e:module:org-screening

# UI mode
npm run test:e2e:ui
```

- Config: `playwright.config.ts`
- Tests: `tests/`

---

## 🚀 Deployment

Deployed trên **Vercel** với cấu hình `vercel.json` (SPA rewrite — mọi route đều về `index.html`).

Monitoring: **Vercel Analytics** + **Vercel Speed Insights** tích hợp sẵn.

---

_© 2026 AuraEyes Team — SEP490 · FPT University_
