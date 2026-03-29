## Supabase Vector RAG (n8n) – notes & template

### Goal

Use Supabase Vector to store and retrieve **project policies**, **clinic rules**, and **FAQ** as a knowledge base for the booking agent.

### Recommended structure

- **Documents**: Markdown policy files (example: `PROJECT_POLICIES.md`), clinic FAQs, payment/booking rules.
- **Chunking**: 600–1200 chars per chunk, overlap 100–200.
- **Metadata**:
  - `source`: file name / doc id
  - `type`: `policy | faq | clinic_rule`
  - `updatedAt`

### Retrieval hints (agent prompt)

- Retrieve top \(k=4..8\) chunks for each user turn.
- Prefer `type=policy` when decision involves consent, privacy, or payment.

### Minimal response contract (to FE)

Always respond with JSON containing at least:

- `reply`
- `intent`
- `requiresConfirmation`
- `traceId`

### n8n implementation sketch

1. Webhook → Normalize FE Contract
2. (Optional) Embed user query → Supabase Vector search → attach results to agent context
3. Agent uses tools:
   - Get Available Appointments
   - Reserve Slot
   - Confirm Reservation
   - Release Reservation
4. Build FE Response → Respond
