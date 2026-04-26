# Activity Diagrams (PlantUML)

Sơ đồ Activity dưới đây được ánh xạ từ các Sequence Diagram đã thực hiện trước đó, sử dụng định dạng **PlantUML** với layout dạng swimlane (`|Actor|`).

## 1. Register Patient Account

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam conditionStyle diamond

|Patient|
start
:Submit registration form;

|Web UI|
:Send POST /api/auth/register;

|System API|
:Validate input;

|Database|
:Check if email/phone exists;
if (Exists?) then (Yes)
    |System API|
    :Return 409 Conflict;
    |Web UI|
    :Display Error Message;
    |Patient|
    stop
else (No)
    |Database|
    :Create new Patient record;
    |System API|
    :Return 201 Created;
    |Web UI|
    :Redirect to Login / Show success message;
    |Patient|
    stop
endif
@enduml
```

## 2. Patient Login

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam conditionStyle diamond

|Patient|
start
:Submit credentials (Email + Password);

|Web UI|
:Send POST /api/auth/login;

|System API|
:Validate credentials;

|Database|
:Verify credentials against DB;
if (Valid?) then (No)
    |System API|
    :Return 401 Unauthorized;
    |Web UI|
    :Display Error Message;
    |Patient|
    stop
else (Yes)
    |System API|
    :Generate Access & Refresh Tokens;
    :Return Tokens & User Info (200 OK);
    |Web UI|
    :Redirect to Patient Dashboard;
    |Patient|
    stop
endif
@enduml
```

## 3. Internal Staff Secure Login

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam conditionStyle diamond

|Staff|
start
:Submit credentials (Email + Password);

|Web UI|
:Send POST /api/auth/staff-login;

|System API|
:Validate credentials;

|Database|
:Verify credentials & Check 2FA status;
if (Valid credentials?) then (No)
    |System API|
    :Return 401 Unauthorized;
    |Web UI|
    :Display Error Message;
    |Staff|
    stop
else (Yes)
    |System API|
    :Return 202 Accepted (Prompt for 2FA);
    |Web UI|
    :Display 2FA Input Form;

    |Staff|
    :Submit 2FA Code;

    |Web UI|
    :Send POST /api/auth/verify-2fa;

    |System API|
    :Validate 2FA token;

    |Database|
    :Verify 2FA token;
    if (Token Valid?) then (No)
        |System API|
        :Return 401 Unauthorized;
        |Web UI|
        :Display Error Message;
        |Staff|
        stop
    else (Yes)
        |System API|
        :Generate Access & Refresh Tokens;
        :Return Tokens & Staff Role Info (200 OK);
        |Web UI|
        :Redirect to Staff Dashboard;
        |Staff|
        stop
    endif
endif
@enduml
```

## 4. Manage Internal Accounts & RBAC Policies

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam conditionStyle diamond

|Admin|
start
:Submit Create/Update Staff Account\n& Assign Role;

|Web UI|
:Send POST/PUT /api/admin/staff;

|System API|
:Verify Admin Permissions (RBAC Check);
if (Has Permission?) then (No)
    :Return 403 Forbidden;
    |Web UI|
    :Display Access Denied Error;
    |Admin|
    stop
else (Yes)
    |Database|
    :Create/Update Staff Record;
    :Assign/Update RBAC Policies\n(Roles/Permissions);
    |System API|
    :Return 200 OK / 201 Created;
    |Web UI|
    :Show Success Message & Refresh List;
    |Admin|
    stop
endif
@enduml
```

## 5. 2FA Enable

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam conditionStyle diamond

|User|
start
:Trigger Enable 2FA button;

|Web UI|
:Send POST /api/auth/2fa/enable;

|System API|
:Process 2FA setup;

|Database|
:Update 2FA Secret & Status;

|System API|
if (Successful?) then (Yes)
    :Return 200 OK\n(QR Code & Recovery Codes);
    |Web UI|
    :Display QR Code for\nAuthenticator App;
    |User|
    stop
