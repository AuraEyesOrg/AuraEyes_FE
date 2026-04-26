# AURA — Ophthalmologist Onboarding & Verification Flow

> Tài liệu này mô tả **toàn bộ vòng đời tài khoản bác sĩ nhãn khoa**, từ khi điền form đăng ký cho đến khi được Admin duyệt và có thể nhận ca bệnh. Mỗi bước đều có trích dẫn file code thực tế.

---

## 1. Tổng quan — State Machine

```
[Guest]
   │  POST /api/auth/register/ophthalmologist
   ▼
[AccountCreated]
   • ApplicationUser.EmailConfirmed = false
   • Ophthalmologist.VerificationStatus = PendingVerification
   • Ophthalmologist.IsVerified = false
   │
   │  GET /api/auth/confirm-email?userId=...&token=...
   ▼
[EmailConfirmed]
   • ApplicationUser.EmailConfirmed = true
   • Có thể đăng nhập, NHƯNG tính năng bị giới hạn
   │
   │  POST /api/system-admin/ophthalmologists/{id}/verify  { approve: true }
   ▼
[Approved — Fully Active]                       [Rejected]
   • IsVerified = true                           • IsVerified = false
   • VerificationStatus = Approved              • VerificationStatus = Rejected
   • Nhận được ca bệnh, tư vấn                 • RejectionReason được set
                                                 • Có thể resubmit hồ sơ
```

---

## 2. Phase 1 — Đăng ký tài khoản

### 2.1 Frontend Form

**Route:** `/register/doctor`
**File:** `src/features/auth/pages/register-doctor.tsx`

| Field             | Validation               | Ghi chú                           |
| ----------------- | ------------------------ | --------------------------------- |
| Email             | Required, email format   | Unique trong hệ thống             |
| Password          | Min 8 ký tự              |                                   |
| ConfirmPassword   | Phải khớp với Password   |                                   |
| FullName          | Required, max 200 ký tự  |                                   |
| Phone             | Optional, phone format   |                                   |
| Bio               | Optional, max 2000 ký tự |                                   |
| YearsOfExperience | Range 0–70               | Default 0                         |
| OrganizationId    | Optional Guid            | Nếu bác sĩ thuộc 1 clinic         |
| LicenseImage      | Optional file            | PDF/JPG/PNG — chứng chỉ hành nghề |
| DegreeImage       | Optional file            | PDF/JPG/PNG — bằng chuyên khoa    |

**API call từ FE:**

```
POST /api/auth/register/ophthalmologist
Content-Type: multipart/form-data
```

**File:** `src/features/auth/api/auth.api.ts`

```ts
// Dùng FormData để gửi kèm file
const formData = new FormData();
// map tất cả fields của RegisterOphthalmologistRequest vào FormData
api.post(API_ENDPOINTS.AUTH.REGISTER_OPHTHALMOLOGIST, formData);
```

---

### 2.2 Backend — Controller

**File:** `src/API/Controllers/AuthController.cs`

```csharp
[HttpPost("register/ophthalmologist")]
[AllowAnonymous]
[Consumes("multipart/form-data")]
public async Task<IActionResult> RegisterOphthalmologist(
    [FromForm] RegisterOphthalmologistRequest request,
    CancellationToken cancellationToken)
```

- Nhận `[FromForm]` (không phải `[FromBody]`) để xử lý multipart/form-data với file uploads.
- Delegate toàn bộ xuống `IAuthService.RegisterOphthalmologistAsync(...)`.
- Trả về `RegisterResponse { UserId, Email, Message }`.

---

### 2.3 Backend — DTO Validation

**File:** `src/Application/Common/Models/Auth/AuthDtos.cs`

```csharp
public class RegisterOphthalmologistRequest
{
    [Required][EmailAddress]    public string Email;
    [Required][MinLength(8)]    public string Password;
    [Required][Compare("Password")] public string ConfirmPassword;
    [Required][MaxLength(200)]  public string FullName;
    [Phone]                     public string? Phone;
                                public string? Bio;
    [Range(0, 70)]              public int YearsOfExperience;
                                public Guid? OrganizationId;
                                public IFormFile? LicenseImage;
                                public IFormFile? DegreeImage;
}
```

---

### 2.4 Backend — AuthService (core logic)

**File:** `src/Infrastructure/Identity/AuthService.cs` → method `RegisterOphthalmologistAsync`

**Transaction flow (atomic):**

