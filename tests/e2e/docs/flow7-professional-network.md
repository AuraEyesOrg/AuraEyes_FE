# AURA - Professional Network Flow

## 1. Objective

- Verify ophthalmologist/organisation can create posts on /network/feed.
- Verify negative path for empty post content.
- Verify interaction path (reaction/comment) and role security boundary (patient blocked).

## 2. Source of Truth

- FE routes/pages/components:
  - /network
  - /network/feed
  - /network/post/:id
  - src/features/professional-network/pages/feed.tsx
  - src/features/professional-network/pages/post-detail.tsx
  - src/features/professional-network/components/post/PostComposer.tsx
  - src/features/professional-network/components/post/PostCard.tsx
- BE endpoints/services:
  - GET /api/network/posts/feed
  - POST /api/network/posts
  - POST /api/network/posts/{id}/reactions
  - POST /api/network/posts/{id}/comments

## 3. Hybrid AAA Test Design

- Arrange (Backdoor/API + DB):
  - POST /api/test-backdoor/reset-and-seed
  - Magic login/auth fixtures for Ophthalmologist, OrgAdmin, Patient
  - Optional DB assertions for post/comment counts
- Act (UI):
  - Create post via PostComposer
  - Trigger reaction and add comment from feed/detail page
  - Attempt unauthorized route access as patient
- Assert (UI + API/DB):
  - Post appears with expected category
  - Comment appears in post detail
  - Unauthorized role is redirected and cannot load network feed payload

## 4. UI Journey (Main)

1. Login as ophthalmologist and open /network/feed.
2. Enter content in Share insights composer.
3. Select post type (Case Presentation / Announcement / Knowledge Share).
4. Attach image and confirm anonymization when required.
5. Click Post and verify content appears in feed.
6. Open /network/post/:id and add comment.
7. Validate interaction updates.
8. Login as patient and navigate /network/feed to verify access denied.

## 5. Backdoor and Data Setup

- Required:
  - POST /api/test-backdoor/reset-and-seed
  - GET /api/test-backdoor/auth/magic-login?email=ophthalmologist@gmail.com
  - GET /api/test-backdoor/auth/magic-login?email=orgadmin@gmail.com
  - GET /api/test-backdoor/auth/magic-login?email=patient@gmail.com

## 6. Recommended Locators

- Composer:
  - getByPlaceholder('Share insights with your network...')
  - getByRole('button', { name: 'Case Presentation' })
  - getByRole('button', { name: 'Announcement' })
  - getByRole('button', { name: 'Knowledge Share' })
  - locator('input[type="file"]').first()
  - getByRole('button', { name: /^Post$/ })
- Feed/post navigation:
  - locator('article').first()
  - locator('a[href*="/network/post/"]').first()
- Comment:
  - getByPlaceholder('Add a comment...')
  - getByRole('button', { name: /^Post$/ }).last()

## 7. Assertions

- New post content appears in feed.
- Empty content cannot be submitted.
- Comment is persisted and visible in post detail.
- Patient role is redirected out of /network/\* and cannot access feed data.

## 8. Risks / Notes

- Feed uses optimistic UI and pagination; use deterministic content strings per test.
- Some action buttons are icon-only; prefer scoped locators (article region + action row).
- For Case Presentation with files, anonymization/disclaimer checkboxes are required.
