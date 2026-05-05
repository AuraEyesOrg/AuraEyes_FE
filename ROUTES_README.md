# AURA - Hệ Thống Phân Chia Routes và Navbar

## 📁 Cấu Trúc Mới

### 1. **Guest/Customer Pages** (Sau khi login)

📍 Location: `src/pages/guest/`

- ✅ **Dashboard** (`/dashboard`) - Trang chủ với thống kê tổng quan
- ✅ **Screening** (`/screening`) - Upload ảnh võng mạc để phân tích
- ✅ **Reports** (`/reports`) - Xem và tải báo cáo y tế
- ✅ **Appointments** (`/appointments`) - Quản lý lịch hẹn

### 2. **Components Mới**

#### Navbar cho Guest/Customer

📍 `src/components/ui/navbar/guest-navbar.tsx`

**Features:**

- 🎨 Modern design với gradient colors
- 📱 Responsive (mobile menu)
- 🔔 Notification bell
- 👤 User dropdown menu (Profile, Settings, Logout)
- 🎯 Active state cho navigation items

#### Layout cho Guest

📍 `src/components/layouts/guest-layout.tsx`

- Wrapper với navbar
- Clean background (gray-50)
- Max-width container

### 3. **Routes Organization**

```typescript
// ============ PUBLIC ============
/ → Landing page (chưa login)

// ============ AUTH ============
/login
/register
/register-doctor
/confirm-email

// ============ GUEST/CUSTOMER (Sau login) ============
/dashboard → Guest Dashboard
/screening → Screening Page
/reports → Reports Page
/appointments → Appointments Page

// ============ ADMIN ============
/admin/dashboard

// ============ ORGANISATION ============
/organisation/dashboard
/organisation/patients
/organisation/analytics
/organisation/calendar
/organisation/settings

// ============ OPHTHALMOLOGIST ============
(Coming soon...)
```

## 🎨 Design Highlights

### Guest Navbar

- **Logo**: AURA với gradient icon
- **Navigation**: Home, Screening, Reports, Appointments
- **User Menu**: Profile, Settings, Logout
- **Mobile-friendly**: Hamburger menu cho mobile

### Guest Pages

1. **Dashboard**
   - Welcome message
   - Quick stats (4 cards)
   - Recent screenings list
   - Quick actions sidebar
   - Health tips

2. **Screening**
   - Upload retinal images
   - Drag & drop support
   - Image preview
   - AI analysis button
   - Instructions

3. **Reports**
   - List of all medical reports
   - Download & view options
   - Status badges
   - Doctor information

4. **Appointments**
   - Upcoming appointments
   - Past appointments
   - Book new appointment
   - Online/Offline badges
   - Cancel/reschedule options

## 🚀 Usage

### Sau khi login thành công:

```typescript
// Redirect user based on role:
- Guest/Customer → /dashboard
- Admin → /admin/dashboard
- Organisation → /organisation/dashboard
- Ophthalmologist → /ophthalmologist/dashboard
```

### Navigation cho Guest:

```typescript
import { GuestLayout } from '@/components/layouts';

const YourPage = () => {
  return (
    <GuestLayout>
      {/* Your content here */}
    </GuestLayout>
  );
};
```

## 📝 Notes

- ✅ Navbar chỉ hiện cho Guest/Customer sau khi login
- ✅ Admin/Organisation/Ophthalmologist có layout riêng
- ✅ Landing page (/) cho người chưa login
- ✅ Auth pages không có navbar
- ✅ Responsive design cho tất cả pages
- ✅ Modern UI với Tailwind CSS

## 🎯 Next Steps

- [ ] Implement authentication logic
- [ ] Connect to backend API
- [ ] Add role-based route protection
- [ ] Create ophthalmologist layout & pages
- [ ] Add more features to each page
