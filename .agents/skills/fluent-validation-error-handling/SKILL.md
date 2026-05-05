---
name: fluent-validation-error-handling
description: Handle .NET FluentValidation + Axios errors via extractApiErrorMessage and implement i18n Yup forms
---

# Frontend Error Handling & Form Validation Guidelines

In the AuraEyes web project, follow these standards when dealing with API responses and client-side form validations.

## 1. Backend API Error Handling (Toasts)

When receiving a `400 Bad Request` from .NET, the response often nests array errors under `response.data.errors`.
**Rule:** Avoid displaying raw server errors directly in the JSX form. Instead, surface them through pop-up Notifications (Toasts).

Always use the shared `extractApiErrorMessage` utility from `@/lib/api-error` to safely extract and map these messages.

**Usage with Toasts:**

```tsx
import { extractApiErrorMessage } from '@/lib/api-error';
import { toast } from 'react-toastify';

useMutation({
  ...
  onError: (error) => {
    toast.error(extractApiErrorMessage(error, "Default update failed message."));
  }
});
```

_Note: Do NOT implement inline API Error Alert boxes like `<ApiErrorAlert />`. Always stick to the unified Toast UI._

## 2. Frontend Form Validation (Yup + i18n)

Client-side validations must happen before sending any request to the API, using `yup`.
**Rule:** Do NOT hardcode English strings inside Yup schemas. Always return a translation **Key**, and use the `useTranslation()` hook to map the localized string below the input fields.

**In the Schema File (`schema.ts`):**

```typescript
export const formSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('Validation.Required')
    .max(200, 'Validation.MaxLength.FullName'),
});
```

**In the Component (`page.tsx`):**

```tsx
const { t: i18nT } = useTranslation();
const t = (key: string) => i18nT(key as never) as unknown as string;

// Underneath the input tags:
{
  formErrors.fullName && (
    <p className="text-sm text-red-500 mt-1">
      {t(formErrors.fullName.message ?? '')}
    </p>
  );
}
```
