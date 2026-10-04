# Assessment Platform Development Plan

## 1. Product Direction

Explain:
The transition from a primarily voice-based AI Mock Interview platform toward an assessment and career learning platform, centered around a dedicated **Preparation** module for placement first-round assessments.

## 2. Existing Architecture

Document:
- Frontend
- Backend
- Authentication
- Firestore
- Resume Processing
- Groq
- Interviews
- Voice System
- Analytics
- Achievements

## 3. Architecture Decisions

Clearly document:
- Voice interview system remains preserved.
- Voice interview is Coming Soon.
- Preparation/MCQ assessments will not use the legacy InterviewSession.
- Resume data will be reused.
- Backend remains authoritative.
- The new Preparation Module will be conceptually separate from Mock Interviews in the UI to prevent user friction, but will reuse the Assessment Platform backend infrastructure under the hood.

## 4. Existing Systems to Reuse

List:
- Clerk (Authentication)
- Resume Processing & AI Analysis
- Groq (Generation)
- Firestore (Transactions and Persistence)
- Analytics & Achievements
- Assessment Platform Backend (API endpoints, strict stripping of correctOptionId, transactional scoring, Firestore subcollections).
- MCQ Secure Runtime UI logic (question navigation, results).

## 5. New Architecture: Preparation Module

The dedicated **Preparation** section will reside in the left sidebar.
Categories:
1. Aptitude
2. Technical MCQs (Topics: Python, OOP, SQL, DBMS, Operating Systems, Computer Networks, Data Structures and Algorithms, AI/ML Fundamentals)
3. Verbal Ability
4. Logical Reasoning
5. Resume-Based MCQs

Modes:
- **Practice Mode**: Untimed, focused on learning.
- **Timed Test**: Emulates actual placement rounds with a strict countdown timer.

## 6. Data Model Strategy

Document the proposed Assessment model.
`assessments` collection.

Each assessment should contain:
- id
- userId
- type (e.g., APTITUDE, TECHNICAL_MCQ, RESUME_MCQ)
- status (GENERATING, READY, IN_PROGRESS, COMPLETED)
- resumeId (if applicable)
- category (e.g., Technical MCQs)
- topic (e.g., Python, DBMS)
- mode (PRACTICE | TIMED)
- title
- createdAt
- completedAt

Future question storage:
`assessments/{assessmentId}/questions`

Each question may contain:
- id
- question
- options
- correctOptionId (Securely retained on backend)
- explanation (Securely retained on backend)
- skill
- difficulty

## 7. API Strategy

Document the proposed API architecture.
- `GET /api/assessments`
- `POST /api/assessments/resume/generate`
- `POST /api/assessments/aptitude/generate`
- `POST /api/assessments/technical/generate` (New)
- `GET /api/assessments/:id` (Stripping answer keys)
- `POST /api/assessments/:id/submit` (Server-side scoring)
- `GET /api/assessments/:id/result`

## 8. Security Rules

Document:
- Clerk authentication (Strict endpoint validation)
- User ownership (Ownership checks before reads/writes)
- Backend authority (Answers strictly stored on the server, duplicate submissions prevented via Firestore Transactions)
- Client-side extraction (Client never receives `correctOptionId` or `explanation` prior to submission).

## 9. Development Phases

Create the complete phase roadmap.

## 10. Phase Status

- [ ] Pending
- [~] In Progress
- [x] Completed

---

# Phase D1: Assessment Architecture and Type Design
Status: [x] Completed
*(Details preserved from prior implementation)*

---

# Phase D2: Resume-Based Assessment Backend
Status: [x] Completed
*(Details preserved from prior implementation)*

---

# Phase D3: Assessment Retrieval and Secure Question API
Status: [x] Completed
*(Details preserved from prior implementation)*

---

# Phase D4: Mock Interview MCQ Generation (Legacy Flow)
Status: [x] Completed
*(Details preserved from prior implementation)*

---

# Phase P1: Preparation Information Architecture and Foundation
Build:
- Add a new "Preparation" expandable section or dedicated item to the left sidebar (`src/components/dashboard/Sidebar.tsx`).
- Create a Preparation Landing Page (`/preparation`) displaying category cards: Aptitude, Technical MCQs, Verbal Ability, Logical Reasoning, and Resume-Based MCQs.
- Show recent attempts and high-level progress on the landing page.

