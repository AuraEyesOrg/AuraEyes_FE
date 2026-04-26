import json

data = [
    # 3.1 Authentication & Authorization
    {"id": "3.1.1", "title": "Register Patient Account", "method": "POST", "endpoint": "/api/auth/register", "actor": "Patient", "controller": "AuthController", "iservice": "IAuthService", "service": "AuthService", "action": "RegisterAsync"},
    {"id": "3.1.2", "title": "Patient Login (Standard & OAuth 2.0)", "method": "POST", "endpoint": "/api/auth/login", "actor": "Patient", "controller": "AuthController", "iservice": "IAuthService", "service": "AuthService", "action": "LoginAsync"},
    {"id": "3.1.3", "title": "Internal Staff Secure Login", "method": "POST", "endpoint": "/api/auth/staff-login", "actor": "Staff", "controller": "AuthController", "iservice": "IAuthService", "service": "AuthService", "action": "StaffLoginAsync"},
    {"id": "3.1.4", "title": "Manage Internal Accounts & RBAC Policies", "method": "PUT", "endpoint": "/api/system-admin/accounts/{accountId}", "actor": "SystemAdmin", "controller": "ClinicStaffController", "iservice": "IClinicStaffService", "service": "ClinicStaffService", "action": "UpdateAccountRolesAsync"},

    # 3.2 User Profile & Leave Management
    {"id": "3.2.1", "title": "Manage Patient Profile", "method": "PUT", "endpoint": "/api/patient-profile/{id}", "actor": "Patient", "controller": "PatientProfileController", "iservice": "IPatientProfileService", "service": "PatientProfileService", "action": "UpdateProfileAsync"},
    {"id": "3.2.2", "title": "Manage Ophthalmologist Profile", "method": "PUT", "endpoint": "/api/ophthalmologists/{id}/profile", "actor": "Ophthalmologist", "controller": "OphthalmologistsController", "iservice": "IOphthalmologistService", "service": "OphthalmologistService", "action": "UpdateProfileAsync"},
    {"id": "3.2.3", "title": "Submit Leave of Absence Request", "method": "POST", "endpoint": "/api/schedule-templates/leave-requests", "actor": "Ophthalmologist", "controller": "ScheduleTemplatesController", "iservice": "IScheduleTemplateService", "service": "ScheduleTemplateService", "action": "SubmitLeaveRequestAsync"},
    {"id": "3.2.4", "title": "Process Leave of Absence Request", "method": "PUT", "endpoint": "/api/system-admin/leave-requests/{id}/process", "actor": "SystemAdmin", "controller": "SystemSettingsController", "iservice": "ISystemSettingService", "service": "SystemSettingService", "action": "ProcessLeaveRequestAsync"},

    # 3.3 Appointment & Scheduling Management
    {"id": "3.3.1", "title": "Schedule Online Appointment & Pay Deposit", "method": "POST", "endpoint": "/api/clinic-appointments/online", "actor": "Patient", "controller": "ClinicAppointmentsController", "iservice": "IAppointmentService", "service": "AppointmentService", "action": "ScheduleOnlineAsync"},
    {"id": "3.3.2", "title": "Register Walk-in Patient", "method": "POST", "endpoint": "/api/clinic-appointments/walk-in", "actor": "ClinicStaff", "controller": "ClinicAppointmentsController", "iservice": "IAppointmentService", "service": "AppointmentService", "action": "RegisterWalkInAsync"},
    {"id": "3.3.3", "title": "Verify Online Booking Check-in", "method": "PUT", "endpoint": "/api/clinic-appointments/{id}/check-in", "actor": "ClinicStaff", "controller": "ClinicAppointmentsController", "iservice": "IAppointmentService", "service": "AppointmentService", "action": "VerifyCheckInAsync"},
    {"id": "3.3.4", "title": "Manage Daily Appointment Schedules", "method": "GET", "endpoint": "/api/appointment-slots", "actor": "ClinicStaff", "controller": "AppointmentSlotsController", "iservice": "IAppointmentSlotService", "service": "AppointmentSlotService", "action": "GetDailySchedulesAsync"},

    # 3.4 Clinical Operations & AI Integration
    {"id": "3.4.1", "title": "Route Patient Cases", "method": "PUT", "endpoint": "/api/screenings/{id}/route", "actor": "ClinicStaff", "controller": "ScreeningsController", "iservice": "IScreeningService", "service": "ScreeningService", "action": "RouteCaseAsync"},
    {"id": "3.4.2", "title": "Upload Retinal Photo & Trigger AI Analysis", "method": "POST", "endpoint": "/api/screenings/trigger-ai", "actor": "ClinicStaff", "controller": "ScreeningsController", "iservice": "IScreeningService", "service": "ScreeningService", "action": "TriggerAIAnalysisAsync"},
    {"id": "3.4.3", "title": "View AI Screening Results & EMR", "method": "GET", "endpoint": "/api/ophthalmologist-screenings/{id}/results", "actor": "Ophthalmologist", "controller": "OphthalmologistScreeningsController", "iservice": "IScreeningService", "service": "ScreeningService", "action": "GetScreeningResultsAsync"},
    {"id": "3.4.4", "title": "Create Final Medical Diagnosis", "method": "POST", "endpoint": "/api/ophthalmologist-screenings/{id}/diagnosis", "actor": "Ophthalmologist", "controller": "OphthalmologistScreeningsController", "iservice": "IScreeningService", "service": "ScreeningService", "action": "CreateDiagnosisAsync"},
    {"id": "3.4.5", "title": "Customize Patient Health Roadmap", "method": "POST", "endpoint": "/api/patient-roadmaps", "actor": "Ophthalmologist", "controller": "PatientRoadmapsController", "iservice": "IPatientRoadmapService", "service": "PatientRoadmapService", "action": "CreateRoadmapAsync"},

    # 3.5 Financial & Checkout Operations
    {"id": "3.5.1", "title": "Settle Final Payment & Complete Transaction", "method": "POST", "endpoint": "/api/financial/checkout", "actor": "ClinicStaff", "controller": "FinancialController", "iservice": "IFinancialService", "service": "FinancialService", "action": "SettlePaymentAsync"},
    {"id": "3.5.2", "title": "Configure Clinic Service Pricing", "method": "PUT", "endpoint": "/api/system-settings/pricing", "actor": "SystemAdmin", "controller": "SystemSettingsController", "iservice": "ISystemSettingService", "service": "SystemSettingService", "action": "UpdatePricingAsync"},
    {"id": "3.5.3", "title": "Monitor Clinic Operational & Financial Metrics", "method": "GET", "endpoint": "/api/financial/metrics", "actor": "SystemAdmin", "controller": "FinancialController", "iservice": "IFinancialService", "service": "FinancialService", "action": "GetMetricsAsync"},
    {"id": "3.5.4", "title": "Audit System Activities & Transactions", "method": "GET", "endpoint": "/api/financial/audit", "actor": "SystemAdmin", "controller": "FinancialController", "iservice": "IFinancialService", "service": "FinancialService", "action": "GetAuditLogsAsync"},
    {"id": "3.5.5", "title": "View Patient Transaction History", "method": "GET", "endpoint": "/api/financial/transactions", "actor": "Patient", "controller": "FinancialController", "iservice": "IFinancialService", "service": "FinancialService", "action": "GetTransactionsAsync"},

    # 3.6 Medical Records & Post-Visit Care
    {"id": "3.6.1", "title": "View Patient Medical History", "method": "GET", "endpoint": "/api/patients/{id}/history", "actor": "Patient", "controller": "PatientsController", "iservice": "IPatientService", "service": "PatientService", "action": "GetMedicalHistoryAsync"},
    {"id": "3.6.2", "title": "View & Download Clinical Results", "method": "GET", "endpoint": "/api/patient-roadmaps/{id}/download", "actor": "Patient", "controller": "PatientRoadmapsController", "iservice": "IPatientRoadmapService", "service": "PatientRoadmapService", "action": "DownloadResultsAsync"},
    {"id": "3.6.3", "title": "Initiate Post-Visit Follow-up Chat", "method": "POST", "endpoint": "/api/consultation-sessions", "actor": "Patient", "controller": "ConsultationSessionsController", "iservice": "IConsultationSessionService", "service": "ConsultationSessionService", "action": "InitiateChatAsync"},
    {"id": "3.6.4", "title": "Respond to Post-Visit Follow-up Chat", "method": "POST", "endpoint": "/api/consultation-sessions/{id}/messages", "actor": "Ophthalmologist", "controller": "ConsultationSessionsController", "iservice": "IConsultationSessionService", "service": "ConsultationSessionService", "action": "SendMessageAsync"},

    # 3.7 Internal Knowledge Network
    {"id": "3.7.1", "title": "Share Clinical Cases & Internal Chat", "method": "POST", "endpoint": "/api/network/posts", "actor": "Ophthalmologist", "controller": "NetworkController", "iservice": "INetworkService", "service": "NetworkService", "action": "CreatePostAsync"},
    {"id": "3.7.2", "title": "Initiate Peer Video Consultation", "method": "POST", "endpoint": "/api/network/video-calls", "actor": "Ophthalmologist", "controller": "NetworkController", "iservice": "INetworkService", "service": "NetworkService", "action": "InitiateVideoCallAsync"},
    {"id": "3.7.3", "title": "Moderate Internal Network Communications", "method": "PUT", "endpoint": "/api/network/posts/{id}/moderate", "actor": "SystemAdmin", "controller": "NetworkController", "iservice": "INetworkService", "service": "NetworkService", "action": "ModeratePostAsync"},

    # 3.8 System Notification Dispatching
    {"id": "3.8.1", "title": "Dispatch Patient Notifications", "method": "POST", "endpoint": "/api/notifications/patient", "actor": "System", "controller": "NotificationsController", "iservice": "INotificationService", "service": "NotificationService", "action": "DispatchToPatientAsync"},
    {"id": "3.8.2", "title": "Dispatch Ophthalmologist Notifications", "method": "POST", "endpoint": "/api/notifications/ophthalmologist", "actor": "System", "controller": "NotificationsController", "iservice": "INotificationService", "service": "NotificationService", "action": "DispatchToDoctorAsync"},
    {"id": "3.8.3", "title": "Dispatch Clinic Staff Notifications", "method": "POST", "endpoint": "/api/notifications/staff", "actor": "System", "controller": "NotificationsController", "iservice": "INotificationService", "service": "NotificationService", "action": "DispatchToStaffAsync"},
    {"id": "3.8.4", "title": "Dispatch System Admin Notifications", "method": "POST", "endpoint": "/api/notifications/admin", "actor": "System", "controller": "NotificationsController", "iservice": "INotificationService", "service": "NotificationService", "action": "DispatchToAdminAsync"},
]