else (No)
    |System API|
    :Return Error (400/401/500);
    |Web UI|
    :Display Error Message;
    |User|
    stop
endif
@enduml
```

## 6. Forgot Password

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam conditionStyle diamond

|User|
start
:Submit email on Forgot Password form;

|Web UI|
:Send POST /api/auth/forgot-password;

|System API|
:Process request;

|Database|
:Find user by email;
if (User Found?) then (Yes)
    :Save Password Reset Token;
    |System API|
    :Send Password Reset Email;
else (No)
    |System API|
    :Proceed silently\n(Security Best Practice);
endif

|System API|
:Return 200 OK;
|Web UI|
:Show "Email Sent" message;
|User|
stop
@enduml
```

## 7. Change Password

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam conditionStyle diamond

|User|
start
:Submit current & new password;

|Web UI|
:Send PUT /api/auth/change-password;

|System API|
:Process request;

|Database|
:Verify current password;
if (Password Correct?) then (No)
    |System API|
    :Return 401 Unauthorized;
    |Web UI|
    :Display Authentication Error;
    |User|
    stop
else (Yes)
    |Database|
    :Update to new password;
    |System API|
    :Return 200 OK;
    |Web UI|
    :Show "Password Changed" message;
    |User|
    stop
endif
@enduml
```

## 8. Manage Patient Profile

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam conditionStyle diamond

|Patient|
start
:Submit updated profile information;

|Web UI|
:Send PUT /api/patients/{id}/profile;

|System API|
:Validate input;

|Database|
:Execute SQL transaction\n(Update patient data);
if (Successful?) then (Yes)
    |System API|
    :Return 200 OK;
    |Web UI|
    :Display success response;
    |Patient|
    stop
else (No)
    |System API|
    :Return Error (400/401/403/404);
    |Web UI|
    :Display Error Message;
    |Patient|
    stop
endif
@enduml
```

## 9. Manage Ophthalmologist Profile

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam conditionStyle diamond

|Ophthalmologist|
start
:Submit updated profile information;

|Web UI|
:Send PUT /api/ophthalmologists/{id}/profile;

|System API|
:Validate input;

|Database|
:Execute SQL transaction\n(Update ophthalmologist data);
if (Successful?) then (Yes)
    |System API|
    :Return 200 OK;
    |Web UI|
    :Display success response;
    |Ophthalmologist|
    stop
else (No)
    |System API|
    :Return Error (400/401/403/404);
    |Web UI|
    :Display Error Message;
    |Ophthalmologist|
    stop
endif
@enduml
```

## 10. Submit Leave of Absence Request

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam conditionStyle diamond

|Ophthalmologist|
start
:Submit leave of absence request form;

|Web UI|
:Send POST /api/leave-requests;

|System API|
:Validate input & constraints;

|Database|
:Execute SQL transaction\n(Insert leave request);
if (Successful?) then (Yes)
    |System API|
    :Return 201 Created;
    |Web UI|
    :Display success response;
    |Ophthalmologist|
    stop
else (No)
    |System API|
    :Return Error (400/401/403/500);
    |Web UI|
    :Display Error Message;
    |Ophthalmologist|
    stop
endif
@enduml
```

## 11. Process Leave of Absence Request

```plantuml
@startuml
skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam conditionStyle diamond

|Admin|
start
:Trigger Approve/Reject action;

|Web UI|
:Send PUT /api/leave-requests/{id}/status;

|System API|
:Validate Admin privileges;

|Database|
:Update request status;
:Cancel/Reschedule related appointments if needed;
if (Successful?) then (Yes)
    |System API|
    :Return 200 OK;
    |Web UI|
    :Display success response;
    |Admin|
    stop
else (No)
    |System API|
    :Return Error (400/401/403/404/500);
    |Web UI|
    :Display Error Message;
    |Admin|
    stop
endif
@enduml
```
