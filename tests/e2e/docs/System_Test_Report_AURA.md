# TEST REPORT DOCUMENT

## Overview

| Field            | Value                         | Field       | Value                          |
| ---------------- | ----------------------------- | ----------- | ------------------------------ |
| Product Metadata | AURA                          | Creator     | QA Automation Team             |
| Project Name     | AURA Retinal Screening System | Issue Date  | 2026-04-13                     |
| Project Code     | AURA-FE-E2E                   | Version     | v3.1                           |
| Document Code    | AURA-FE-E2E_Test_Report       | Report Type | Module-based (Scholarix style) |

## Record of Change

| Effective Date | Version | Change Item                  | A/D/M | Change Description                                                                                                                                                     |
| -------------- | ------- | ---------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-13     | v3.1    | Expanded module test catalog | M     | Added full testcase matrix for screening errors, quota, booking, consultation, feedback, wallet in-out, and network collaboration with mandatory 3 rounds per testcase |

## Test Coverage

| No  | Module Name                         | Prefix              | Test Cases | Coverage Summary                                                         |
| --- | ----------------------------------- | ------------------- | ---------: | ------------------------------------------------------------------------ |
| 1   | Authentication and Access           | AUTH\_              |          8 | login, onboarding, role guard, dashboard redirect                        |
| 2   | Screening and Quota                 | SCREEN\_            |         10 | upload error, blur, out of quota, buy quota, spend wallet                |
| 3   | Doctor and Clinic Discovery Booking | BOOK\_              |          8 | find doctor, find clinic, register clinic slot, book doctor consultation |
| 4   | Consultation and Feedback           | CONSULT*, FEEDBACK* |          9 | meeting setup, consultation handoff, feedback clinic/doctor/system       |
| 5   | Wallet and Transaction Lifecycle    | WALLET\_            |         12 | topup, withdraw, inflow-outflow ledger, spend by quota and booking       |
| 6   | Professional Network Collaboration  | NETWORK\_           |         12 | post, repost, comment, reaction, save, share from consultation/result    |
|     | **Total**                           |                     |     **59** | **All modules mapped with 3-round execution rule**                       |

## Test Statistics

| Field                   | Value                           | Field                  | Value                                |
| ----------------------- | ------------------------------- | ---------------------- | ------------------------------------ |
| Total Test Cases        | 59                              | Total Execution Points | 177                                  |
| Round Policy            | 3 rounds mandatory per testcase | Coverage Ratio         | 100% planned                         |
| Current Execution State | Pending env fix                 | Blocker                | global-auth magic-login fetch failed |

| No  | Module                              | Test Cases | Execution Points (x3 rounds) |
| --- | ----------------------------------- | ---------: | ---------------------------: |
| 1   | Authentication and Access           |          8 |                           24 |
| 2   | Screening and Quota                 |         10 |                           30 |
| 3   | Doctor and Clinic Discovery Booking |          8 |                           24 |
| 4   | Consultation and Feedback           |          9 |                           27 |
| 5   | Wallet and Transaction Lifecycle    |         12 |                           36 |
| 6   | Professional Network Collaboration  |         12 |                           36 |
|     | **Subtotal**                        |     **59** |                      **177** |

| Testing Round | Scope                    | Required Cases | Status  |
| ------------- | ------------------------ | -------------: | ------- |
| Round 1       | Baseline run             |             59 | Planned |
| Round 2       | Retest + hardening       |             59 | Planned |
| Round 3       | Regression stabilization |             59 | Planned |

---

## Module 1 - Authentication and Access

| Field         | Value                                                |
| ------------- | ---------------------------------------------------- |
| Feature       | Authentication and Access                            |
| Number of TCs | 8                                                    |
| Round Rule    | Every testcase must run in Round 1, Round 2, Round 3 |

| Test Case ID | Test Case Description                                     | Round 1 | Round 2 | Round 3 | Note                      |
| ------------ | --------------------------------------------------------- | ------- | ------- | ------- | ------------------------- |
| AUTH_01      | Doctor onboarding submission with valid required fields   | Planned | Planned | Planned | from register-doctor flow |
| AUTH_02      | Onboarding submit blocked when required fields missing    | Planned | Planned | Planned | validation case           |
| AUTH_03      | System admin opens doctor verification queue              | Planned | Planned | Planned | access and listing        |
| AUTH_04      | Unverified ophthalmologist redirected to pending approval | Planned | Planned | Planned | route guard               |
| AUTH_05      | Verified ophthalmologist can access dashboard             | Planned | Planned | Planned | positive guard            |
| AUTH_06      | System admin can open organisation onboarding list        | Planned | Planned | Planned | org onboarding queue      |
| AUTH_07      | Org login defaults to organisation dashboard              | Planned | Planned | Planned | redirect behavior         |
| AUTH_08      | Org routes are accessible without forced contract gate    | Planned | Planned | Planned | current contract policy   |