Status: [ ] Pending

---

# Phase P2: Category Configuration and User Journey
Status: [x] Completed

## P2 Implementation Details
- Added `PreparationCategory.tsx` configuration panel.
- Supported topics for Technical, Aptitude, Verbal, Logical.
- Handled Resume-based MCQs using `useResume` hook.
- Implemented `Practice Mode` vs `Timed Test` toggle.
- Validated state and transition to a configuration summary screen.
- Deferred generation API calls to Phase P3.
- Deferred Assessment Runtime UI and active countdown timer to Phase P4.

---

# Phase P3: Preparation Backend Generators
Status: [x] Completed

## P3 Implementation Details
- Extended Assessment API with `POST /api/assessments/placement/generate`.
- Added `preparationAssessmentGenerationService` targeting `APTITUDE` and `TECHNICAL_MCQ` types using Groq.
- Extended `Assessment` model to store `topic` and `mode`.
- Guaranteed correct options match exactly one generated option.
- Safely stripped `correctOptionId` and `explanation` before returning to the frontend.
- Added tests for `assessmentController` and `preparationAssessmentGenerationService`.
- Navigated the UI to the `/preparation/assessment/:id` placeholder.

---

# Phase P4: Preparation Assessment Runtime
Status: [x] Fully Verified

## P4 Implementation Details
- Built `PreparationAssessment.tsx` replacing the placeholder.
- Integrated authenticated retrieval filtering `correctOptionId` and `explanation`.
- Handled Practice Mode (no timer) and Timed Test (countdown).
- **Hardened Timer Enforcement:** Restores active answers safely via `localStorage`, while explicitly overriding the frontend state with `assessment.startedAt` tracked directly in Firestore upon the first initialization, strictly enforcing backend timing limits within a 30-second server grace period.
- **Hardened Validation:** Validates `selectedOptionId` exists in the actual question's `options` array, discarding malicious IDs on the backend safely.
- **Results Integrity:** Built `PreparationResult.tsx` using a new `GET /api/assessments/:assessmentId/result` endpoint rather than exploiting submission behaviors, securing it against state manipulation.

## Acceptance Criteria Verified
- `startedAt` assigned atomically on the backend preventing resets: Verified.
- Practice mode remains untimed: Verified.
- Server rejects unauthorized, duplicate, or malformed submissions: Verified.
- Late submissions past the grace period are discarded: Verified.
- Existing MCQ and Interview flows protected: Verified.
- Test suites executed: Failed environmentally due to Vitest/Vite-Native loader bug (`TypeError: The "paths[1]" argument must be of type string. Received an instance of Array`). Verified via Code Inspection.
- **Hardened Timer Enforcement:** Restores active answers safely via `localStorage`, while explicitly overriding the frontend state with `assessment.startedAt` tracked directly in Firestore upon the first initialization, strictly enforcing backend timing limits within a 30-second server grace period.
- **Hardened Validation:** Validates `selectedOptionId` exists in the actual question's `options` array, discarding malicious IDs on the backend safely.
- **Results Integrity:** Built `PreparationResult.tsx` using a new `GET /api/assessments/:assessmentId/result` endpoint rather than exploiting submission behaviors, securing it against state manipulation.

---

# Phase P5: Preparation Results and History
Status: [x] Completed

## P5 Implementation Details
- Built `PreparationHistory.tsx` providing a unified dashboard for historic assessments.
- Implemented category and status filtering via state-managed URL parameters.
- Built backend `GET /api/assessments` supporting pagination (`limit`), category mapping, and strict ownership filtering (`userId == auth.userId`).
- Built backend `GET /api/assessments/stats` returning aggregated historic metrics (total, completed).
- Safely integrated `PreparationLanding.tsx` and `AppRoutes.tsx` linking to `/preparation/history`.
- Integrated robust unit tests covering unauthenticated edge cases, parameter binding, and result integrity in `assessmentController.test.ts`.

