# USER MANUAL - HUONG DAN NGUOI DUNG THEO WORKFLOW

He thong: Aura FE (React + TypeScript)
Doi tuong: Nguoi dung cuoi va nhom van hanh (Patient, OrgAdmin, Ophthalmologist, SystemAdmin)
Pham vi: Huong dan theo luong su dung thuc te (workflow) thay vi chia theo module

## 1) Ban do workflow tong quan

| Workflow ID | Vai tro                       | Muc tieu                                                  | Route chinh                                                                                 |
| ----------- | ----------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| WF-01       | Tat ca vai tro                | Dang ky, dang nhap, khoi phuc mat khau, bao mat tai khoan | /login, /forgot-password, /reset-password, /two-factor-verify, /force-change-password       |
| WF-02       | Patient                       | Nap tien vi va mua quota                                  | /patient/wallet, /patient/wallet/payment-callback                                           |
| WF-03       | Patient                       | Chay AI screening tu upload den luu ket qua               | /patient/screening/new, /patient/analysis, /patient/analysis/details                        |
| WF-04       | Patient                       | Dat lich tu van online va vao chat                        | /patient/book, /patient/book/confirm, /patient/chat                                         |
| WF-05       | Patient + OrgAdmin            | Dat lich kham offline va xu ly vong doi lich hen          | /patient/clinics, /organisation/calendar                                                    |
| WF-06       | Patient                       | Gui feedback cho he thong va bac si                       | /patient/help-feedback                                                                      |
| WF-07       | OrgAdmin                      | Quan ly benh nhan walk-in va screening tai co so          | /organisation/patients, /organisation/screening, /organisation/screening/result             |
| WF-08       | OrgAdmin                      | Van hanh tai chinh va hop dong to chuc                    | /organisation/wallet, /organisation/billing, /organisation/contract, /organisation/settings |
| WF-09       | Ophthalmologist               | Onboarding tu dang ky den kich hoat hop dong              | /register-doctor, /ophthalmologist/pending-approval, /ophthalmologist/contract              |
| WF-10       | Ophthalmologist               | Review chan doan va share case                            | /ophthalmologist/screenings/:screeningId/review, /ophthalmologist/consultations, /network   |
| WF-11       | SystemAdmin                   | Dieu hanh onboarding, user, payout, settings, audit       | /system-admin/\*                                                                            |
| WF-12       | Vai tro duoc phep vao network | Hop tac tren mang luoi chuyen mon                         | /network/feed, /network/discover, /network/saved                                            |

## 2) Quy tac truy cap va redirect quan trong

1. Nguoi chua dang nhap vao route private se bi dieu huong ve public entry qua PrivateRoute.
2. OrgAdmin co mustChangePassword=true se bat buoc vao /force-change-password truoc khi dung route organisation.
3. Ophthalmologist co PendingVerification se bi dieu huong den /ophthalmologist/pending-approval.
4. Ophthalmologist chua co contractStatus Active se bi dieu huong den /ophthalmologist/contract.
5. Route /network chi cho phep SystemAdmin, Admin, OrgAdmin, Ophthalmologist; Patient bi chan.
6. Da so route ho tro ca dang co locale va khong locale, vi du /:locale/patient/dashboard va /patient/dashboard.

## 3) Huong dan chi tiet theo workflow

### WF-01: Dang nhap, khoi phuc mat khau, bao mat tai khoan

1. Vao /login va dang nhap bang email/password hoac Google.
2. Neu tai khoan bat OTP, tiep tuc tai /two-factor-verify.
3. Neu quen mat khau, vao /forgot-password va hoan tat /reset-password.
4. Neu la OrgAdmin moi va bi yeu cau doi mat khau, hoan tat /force-change-password.

API FE chinh:

1. login
2. googleLogin
3. verifyTwoFactorLogin
4. forgotPassword
5. resetPassword

### WF-02: Nap tien va mua quota (Patient)

1. Vao /patient/wallet va tao lenh nap tien.
2. Hoan tat thanh toan, quay lai /patient/wallet/payment-callback.
3. Xac nhan trang thai thanh toan va so du cap nhat.
4. Mua quota tu so du de san sang cho screening.

API FE chinh:

1. walletApi.createDeposit
2. walletApi.verifyPayment
3. quotaApi.getBalance
4. quotaApi.buy

### WF-03: AI screening end-to-end (Patient)

1. Vao /patient/screening/new va upload anh vong mac.
2. Xac nhan consent va bat dau phan tich.
3. Theo doi ket qua o /patient/analysis va /patient/analysis/details.
4. Luu ket qua AI de tai su dung va doi chieu ve sau.

API FE chinh:

1. uploadRetinalImages
2. createSession
3. agreeScreeningConsent
4. saveAiResults

### WF-04: Dat lich tu van online den chat

1. Vao /patient/book, chon bac si va slot.
2. Dat giu slot va chuyen sang /patient/book/confirm.
3. Xac nhan lich hen de tao consultation context.
4. Chuyen sang /patient/chat de trao doi.

