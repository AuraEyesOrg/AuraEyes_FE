# System Admin API Documentation

## Overview

This document describes the System Admin backend API endpoints for the AuraEyes medical AI platform.  
All endpoints require authentication and the `SystemAdmin` role.

**Base URL:** `/api/system-admin`

**Authorization:** Bearer Token + `SystemAdminOnly` policy

---

## Table of Contents

1. [Dashboard APIs](#dashboard-apis)
2. [Clinics APIs](#clinics-apis)
3. [Users APIs](#users-apis)
4. [AI Models APIs](#ai-models-apis)
5. [Audit Logs APIs](#audit-logs-apis)
6. [Testing Guide](#testing-guide)
7. [Error Handling](#error-handling)

---

## Dashboard APIs

### GET /api/system-admin/dashboard/metrics

Get dashboard overview metrics including screening counts, AI accuracy, and system statistics.

**Screen Reference:** 3.3.1-3.3.4

**Response:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "totalScreeningsToday": 156,
    "totalScreeningsYesterday": 142,
    "screeningsChangePercentage": 9.9,
    "aiAccuracy": 97.5,
    "aiAccuracyChangePercentage": 0.3,
    "pendingReviews": 12,
    "criticalCases": 3,
    "actionRequired": true,
    "totalActiveClinics": 25,
    "totalActiveDevices": 42,
    "totalUsers": 1250,
    "totalPatients": 8500
  }
}
```

---

### GET /api/system-admin/dashboard/screening-trends

Get screening volume trends over time.

**Screen Reference:** 3.3.5

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| timeRange | string | "monthly" | "weekly" or "monthly" |
| periods | int | 12 | Number of periods to include |

**Request:**

```
GET /api/system-admin/dashboard/screening-trends?timeRange=monthly&periods=12
```

**Response:**

```json
{
  "success": true,
  "data": {
    "timeRange": "monthly",
    "dataPoints": [
      { "date": "2024-01-01T00:00:00Z", "label": "Jan 2024", "count": 1250 },
      { "date": "2024-02-01T00:00:00Z", "label": "Feb 2024", "count": 1340 }
    ],
    "totalScreenings": 15680,
    "averagePerPeriod": 1306.7
  }
}
```

---

### GET /api/system-admin/dashboard/risk-analysis

Get population risk analysis data.

**Screen Reference:** 3.3.6

**Response:**

```json
{
  "success": true,
  "data": {
    "riskDistribution": [
      { "riskLevel": "Low", "count": 6500, "percentage": 65.0 },
      { "riskLevel": "Moderate", "count": 2500, "percentage": 25.0 },
      { "riskLevel": "High", "count": 800, "percentage": 8.0 },
      { "riskLevel": "Critical", "count": 200, "percentage": 2.0 }
    ],
    "totalAnalyzed": 10000,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /api/system-admin/dashboard/system-health

Get system health status for all components.

**Screen Reference:** 3.3.7

**Response:**

```json
{
  "success": true,
  "data": {
    "overallStatus": "Healthy",
    "components": [
      {
        "name": "Database",
        "status": "Healthy",
        "latency": 5,
        "lastChecked": "2024-01-15T10:30:00Z"
      },
      {
        "name": "AI Model",
        "status": "Healthy",
        "latency": 150,
        "lastChecked": "2024-01-15T10:30:00Z"
      },
      {
        "name": "Storage",
        "status": "Healthy",
        "latency": 10,
        "lastChecked": "2024-01-15T10:30:00Z"
      }
    ],
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /api/system-admin/dashboard/recent-screenings

Get recent screenings list with pagination.

**Screen Reference:** 3.3.8

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| pageNumber | int | 1 | Page number |
| pageSize | int | 10 | Items per page |

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "patientName": "John Doe",
        "clinicName": "Central Eye Clinic",
        "aiDiagnosis": "Mild DR",
        "riskLevel": "Moderate",
        "status": "Pending Review",
        "screeningDate": "2024-01-15T09:30:00Z"
      }
    ],
    "totalCount": 156,
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 16
  }
}
```

---

## Clinics APIs

### GET /api/system-admin/clinics/metrics

Get clinic and device inventory metrics.

**Screen Reference:** 3.4.1-3.4.3

**Response:**

```json
{
  "success": true,
  "data": {
    "totalClinics": 30,
    "activeClinics": 25,
    "pendingClinics": 3,
    "suspendedClinics": 2,
    "totalDevices": 50,
    "onlineDevices": 42,
    "offlineDevices": 5,
    "calibrationRequired": 3
  }
}
```

---

### GET /api/system-admin/clinics

Get clinics list with pagination and filtering.

**Screen Reference:** 3.4.6-3.4.8

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| searchTerm | string | No | Search by name, code, location |
| status | ClinicStatus | No | Active, Pending, Inactive, Suspended, Closed |
| pageNumber | int | No | Page number (default: 1) |
| pageSize | int | No | Items per page (default: 10) |

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "code": "CEC-001",
        "name": "Central Eye Clinic",
        "location": "123 Main St, City",
        "headOfDepartment": "Dr. Smith",
        "status": "Active",
        "totalDevices": 5,
        "activeDevices": 4,
        "totalScreenings": 1250,
        "createdAt": "2023-06-15T00:00:00Z"
      }
    ],
    "totalCount": 30,
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 3
  }
}
```

---

### GET /api/system-admin/clinics/{id}

Get clinic detail with devices.

**Screen Reference:** 3.4.9

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "CEC-001",
    "name": "Central Eye Clinic",
    "address": "123 Main St, City, State 12345",
    "phoneNumber": "+1-555-0100",
    "email": "contact@centraleye.com",
    "headOfDepartment": "Dr. John Smith",
    "status": "Active",
    "licenseNumber": "MED-2023-001",
    "licenseExpiry": "2025-12-31T00:00:00Z",
    "createdAt": "2023-06-15T00:00:00Z",
    "updatedAt": "2024-01-10T00:00:00Z",
    "devices": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
        "serialNumber": "FC-2023-001",
        "name": "Fundus Camera A1",
        "type": "FundusCamera",
        "status": "Online",
        "lastCalibrationDate": "2024-01-01T00:00:00Z",
        "nextCalibrationDate": "2024-04-01T00:00:00Z"
      }
    ]
  }
}
```

---

### POST /api/system-admin/clinics

Register a new clinic.

**Screen Reference:** 3.4.4

**Request Body:**

```json
{
  "code": "CEC-002",
  "name": "East Side Eye Clinic",
  "address": "456 East Ave, City, State 12346",
  "phoneNumber": "+1-555-0200",
  "email": "contact@eastside.com",
  "headOfDepartment": "Dr. Jane Doe",
  "licenseNumber": "MED-2024-002",
  "licenseExpiry": "2026-12-31"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Clinic registered successfully",
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afa8"
}
```

---

### PATCH /api/system-admin/clinics/{id}/status

Update clinic status.

**Screen Reference:** 3.4.9

**Request Body:**

```json
{
  "newStatus": "Suspended",
  "reason": "License renewal pending"
}
```

**ClinicStatus enum values:**

- `Pending` (0)
- `Active` (1)
- `Inactive` (2)
- `Suspended` (3)
- `Closed` (4)

**Response:**

```json
{
  "success": true,
  "message": "Clinic status updated successfully"
}
```

---

## Users APIs

### GET /api/system-admin/users/metrics

Get user management metrics.

**Screen Reference:** 3.5.2-3.5.5

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalUsersMonthlyChange": 5.2,
    "activeDoctors": 85,
    "activeDoctorsChange": 2.4,
    "patientsScreened": 8500,
    "patientsScreenedChange": 8.1,
    "pendingApprovals": 12
  }
}
```

---

### GET /api/system-admin/users

Get users list with pagination and filtering.

**Screen Reference:** 3.5.1, 3.5.6-3.5.9

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| searchTerm | string | No | Search by name, email, username |
| role | string | No | Filter by role (e.g., "Ophthalmologist", "Patient") |
| status | string | No | "Active", "Pending", "Suspended" |
| pageNumber | int | No | Page number (default: 1) |
| pageSize | int | No | Items per page (default: 10) |

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "email": "john.doe@hospital.com",
        "fullName": "Dr. John Doe",
        "phoneNumber": "+1-555-0100",
        "roles": ["Ophthalmologist"],
        "permissions": ["ViewPatients", "CreateScreening"],
        "status": "Active",
        "isActive": true,
        "emailConfirmed": true,
        "createdAt": "2023-06-15T00:00:00Z",
        "lastLoginAt": "2024-01-15T08:30:00Z"
      }
    ],
    "totalCount": 1250,
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 125
  }
}
```

---

### PATCH /api/system-admin/users/{id}/role

Update user role.

**Screen Reference:** 3.5.11

**Request Body:**

```json
{
  "role": "Ophthalmologist",
  "addRole": true
}
```

Set `addRole: false` to remove the role.

**Response:**

```json
{
  "success": true,
  "message": "Role added successfully"
}
```

---

### PATCH /api/system-admin/users/{id}/status

Update user status.

**Screen Reference:** 3.5.12

**Request Body:**

```json
{
  "action": "suspend",
  "reason": "Policy violation"
}
```

**Available actions:**

- `activate` - Activate a suspended user
- `suspend` - Suspend an active user
- `approve` - Approve a pending user (confirms email and activates)

**Response:**

```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

---

## AI Models APIs

### GET /api/system-admin/ai-models/metrics

Get AI model performance metrics.

**Screen Reference:** 3.9.1-3.9.4

**Response:**

```json
{
  "success": true,
  "data": {
    "globalAccuracy": 97.5,
    "accuracyChange": 0.3,
    "falsePositiveRate": 2.1,
    "falsePositiveChange": -0.2,
    "averageInferenceTime": 150,
    "inferenceTimeChange": -5,
    "activeModelVersion": "v2.3.1",
    "modelDeployedAt": "2024-01-01T00:00:00Z",
    "totalPredictions": 125000,
    "lastDayPredictions": 1560
  }
}
```

---

### GET /api/system-admin/ai-models/versions

Get model version history.

**Screen Reference:** 3.9.7

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | int | 10 | Number of versions to retrieve |

**Response:**

```json
{
  "success": true,
  "data": {
    "activeVersion": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "version": "v2.3.1",
      "status": "Active",
      "accuracy": 97.5,
      "falsePositiveRate": 2.1,
      "deployedAt": "2024-01-01T00:00:00Z",
      "deployedBy": "Dr. Admin"
    },
    "versions": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "version": "v2.3.1",
        "status": "Active",
        "accuracy": 97.5,
        "falsePositiveRate": 2.1,
        "createdAt": "2023-12-15T00:00:00Z"
      },
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
        "version": "v2.3.0",
        "status": "Deprecated",
        "accuracy": 96.8,
        "falsePositiveRate": 2.5,
        "createdAt": "2023-10-01T00:00:00Z"
      }
    ]
  }
}
```

---

### POST /api/system-admin/ai-models/{id}/promote

Promote a model version to a new status.

**Screen Reference:** 3.9.8

**Request Body:**

```json
{
  "targetStatus": 2
}
```

**AiModelStatus enum values:**

- `Development` (0)
- `Staging` (1)
- `Active` (2)
- `Deprecated` (3)
- `Archived` (4)

**Response:**

```json
{
  "success": true,
  "message": "Model promoted successfully"
}
```

---

### POST /api/system-admin/ai-models

Deploy a new AI model version.

**Screen Reference:** 3.9.9

**Request Body:**

```json
{
  "version": "v2.4.0",
  "modelPath": "/models/dr-detector-v2.4.0.onnx",
  "description": "Improved accuracy for early-stage DR detection",
  "releaseNotes": "- Added new training data\n- Improved edge case handling"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Model deployed successfully",
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afa8"
}
```

---

## Audit Logs APIs

### GET /api/system-admin/auditlogs

Get audit logs with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| searchTerm | string | No | Search in action, entity name, or entity ID |
| action | string | No | Filter by action type (e.g., "CreateClinic", "UpdateUserStatus") |
| entityName | string | No | Filter by entity (e.g., "User", "Clinic", "Device") |
| userId | Guid | No | Filter by user ID |
| fromDate | DateTime | No | Start date filter |
| toDate | DateTime | No | End date filter |
| pageNumber | int | No | Page number (default: 1) |
| pageSize | int | No | Items per page (default: 20) |

**Request:**

```
GET /api/system-admin/auditlogs?action=UpdateUserStatus&fromDate=2024-01-01&pageSize=20
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
        "userName": "Dr. Admin",
        "action": "UpdateUserStatus:suspend",
        "entityName": "User",
        "entityId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        "oldValue": "{\"IsActive\": true}",
        "newValue": "{\"IsActive\": false, \"Reason\": \"Policy violation\"}",
        "ipAddress": "192.168.1.100",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "totalCount": 1500,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPages": 75
  }
}
```

---

## Testing Guide

### Prerequisites

1. Get a valid JWT token with SystemAdmin role:

```bash
# Login as System Admin
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@auraeyes.com",
  "password": "Admin@123"
}
```

2. Use the token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Test Accounts (Development)

See [TEST_ACCOUNTS.md](./TEST_ACCOUNTS.md) for development test accounts.

### Testing with cURL

```bash
# Get Dashboard Metrics
curl -X GET "https://localhost:7000/api/system-admin/dashboard/metrics" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Get Clinics List
curl -X GET "https://localhost:7000/api/system-admin/clinics?status=Active&pageSize=10" \
  -H "Authorization: Bearer <token>"

