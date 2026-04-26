# Notification Integration Guide

## Overview

This guide explains how to integrate real-time notifications into new features or modules in the AURA system. The notification system uses SignalR for real-time delivery and PostgreSQL JSONB for persistent storage.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ SignalR Hook │  │ Zustand Store │  │ Toast/Bell   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                       WebSocket Connection
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       Backend (.NET 8)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   NotificationHub                          │  │
│  │                   (SignalR Hub)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 INotificationService                       │  │
│  │    - Persists to Database                                  │  │
│  │    - Broadcasts via SignalR                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   PostgreSQL                               │  │
│  │        Notifications Table (JSONB Payload)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## NotificationType Enum

All notification types are defined in `Domain/Enums/NotificationType.cs`:

| Enum Value                   | FR    | Description                          | Expected Payload                    |
| ---------------------------- | ----- | ------------------------------------ | ----------------------------------- |
| `AiScreeningCompleted`       | FR-45 | Patient receives AI screening result | `{ ScreeningId, ResultStatus }`     |
| `ConsultationAccepted`       | FR-46 | Doctor accepts consultation          | `{ ConsultationId, DoctorId }`      |
| `ConsultationResultProvided` | FR-46 | Doctor provides consultation result  | `{ ConsultationId, DoctorId }`      |
| `NewConsultationRequest`     | FR-47 | Doctor receives new consultation     | `{ ConsultationId, PatientId }`     |
| `NewPatientMessage`          | FR-47 | Doctor receives patient message      | `{ ConsultationId, PatientId }`     |
| `NewAppointmentBooked`       | FR-48 | Admin receives new appointment       | `{ AppointmentId, Action }`         |
| `ScheduleChanged`            | FR-48 | Admin receives schedule change       | `{ AppointmentId, Action }`         |
| `WalletDepositSuccess`       | FR-49 | User successfully deposits           | `{ TransactionId, Amount, Action }` |
| `WalletPaymentProcessed`     | FR-49 | User payment processed               | `{ TransactionId, Amount, Action }` |

## Integration Steps

### Step 1: Inject INotificationService

In your Command Handler, inject `INotificationService`:

```csharp
public class YourCommandHandler : ICommandHandler<YourCommand, YourResponse>
{
    private readonly INotificationService _notificationService;
    // ... other dependencies

    public YourCommandHandler(
        INotificationService notificationService,
        // ... other dependencies
    )
    {
        _notificationService = notificationService;
        // ...
    }
}
```

### Step 2: Call SendAsync After Successful Operation

After your business logic completes successfully (typically after `SaveChangesAsync`):

```csharp
public async Task<Result<YourResponse>> Handle(
    YourCommand request,
    CancellationToken cancellationToken)
{
    // ... your business logic ...

    await _unitOfWork.SaveChangesAsync(cancellationToken);

    // Send notification
    await _notificationService.SendAsync(
        userId: targetUserId,               // Who receives the notification
        title: "Tiêu đề thông báo",         // Short title
        message: "Nội dung chi tiết...",    // Detailed message
        type: NotificationType.YourType,    // Enum type for routing
        payload: new                        // Anonymous object for JSONB
        {
            EntityId = entity.Id,
            SomeField = value,
            Action = "Created"
        },
        cancellationToken: cancellationToken
    );

    return Result<YourResponse>.Success(response);
}
```

---

## Future Module Integration Examples

### Messaging Module (Chat Notifications)

**FR-47: NewPatientMessage** - Already implemented in `SendMessageCommandHandler`.

For extending to doctor replies:

```csharp
// In a hypothetical DoctorReplyCommandHandler
public async Task<Result> Handle(DoctorReplyCommand request, CancellationToken ct)
{
    // ... save message logic ...

    await _notificationService.SendAsync(
        session.PatientId,
        "Tin nhắn mới từ bác sĩ",
        $"Bác sĩ đã trả lời: \"{messagePreview}\"",
        NotificationType.ConsultationResultProvided, // Or create a new type
        new { ConsultationId = session.Id, DoctorId = request.DoctorId },
        ct);
}
```

### Appointment Module (Schedule Notifications)

**FR-48: NewAppointmentBooked**

```csharp
// In CreateAppointmentCommandHandler
public async Task<Result<Guid>> Handle(CreateAppointmentCommand request, CancellationToken ct)
{
    var appointment = new Appointment(/* ... */);
    await _appointmentRepository.AddAsync(appointment, ct);
    await _unitOfWork.SaveChangesAsync(ct);

    // Notify Admin(s)
    var adminUsers = await _userRepository.GetUsersInRoleAsync("SystemAdmin", ct);
    foreach (var admin in adminUsers)
    {
        await _notificationService.SendAsync(
            admin.Id,
            "Lịch hẹn mới",
            $"Bệnh nhân {patientName} đã đặt lịch khám ngày {appointment.Time:dd/MM/yyyy HH:mm}",
            NotificationType.NewAppointmentBooked,
            new { AppointmentId = appointment.Id, Action = "Booked" },
            ct);
    }

    return Result<Guid>.Success(appointment.Id);
}
```

**FR-48: ScheduleChanged**

```csharp
// In RescheduleAppointmentCommandHandler
public async Task<Result> Handle(RescheduleAppointmentCommand request, CancellationToken ct)
{
    var appointment = await _appointmentRepository.GetByIdAsync(request.AppointmentId, ct);

    appointment.Reschedule(request.NewTime);
    await _unitOfWork.SaveChangesAsync(ct);

    // Notify relevant stakeholders
    await _notificationService.SendAsync(
        appointment.DoctorId,
        "Lịch hẹn thay đổi",
        $"Lịch hẹn ngày {oldTime:dd/MM} đã được chuyển sang {request.NewTime:dd/MM HH:mm}",
        NotificationType.ScheduleChanged,
        new { AppointmentId = appointment.Id, Action = "Rescheduled" },
        ct);

    return Result.Success();
}
```

---

## Adding New NotificationType

If you need a new notification type:

1. **Add to Enum** in `Domain/Enums/NotificationType.cs`:

```csharp
/// <summary>
/// FR-XX: Description
/// Payload: { Field1, Field2 }
/// </summary>
YourNewType = 10
```

2. **Update Frontend Routing** in `getNotificationAction()` utility function.

3. **Document** the new type in this file.

---

## Best Practices

1. **Always notify after SaveChanges** - Ensure data is persisted before broadcasting.

2. **Use descriptive Vietnamese messages** - Notifications are user-facing.

3. **Keep payloads minimal** - Only include IDs and essential metadata.

4. **Use appropriate NotificationType** - Enables proper routing and icon display.

5. **Handle errors gracefully** - Notification failures shouldn't break the main flow:

```csharp
try
{
    await _notificationService.SendAsync(/* ... */);
}
catch (Exception ex)
{
    _logger.LogWarning(ex, "Failed to send notification, but main operation succeeded");
    // Don't rethrow - notification is secondary
}
```

---

## Testing Notifications

Use the SignalR test endpoint (development only):

```bash
# Connect to hub
wscat -c "wss://your-api/hubs/notifications" -H "Authorization: Bearer <token>"

# Listen for ReceiveNotification events
```

Or use the Swagger UI to trigger commands and observe notifications in the frontend.