```
1. Kiểm tra email chưa tồn tại
      → GetUserByEmailAsync() → nếu tồn tại trả Failure

2. BeginTransactionAsync()

3. Tạo ApplicationUser
      UserManager.CreateAsync(user, password)
      Fields: Email, FullName, OrganizationId

4. Gán role "Ophthalmologist"
      IIdentityService.AddToRoleAsync(userId, Roles.Ophthalmologist)

5. Upload files lên Supabase S3 (nếu có)
      LicenseImage → IFileStorageService.SaveFileAsync(stream, fileName, "credentials/{userId}")
      DegreeImage  → IFileStorageService.SaveFileAsync(stream, fileName, "credentials/{userId}")
      Track uploaded URLs vào List<string> uploadedFileUrls (dùng cho compensating rollback)

6. Tạo Ophthalmologist profile
      new Ophthalmologist(userId, bio, yearsOfExperience, phone, licenseUrl, degreeUrl)
      → VerificationStatus = PendingVerification, IsVerified = false (trong constructor)
      IRepository<Ophthalmologist>.AddAsync(ophthalmologist)

7. SaveChangesAsync()

8. CommitTransactionAsync()
      ✅ DB đã commit, không thể rollback DB nữa

9. [Best-effort] Gửi email xác nhận
      GenerateEmailConfirmationTokenAsync()
      confirmationLink = "{baseUrl}?userId={id}&token={encodedToken}"
      IEmailService.SendEmailConfirmationAsync(email, link)
      → NẾU lỗi: chỉ log warning, KHÔNG rollback (DB đã commit)

ON EXCEPTION (bất kỳ bước nào trước commit):
   RollbackTransactionAsync()
   + foreach uploadedFileUrls → IFileStorageService.DeleteFile(url)  [compensating action]
```

**⚠️ Lưu ý quan trọng:**

- Files được upload lên S3 **trước** khi commit DB. Nếu DB commit thất bại → cần xoá file S3 (compensating rollback).
- Email được gửi **sau** khi commit DB. Nếu email lỗi → **không** rollback DB — tài khoản vẫn được tạo, cần resend confirmation thủ công.

---

### 2.5 Domain Entity

**File:** `src/Domain/Entities/Users/Ophthalmologist.cs`

```csharp
public class Ophthalmologist : BaseEntity, IAggregateRoot
{
    public Guid UserId { get; private set; }
    public string? Bio { get; private set; }
    public string? Phone { get; private set; }
    public int YearsOfExperience { get; private set; }
    public bool IsVerified { get; private set; }              // false khi mới tạo
    public VerificationStatus VerificationStatus { get; private set; } // = PendingVerification
    public string? LicenseUrl { get; private set; }           // Supabase S3 URL
    public string? DegreeUrl { get; private set; }            // Supabase S3 URL
    public string? RejectionReason { get; private set; }
    public IReadOnlyCollection<Certificate> Certificates { get; }

    // Domain methods:
    public void Verify()   // → IsVerified = true, Status = Approved
    public void Reject(string? reason) // → IsVerified = false, Status = Rejected, set RejectionReason
    public void Unverify() // → IsVerified = false, Status = PendingVerification (dùng khi cần re-review)
    public void UpdateCredentialFiles(string? licenseUrl, string? degreeUrl)
}
```

---

## 3. Phase 2 — Xác nhận Email

**Endpoint:** `GET /api/auth/confirm-email?userId={guid}&token={urlEncodedToken}`
**File:** `src/API/Controllers/AuthController.cs` → `ConfirmEmail()`

**Flow:**

```
1. Parse userId từ string → Guid
2. GetUserByIdAsync(userId) → nếu không tồn tại → 404
3. IIdentityService.ConfirmEmailAsync(userId, token)
      → UserManager.ConfirmEmailAsync(user, decodedToken)
      → Set ApplicationUser.EmailConfirmed = true
4. Trả về 200 "Email confirmed successfully. You can now login."
```

**FE page:** `src/features/auth/pages/confirm-email.tsx`

- Đọc `userId` và `token` từ URL query params
- Gọi API confirm
- Hiển thị thành công → redirect `/login`

**Login gate:**

```csharp
// AuthService.LoginAsync()
if (!user.EmailConfirmed)
    return Result<LoginResponse>.Unauthorized("Please confirm your email before logging in.");
```

→ Bác sĩ **không thể đăng nhập** trước khi confirm email.

---