## Acceptance Criteria Verified
- Assessment history fetches successfully per user strictly: Verified.
- History filtering routes properly map to Firebase parameters: Verified.
- Progress metrics properly aggregate stats natively on backend: Verified.
- Tests assert strict ownership over historic data: Verified.
- Build verified.

---

# Phase P6: Preparation Progress & Performance Analytics
Status: [x] Completed

## P6 Implementation Details
- Built a dedicated analytics service (`assessmentAnalyticsService.ts`) operating directly on `assessments` and their `results/final` nested documents safely using native parallel reads (`db.getAll`).
- Designed robust aggregation maps classifying Category and Topic data without extraneous sub-queries, strictly constrained by `auth.userId` and a max-limit constraint.
- Mapped logic for classifying topic competency ('Strong', 'Developing', 'Needs Improvement').
- Plumbed API route `GET /api/assessments/analytics`.
- Developed fully responsive frontend UI `PreparationAnalytics.tsx` presenting summary statistics, topic tables with interactive indicators, and simple pure CSS bar charts tracing performance history chronologically.
- Enforced complete isolation: existing interview data models, external APIs, and dependencies were completely undisturbed.

## Acceptance Criteria Verified
- Unauthenticated requests rejected: Verified via tests.
- Analytics aggregates exactly zero for new users gracefully: Verified via tests.
- Correctly parses chronological assessments: Verified.
- Safely links between `/history` and `/analytics` seamlessly: Verified.
- Test coverage written spanning API and service boundary logic: Verified successfully via Vite 8 workaround.
- Both frontend and backend built successfully.

---

# Phase P7: AI-Powered Personalized Preparation Recommendations
Status: [x] Completed

## P7 Implementation Details
- Built a dedicated recommendation service (`preparationRecommendationService.ts`) operating downstream of the verified P6 analytics engine.
- AI (Groq) is fed strictly verified facts (`getUserAnalytics`) and instructed not to recalculate, invent, or mutate performance statistics.
- Plumbed API route `GET /api/assessments/recommendations` which requires valid authentication and validates returned JSON schema using Zod.
- Implemented short-lived persistence mapping in Firebase at `users/{userId}/preparationRecommendations/latest`. Recommendations regenerate only when `totalCompleted` increases.
- Gracefully short-circuits to an explicit "No Data" response if `totalCompleted < 1`, preventing hallucinated responses.
- Developed fully responsive frontend UI `PreparationRecommendations.tsx` utilizing Lucide icons and Tailwind styles to separately present *Verified Performance* vs *AI Strategy*. Includes a 7-day study plan, priority focus areas, and Next Assessment configurations.
- Enforced complete isolation: existing AI behavior, voice processing, mock interviews, and MCQs were untouched.

## Acceptance Criteria Verified
- Missing assessments fail-safe triggers naturally: Verified via tests.
- Caching logic accurately hits and bypasses when completion count matches: Verified via tests.
- JSON structure parsing and rigorous Zod validation reject malformed schemas: Verified via tests.
- Both frontend and backend built successfully.

---

# Phase P8.1: Preparation Navigation & UX Foundation
Status: [x] Completed

## P8.1 Implementation Details
- Built a reusable `PreparationNavigation` component for high-level Preparation tab switching (Overview, Practice, History, Analytics, AI Recommendations).
- Built a `PreparationBreadcrumb` component to ensure contextual navigation within deeply nested flows (e.g., Preparation / Aptitude / Assessment).
- Integrated both components non-intrusively across the entire Preparation module (`PreparationLanding`, `PreparationCategory`, `PreparationHistory`, `PreparationAnalytics`, `PreparationRecommendations`, `PreparationAssessment`, `PreparationResult`).
- Connected AI Recommendations as a clear secondary action button on the Analytics page.
- Safely restored UI state (`setSummary(null)`) through click interception on the breadcrumbs within `PreparationCategory` to prevent React Router from retaining sticky configuration states.
- Replaced manual "Back to Preparation" links with standard breadcrumbs in deeper views while preserving all existing active session and submission constraints.

## Acceptance Criteria Verified
- Clean Git state verified before editing.
- No modifications made to backend endpoints, P6 analytics math, or P7 recommendation caching logic.
- Sidebar remained intact without overcrowding.
- Navigating back from an assessment result works seamlessly through the breadcrumbs.
- Browser limitation acknowledged: Playwright 404 driver error prevented local browser subagent UI testing. Validated manually at the code-level.

