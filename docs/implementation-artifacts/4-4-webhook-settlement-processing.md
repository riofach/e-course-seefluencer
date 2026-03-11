# Story 4.4: Webhook Settlement Processing

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the system,
I need to process payment notifications automatically from Midtrans,
so that student subscriptions are activated without manual intervention after a successful payment.

## Acceptance Criteria

1. **Given** a user completes a Midtrans Sandbox payment (Story 4.3 `onSuccess` fires),
   **When** Midtrans sends a POST notification to `/api/webhooks/midtrans`,
   **Then** the endpoint is reachable **without any authentication or CSRF token** — it must be publicly accessible (architecture constraint: sole anonymous route).

2. **Given** a valid POST body arrives at `/api/webhooks/midtrans`,
   **When** the server processes the payload,
   **Then** the `signature_key` in the payload is verified against the server-computed hash: `SHA512(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)` (NFR-S3).

3. **Given** the signature verification **fails**,
   **When** the endpoint evaluates the signature,
   **Then** the handler returns HTTP `401 Unauthorized` and **does NOT mutate** the database.

4. **Given** the signature verification **passes** and `transaction_status === "settlement"` or `"capture"`,
   **When** the handler looks up the subscription by `order_id` (stored as `midtransOrderId` in the `subscriptions` table),
   **Then** the subscription record is updated: `status = 'active'`, `startDate = now()`, `endDate = startDate + plan.durationDays` (FR18).

5. **Given** the webhook payload has `transaction_status === "deny"`, `"cancel"`, `"expire"`, or `"failure"`,
   **When** the handler processes the notification,
   **Then** the subscription record's `status` is updated to `'inactive'` (no error thrown, just silent update).

6. **Given** a duplicate webhook notification is received for an already `'active'` subscription (Midtrans may resend),
   **When** the handler processes the duplicate,
   **Then** the handler returns HTTP `200 OK` without re-processing or corrupting the subscription (idempotency guarantee).

7. **Given** the POST body is malformed JSON or missing required fields (`transaction_status`, `order_id`, `gross_amount`, `signature_key`),
   **When** the endpoint attempts to parse it,
   **Then** the handler returns HTTP `400 Bad Request` without throwing an unhandled exception.

8. **Given** the subscription for the given `order_id` is **not found** in the database,
   **When** the handler tries to update it,
   **Then** the handler returns HTTP `404 Not Found` without throwing an unhandled exception.

9. **Given** a successful settlement is processed,
   **When** the database update completes,
   **Then** the handler returns HTTP `200 OK` to Midtrans (Midtrans will retry if it receives anything other than 200).

## Tasks / Subtasks

- [x] **Create the Route Handler file** (AC: 1, 9)
  - [x] Create `project-e-course/src/app/api/webhooks/midtrans/route.ts`
  - [x] Export only `POST` handler — no `GET`, `PUT`, etc.
  - [x] Do NOT add any auth middleware or CSRF protection to this route

- [x] **Implement Zod schema for webhook payload validation** (AC: 7)
  - [x] Create `project-e-course/src/app/api/webhooks/midtrans/webhook-payload.schema.ts` (or inline in route.ts if compact)
  - [x] Schema must include: `order_id` (string), `transaction_status` (string), `status_code` (string), `gross_amount` (string), `signature_key` (string)
  - [x] Use `z.object(...)` with `.safeParse()` — on failure, return `NextResponse.json({ error: 'Invalid payload' }, { status: 400 })`

- [x] **Implement signature verification** (AC: 2, 3, NFR-S3)
  - [x] Create pure function: `verifyMidtransSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string, receivedSignature: string): boolean`
  - [x] Implementation: `crypto.createHash('sha512').update(orderId + statusCode + grossAmount + serverKey).digest('hex')` — compare with `receivedSignature`
  - [x] Place helper in `project-e-course/src/server/actions/payments/webhook-utils.ts` (testable, no `server-only` import needed here)
  - [x] On signature mismatch: return `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`