## 4. Phase 3 — Admin Verification

### 4.1 Admin xem danh sách Pending

**Endpoint:** `GET /api/system-admin/ophthalmologists?status=PendingVerification`
**File:** `src/API/Controllers/SystemAdmin/OphthalmologistsController.cs`

Admin thấy danh sách bác sĩ chờ duyệt, có thể xem:

- Thông tin profile (Bio, YearsOfExperience, Phone)
- Link xem LicenseUrl, DegreeUrl (S3 presigned URLs)

---

### 4.2 Admin duyệt hoặc từ chối

**Endpoint:** `POST /api/system-admin/ophthalmologists/{id}/verify`
**File:** `src/API/Controllers/SystemAdmin/OphthalmologistsController.cs`

**Request body:**

```json
{
  "approve": true, // true = duyệt, false = từ chối
  "rejectionReason": "" // bắt buộc nếu approve = false
}
```

**Command:** `VerifyOphthalmologistCommand { OphthalmologistId, Approve, RejectionReason }`
**Handler:** `src/Application/SystemAdmin/Ophthalmologists/Commands/VerifyOphthalmologist/VerifyOphthalmologistCommandHandler.cs`

```csharp
public async Task<Result<string>> Handle(VerifyOphthalmologistCommand request, ...)
{
    var ophthalmologist = await _repo.GetByIdAsync(request.OphthalmologistId);
    if (ophthalmologist == null) return Result.Failure("Not found");

    if (request.Approve)
        ophthalmologist.Verify();         // IsVerified=true, Status=Approved
    else
        ophthalmologist.Reject(request.RejectionReason);  // IsVerified=false, Status=Rejected

    await _repo.UpdateAsync(ophthalmologist);
    await _unitOfWork.SaveChangesAsync();
    return Result.Success(approve ? "Approved" : "Rejected");
}
```

**Authorization:** Policy `SystemAdminOnly` — chỉ SystemAdmin mới gọi được endpoint này.

---

### 4.3 Kết quả sau verify

| Hành động Admin | IsVerified | VerificationStatus    | RejectionReason |
| --------------- | ---------- | --------------------- | --------------- |
| Approve         | `true`     | `Approved`            | `null`          |
| Reject          | `false`    | `Rejected`            | Reason text     |
| (Unverify)      | `false`    | `PendingVerification` | `null`          |

---

## 5. Sau khi Approved — Các tính năng mở khoá

Sau khi `IsVerified = true` và `VerificationStatus = Approved`:

1. **Nhận yêu cầu tư vấn** — endpoint `OphthalmologistsController` trả về bác sĩ trong danh sách "available"
2. **Ký hợp đồng hợp tác** — route `/ophthalmologist/consultations`
3. **Đổi trạng thái Available** — nhận ca từ hàng đợi
4. **Xem screenings** — `/ophthalmologist/screenings/:screeningId/review`
5. **Rút tiền thu nhập** từ Wallet

**Authorization tại API:**

```csharp
[Authorize(Policy = Policies.OphthalmologistOnly)]
```

→ Middleware kiểm tra JWT claim `role = "Ophthalmologist"`.
→ **Không** tự động kiểm tra `IsVerified` trong middleware — cần guard ở Application layer nếu muốn chặn bác sĩ chưa verified.

> ⚠️ **Gap cần xem xét:** Hiện tại không có middleware/guard tự động block bác sĩ có `VerificationStatus = Rejected` hoặc `PendingVerification`. Nếu cần, nên thêm check `IsVerified == true` trong các command handler nhận ca bệnh.

---

## 6. Sơ đồ luồng dữ liệu (Data Flow)

```
FE register-doctor.tsx
    │ FormData (multipart)
    ▼
POST /api/auth/register/ophthalmologist  [AuthController]
    │
    ▼
IAuthService.RegisterOphthalmologistAsync  [AuthService.cs]
    │
    ├── UserManager.CreateAsync()           → AspNetUsers table
    ├── AddToRole("Ophthalmologist")        → AspNetUserRoles table
    ├── FileStorageService.SaveFileAsync()  → Supabase S3 (License/Degree)
    ├── Repository<Ophthalmologist>.Add()   → Ophthalmologists table
    └── EmailService.SendConfirmation()     → Email provider

    [User clicks email link]
GET /api/auth/confirm-email  [AuthController]
    │
    └── UserManager.ConfirmEmailAsync()     → AspNetUsers.EmailConfirmed = true

    [User logs in]
POST /api/auth/login  [AuthController]
    │
    └── GenerateAccessToken() → JWT with role claims + profile_id claim

    [System Admin reviews pending list]
GET /api/system-admin/ophthalmologists?status=PendingVerification

    [System Admin approves/rejects]
POST /api/system-admin/ophthalmologists/{id}/verify  [SystemAdmin/OphthalmologistsController]
    │
    └── VerifyOphthalmologistCommandHandler
            ophthalmologist.Verify()  →  Ophthalmologists table updated
```

