# AuraEyes Frontend — React 19 · TypeScript · Vite · TanStack Query · Zustand

> **AuraEyes** is an online ophthalmology healthcare platform. The frontend is built with a **Feature-Sliced Design** architecture, featuring AI-powered retinal screening, online consultations via Google Meet, PayOS payments, and real-time SignalR communication.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Feature Modules](#-feature-modules)
- [State Management](#-state-management)
- [Data Fetching Flow](#-data-fetching-flow)
- [Routing & Authorization](#-routing--authorization)
- [Real-time (SignalR)](#-real-time-signalr)
- [Internationalization (i18n)](#-internationalization-i18n)
- [Build & Performance](#-build--performance)
- [Environment Configuration](#-environment-configuration)
- [Running Locally](#-running-locally)
- [Scripts](#-scripts)
- [Testing](#-testing)

---

## 🛠 Tech Stack

### Core

| Library          | Version | Purpose                   |
| ---------------- | ------- | ------------------------- |
| React            | 19.x    | UI framework              |
| TypeScript       | 5.8     | Type safety               |
| Vite             | 7.x     | Build tool (SWC compiler) |
| React Router DOM | 7.x     | Client-side routing       |

### State & Data

| Library               | Version | Purpose                                |
| --------------------- | ------- | -------------------------------------- |
| TanStack React Query  | 5.x     | Server state, caching, mutations       |
| Zustand               | 5.x     | Client state (auth, UI, notifications) |
| Axios                 | 1.x     | HTTP client with JWT interceptors      |
| React Hook Form       | 7.x     | Form management                        |
| Yup                   | 1.x     | Schema validation                      |
| `@hookform/resolvers` | 5.x     | Yup ↔ React Hook Form bridge           |

### UI & Styling

| Library                        | Purpose                               |
| ------------------------------ | ------------------------------------- |
| Tailwind CSS 4                 | Utility-first CSS                     |
| Lucide React                   | Icon system                           |
| Framer Motion                  | Animation                             |
| GSAP + `@gsap/react`           | Complex animations (landing page)     |
| `@lottiefiles/dotlottie-react` | Lottie animations                     |
| React Toastify                 | Toast notifications                   |
| Recharts                       | Charts / Dashboard data visualisation |

### Third-party Integrations

| Library                     | Purpose                          |
| --------------------------- | -------------------------------- |
| `@microsoft/signalr`        | Real-time (Chat + Notifications) |
| `@react-oauth/google`       | Google OAuth2 Login              |
| `react-google-recaptcha`    | reCAPTCHA v2                     |
| `@google/genai`             | Google Gemini AI                 |
| `@n8n/chat`                 | n8n chatbot widget               |
| `jspdf` + `jspdf-autotable` | PDF export                       |
| `xlsx`                      | Excel export                     |
| `zxing`                     | QR Code scanner                  |
| `date-fns`                  | Date utilities                   |
| `react-joyride`             | Guided onboarding tour           |

### Dev & Tooling

| Tool                                           | Purpose                                  |
| ---------------------------------------------- | ---------------------------------------- |
| Husky + lint-staged                            | Git hooks (auto lint/format on commit)   |
| ESLint 9                                       | Linting (react-hooks, a11y, import-sort) |
| Prettier                                       | Code formatting                          |
| Commitlint + Commitizen                        | Conventional commits enforcement         |
| Jest + `@testing-library`                      | Unit tests                               |
| Playwright                                     | End-to-end tests                         |
| `rollup-plugin-visualizer`                     | Bundle analysis                          |
| `vite-plugin-pwa`                              | Progressive Web App support              |
| `vite-plugin-compression`                      | Brotli + Gzip output compression         |
| `@vercel/analytics` + `@vercel/speed-insights` | Vercel monitoring                        |

---

## 📁 Project Structure

```
AuraEyes_FE/
├── public/                     # Static assets
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root component + router
│   ├── provider.tsx            # AppProvider (QueryClient, Google OAuth, Theme, SignalR)
│   │
│   ├── features/               # Feature modules (core)
│   │   ├── auth/               # Login, registration, 2FA, Google login
│   │   ├── patient/            # Dashboard, AI screening, booking, wallet, doctors, ...
│   │   ├── ophthalmologist/    # Dashboard, appointments, slots, screening review, wallet, ...
│   │   ├── organisation/       # Dashboard, patients, calendar, screening, contracts, ...
│   │   ├── system-admin/       # Full system administration
│   │   ├── consultation/       # Chat + consultation sessions (API + hooks)
│   │   ├── professional-network/ # Doctor network, posts
│   │   ├── notifications/      # Notification centre
│   │   └── guest/              # Public pages (landing, about, ...)
│   │
│   ├── components/
│   │   ├── layouts/            # Layout wrappers (patient, doctor, org, admin)
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
│   │   ├── endpoints.ts        # All API endpoint constants
│   │   ├── react-query.ts      # QueryClient configuration
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
│   │   ├── i18n.ts             # i18next configuration
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

### Internal Feature Structure

```
src/features/<feature>/
├── api/          # TanStack Query hooks (useQuery, useMutation) + API calls
├── components/   # Feature-specific UI components
├── hooks/        # Feature-specific hooks
├── pages/        # Page components (1:1 mapping with routes)
├── types/        # TypeScript interfaces & types
├── schemas/      # Yup validation schemas (if applicable)
├── stores/       # Feature-level Zustand stores (if applicable)
├── lib/          # Feature-local utilities
├── utils/        # Helper functions
└── index.ts      # Public exports
```

---

## 🗂 Feature Modules

### 👤 Auth (`/features/auth`)

- Login (email/password + Google OAuth2)
- Account registration
- Email verification (OTP)
- Forgot password / Reset password
- Two-Factor Authentication (2FA)
- reCAPTCHA v2

### 🧑‍⚕️ Patient (`/features/patient`) — 20 pages

| Page                       | Description                           |
| -------------------------- | ------------------------------------- |
| `dashboard.tsx`            | Health overview and screening history |
| `screening.tsx`            | AI screening history list             |
| `screening-new.tsx`        | Start a new screening session         |
| `retinal-analysis.tsx`     | AI-powered retinal image analysis     |
| `analysis-detail.tsx`      | Detailed analysis result              |
| `roadmap.tsx`              | AI-generated treatment roadmap        |
| `doctors.tsx`              | Search & view doctor profiles         |
| `book-appointment.tsx`     | Book an appointment with a doctor     |
| `booking-confirmation.tsx` | Appointment booking confirmation      |
| `appointments.tsx`         | My appointments                       |
| `clinics.tsx`              | Clinics / organisations listing       |
| `wallet.tsx`               | Digital wallet & transaction history  |
| `payment-callback.tsx`     | PayOS payment callback handler        |
| `chat.tsx`                 | Chat with doctor (SignalR)            |
| `review.tsx`               | Post-consultation review              |
| `profile.tsx`              | Patient personal profile              |
| `settings.tsx`             | Account settings                      |
| `notifications.tsx`        | Notifications                         |
| `help-feedback.tsx`        | Help & Feedback                       |

### 👁 Ophthalmologist (`/features/ophthalmologist`) — 15 pages

| Page                                  | Description                            |
| ------------------------------------- | -------------------------------------- |
| `dashboard.tsx`                       | Activity overview                      |
| `appointments.tsx`                    | Appointment management                 |
| `slot-management.tsx`                 | Appointment slot management            |
| `schedules.tsx`                       | Work schedule templates                |
| `leave-requests.tsx`                  | Leave requests                         |
| `screenings.tsx`                      | Screenings pending review              |
| `screening-review.tsx`                | Review & annotate AI screening results |
| `patients.tsx`                        | My patient list                        |
| `ConsultationsChatView.tsx`           | Online consultation chat view          |
| `consultations.tsx`                   | Consultation session list              |
| `wallet.tsx`                          | Wallet & earnings                      |
| `contract.tsx`                        | Employment contract                    |
| `employment-type-change-requests.tsx` | Employment type change requests        |
| `settings.tsx`                        | Profile & certifications               |

### 🏥 Organisation (`/features/organisation`) — 14 pages

| Page                   | Description                       |
| ---------------------- | --------------------------------- |
| `dashboard.tsx`        | Organisation overview             |
| `analytics.tsx`        | Data analytics & metrics          |
| `patients.tsx`         | Organisation patients             |
| `patient-history.tsx`  | Patient medical history           |
| `screening.tsx`        | Organisation-conducted screenings |
| `screening-result.tsx` | Screening results (PDF export)    |
| `reports.tsx`          | Summary reports                   |
| `calendar.tsx`         | Organisation work calendar        |
| `slot-management.tsx`  | Slot management                   |
| `wallet.tsx`           | Financial management              |
| `contract.tsx`         | Doctor contracts                  |
| `settings.tsx`         | Organisation settings             |

### 🔧 System Admin (`/features/system-admin`) — 18 pages

| Page                                  | Description                           |
| ------------------------------------- | ------------------------------------- |
| `dashboard.tsx`                       | System-wide analytics dashboard       |
| `ophthalmologists.tsx`                | Doctor management & verification      |
| `organisations.tsx`                   | Organisation management & onboarding  |
| `patients.tsx`                        | Patient management                    |
| `users.tsx`                           | All accounts management               |
| `permissions.tsx`                     | RBAC — granular permission management |
| `verification-requests.tsx`           | Doctor verification requests          |
| `employment-type-change-requests.tsx` | Employment contract change approvals  |
| `leave-requests.tsx`                  | Leave request approvals               |
| `contracts.tsx`                       | All contracts                         |
| `contract-templates.tsx`              | Contract templates                    |
| `contract-template-editor.tsx`        | Contract template editor              |
| `cashflow.tsx`                        | System cash flow                      |
| `withdrawal-requests.tsx`             | Withdrawal request approvals          |
| `audit-logs.tsx`                      | System audit logs                     |
| `settings.tsx`                        | System configuration                  |
| `status.tsx`                          | System status (BetterStack embed)     |

### 🌐 Professional Network (`/features/professional-network`)

- Doctor post feed
- Create / edit posts
- Medical professional network interactions

### 💬 Consultation (`/features/consultation`)

- API hooks for consultation sessions
- Real-time chat via SignalR

---

## 🗃 State Management

### Zustand Stores

| Store                     | Contents                                                          |
| ------------------------- | ----------------------------------------------------------------- |
| `auth-store.ts`           | `user`, `accessToken`, `refreshToken`, `roles`, `isAuthenticated` |
| `global-store.ts`         | Global UI flags                                                   |
| `useNotificationStore.ts` | Real-time notification list, badge count                          |
| `useLanguageStore.ts`     | Current locale (vi/en)                                            |

### TanStack Query

- All **server state** (lists, details, pagination) handled via `useQuery`
- All **mutations** (create, update, delete) handled via `useMutation` + `invalidateQueries`
- `QueryClient` configured centrally at `src/lib/react-query.ts`

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
    │   lib/axios.ts  (Axios instance with Base URL)
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

### Route Structure (`src/routes/index.tsx`)

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

| Component      | Description                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `PrivateRoute` | Checks `isAuthenticated` + role from `auth-store`. Redirects to `/auth/login` if not authenticated |
| `PublicRoute`  | Redirects to dashboard if already authenticated                                                    |

### Permission Hook

`usePermissions` — reads granular permissions from JWT claims, used to show/hide UI elements.

---

## ⚡ Real-time (SignalR)

Automatically initialised when the user is authenticated, via `SignalRProvider` inside `AppProvider`.

| Hook                     | Hub               | Function                             |
| ------------------------ | ----------------- | ------------------------------------ |
| `useSignalRNotification` | `NotificationHub` | Receive real-time push notifications |
| `useSignalRChat`         | `ChatHub`         | Chat between patient ↔ doctor        |

**Connection:** JWT token is passed via `?access_token=...` query string when establishing the WebSocket connection.

---

## 🌍 Internationalization (i18n)

- **Libraries**: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- **Supported languages**: `vi` (Vietnamese) · `en` (English)
- **Type-safe keys**: `npm run i18n:types` auto-generates `messages.generated.d.ts`
- **Safe hook**: `useSafeTranslation` wrapper prevents undefined key errors

```bash
# Regenerate TypeScript types for i18n keys
npm run i18n:types

# Audit unused i18n keys in the patient feature
npm run i18n:audit:patient
```

---

## 🏗 Build & Performance

### Vite Build Optimisations

| Feature             | Details                                               |
| ------------------- | ----------------------------------------------------- |
| **Compiler**        | SWC (replaces Babel, ~5–20x faster)                   |
| **Code splitting**  | Manual chunks: `react-core`, `ui-icons`, `n8n-widget` |
| **CSS split**       | `cssCodeSplit: true`                                  |
| **Compression**     | Brotli (`.br`) + Gzip (`.gz`) for assets > 10KB       |
| **Console strip**   | `drop: ['console', 'debugger']` in production         |
| **PWA**             | `vite-plugin-pwa` — service worker + offline support  |
| **Bundle analysis** | `dist/stats.html` (Rollup Visualizer)                 |
| **Path alias**      | `@/` → `src/`                                         |

### Dev Server

```
Dev port:      3000
Preview port:  8080
```

---

## ⚙️ Environment Configuration

```bash
cp .env.example .env
```

```env
# Backend API URL
VITE_API_END_POINT=https://api.auraeyes.site

# Google reCAPTCHA v2 Site Key
VITE_RECAPTCHA_SITE_KEY=

# Google OAuth2 Client ID
VITE_GOOGLE_CLIENT_ID=
```

---

## 💻 Running Locally

### Requirements

- Node.js ≥ 18
- npm ≥ 9 (or pnpm / yarn)

```bash
# 1. Clone the repository
git clone https://github.com/AuraEyesOrg/AuraEyes_FE.git
cd AuraEyes_FE

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Fill in VITE_API_END_POINT, VITE_RECAPTCHA_SITE_KEY, VITE_GOOGLE_CLIENT_ID

# 4. Start dev server
npm run dev
# → http://localhost:3000

# 5. Build for production
npm run build

# 6. Preview production build
npm run preview
# → http://localhost:8080
```

---

## 📜 Scripts

| Script                                 | Description                                         |
| -------------------------------------- | --------------------------------------------------- |
| `npm run dev`                          | Start dev server (port 3000)                        |
| `npm run dev:test`                     | Dev server in test mode (port 3001)                 |
| `npm run build`                        | TypeScript check → generate i18n types → Vite build |
| `npm run preview`                      | Preview production build                            |
| `npm run lint`                         | Run ESLint across the entire project                |
| `npm run lint:fix`                     | Auto-fix lint errors                                |
| `npm run format`                       | Prettier format all files                           |
| `npm run test`                         | Run Jest unit tests                                 |
| `npm run test:e2e`                     | Run all Playwright E2E tests                        |
| `npm run test:e2e:module:auth`         | E2E — Auth module                                   |
| `npm run test:e2e:module:screening`    | E2E — Screening module                              |
| `npm run test:e2e:module:consultation` | E2E — Consultation module                           |
| `npm run test:e2e:module:wallet`       | E2E — Wallet module                                 |
| `npm run test:e2e:module:booking`      | E2E — Booking module                                |
| `npm run test:e2e:round1`              | E2E tests tagged `@round-1`                         |
| `npm run test:e2e:ui`                  | Playwright UI mode                                  |
| `npm run i18n:types`                   | Generate TypeScript types for i18n keys             |
| `npm run commit`                       | Commitizen (conventional commits)                   |
| `npm run release`                      | standard-version (changelog + version tag)          |

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
# All tests
npm run test:e2e

# Run by module
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

Deployed on **Vercel** with `vercel.json` configured as an SPA (all routes rewrite to `index.html`).

Monitoring: **Vercel Analytics** + **Vercel Speed Insights** are built-in.

---

_© 2026 AuraEyes Team — SEP490 · FPT University_