API FE chinh:

1. getAppointmentSlots
2. reserveSlot
3. confirmReservation
4. releaseReservation

### WF-05: Dat lich kham offline va xu ly lich hen

Benh nhan:

1. Vao /patient/clinics.
2. Chon slot tai co so va tao lich hen.
3. Neu can, huy lich truoc gio kham.

To chuc:

1. Vao /organisation/calendar.
2. Day trang thai lich hen qua cac moc check-in, start, complete, no-show.

API FE chinh:

1. createClinicAppointment
2. cancelClinicAppointment
3. checkInClinicAppointment
4. startClinicAppointment
5. completeClinicAppointment
6. markNoShowClinicAppointment

### WF-06: Gui feedback (Patient)

1. Vao /patient/help-feedback.
2. Gui feedback cho website/he thong.
3. Gui feedback cho bac si sau consultation.

API FE chinh:

1. createWebsiteFeedback
2. createOphthalmologistFeedback
3. createOrganisationFeedback

### WF-07: Van hanh walk-in va screening (OrgAdmin)

1. Vao /organisation/patients va tao ho so walk-in.
2. Vao /organisation/screening, upload anh cho benh nhan da chon.
3. Tao screening session va luu ket qua.
4. Vao /organisation/screening/result de chia se bao cao khi can.

API FE chinh:

1. orgWalkInPatientApi.createWalkInPatient
2. orgScreeningApi.uploadImages
3. orgScreeningApi.createSession
4. orgScreeningApi.saveResults
5. orgScreeningApi.shareSessionResult

### WF-08: Tai chinh va hop dong to chuc (OrgAdmin)

1. Vao /organisation/wallet de xem so du va giao dich.
2. Vao /organisation/billing de mua quota.
3. Vao /organisation/contract de xem va upload hop dong da ky.
4. Vao /organisation/settings de cap nhat cau hinh don vi.

API FE chinh:

1. organisationWalletApi.getWallet
2. organisationWalletApi.createDeposit
3. orgBillingApi.buyQuota
4. organisationContractApi.getMyContract
5. organisationContractApi.uploadSignedContract

### WF-09: Onboarding den trang thai active (Ophthalmologist)

1. Dang ky tai /register-doctor.
2. Cho duyet tai /ophthalmologist/pending-approval.
3. Vao /ophthalmologist/contract va upload hop dong da ky.
4. Truy cap /ophthalmologist/dashboard sau khi duyet + contract active.

API FE chinh:

1. registerOphthalmologist
2. contractApi.getMyContract
3. contractApi.uploadSignedContract

### WF-10: Review chan doan va share-case (Ophthalmologist)

1. Vao /ophthalmologist/screenings/:screeningId/review va hoan tat chan doan.
2. Vao /ophthalmologist/consultations de tiep tuc theo case.
3. Chia se ca benh len network voi xac nhan an danh.

API FE chinh:

1. save-results endpoint trong review flow
2. postsApi.createPost
3. postsApi.shareConsultationCase

### WF-11: Dieu hanh he thong (SystemAdmin)

1. Vao /system-admin/organisations va /system-admin/ophthalmologists de duyet onboarding.
2. Vao /system-admin/users de lock/unlock tai khoan.
3. Vao /system-admin/withdrawal-requests de duyet payout.
4. Vao /system-admin/settings de cap nhat chinh sach gia va booking.
5. Vao /system-admin/audit-logs de doi soat audit.

API FE chinh:

1. organisationApi.getOnboardingRequests
2. organisationApi.approveOnboardingRequest
3. ophthalmologistApi.verifyOphthalmologist
4. userApi.lockUser
5. userApi.unlockUser
6. ophthalmologistApi.confirmWithdrawalRequest
7. ophthalmologistApi.rejectWithdrawalRequest
8. ophthalmologistApi.processPayoutViaPayOS
9. ophthalmologistApi.syncPayoutStatus
10. auditApi.getAuditLogs

### WF-12: Hop tac tren professional network

1. Vao /network/feed de dang bai.
2. Vao /network/discover de tim bai viet va doi tac lien quan.
3. Vao /network/saved de quan ly bai da luu.
4. Thuc hien reaction, comment, repost va moderation theo role.

API FE chinh:

1. postsApi.createPost
2. postsApi.toggleReaction
3. postsApi.addComment
4. postsApi.repostPost
5. postsApi.toggleSavePost
6. postsApi.hidePost

## 4) Ghi chu van hanh

1. Khi deploy production nen uu tien route co locale de dam bao nhat quan da ngon ngu.
2. Khi triage loi can luu route, thoi diem, role, va request correlation ID.
3. Workflow share-case va upload tren network phai co xac nhan anonymization truoc khi submit.
4. Sau thao tac payout can sync trang thai de tranh hien thi du lieu cu tren UI.
