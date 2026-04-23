# Development Workflow Standards (Frontend)

## Build Verification

1. **Mandatory Build**: Every significant change MUST be verified by running `npm run build`.
2. **TypeScript Integrity**: Ensure there are no TypeScript errors (`tsc`) before declaring a task complete.
3. **Linting**: Run `npm run lint` if available to maintain code quality.

## API Alignment

1. **Source of Truth**: Always cross-reference the backend (BE) DTOs and Controllers before implementing or updating FE services.
2. **Data Mapping**: If the BE fields differ from FE conventions (e.g., `fullName` vs `name`), perform explicit mapping in the service/api layer or data store.
3. **Role Consistency**: Strictly follow the PascalCase role hierarchy defined in the Role Management skill.
