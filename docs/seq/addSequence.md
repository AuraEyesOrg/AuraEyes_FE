### Manage Clinic Queue & Route Case to Doctor

#### View Clinic Queue

```mermaid
sequenceDiagram
    title [GET] /api/clinic/queue
    actor Staff as Clinic Staff
    participant UI as :Web UI
    participant API as :System API
    participant DB as :Database

    Staff->>UI: 1.1 Navigate to Clinic Queue page
    activate UI

    UI->>API: 2.1 GET /api/clinic/queue
    activate API

    API->>DB: 3.1 Query cases (CheckedIn, AICompleted)
    activate DB
    DB-->>API: 3.2 Return queue list
    deactivate DB

    API-->>UI: 4.0.1 Return queue data (200 OK)
    UI-->>Staff: 4.0.2 Display Clinic Queue list

    alt Authentication Failed
        API-->>UI: 4.1.1 401 Unauthorized
        UI-->>Staff: 4.1.2 Redirect to login / Display error
    else Authorization Failed
        API-->>UI: 4.2.1 403 Forbidden
        UI-->>Staff: 4.2.2 Display access denied
    else Unexpected Server Error
        API-->>UI: 4.3.1 500 Internal Server Error
        UI-->>Staff: 4.3.2 Display system error
    end

    deactivate API
    deactivate UI
```

#### Route Case to Doctor

```mermaid
sequenceDiagram
    title [PUT] /api/clinic/queue/{caseId}/route
    actor Staff as Clinic Staff
    participant UI as :Web UI
    participant API as :System API
    participant DB as :Database

    Staff->>UI: 1.1 Select Doctor & Trigger "Route Case"
    activate UI

    UI->>API: 2.1 PUT /api/clinic/queue/{caseId}/route
    Note right of UI: Payload: { doctorId }
    activate API

    API->>DB: 3.1 Execute SQL transaction (Update status to SentToDoctor, Assign DoctorId)
    activate DB
    DB-->>API: 3.2 Database response
    deactivate DB

    API-->>UI: 4.0.1 Success result (200 OK)
    UI-->>Staff: 4.0.2 Display success & Refresh Queue

    alt Validation Failed
        API-->>UI: 4.1.1 400 Bad Request with validation error message
        UI-->>Staff: 4.1.2 Display validation error
    else Authentication Failed
        API-->>UI: 4.2.1 401 Unauthorized with authentication failure message
        UI-->>Staff: 4.2.2 Display authentication error
    else Authorization Failed
        API-->>UI: 4.3.1 403 Forbidden with authorization failure message
        UI-->>Staff: 4.3.2 Display authorization error
    else Resource Not Found
        API-->>UI: 4.4.1 404 Not Found with missing resource message
        UI-->>Staff: 4.4.2 Display resource not found error
    else Unexpected Server Error
        API-->>UI: 4.5.1 500 Internal Server Error with system error message
        UI-->>Staff: 4.5.2 Display system error
    end

    deactivate API
    deactivate UI
```

### 3.3.8 Trigger Scheduling Jobs (System Admin)

```mermaid
sequenceDiagram
    title [POST] /api/admin/jobs/trigger
    actor Admin as System Admin
    participant UI as :Web UI
    participant API as :System API
    participant DB as :Database

    Admin->>UI: 1.1 Select Job & Trigger Execution
    activate UI

    UI->>API: 2.1 POST /api/admin/jobs/trigger
    Note right of UI: Payload: { jobId }
    activate API

    API->>DB: 3.1 Log manual job trigger event
    activate DB
    DB-->>API: 3.2 Database response
    deactivate DB

    API-->>UI: 4.0.1 Success result (200 OK)
    UI-->>Admin: 4.0.2 Display success message

    alt Validation Failed
        API-->>UI: 4.1.1 400 Bad Request with validation error message
        UI-->>Admin: 4.1.2 Display validation error
    else Authentication Failed
        API-->>UI: 4.2.1 401 Unauthorized with authentication failure message
        UI-->>Admin: 4.2.2 Display authentication error
    else Authorization Failed
        API-->>UI: 4.3.1 403 Forbidden with authorization failure message
        UI-->>Admin: 4.3.2 Display authorization error
    else Resource Not Found
        API-->>UI: 4.4.1 404 Not Found with missing resource message
        UI-->>Admin: 4.4.2 Display resource not found error
    else Unexpected Server Error
        API-->>UI: 4.5.1 500 Internal Server Error with system error message
        UI-->>Admin: 4.5.2 Display system error
    end

    deactivate API
    deactivate UI
```