template = """
### {id} {title}

```mermaid
sequenceDiagram
    title [{method}] {endpoint}
    actor {actor}
    participant UI as :UserInterface
    participant Controller as :{controller}
    participant IService as :{iservice}
    participant Service as :{service}
    participant UoW as :IUnitOfWork
    participant DB as :Database

    {actor}->>UI: 1.1 Trigger action on UI
    activate UI
    UI->>Controller: 2.1 {method} {endpoint}
    activate Controller
    Controller->>IService: 3.1 {action}(...)
    activate IService
    IService->>Service: 3.2 Forward to {service}
    activate Service
    Service->>UoW: 4.1 Open transaction boundary
    activate UoW
    UoW->>DB: 4.2 Execute SQL transaction
    activate DB
    DB-->>UoW: 4.3 Database response
    deactivate DB
    UoW-->>Service: 4.4 Transaction boundary completed
    deactivate UoW

    Service-->>IService: 5.0.1 Success result
    IService-->>Controller: 5.0.2 Success result
    Controller-->>UI: 5.0.3 200 OK with success response

    alt Error Response
        alt Validation Failed
            Service-->>IService: 5.1.1.1 Validation failed
            IService-->>Controller: 5.1.1.2 Validation failed
            Controller-->>UI: 5.1.1.3 400 Bad Request with validation error message
        else Authentication Failed
            Service-->>IService: 5.2.1.1 Authentication failed
            IService-->>Controller: 5.2.1.2 Authentication failed
            Controller-->>UI: 5.2.1.3 401 Unauthorized with authentication failure message
        else Authorization Failed
            Service-->>IService: 5.3.1.1 Authorization failed
            IService-->>Controller: 5.3.1.2 Authorization failed
            Controller-->>UI: 5.3.1.3 403 Forbidden with authorization failure message
        else Resource Not Found
            Service-->>IService: 5.4.1.1 Resource not found
            IService-->>Controller: 5.4.1.2 Resource not found
            Controller-->>UI: 5.4.1.3 404 Not Found with missing resource message
        else Unexpected Server Error
            Service-->>IService: 5.5.1.1 Unexpected server error
            IService-->>Controller: 5.5.1.2 Unexpected server error
            Controller-->>UI: 5.5.1.3 500 Internal Server Error with system error message
        end
    end

    deactivate Service
    deactivate IService
    deactivate Controller
    deactivate UI
```
"""

sections = {
    "3.1": "Authentication & Authorization",
    "3.2": "User Profile & Leave Management",
    "3.3": "Appointment & Scheduling Management",
    "3.4": "Clinical Operations & AI Integration",
    "3.5": "Financial & Checkout Operations",
    "3.6": "Medical Records & Post-Visit Care",
    "3.7": "Internal Knowledge Network",
    "3.8": "System Notification Dispatching"
}

output = "# AuraEyes Sequence Diagrams\n\n"

current_section = ""

for item in data:
    sec = item["id"][:3]
    if sec != current_section:
        current_section = sec
        output += f"## {sec} {sections[sec]}\n"
    
    output += template.format(**item)

with open(r"e:\FPT\SP26_Term9\SEP490\AuraEyes_BE\docs\Mermaid.md", "w", encoding="utf-8") as f:
    f.write(output)

print("Markdown generated successfully.")