## Module 2 - Screening and Quota

| Field         | Value                                                |
| ------------- | ---------------------------------------------------- |
| Feature       | Screening and Quota                                  |
| Number of TCs | 10                                                   |
| Round Rule    | Every testcase must run in Round 1, Round 2, Round 3 |

| Test Case ID | Test Case Description                                   | Round 1 | Round 2 | Round 3 | Note                 |
| ------------ | ------------------------------------------------------- | ------- | ------- | ------- | -------------------- |
| SCREEN_01    | Patient upload invalid image file is blocked            | Planned | Planned | Planned | unsupported format   |
| SCREEN_02    | Patient upload blurred image shows blur warning         | Planned | Planned | Planned | blur detection       |
| SCREEN_03    | Patient can retake image after blur detection           | Planned | Planned | Planned | retry flow           |
| SCREEN_04    | Patient starts AI analysis with valid image             | Planned | Planned | Planned | happy path           |
| SCREEN_05    | Patient out of quota is blocked from analysis           | Planned | Planned | Planned | exhausted quota      |
| SCREEN_06    | Patient buys quota successfully from warning path       | Planned | Planned | Planned | buy quota            |
| SCREEN_07    | Patient buy quota blocked by insufficient wallet        | Planned | Planned | Planned | payment guard        |
| SCREEN_08    | Wallet ledger records quota purchase spend              | Planned | Planned | Planned | spend tracking       |
| SCREEN_09    | Organisation can spend wallet to buy quota              | Planned | Planned | Planned | org quota spend      |
| SCREEN_10    | Screening result is available after successful analysis | Planned | Planned | Planned | downstream readiness |

## Module 3 - Doctor and Clinic Discovery Booking

| Field         | Value                                                |
| ------------- | ---------------------------------------------------- |
| Feature       | Doctor and Clinic Discovery Booking                  |
| Number of TCs | 8                                                    |
| Round Rule    | Every testcase must run in Round 1, Round 2, Round 3 |

| Test Case ID | Test Case Description                                     | Round 1 | Round 2 | Round 3 | Note                 |
| ------------ | --------------------------------------------------------- | ------- | ------- | ------- | -------------------- |
| BOOK_01      | Patient can search and open doctor list                   | Planned | Planned | Planned | find doctor          |
| BOOK_02      | Patient can search and open clinic list                   | Planned | Planned | Planned | find clinic          |
| BOOK_03      | Patient can register appointment slot from clinic         | Planned | Planned | Planned | clinic booking       |
| BOOK_04      | Patient can book appointment with doctor for consultation | Planned | Planned | Planned | consultation booking |
| BOOK_05      | Booking payment success confirms appointment              | Planned | Planned | Planned | pay and confirm      |
| BOOK_06      | Booking payment blocked when wallet insufficient          | Planned | Planned | Planned | negative payment     |
| BOOK_07      | Double booking same slot is prevented                     | Planned | Planned | Planned | concurrency guard    |
| BOOK_08      | Booked appointment appears in patient schedule list       | Planned | Planned | Planned | persistence check    |

## Module 4 - Consultation and Feedback

| Field         | Value                                                |
| ------------- | ---------------------------------------------------- |
| Feature       | Consultation and Feedback                            |
| Number of TCs | 9                                                    |
| Round Rule    | Every testcase must run in Round 1, Round 2, Round 3 |

| Test Case ID | Test Case Description                                | Round 1 | Round 2 | Round 3 | Note                    |
| ------------ | ---------------------------------------------------- | ------- | ------- | ------- | ----------------------- |
| CONSULT_01   | Consultation session contains pre-setup meeting link | Planned | Planned | Planned | meeting setup           |
| CONSULT_02   | Patient can open consultation chat from appointment  | Planned | Planned | Planned | patient handoff         |
| CONSULT_03   | Doctor can open same consultation session            | Planned | Planned | Planned | doctor handoff          |
| FEEDBACK_01  | Patient can submit feedback for clinic               | Planned | Planned | Planned | clinic rating           |
| FEEDBACK_02  | Patient can submit feedback for doctor               | Planned | Planned | Planned | doctor rating           |
| FEEDBACK_03  | Patient can submit feedback for system               | Planned | Planned | Planned | system rating           |
| FEEDBACK_04  | Empty feedback content is blocked by validation      | Planned | Planned | Planned | required message        |
| CONSULT_04   | Doctor can share post from consultation context      | Planned | Planned | Planned | consultation to network |
| CONSULT_05   | Organisation can share from walk-in patient result   | Planned | Planned | Planned | result to network       |

