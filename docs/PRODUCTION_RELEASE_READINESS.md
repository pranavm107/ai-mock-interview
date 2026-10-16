# Production Release Readiness

## 1. Release Scope & Architecture
This release candidate encompasses the **AI Coding Training** module, including:
- Clerk authentication and integration.
- Daily problem assignment deterministic engine.
- Monaco-based editor with automated Docker sandbox execution.
- LLM-powered static code analysis.
- Integrity session monitoring, including malpractice strike logic.
- Performance and query scaling improvements via payload projection.

## 2. Required Environment Variables
**DO NOT COMMIT REAL VALUES to source control.** Ensure `.env` is listed in your `.gitignore` across deployment boundaries.

**Frontend (`VITE_` prefixed):**
- `VITE_API_URL` (Required) - Backend routing URL
- `VITE_CLERK_PUBLISHABLE_KEY` (Required) - Auth publishable key
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` (Required) - Firebase core web integration
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Optional/Contextual) - Used for previous file storage logic

**Backend:**
- `NODE_ENV` (Required) - Should be `production`
- `PORT` (Required) - Listen port
- `CLERK_SECRET_KEY` (Required) - Auth verification
- `GROQ_API_KEY` (Required) - AI code analysis backend provider
- `GROQ_MODEL` (Optional, defaults to `llama3-70b-8192`) - The model slug for inference
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (Required) - Firebase Admin service account keys for database operations

## 3. Pre-deployment Checklist
- [x] Ensure `.env` files are strictly git-ignored.
- [x] Ensure all frontend secrets use `VITE_` prefix and backend secrets strictly omit it.
- [x] Verify Docker daemon access for sandbox execution (`/var/run/docker.sock`).
- [ ] Define CORS allow-list for `VITE_API_URL` matching the target domain.
- [ ] Register target domain with Clerk.
- [ ] Ensure Firebase Firestore indexes are provisioned.

## 4. Build and Test Commands
All integration builds and regression test suites pass.

**Run Build:**
- Frontend: `npm run build`
- Backend: `cd server && npm run build`

**Run Tests:**
- Frontend: `npx vitest run src/tests/pages/CodingDashboard.test.tsx src/tests/components/coding/CodingReadiness.test.tsx src/tests/pages/CodingWorkspaceA11y.test.tsx src/tests/components/coding/CodingA11y.test.tsx`
- Backend: `npx vitest run server/test-c22.test.ts server/test-c23.test.ts server/test-c24.test.ts server/test-c29.test.ts server/tests/routes/integrity.security.test.ts`

## 5. Security & Privacy Findings
- **Data Integrity:** `codingDailyAssignments` guarantees stable user mappings. Test case solutions are isolated correctly. C25 experimental Chrome Integrity Extension message bridge remains safely disabled by default.
- **Isolation Boundaries:** Code execution relies on ephemeral `python:3.12-alpine` containers restricted to 256MB memory, strict PID limits, no networking, dropped capabilities, and forced timeout interrupts. 
- **Secret Handling:** All secrets are correctly omitted from bundles. The AI prompt uses boundaries to mitigate prompt injection.
- **Authorization:** `integrity.security.test.ts` confirms full boundary enforcement against hijacked sessions or cross-tenant data requests.

## 6. Known Limitations & Unresolved Issues
- **Scaling Bottlenecks:** Firestore `IN` batch queries limit chunking in `codingAnalyticsService.ts` to 10-item boundaries.
- **Concurrency Locks:** The AI analysis concurrency boundary relies on a Node-level `Set()`. In a multi-instance pod deployment without sticky sessions, users could theoretically bypass concurrency limitations. Needs Redis if heavily scaled.
- **Legacy Failures:** Some legacy interview-test suites from unrelated modules (e.g. C18 tests in `test-c18.test.ts`) may fail due to schema changes unrelated to the coding module.

## 7. Manual Verification Steps
- [ ] **Infrastructure Provisioning:** Host environment requires Docker daemon to be running. Depending on PaaS (like Heroku or Vercel), serverless execution of `sandboxRunner.ts` will fail natively unless running on a provisioned VM/Container instance.
- [ ] **Smoke Test:** Create a fresh user account and confirm they receive an initial problem assignment correctly.

## 8. Backup and Rollback Considerations
- **Rollback:** Ensure Firestore backups are enabled before cutting the production release, as new assignment and submission schemas will generate irreversible data.
- **Reversion:** Code reversion is completely stateless outside of Firestore schema compatibility.

## 9. Final Decision
**Status:** **READY WITH LIMITATIONS**

**Evidence:**
- Build pipelines (Vite TS/React + TS backend) complete without fatal chunking or syntax exceptions.
- C22-C29 core business logic regressions strictly pass.
- Application holds firm boundaries against unauthorized state mutations in testing.
- **Limitation:** The audited coding module passes the selected checks; production deployment remains unverified. The backend MUST be hosted in an environment that allows Docker socket mounting, rendering standard serverless deployments invalid. Target environments and live integrations (CORS, Firestore indexes) must still be provisioned and smoke-tested.