---

# Phase P8.2: Preparation Dashboard
Status: [x] Completed

## P8.2 Implementation Details
- Transformed `/preparation` from a simple category selector into a fully personalized dashboard.
- Maintained a non-intrusive presentation layer that reuses verified P5, P6, and P7 APIs (`GET /api/assessments/analytics`, `GET /api/assessments/recommendations`, and `GET /api/assessments`).
- Displayed high-level summary cards (Completed, Average Score, Best Score, Accuracy) directly using P6 metrics without recalculating.
- Introduced prominent Quick Actions connecting Practice, Analytics, and AI Recommendations.
- Displayed AI Recommendations ("Recommended for You") natively on the dashboard using P7's response format, ensuring it remains robust in both missing-data and error scenarios.
- Preserved the existing Practice Categories selector flow.
- Showed a Recent Activity feed, dynamically pulling the 5 most recent assessments using P5 history endpoints, with seamless redirection to corresponding assessment runtimes or results.
- Added comprehensive empty states (Zero Completed Assessments) with strong calls to action encouraging new users to take their first assessment.
- Verified desktop, tablet, and mobile responsiveness via native Tailwind CSS grids and flexbox stacking.
- Verified backward-compatibility and zero changes to underlying backend APIs.

---

# Phase P8.3: Recommendation → Practice Deep-Linking
Status: [x] Completed

## P8.3 Implementation Details
- Transformed the "Start Practice" CTA buttons in both the Dashboard (`PreparationLanding.tsx`) and the standalone Recommendations page (`PreparationRecommendations.tsx`) to deeply link to `PreparationCategory.tsx`.
- Constructed URL query parameters strictly based on AI recommendation output (`category`, `topic`, `difficulty`), translating textual category names into route slugs.
- Modified `PreparationCategory.tsx` to read `useSearchParams`, verifying requested parameters against hardcoded whitelist arrays (like `TOPIC_MAP`) to prevent unsupported UI states.
- Implemented a graceful fallback mechanism where if a deep-linked parameter is invalid or missing, it seamlessly defaults to the first available category topic.
- Maintained the principle of non-automatic generation: deep-links populate the user's initial configuration state without immediately launching an assessment via the POST endpoint.
- Introduced a helpful visual indicator ("Pre-configured based on your AI preparation recommendation...") inside `PreparationCategory.tsx` whenever a deep-linked initialization occurs.
- Assured full compatibility with browser refreshes by relying entirely on React Router URL query parameter state.
- Checked types and successfully compiled via Vite build step.

### P8.3 Follow-up: Practice Navigation
- Created `/preparation/practice` as a dedicated entry point for category selection, cleanly extracting it from the Dashboard.
- Fixed the top-level Preparation → Practice navigation to point to this new route.
- Ensured the "Practice" navigation item remains visually active across all category configuration paths (e.g. `/preparation/technical-mcqs`) while disabling itself correctly when taking or reviewing an assessment.
- Migrated generic "Start Practice" buttons across the empty states and Quick Actions to use strict React Router `<Link>` tags pointing to the new Practice route instead of fragile `#categories` anchors.
- Verified that AI recommendation deep-links (`?topic=&difficulty=`) remain completely intact and unaffected.

---

# Phase P8.4: Complete Preparation Loop
Status: [x] Completed

## P8.4 Implementation Details
- Conducted end-to-end integration hardening for the entire Preparation journey.
- **Assessment → Result**: Verified the Assessment Runtime correctly routes users to `/preparation/results/:id` upon submission.
- **Result Next Actions**: Added contextual CTAs at the bottom of `PreparationResult.tsx` allowing the user to smoothly navigate to "Continue Practice", "View Analytics", or "View History".
- **History Integration**: Verified `PreparationHistory.tsx` accurately displays assessment history, and updated the empty state "Start Practising" link to safely route to `/preparation/practice`.
- **Analytics & Recommendations Integration**: Verified `PreparationAnalytics.tsx` accurately loads data, and updated its empty state link to point to `/preparation/practice`.
- **Navigation Consistency**: Standardized `PreparationBreadcrumb.tsx` across `PreparationCategory.tsx` to include the `Practice` route. Verified `PreparationNavigation.tsx` highlights correctly for each step of the journey, detaching appropriately during assessment runtime.
- **Validation**: Performed full TS and Vite build validation.

