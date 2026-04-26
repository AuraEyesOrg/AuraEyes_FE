# Profile & Leave Management Sequence Diagrams

## 3.2.1 Manage Patient Profile

```mermaid
sequenceDiagram
    title [PUT] /api/patients/{id}/profile
    actor Patient
    participant UI as :UserInterface
    participant Controller as :PatientController
    participant IService as :IPatientService
    participant Service as :PatientService
    participant UoW as :IUnitOfWork
    participant DB as :Database

    Patient->>UI: 1.1 Submit updated profile information
    activate UI
    UI->>Controller: 2.1 PUT /api/patients/{id}/profile
    activate Controller
    Controller->>IService: 3.1 UpdateProfileAsync(id, requestDto)
    activate IService
    IService->>Service: 3.2 Forward to PatientService
    activate Service

    Service->>UoW: 4.1 Open transaction boundary
    activate UoW
    UoW->>DB: 4.2 Execute SQL transaction (Update patient data)
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

## 3.2.2 Manage Ophthalmologist Profile

```mermaid
sequenceDiagram
    title [PUT] /api/ophthalmologists/{id}/profile
    actor Ophthalmologist
    participant UI as :UserInterface
    participant Controller as :OphthalmologistController
    participant IService as :IOphthalmologistService
    participant Service as :OphthalmologistService
    participant UoW as :IUnitOfWork
    participant DB as :Database

    Ophthalmologist->>UI: 1.1 Submit updated profile information
    activate UI
    UI->>Controller: 2.1 PUT /api/ophthalmologists/{id}/profile
    activate Controller
    Controller->>IService: 3.1 UpdateProfileAsync(id, requestDto)
    activate IService
    IService->>Service: 3.2 Forward to OphthalmologistService
    activate Service

    Service->>UoW: 4.1 Open transaction boundary
    activate UoW
    UoW->>DB: 4.2 Execute SQL transaction (Update ophthalmologist data)
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

## 3.2.3 Submit Leave of Absence Request

```mermaid
sequenceDiagram
    title [POST] /api/leave-requests
    actor Ophthalmologist
    participant UI as :UserInterface
    participant Controller as :LeaveRequestController
    participant IService as :ILeaveRequestService
    participant Service as :LeaveRequestService
    participant UoW as :IUnitOfWork
    participant DB as :Database

    Ophthalmologist->>UI: 1.1 Submit leave of absence request form
    activate UI
    UI->>Controller: 2.1 POST /api/leave-requests
    activate Controller
    Controller->>IService: 3.1 CreateLeaveRequestAsync(GetCurrentUserId(), requestDto)
    activate IService
    IService->>Service: 3.2 Forward to LeaveRequestService
    activate Service

    Service->>UoW: 4.1 Open transaction boundary
    activate UoW
    UoW->>DB: 4.2 Execute SQL transaction (Insert leave request record)
    activate DB
    DB-->>UoW: 4.3 Database response
    deactivate DB
    UoW-->>Service: 4.4 Transaction boundary completed
    deactivate UoW

    Service-->>IService: 5.0.1 Success result
    IService-->>Controller: 5.0.2 Success result
    Controller-->>UI: 5.0.3 201 Created with success response

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

## 3.2.4 Process Leave of Absence Request

```mermaid
sequenceDiagram
    title [PUT] /api/leave-requests/{id}/status
    actor Admin
    participant UI as :UserInterface
    participant Controller as :LeaveRequestController
    participant IService as :ILeaveRequestService
    participant Service as :LeaveRequestService
    participant UoW as :IUnitOfWork
    participant DB as :Database

    Admin->>UI: 1.1 Trigger Approve/Reject action
    activate UI
    UI->>Controller: 2.1 PUT /api/leave-requests/{id}/status
    activate Controller
    Controller->>IService: 3.1 UpdateLeaveRequestStatusAsync(id, requestDto)
    activate IService
    IService->>Service: 3.2 Forward to LeaveRequestService
    activate Service

    Service->>UoW: 4.1 Open transaction boundary
    activate UoW
    UoW->>DB: 4.2 Execute SQL transaction (Update request status & cancel related appointments if needed)
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
