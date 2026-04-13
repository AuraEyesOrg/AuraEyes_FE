# Patient Module i18n Baseline

Generated: 2026-04-04
Source: scripts/audit-patient-i18n.mjs

## Summary

- Total files: 19
- Files with translation hook: 3
- Files without translation hook: 16
- Total translation keys used: 85
- Missing keys in en.json: 0
- Missing keys in vi.json: 0

## Highest Priority Files (by hardcoded UI strings + missing hook)

1. src/features/patient/pages/appointments.tsx
2. src/features/patient/pages/booking-confirmation.tsx
3. src/features/patient/pages/chat.tsx
4. src/features/patient/pages/profile.tsx
5. src/features/patient/pages/reports.tsx
6. src/features/patient/pages/screening-new.tsx
7. src/features/patient/pages/wallet.tsx
8. src/features/patient/pages/dashboard.tsx
9. src/features/patient/pages/retinal-analysis.tsx
10. src/features/patient/pages/clinics.tsx

## Notes

- Baseline confirms key parity is currently healthy for keys already wrapped in t(...).
- Main implementation workload is converting hardcoded patient UI strings into translation keys, page by page.
- Detailed machine-readable output is generated to artifacts/i18n/patient-i18n-baseline.json when running npm run i18n:audit:patient.
