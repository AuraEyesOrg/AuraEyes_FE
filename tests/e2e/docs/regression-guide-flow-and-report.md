# AURA - Regression Test Guide for Flow Guide and Test Report

## 1. Purpose

This document defines regression verification to keep both system artifacts in sync:

- Flow guide: docs/SYSTEM_TEST_FLOW_AND_GUIDE.md
- Master report: tests/e2e/docs/System_Test_Report_AURA.md

Goal: prevent drift between designed E2E coverage and recorded execution outcomes.

## 2. Regression Scope

- Functional coverage sync:
  - Flow 01 -> Flow 07 must exist in both guide and report.
- Test case accounting:
  - Number of TCs per feature in report must match spec inventory in tests/e2e/specs.
- Defect lifecycle consistency:
  - Failed cases in Round 1 must have realistic root-cause notes.
  - Round 2 retest status must reflect fix verification.
- Hybrid AAA compliance:
  - Specs must preserve Arrange/Act/Assert split with backdoor setup.

## 3. Trigger Points

Run this regression checklist when any of these happen:

1. Added/removed E2E test cases.
2. Added new flow doc or changed route behavior.
3. Updated security guards, payment, upload, or profile/network modules.
4. Updated System_Test_Report_AURA.md statistics.

## 4. Regression Checklist

### 4.1 Guide vs Report alignment

- Feature names match exactly across two docs.
- Route references in guide are still valid in FE router.
- Flow strategy (Happy/Negative/Alternative/Security) appears for each flow.

### 4.2 Report integrity

- Sub total equals sum of all module test cases.
- Round 1 failed percentage remains realistic (10-15% for capstone simulation).
- Round 2 passed count equals number of failed cases retested.
- Each failed case note includes:
  - symptom,
  - technical cause,
  - Jira ID,
  - Round 2 fix result.

### 4.3 Spec coverage integrity

- Each flow has corresponding spec file:
  - 01-doctor-registration-full-flow.spec.ts
  - 02-org-onboarding.spec.ts
  - 03-patient-screening-and-consultation-session.spec.ts
  - 04-offline-booking.spec.ts
  - 05-buy-quota.spec.ts
  - 06-profile-management.spec.ts
  - 07-professional-network.spec.ts
- New negative/security cases from report are represented in specs.
- Backdoor reset-and-seed is executed consistently before tests/suites.

## 5. Evidence Matrix

Capture these artifacts for each regression run:

- Playwright HTML report summary.
- Failed screenshot/video traces for Round 1 defects.
- Round 2 rerun log proving fix closure.
- Updated report diff and guide diff.

## 6. Exit Criteria

Regression cycle can be closed when:

1. Guide and report are structurally aligned for all 7 flows.
2. Statistics are mathematically consistent.
3. All Round 1 failed cases have Round 2 pass evidence.
4. No unresolved security-boundary defects in access-control scenarios.

## 7. Ownership

- QA Automation Lead: maintain report integrity and execution evidence.
- System Analyst: validate flow-to-business mapping.
- Tech Lead/BE+FE owners: confirm root-cause and fix acceptance for failed cases.