## Module 5 - Wallet and Transaction Lifecycle

| Field         | Value                                                |
| ------------- | ---------------------------------------------------- |
| Feature       | Wallet and Transaction Lifecycle                     |
| Number of TCs | 12                                                   |
| Round Rule    | Every testcase must run in Round 1, Round 2, Round 3 |

| Test Case ID | Test Case Description                                | Round 1 | Round 2 | Round 3 | Note              |
| ------------ | ---------------------------------------------------- | ------- | ------- | ------- | ----------------- |
| WALLET_01    | Patient creates topup request successfully           | Planned | Planned | Planned | deposit init      |
| WALLET_02    | Topup callback success increases patient wallet      | Planned | Planned | Planned | inflow            |
| WALLET_03    | Topup callback failure keeps balance unchanged       | Planned | Planned | Planned | failure branch    |
| WALLET_04    | Patient submits wallet withdraw request              | Planned | Planned | Planned | outflow request   |
| WALLET_05    | Doctor submits wallet withdraw request               | Planned | Planned | Planned | role doctor       |
| WALLET_06    | Organisation submits wallet withdraw request         | Planned | Planned | Planned | role organisation |
| WALLET_07    | Wallet inflow-outflow summary is accurate            | Planned | Planned | Planned | reconciliation    |
| WALLET_08    | Patient wallet is charged when buying quota          | Planned | Planned | Planned | quota spend       |
| WALLET_09    | Patient wallet is charged when booking appointment   | Planned | Planned | Planned | booking spend     |
| WALLET_10    | Organisation wallet is charged when buying quota     | Planned | Planned | Planned | org spend         |
| WALLET_11    | Admin approves withdraw request and updates ledger   | Planned | Planned | Planned | approval flow     |
| WALLET_12    | Admin rejects withdraw request and preserves balance | Planned | Planned | Planned | reject flow       |

## Module 6 - Professional Network Collaboration

| Field         | Value                                                |
| ------------- | ---------------------------------------------------- |
| Feature       | Professional Network Collaboration                   |
| Number of TCs | 12                                                   |
| Round Rule    | Every testcase must run in Round 1, Round 2, Round 3 |

| Test Case ID | Test Case Description                                   | Round 1 | Round 2 | Round 3 | Note                          |
| ------------ | ------------------------------------------------------- | ------- | ------- | ------- | ----------------------------- |
| NETWORK_01   | Doctor can create text post                             | Planned | Planned | Planned | author doctor                 |
| NETWORK_02   | Organisation can create post                            | Planned | Planned | Planned | author organisation           |
| NETWORK_03   | Admin can create post                                   | Planned | Planned | Planned | author admin                  |
| NETWORK_04   | Doctor can repost an existing post                      | Planned | Planned | Planned | repost doctor                 |
| NETWORK_05   | Organisation can repost an existing post                | Planned | Planned | Planned | repost organisation           |
| NETWORK_06   | User can add comment on post detail                     | Planned | Planned | Planned | comment                       |
| NETWORK_07   | User can react on post detail                           | Planned | Planned | Planned | reaction                      |
| NETWORK_08   | User can save post to personal saved list               | Planned | Planned | Planned | save post                     |
| NETWORK_09   | User can remove post from saved list                    | Planned | Planned | Planned | unsave post                   |
| NETWORK_10   | User can post image content with multiple post types    | Planned | Planned | Planned | case, announcement, knowledge |
| NETWORK_11   | Doctor can share post from consultation session         | Planned | Planned | Planned | consultation share            |
| NETWORK_12   | Organisation can share post from walk-in result context | Planned | Planned | Planned | walk-in result share          |

## Notes

- This report follows mandatory 3-round execution for every testcase.
- Legacy flow-based document style is removed; module-based structure is retained.
- After environment fix for global-auth magic-login, update Round 1/2/3 from Planned to Pass/Fail.