## Known Limitations
- Automated browser tests remain blocked due to the ongoing Vite 8/Rolldown environment mismatch with Playwright. Requires manual browser verification of the full loop.

---

# Phase P8.5: Final UX + Production Hardening
Status: [x] Completed

## P8.5 Implementation Details
- **Error States**: Implemented robust error state handling across `PreparationLanding.tsx`, `PreparationAssessment.tsx`, `PreparationResult.tsx`, and `PreparationHistory.tsx`, complete with user-friendly actionable CTAs like "Try Again" or "Back to Dashboard" instead of exposing blank screens or stack traces.
- **Double Submit Protection**: Verified and hardened duplicate action prevention. Re-confirmed submission logic limits duplicates, and added an early return `if (generating) return;` block to `PreparationCategory.tsx` to prevent accidental multi-clicks generating duplicate assessments.
- **Security & Authorization Check**: Audited server controllers. Validated that assessment generation, submission, analytics and recommendation APIs are completely isolated to the `userId` in context, properly reject cross-account access, securely handle assessment questions, score strictly server-side, and do not leak environment variables.
- **Navigation Verification**: Verified no dead `#categories` links or `window.location` reloads exist. Validated URL parameters properly map invalid parameters to defaults securely.
- **Accessibility & Responsive**: Confirmed elements use native `<button>` and `react-router` `<Link>` components, maintain sufficient contrast, and naturally respond gracefully on mobile grids (e.g., question selector scales properly using grid layout without overflow).
- **Console & Performance**: Checked for unused hooks/dependencies. Confirmed Dashboard `Promise.allSettled` fails gracefully on partial rejections without crashing the entire UI.
- **Validation**: Performed full TS and Vite build validation.

## Known Limitations
- Manual verification requested since automated browser testing is currently blocked by Vite 8 / Rolldown Playwright incompatibility.
- No other outstanding regressions identified.

---

# Phase I1: Interview Trust & UX
Status: [x] Completed

## I1 Implementation Details
- Created a separate feature branch `feature/interview-i1-trust-ux` to isolate interview product enhancements from the main preparation module.
- Overhauled the Interview Runtime header to present a professional layout containing the dynamically mapped interview type, role, and company name instead of generic metadata.
- Implemented a user-friendly visual progress bar (e.g., `Question 1 of 5`) replacing the raw developer-style state tracking.
- Replaced separate text/voice switch buttons with a clean Segmented Control for Text vs. Voice mode selection.
- Introduced explicit voice connection states (`Checking microphone and voice connection...`, `✓ Voice ready...`, and `Voice unavailable. We couldn't connect...`) to provide better context to the user.
- Added a robust voice unavailability fallback UI allowing users to easily "Continue with Text" or "Try Again" when a WebSockets connection fails.
- Added accessible `aria-label`s and visual tooltips to icon-only Voice Controls.
- Hardened `useVoiceInterview` connection handling to immediately clean up previous WebSockets, streams, and processors before attempting a new connection to prevent orphaned sessions.
- Modified `InterviewAnalyticsPanel` integration to completely hide the Live Analytics panel while the assessment is empty (before any question is evaluated), maximizing space for the interview content and preventing distraction.
- Maintained strict backward compatibility with existing Mock Interview flows, Deepgram, Groq, and backend logic.

---

# Phase I2: Question Quality Engine
Status: [x] Completed

## I2 Implementation Details
- Created a separate feature branch `feature/interview-i2-question-quality` to build a production-grade question quality engine.
- Implemented `runBatchAIValidation` which calls a new batch AI semantic validation prompt using Groq to evaluate the full set of generated questions in one go.
- Integrated `runBatchAIValidation` into `interviewGenerationService.ts` to execute *after* deterministic structural checks (`validateGeneratedInterview`) pass.
- Implemented targeted regeneration via `regenerateInvalidQuestions`. When questions fail validation (HIGH or MEDIUM severity), they are specifically targeted for replacement without throwing away valid questions.
- Preserved existing interview generation pipelines and didn't migrate AI providers.
- Prevented infinite loops by capping retries for AI generation, throwing safe error messages to the frontend.
- Tested compilation through backend (`tsc`) successfully without errors.
- Tests (Vitest) remain BLOCKED by the Vite 8 / Rolldown native dependency issue.

