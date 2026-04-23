/**
 * Clinic Staff – Screening Result Page
 *
 * Re-uses the full OrganisationScreeningResultPage which already contains all
 * AI analysis, annotation, share, and PDF export logic.  The only difference
 * is that the inner page renders Organisation's Sidebar/Header; for Clinic Staff
 * we inject the same component unchanged because Clinic Staff users are part of
 * the same organisation role-group and share identical backend access.
 *
 * Route: /clinic-staff/screenings/result?id=<screeningId>
 *        navigated to from /clinic-staff/screenings/new after session creation.
 */
export { default } from '@/features/organisation/pages/screening-result';