- [x] **Implement subscription update logic** (AC: 4, 5, 6, 8)
  - [x] Create Server-side handler function in `project-e-course/src/server/actions/payments/process-webhook.ts`
  - [x] Lookup subscription: `db.select().from(subscriptions).where(eq(subscriptions.midtransOrderId, orderId)).limit(1)`
  - [x] If not found: return 404 response
  - [x] If `transaction_status === 'settlement' || 'capture'`: update `status = 'active'`, `startDate = new Date()`, recalculate `endDate`
  - [x] If already `'active'` (duplicate): return 200 immediately without mutation (idempotency)
  - [x] If `transaction_status` is `'deny' | 'cancel' | 'expire' | 'failure'`: update `status = 'inactive'`

- [x] **Recalculate `endDate` from plan** (AC: 4)
  - [x] After finding subscription, query `plans` table to get `durationDays` for the subscription's `planId`
  - [x] `endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)`
  - [x] Update `subscriptions` table with Drizzle: `db.update(subscriptions).set({ status: 'active', startDate, endDate }).where(eq(subscriptions.id, sub.id))`

- [x] **Wire `env.MIDTRANS_SERVER_KEY` safely** (NFR-S3)
  - [x] Confirm `MIDTRANS_SERVER_KEY` is in `env.js` **server** schema (NOT `NEXT_PUBLIC_`)
  - [x] Import via `import { env } from '~/env'` — never reference `process.env.MIDTRANS_SERVER_KEY` directly

- [x] **Write unit tests** (testing requirement)
  - [x] Create `project-e-course/src/server/actions/payments/webhook-utils.test.ts` (Vitest/Node)
    - [x] Test: correct signature returns `true`
    - [x] Test: wrong signature returns `false`
    - [x] Test: empty signature returns `false`
  - [x] Create `project-e-course/src/server/actions/payments/process-webhook.test.ts` (Vitest/Node)
    - [x] Test: settlement status → subscription updated to `active`
    - [x] Test: already active subscription → no mutation (idempotency)
    - [x] Test: deny/cancel/expire → subscription updated to `inactive`
    - [x] Test: unknown orderId → returns error object (404 semantics)

- [x] **Integration smoke test via ngrok** (optional, manual)
  - [x] Start `npm run dev` in `project-e-course/`
  - [x] Start ngrok: `ngrok http 3000` → copy HTTPS URL
  - [x] Configure Midtrans Sandbox Notification URL: `https://<ngrok-url>/api/webhooks/midtrans`
  - [x] Complete Sandbox payment from `/pricing` → confirm subscription activates in DB

## Dev Notes

### 🔴 Critical: This is the ONLY Anonymous HTTP Route

Per architecture constraint (`architecture.md`): `/api/webhooks/midtrans` is the **sole route handler that allows anonymous POST access** without CSRF or authentication. The `middleware.ts` matcher does NOT include `api/webhooks/*` — confirm this.

Current `middleware.ts` matcher:

```ts
matcher: ["/courses/:path*", "/admin/:path*", "/profile/:path*"],
```

✅ `/api/webhooks/midtrans` is NOT in the matcher → it is already publicly accessible. Do NOT add it.

### 🔴 Critical: Signature Verification Algorithm

Midtrans webhook signature is computed as:

```
SHA512(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
```

**Important:** `gross_amount` in the webhook payload is a **string** (e.g., `"99000.00"`), not a number. Use the raw string value as-is for the hash. Do NOT parse it to a number before hashing.

```ts
import crypto from 'node:crypto';

export function verifyMidtransSignature(
	orderId: string,
	statusCode: string,
	grossAmount: string,
	serverKey: string,
	receivedSignature: string,
): boolean {
	const computedHash = crypto
		.createHash('sha512')
		.update(orderId + statusCode + grossAmount + serverKey)
		.digest('hex');
	return computedHash === receivedSignature;
}
```