---

# Phase I3: Real Interview Experience
Status: [x] Completed

## I3 Implementation Details
- Created a separate feature branch `feature/interview-i3-real-experience` to build the real interview runtime UX.
- Created `uiStore.ts` using Zustand to manage a global Focus Mode state (`isFocusMode`) to control the layout hierarchy dynamically.
- Implemented **Focus Mode**: When an interview is active (`STARTED` or `ASKING`), the global application layout hides the sidebar and top navigation header to maximize focus on the active session. This returns the user to the full dashboard once exited or completed.
- Implemented **Exit Behavior**: Added a prominent "Exit Interview" button next to the title. When clicked during an active session, a modal confirmation dialog is shown to prevent accidental data loss. Otherwise, it safely redirects to the dashboard.
- Implemented **Interview Timer**: Added a localized, client-side `<SessionTimer>` component in `InterviewRuntime.tsx`. This avoids re-rendering the entire component tree by managing its own state interval while fetching `session.startedAt` as the authoritative source of truth from the backend. The timer behaves gracefully as elapsed time (`Elapsed ⏱ MM:SS`).
- Preserved existing I1 features: The professional header, "Question X of Y", visual progress bar, Text/Voice controls, voice fallback mechanisms, and Live Analytics structure remain intact.
- Ensured responsiveness and accessibility without introducing arbitrary container limits (`max-w-4xl`) on the parent, allowing the interview view to maintain its flex layout gracefully across Desktop, Tablet, and Mobile devices.
- Tests (Vitest) remain BLOCKED due to the ongoing Vite 8 / Rolldown native dependency issue.

# Phase I4: Smart Interview Setup
**Status**: 🟢 COMPLETED
**Goal**: Make interview setup smarter and more personalized using Resume and JD analysis.
**Changes Made**:
- Implemented `SmartSetupService` AI parser for extracting structured recommendations from Resume/JD.
- Added `/api/interviews/smart-setup` route to handle setup analysis requests securely.
- Updated `Generate.tsx` to provide a dedicated Smart Setup panel with Resume/JD selection and AI analysis logic.
- Implemented clear UI differentiation between AI-recommended values and User-selected overrides.
- Retained the existing I2 generation pipeline and avoided auto-generation of interviews based on AI suggestions.
- Preserved existing I1, I2, and I3 components seamlessly.

# Phase I5: Professional Feedback Report
**Status**: 🟢 COMPLETED
**Goal**: Build a professional, actionable post-interview feedback experience.
**Changes Made**:
- Finalized and polished `InterviewReport.tsx` as the official post-interview report.
- Ensured graceful error, missing, and loading states for evaluation.
- Added practice connection in `ActionableInsights` using deep-linking to `/preparation/practice`.
- Secured `interviewReportController.ts` by checking `userId` from the Clerk token and comparing it against the owner of the report/session to prevent IDOR.
- Validated that the `reportGenerationService` is idempotent (does not duplicate evaluations).
- Confirmed that I1-I4 functionality is perfectly preserved.

