# Role Management Standards

## Unified PascalCase Hierarchy

The project uses exactly four roles, which MUST be written in PascalCase without underscores or spaces:

1. `SystemAdmin`
2. `Ophthalmologist`
3. `ClinicStaff`
4. `Patient`

## Implementation Rules

1. **No Underscores**: Do NOT use `system_admin`, `clinic_staff`, or similar legacy naming conventions.
2. **Deprecation**: The `OrgAdmin` role is COMPLETELY REMOVED and replaced by `ClinicStaff`.
3. **Normalization**: All user data received from the backend MUST be normalized in `store/auth-store.ts` to map legacy or variant role strings to this official 4-role set.
4. **Route Guards**: Use these PascalCase strings in all `PrivateRoute` and `LocalizedPrivateRoute` `allowedRoles` arrays.
5. **Types**: Use the `UserRole` type from `src/types/auth.types.ts`.

## Role Mapping (Internal Normalization)

- `admin` / `systemadmin` -> `SystemAdmin`
- `doctor` / `ophthalmologist` -> `Ophthalmologist`
- `orgadmin` / `organization` / `clinicstaff` -> `ClinicStaff`
- `patient` -> `Patient`