# Register New Clinic
curl -X POST "https://localhost:7000/api/system-admin/clinics" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST-001",
    "name": "Test Clinic",
    "address": "123 Test St",
    "phoneNumber": "+1-555-0000",
    "email": "test@clinic.com",
    "headOfDepartment": "Dr. Test",
    "licenseNumber": "TEST-2024-001",
    "licenseExpiry": "2026-12-31"
  }'

# Update User Status
curl -X PATCH "https://localhost:7000/api/system-admin/users/<user-id>/status" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "suspend", "reason": "Testing"}'
```

### Testing with Swagger

1. Run the API in Development mode
2. Navigate to `https://localhost:7000/swagger`
3. Click "Authorize" and enter your JWT token
4. Test endpoints directly from the Swagger UI

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

### HTTP Status Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | Success                                 |
| 201  | Created                                 |
| 400  | Bad Request - Validation errors         |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource doesn't exist      |
| 409  | Conflict - Duplicate resource           |
| 500  | Internal Server Error                   |

---

## Architecture Notes

### Clean Architecture Layers

- **API** - Thin controllers, routing, authentication
- **Application** - CQRS handlers, business logic, validation
- **Domain** - Entities, value objects, domain events
- **Infrastructure** - Database, external services, identity

### CQRS Pattern

- All read operations use `IQuery<T>`
- All write operations use `ICommand` or `ICommand<T>`
- Handlers return `Result<T>` for consistent error handling

### Authorization

- All System Admin endpoints require `[Authorize(Policy = Policies.SystemAdminOnly)]`
- Policy is configured in `Infrastructure/DependencyInjection.cs`

---

## Changelog

### v1.0.0 (2024-01-15)

- Initial System Admin API implementation
- Dashboard metrics and trends
- Clinic & Device management
- User & Role management
- AI Model monitoring
- Audit log querying