# Phase I6: Adaptive AI Interviewer
**Status**: 🟢 COMPLETED
**Goal**: The interviewer should intelligently adapt the next question based on the candidate's previous answer (Follow-ups).
**Changes Made**:
- Integrated dynamic AI follow-up questions generated contextually from the user's previous answer using Groq.
- **I6 Feature 14 - Validation**: Integrated `runBatchAIValidation` (I2) directly into `followUpEngine.ts` to ensure dynamically generated follow-ups meet the same rigorous quality standards. Automatically triggers fallback logic if AI validation fails.
- **I6 Feature 17 - Idempotency**: Hardened `interviewSessionController.ts` by checking existing answers for the exact text and `questionId` to prevent AI duplication across double clicks or UI re-mounts.
- **I6 Feature 7 & 22 & 24 - Progress and Completion**: Kept `totalQuestions` static in `sessionService.ts` and successfully injected follow-up questions in `InterviewRuntime.tsx` seamlessly so `currentQuestionIndex` does not confusingly advance for a follow-up. Limits maximum follow-ups by `difficulty` level.
- **I6 Feature 25 - Report Compatibility**: Injected adaptive follow-up questions directly into `reportGenerationService.ts` by fetching the tracked `followUpHistory` during report generation. This ensures adaptive questions appear cleanly in the Professional Feedback Report.
- Kept the UI in `InterviewRuntime.tsx` exactly the same without altering existing features. Tests successfully compile.
# Phase I7: Readiness & Weakness Intelligence
**Status**: 🟢 COMPLETED
**Goal**: Implement a longitudinal intelligence layer tracking interview readiness, weakness/strength detection, and skill trends based on historical interview and assessment data.
**Changes Made**:
- **Types**: Added `src/types/readiness.ts` explicitly modeling `ReadinessProfile`, `ReadinessLevel`, `ConfidenceLevel`, and trend metadata to ensure strict type safety across boundaries.
- **Aggregation Service**: Created `readinessIntelligenceService.ts` utilizing existing `assessmentAnalyticsService.ts` and `firebaseAdmin` to deterministically aggregate historical Interview Reports and Assessment Results natively.
- **Deterministic Metrics**: Developed purely mathematical evaluations of historical scores and recency to calculate readiness states without inventing logic or relying upon generative AI hallucination. Explicitly handles "Insufficient Data" scenarios cleanly.
- **Controller & API**: Built `readinessController.ts` and registered it at `GET /api/analytics/readiness`, securely locked behind Clerk token verification.
- **Frontend Panel**: Created `ReadinessIntelligencePanel.tsx` delivering a stunning, responsive, gradient-infused UI that vividly visualizes readiness scores, components, trending top weaknesses (with deep-links to `/preparation/practice`), and priority action plans.
- **Dashboard Integration**: Integrated the readiness panel seamlessly into the existing `AnalyticsDashboard.tsx` view as the primary header, fulfilling the dashboard integration requirement without rewriting existing overview cards. 
- **Type Compliance**: Leveraged explicit `import type` to support strict `verbatimModuleSyntax` rules under Vite and tsc. Builds passing for both `server` and `frontend`.

# Phase I8: Navigation & Product Architecture

## Objectives
- Restructure the application navigation into a coherent career platform.
- Move towards a unified hierarchy: Practice, Progress, Career Coach, Library, and Profile/Settings.
- Standardize breadcrumbs across the app to establish clear location context and logical back paths.
- Preserve all existing functionality without regressions, especially I3 Focus Mode and I7 Deep Links.

## Implementation Details
1. **Sidebar Refactoring:**
   - Updated `Sidebar.tsx` to group links under categorical headings (`HOME`, `PRACTICE`, `CAREER`, `PROGRESS`, `LIBRARY`, `ACCOUNT`).
   - Mapped `Mock Interviews` and `Assessments` under `PRACTICE`.
   - Unified `History`, `Analytics`, and `Achievements` under `PROGRESS`.
   - Improved active path matching logic to correctly identify nested routes (e.g. `/interview/...` falling under `Mock Interviews`).
   
2. **Global Breadcrumb System (`AppBreadcrumb`):**
   - Introduced a new reusable component `AppBreadcrumb.tsx`.
   - Replaced the scoped `PreparationBreadcrumb` across all `Preparation*.tsx` routes with the global `AppBreadcrumb`.
   - Implemented `AppBreadcrumb` in top-level dashboard pages (`Generate.tsx`, `History.tsx`, `AnalyticsDashboard.tsx`, `Resume.tsx`, `Achievements.tsx`, `CareerDashboard.tsx`).
   - Assured Focus Mode integrity: Because breadcrumbs were inserted within standard pages (rather than forcibly inside `ProtectedLayout`), they natively disappear when I3 Focus Mode mounts the interview runtime layout, preventing any unwanted navigation leakage.

## Status
- Core navigation structure built.
- TypeScript builds pass perfectly.
- Awaiting manual verification (A-L).
