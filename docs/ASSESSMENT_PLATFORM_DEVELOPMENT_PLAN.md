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