### 🔴 Critical: Story 4.3 Created Subscription in `'inactive'` State

Story 4.2/4.3 already creates a `subscriptions` row with `status: 'inactive'` and a unique `midtransOrderId` (format: `sub_<userId8chars>_<timestamp>`) **before** the Snap popup opens. This webhook handler must:

1. **Find** that existing row by `midtransOrderId = order_id` from webhook payload
2. **Update** it to `active` (NOT insert a new row)

**Schema reference** (already exists in `project-e-course/src/server/db/schema.ts`):

```ts
export const subscriptions = pgTable('subscriptions', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	planId: integer('plan_id').references(() => plans.id),
	status: varchar('status', { length: 20 }).default('inactive').notNull(),
	startDate: timestamp('start_date', { withTimezone: true }),
	endDate: timestamp('end_date', { withTimezone: true }),
	midtransOrderId: varchar('midtrans_order_id', { length: 255 }).unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

### 🔴 Critical: `endDate` Must Be Recalculated at Settlement Time

Story 4.2 stored a preliminary `endDate` at subscription creation time (based on `startDate = now()` at checkout). At webhook settlement, `startDate` and `endDate` **must be reset** to the actual settlement moment:

```ts
const now = new Date();
const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
// Update subscription: status='active', startDate=now, endDate=endDate
```

Query `plans` table by `subscription.planId` to get `durationDays`.

### 🔵 Route Handler Structure

```ts
// project-e-course/src/app/api/webhooks/midtrans/route.ts
import { NextResponse } from 'next/server';
import { env } from '~/env';
import { db } from '~/server/db';
import { subscriptions, plans } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyMidtransSignature } from '~/server/actions/payments/webhook-utils';
import { webhookPayloadSchema } from './webhook-payload.schema'; // or inline

export async function POST(request: Request) {
	// 1. Parse body
	const body = await request.json().catch(() => null);
	const parsed = webhookPayloadSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
	}

	const { order_id, transaction_status, status_code, gross_amount, signature_key } = parsed.data;

	// 2. Verify signature
	const isValid = verifyMidtransSignature(
		order_id,
		status_code,
		gross_amount,
		env.MIDTRANS_SERVER_KEY,
		signature_key,
	);
	if (!isValid) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// 3. Find subscription
	const [subscription] = await db
		.select()
		.from(subscriptions)
		.where(eq(subscriptions.midtransOrderId, order_id))
		.limit(1);

	if (!subscription) {
		return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
	}

	// 4. Idempotency: already active → skip
	if (subscription.status === 'active') {
		return NextResponse.json({ ok: true }, { status: 200 });
	}

	// 5. Handle status transitions
	if (transaction_status === 'settlement' || transaction_status === 'capture') {
		const [plan] = await db.select().from(plans).where(eq(plans.id, subscription.planId!)).limit(1);
		const now = new Date();
		const endDate = new Date(now.getTime() + (plan?.durationDays ?? 30) * 24 * 60 * 60 * 1000);

		await db
			.update(subscriptions)
			.set({ status: 'active', startDate: now, endDate })
			.where(eq(subscriptions.id, subscription.id));
	} else if (['deny', 'cancel', 'expire', 'failure'].includes(transaction_status)) {
		await db
			.update(subscriptions)
			.set({ status: 'inactive' })
			.where(eq(subscriptions.id, subscription.id));
	}

	return NextResponse.json({ ok: true }, { status: 200 });
}
```

### 🔵 Webhook Payload Schema

```ts
// webhook-payload.schema.ts
import { z } from 'zod';