### 3.4.5 Clinic Screening Operations

```mermaid
sequenceDiagram
    title [POST] /api/clinic/screenings
    actor Staff as Clinic Staff
    participant UI as :Web UI
    participant API as :System API
    participant DB as :Database

    Staff->>UI: 1.1 Upload Retinal Image & Submit
    activate UI

    UI->>API: 2.1 POST /api/clinic/screenings
    Note right of UI: Payload: { medicalRecordId, imageFile }
    activate API

    API->>DB: 3.1 Insert AiScreenings record & trigger Analysis
    activate DB
    DB-->>API: 3.2 Database response
    deactivate DB

    API-->>UI: 4.0.1 Return analysis results (201 Created)
    UI-->>Staff: 4.0.2 Display AI results & anomalies

    alt Validation Failed
        API-->>UI: 4.1.1 400 Bad Request with validation error message
        UI-->>Staff: 4.1.2 Display validation error
    else Authentication Failed
        API-->>UI: 4.2.1 401 Unauthorized with authentication failure message
        UI-->>Staff: 4.2.2 Display authentication error
    else Authorization Failed
        API-->>UI: 4.3.1 403 Forbidden with authorization failure message
        UI-->>Staff: 4.3.2 Display authorization error
    else Resource Not Found
        API-->>UI: 4.4.1 404 Not Found with missing resource message
        UI-->>Staff: 4.4.2 Display resource not found error
    else Unexpected Server Error
        API-->>UI: 4.5.1 500 Internal Server Error with system error message
        UI-->>Staff: 4.5.2 Display system error
    end

    deactivate API
    deactivate UI
```

### 3.4.8 Create Final Medical Diagnosis & Prescription

```mermaid
sequenceDiagram
    title [PUT] /api/medical-records/{id}/finalize
    actor Doctor as Ophthalmologist
    participant UI as :Web UI
    participant API as :System API
    participant DB as :Database

    Doctor->>UI: 1.1 Input Diagnosis, Prescription & Click "Finalize"
    activate UI

    UI->>API: 2.1 PUT /api/medical-records/{id}/finalize
    Note right of UI: Payload: { diagnosis, prescriptionItems[], prescriptionNote }
    activate API

    API->>DB: 3.1 Execute SQL transaction (Update Medical Record, Insert Prescription)
    activate DB
    DB-->>API: 3.2 Database response
    deactivate DB

    API-->>UI: 4.0.1 Success result (200 OK)
    UI-->>Doctor: 4.0.2 Display success & lock record

    alt Validation Failed
        API-->>UI: 4.1.1 400 Bad Request with validation error message
        UI-->>Doctor: 4.1.2 Display validation error
    else Authentication Failed
        API-->>UI: 4.2.1 401 Unauthorized with authentication failure message
        UI-->>Doctor: 4.2.2 Display authentication error
    else Authorization Failed
        API-->>UI: 4.3.1 403 Forbidden with authorization failure message
        UI-->>Doctor: 4.3.2 Display authorization error
    else Resource Not Found
        API-->>UI: 4.4.1 404 Not Found with missing resource message
        UI-->>Doctor: 4.4.2 Display resource not found error
    else Unexpected Server Error
        API-->>UI: 4.5.1 500 Internal Server Error with system error message
        UI-->>Doctor: 4.5.2 Display system error
    end

    deactivate API
    deactivate UI
```