---

## 7. File Index (Code References)

| Layer      | File                                                                           | Mục đích                                             |
| ---------- | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| **FE**     | `src/features/auth/pages/register-doctor.tsx`                                  | Registration form UI                                 |
| **FE**     | `src/features/auth/api/auth.api.ts`                                            | `registerOphthalmologist()` — FormData builder       |
| **FE**     | `src/features/auth/pages/confirm-email.tsx`                                    | Email confirmation page                              |
| **API**    | `src/API/Controllers/AuthController.cs`                                        | `POST register/ophthalmologist`, `GET confirm-email` |
| **API**    | `src/API/Controllers/SystemAdmin/OphthalmologistsController.cs`                | `POST {id}/verify`                                   |
| **App**    | `src/Application/Common/Models/Auth/AuthDtos.cs`                               | `RegisterOphthalmologistRequest` DTO                 |
| **App**    | `src/Application/Ophthalmologists/Commands/CreateOphthalmologist/`             | CQRS command tạo profile (dùng khi admin tạo thay)   |
| **App**    | `src/Application/SystemAdmin/Ophthalmologists/Commands/VerifyOphthalmologist/` | `VerifyOphthalmologistCommandHandler`                |
| **Infra**  | `src/Infrastructure/Identity/AuthService.cs`                                   | `RegisterOphthalmologistAsync` — toàn bộ logic       |
| **Infra**  | `src/Infrastructure/Identity/IdentityService.cs`                               | `ConfirmEmailAsync`, `AddToRoleAsync`                |
| **Domain** | `src/Domain/Entities/Users/Ophthalmologist.cs`                                 | Entity + domain methods `Verify()`, `Reject()`       |
| **Domain** | `src/Domain/Enums/VerificationStatus.cs`                                       | Enum: `PendingVerification`, `Approved`, `Rejected`  |

---

## 8. Điểm cần xem xét / TODO

### 8.1 Quota cho Organisation vs Patient — chưa đầy đủ

**File:** `src/Infrastructure/Services/AiQuotaService.cs`

```csharp
public async Task<AiQuotaDto> GetQuotaAsync(Guid userId, string role, ...)
{
    if (role == "Patient")      return await GetPatientQuotaAsync(userId);
    if (role == "Ophthalmologist") return await GetContractQuotaAsync(userId);  // ← BUG?
    // KHÔNG có case "Organisation" / "OrgAdmin"
    return new AiQuotaDto { TotalQuota = 0, ... };
}
```

**Vấn đề:**

- `GetContractQuotaAsync` được map vào role `"Ophthalmologist"`, nhưng comment trong code ghi rõ đây là "B2B — Organisation quota".
- Không có case xử lý role `"Organisation"` hoặc `"OrgAdmin"` → Organisation user sẽ nhận về `TotalQuota = 0`.
- **Patient quota** = Free quota (SystemSettings `FREE_AI_QUOTA`) + số bundle đã mua (WalletTransactions `ReferenceType = "AiQuota"`).
- **Organisation quota** = Tổng `AiQuotaLimit` từ các Contract đang active — **chưa được route đúng**.

**Việc cần làm:**

```csharp
// Thêm case mới:
if (role == "Organisation" || role == "OrgAdmin")
    return await GetOrgQuotaAsync(userId, cancellationToken);

// Viết GetOrgQuotaAsync() riêng cho logic B2B contract
```

### 8.2 Missing: Block bác sĩ chưa verified

Hiện không có guard nào ngăn bác sĩ có `VerificationStatus = Rejected` nhận ca bệnh sau khi đã login. Cần thêm check `IsVerified` trong các command handler liên quan.

### 8.3 Missing: Notification khi Admin duyệt/từ chối

`VerifyOphthalmologistCommandHandler` không gửi email thông báo cho bác sĩ. Nên thêm `IEmailService.SendVerificationResultAsync()` sau khi save.