export const webhookPayloadSchema = z.object({
	order_id: z.string(),
	transaction_status: z.string(),
	status_code: z.string(),
	gross_amount: z.string(),
	signature_key: z.string(),
	fraud_status: z.string().optional(),
	payment_type: z.string().optional(),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
```

### 🔵 Midtrans Transaction Status Values

| `transaction_status` | Meaning                                       | Action                      |
| -------------------- | --------------------------------------------- | --------------------------- |
| `settlement`         | Bank transfer confirmed / Credit card settled | Set `active`                |
| `capture`            | Credit card captured                          | Set `active`                |
| `pending`            | Awaiting bank transfer                        | No action (keep `inactive`) |
| `deny`               | Card denied / fraud detected                  | Set `inactive`              |
| `cancel`             | User or merchant cancelled                    | Set `inactive`              |
| `expire`             | Payment window expired                        | Set `inactive`              |
| `failure`            | Technical failure                             | Set `inactive`              |

> Note: For `pending`, do NOT update the subscription — Midtrans will send another notification when status changes to `settlement` or `expire`.

### 🔵 Testing Midtrans Webhook Locally

Since Midtrans cannot reach `localhost`, two options:

**Option A (Recommended): ngrok**

```bash
ngrok http 3000
# Output: https://xxxx.ngrok.io
# Set Midtrans Sandbox Notification URL to: https://xxxx.ngrok.io/api/webhooks/midtrans
```

**Option B: Mock webhook via curl (no ngrok needed)**

```bash
# First compute correct signature in Node.js:
# SHA512(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
# Then send:
curl -X POST http://localhost:3000/api/webhooks/midtrans \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "sub_abc12345_1234567890",
    "transaction_status": "settlement",
    "status_code": "200",
    "gross_amount": "99000.00",
    "signature_key": "<computed_sha512_hash>"
  }'
```

### 🔵 Environment Variables

These are already in `env.js` and `.env` from Story 4.2:

```ts
// env.js — server schema (already exists)
MIDTRANS_SERVER_KEY: z.string().min(1),        // server-only, used for signature + Snap API
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string(),   // client-safe, already in layout.tsx <Script>
```

**NEVER** use `process.env.MIDTRANS_SERVER_KEY` directly. Always import `env` from `~/env`.

### 🔵 `getUserActiveSubscription` — Existing Query for Paywall

After this webhook activates the subscription, the paywall check in Story 4.1 uses `getUserActiveSubscription` from `src/server/queries/subscriptions.ts`. Ensure the updated schema matches what this query expects:

```ts
// Already exists — checks: status === 'active' AND endDate > now()
export async function getUserActiveSubscription(userId: string) { ... }
```

✅ No changes needed to this query — it will automatically reflect the activated subscription.

### 🔵 Existing Patterns to Follow

**Physical project root:** All source files are under `project-e-course/src/`. The `package.json` is in `project-e-course/`.

**TypeScript conventions:**

- Return type for route handler: `NextResponse` (from `next/server`)
- No `any` types — use `z.infer<typeof webhookPayloadSchema>` for payload typing
- Drizzle infer for subscription type: `typeof subscriptions.$inferSelect`

**File naming convention:** `kebab-case` for all new files.

**Error handling convention:** Do NOT `throw` from route handlers — catch errors and return appropriate `NextResponse`.

**Testing framework:** Vitest (Node environment). Run tests with:

- `npm test` — Node test runner for `.test.ts` files
- `npx vitest run src/server/actions/payments/webhook-utils.test.ts`

**Auth guard pattern (NOT needed here):** This route is intentionally anonymous — do NOT add `getServerAuthSession()` to the webhook handler.

### 🟡 UX/Frontend Impact

This is a **pure backend story**. No UI components are created or modified. The user experience impact is:

- After `onSuccess` in Story 4.3, user sees "Pembayaran berhasil! Sedang mengaktifkan langgananmu…"
- The subscription activates asynchronously via this webhook (typically within 1-3 seconds)
- On the student's next visit to a premium lesson, `getUserActiveSubscription()` will return the active subscription → paywall disappears

There is **no real-time push** from webhook to client in this story. The student simply navigates to premium content after a brief wait.

### 🟡 Security Notes (NFR-S3)

- `MIDTRANS_SERVER_KEY` is **ONLY** used server-side in this webhook handler and in `initiate-checkout.ts`. Never expose via `NEXT_PUBLIC_`.
- The signature verification (AC: 2, 3) is the primary security gate. Without it, anyone could fake a webhook and activate subscriptions for free.
- The route must NOT require `Authorization` headers or cookies — Midtrans cannot send them.
- Input validation via Zod (AC: 7) prevents injection or malformed data from reaching the database layer.

### 🟢 What Already Exists (DO NOT Recreate)

```
project-e-course/src/server/db/schema.ts                             — subscriptions + plans tables
project-e-course/src/server/db/index.ts                              — db client (Drizzle)
project-e-course/src/server/actions/payments/initiate-checkout.ts    — creates 'inactive' subscription
project-e-course/src/server/actions/payments/initiate-checkout.shared.ts — PendingSubscriptionInput type, addDays logic
project-e-course/src/server/queries/subscriptions.ts                 — getUserActiveSubscription (used by paywall)
project-e-course/src/middleware.ts                                    — does NOT block /api/webhooks/*
project-e-course/src/app/layout.tsx                                  — Snap.js already loaded
project-e-course/src/env.js                                          — MIDTRANS_SERVER_KEY already validated
project-e-course/src/types/index.ts                                  — ActionResponse<T> type
```

### 🟢 New Files to Create

```
project-e-course/src/app/api/webhooks/midtrans/route.ts               — Main Route Handler (POST only)
project-e-course/src/app/api/webhooks/midtrans/webhook-payload.schema.ts — Zod schema for payload
project-e-course/src/server/actions/payments/webhook-utils.ts         — Pure verifyMidtransSignature()
project-e-course/src/server/actions/payments/webhook-utils.test.ts    — Unit tests for signature verification
project-e-course/src/server/actions/payments/process-webhook.test.ts  — Unit tests for DB update logic
```

### Project Structure Notes

- New route follows Next.js App Router convention: `src/app/api/webhooks/midtrans/route.ts`
- Need to create directory `src/app/api/webhooks/midtrans/` — directory does NOT exist yet (only `src/app/api/auth/[...nextauth]/` exists)
- Helper functions go under `src/server/actions/payments/` to stay consistent with feature-sliced pattern
- No new database migrations needed — `subscriptions` and `plans` tables already exist

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 4, Story 4.4 (FR18), Epic 4 overview]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — `/api/webhooks/midtrans` as sole anonymous route, Server Actions `ActionResponse<T>`, Feature-Sliced Actions, NFR-S3 security, Drizzle ORM patterns]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR18 (Webhook subscription activation), NFR-S3 (environment variable security)]
- [Source: `_bmad-output/implementation-artifacts/4-3-midtrans-checkout-integration.md` — `midtransOrderId` format (`sub_<userId8chars>_<timestamp>`), subscription created as `inactive` before Snap, `initiateMidtransCheckoutWithDependencies` implementation, Vitest test framework, `ActionResponse<T>` location, physical project directory]
- [Source: `project-e-course/src/server/db/schema.ts` — `subscriptions` table schema, `plans` table schema, `midtransOrderId` column]
- [Source: `project-e-course/src/server/actions/payments/initiate-checkout.shared.ts` — `addDays()` utility, `PendingSubscriptionInput` type, `buildMidtransOrderId` pattern]
- [Source: `project-e-course/src/server/queries/subscriptions.ts` — `getUserActiveSubscription` — downstream consumer of this webhook's activation]
- [Source: `project-e-course/src/middleware.ts` — matcher does NOT include webhook routes → already publicly accessible]
- [Source: `project-e-course/src/env.js` — MIDTRANS_SERVER_KEY server schema validation]

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- Confirmed `project-e-course/src/middleware.ts` matcher still excludes `/api/webhooks/*`, preserving the architecture requirement that `/api/webhooks/midtrans` remains the sole anonymous POST route.
- Confirmed `project-e-course/src/env.js` keeps `MIDTRANS_SERVER_KEY` in the server schema and no `NEXT_PUBLIC_` secret exposure was introduced.
- Automated validation completed successfully: `npm test` and `npm run check` both pass after adding webhook route, payload validation, signature verification, route-body handler, and subscription processing logic.
- Manual ngrok/Midtrans sandbox smoke verification completed successfully: Midtrans Sandbox notification URL was pointed to the ngrok tunnel, payment success hit `/api/webhooks/midtrans`, and the subscription activated correctly.
- During smoke verification, `/pricing` initially required a manual refresh to reflect the newly active subscription; this was fixed by refreshing pricing route data from the client after Snap success so the badge and active-plan CTA update automatically.

### Completion Notes List

- Added anonymous App Router webhook endpoint at `project-e-course/src/app/api/webhooks/midtrans/route.ts` with POST-only handling, safe JSON parsing, public access, and response mapping to Midtrans-compatible HTTP statuses.
- Added payload validation in `project-e-course/src/app/api/webhooks/midtrans/webhook-payload.schema.ts` and extracted route-body orchestration into `project-e-course/src/app/api/webhooks/midtrans/route.shared.ts` for direct automated coverage of 400/401/200/404 flows.
- Added pure SHA512 signature verification helper in `project-e-course/src/server/actions/payments/webhook-utils.ts` with unit coverage for valid, invalid, and empty signatures.
- Added subscription settlement processor in `project-e-course/src/server/actions/payments/process-webhook.ts` and `project-e-course/src/server/actions/payments/process-webhook.shared.ts`, covering lookup by `midtransOrderId`, idempotent active handling, activation with recalculated `startDate`/`endDate`, inactive transitions for deny/cancel/expire/failure, and 404 handling when subscription or plan is unavailable.
- Added automated tests in `project-e-course/src/server/actions/payments/webhook-utils.test.ts`, `project-e-course/src/server/actions/payments/process-webhook.test.ts`, and `project-e-course/src/app/api/webhooks/midtrans/route.test.ts` to cover acceptance-critical logic for signature checks, DB update semantics, and request validation/orchestration.
- Completed manual ngrok smoke verification end-to-end: successful Midtrans Sandbox payment triggered the webhook, updated the existing subscription row to active, and confirmed the pricing screen reflects the active plan state.
- Added client-side pricing refresh behavior in `project-e-course/src/components/student/pricing-page-client.tsx` so the UI re-syncs automatically after webhook-driven activation without requiring a manual browser refresh.

### File List

- \_bmad-output/implementation-artifacts/4-4-webhook-settlement-processing.md
- \_bmad-output/implementation-artifacts/sprint-status.yaml
- project-e-course/src/app/api/webhooks/midtrans/route.shared.ts
- project-e-course/src/app/api/webhooks/midtrans/route.test.ts
- project-e-course/src/app/api/webhooks/midtrans/route.ts
- project-e-course/src/app/api/webhooks/midtrans/webhook-payload.schema.ts
- project-e-course/src/components/student/pricing-page-client.test.tsx
- project-e-course/src/components/student/pricing-page-client.tsx
- project-e-course/src/server/actions/payments/process-webhook.shared.ts
- project-e-course/src/server/actions/payments/process-webhook.test.ts
- project-e-course/src/server/actions/payments/process-webhook.ts
- project-e-course/src/server/actions/payments/webhook-utils.test.ts
- project-e-course/src/server/actions/payments/webhook-utils.ts

## Change Log

- 2026-03-09: Implemented Midtrans webhook settlement processing with payload validation, signature verification, idempotent subscription activation/inactivation, route orchestration tests, and pricing-page refresh behavior so subscription status updates automatically after successful payment.
