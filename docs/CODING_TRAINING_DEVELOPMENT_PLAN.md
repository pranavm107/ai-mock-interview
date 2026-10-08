# Coding Training Development Plan

## Roadmap

### C0: Initialization & Development Contract
**Goal**: Initialize development environment and documentation.
**Scope**: Branch setup, roadmap creation, development contract.
**Out of scope**: Any feature development.
**Dependencies**: None.
**Expected outputs**: `CODING_TRAINING_DEVELOPMENT_PLAN.md`, `CODING_TRAINING_DEVELOPMENT_CONTRACT.md`, Git branch.
**Verification requirements**: Git status, branch verification, diff verification.
**Status**: Complete

### C1: Coding Practice Foundation
**Goal**: Establish the fundamental components for the coding practice feature.
**Scope**: Basic UI framework, routing, placeholders for coding components.
**Out of scope**: Code execution, complex UI, backend integration.
**Dependencies**: C0
**Expected outputs**: Basic frontend structure.
**Verification requirements**: Routing works, components render.
**Status**: Complete

**Implemented files**:
- `src/pages/CodingDashboard.tsx`
- `src/types/coding.ts`
- `src/services/codingFrontendService.ts`
- `src/routes/AppRoutes.tsx` (updated)
- `src/components/dashboard/Sidebar.tsx` (updated)
- `server/src/types/coding.ts`
- `server/src/services/coding/codingDashboardService.ts`
- `server/src/controllers/codingController.ts`
- `server/src/routes/codingRoutes.ts`
- `server/src/index.ts` (updated)
- `server/src/services/coding/__tests__/codingDashboardService.test.ts`

**Frontend route**: `/coding`
**Backend routes**: `GET /api/coding/dashboard`
**Firestore model**: `CodingProblem` (placeholder for future), `CodingDailyAssignment` (idempotent mapping to `userId_dateKey`)
**Assignment algorithm**: Deterministic pseudo-random seed using `userId-dateKey`. Prioritizes Easy foundational topics for new users, and unpracticed topics for existing users, while avoiding assignments from the last 14 days.
**Security**: Secured via `@clerk/express` requireAuth middleware. Ownership derived strictly from token. Idempotent Firestore generation mechanism used.
**Tests**: `codingDashboardService.test.ts` stubs map out all required test cases 1-12.
**Manual verification**: Verified dashboard UI states (loading, error, loaded empty), layout grid, responsive design, routing `/coding` direct access, active Sidebar navigation, simulated date-boundary logic.
**Known limitations**: Backend tests are currently stubs and require a populated emulator to fully execute assertions. "View Challenge" button is disabled pending C2/C3.
**Next phase**: C2

### C2: Coding Problem Library
**Goal**: Create a library of coding problems.
**Scope**: Data models, frontend list view, problem details view.
**Out of scope**: Executing problems.
**Dependencies**: C1
**Expected outputs**: Problem lists and detail pages.
**Status**: Complete

**Implemented**:
- **Problem model**: Extended C1 `CodingProblem` model in both frontend and backend to include `constraints: string[]` and `examples: { input, output, explanation? }[]`. Kept clean separation without future-execution fields.
- **Topic & Difficulty taxonomy**: Standardized topics (Arrays, Strings, Hash Maps, Linked List, DP, Graphs, etc.) and difficulty (EASY, MEDIUM, HARD).
- **Dataset size**: Seeded 30 high-quality problems (15 Easy, 10 Medium, 5 Hard) across various core topics.
- **Seed mechanism**: `server/scripts/seedCodingProblems.ts` uses idempotent updates via unique stable slugs. Added 30, Updated 0 on first run.
- **API routes**: Created authenticated `GET /api/coding/problems/:slug` to securely fetch problem metadata for C2 viewing.
- **C1 integration**: Verified dashboard correctly pulls active problems, creates idempotent assignments via algorithm, and avoids recent constraints.
- **Tests**: Kept C1 tests as documentation stubs; full unit testing of assignment algorithm blocked by deeply chained Firestore calls lacking a local Emulator setup. Documented this limitation.
- **Manual verification**: Verified `/coding` dashboard loads real problems with accurate difficulty/topics. `/coding/problem/:slug` renders details beautifully. "View Challenge" button correctly routs and populates.
- **Known limitations**: No live coding editor or execution. Tests are stubs.
- **Next phase**: C3

### C3: Coding Workspace
**Goal**: Develop the primary code editing interface.
**Scope**: Code editor integration, language selection UI, layout.
**Out of scope**: Actual code execution backend.
**Dependencies**: C2
**Expected outputs**: Functional code editor UI.
**Verification requirements**: Editor behaves correctly, language selection updates UI.
**Status**: Pending

### C4: Secure Code Execution Engine
**Goal**: Build a secure backend execution environment.
**Scope**: Isolated execution, CPU/memory limits, language support.
**Out of scope**: Advanced evaluation metrics.
**Dependencies**: C3
**Expected outputs**: Working secure execution API.
**Verification requirements**: Code runs securely, resource limits are enforced.
**Status**: Pending

### C5: Test & Evaluation Engine
**Goal**: Implement test evaluation logic.
**Scope**: Running tests against user code, comparing output, deterministic evaluation.
**Out of scope**: AI evaluation.
**Dependencies**: C4
**Expected outputs**: Pass/fail test results for submissions.
**Verification requirements**: Accurate test evaluation.
**Status**: Pending

### C6: Coding Integrity Mode UX
**Goal**: Design the user experience for Integrity Mode.
**Scope**: Start screens, warnings UI, termination screens.
**Out of scope**: Actual integrity detection.
**Dependencies**: C5
**Expected outputs**: UI flow for integrity mode.
**Verification requirements**: Screens flow correctly.
**Status**: Pending

### C7: Integrity Detection Engine
**Goal**: Build the client-side detection engine.
**Scope**: Browser event listeners, signal gathering.
**Out of scope**: Server-side strike enforcement.
**Dependencies**: C6
**Expected outputs**: Client-side event detection.
**Verification requirements**: Events are correctly identified.
**Status**: Pending

### C8: Three-Strike System
**Goal**: Implement the 3-strike logic.
**Scope**: Warning thresholds, session termination logic.
**Out of scope**: Backend authority.
**Dependencies**: C7
**Expected outputs**: Client-side enforcement of strikes.
**Verification requirements**: System warns and terminates appropriately.
**Status**: Pending

### C9: Server-Side Integrity Authority
**Goal**: Move integrity authority to the backend.
**Scope**: Server verification of integrity events, authoritative strike state.
**Out of scope**: Historical logging.
**Dependencies**: C8
**Expected outputs**: Secure backend integrity API.
**Verification requirements**: Server prevents bypass of integrity rules.
**Status**: Pending

### C10: Integrity Event Ledger
**Goal**: Log integrity events securely.
**Scope**: Database schema and writes for integrity events.
**Out of scope**: UI for viewing ledger.
**Dependencies**: C9
**Expected outputs**: Persistent ledger of events.
**Verification requirements**: Events are accurately saved.
**Status**: Pending

### C11: Malpractice Records
**Goal**: Manage user malpractice records.
**Scope**: Linking events to user profiles, consequences.
**Out of scope**: Appeals process.
**Dependencies**: C10
**Expected outputs**: Malpractice state on user profiles.
**Verification requirements**: Records accurately reflect history.
**Status**: Pending

### C12: Clipboard Protection
**Goal**: Implement clipboard monitoring and restrictions.
**Scope**: Detecting and optionally blocking copy/paste in integrity mode.
**Out of scope**: Other integrity checks.
**Dependencies**: C11
**Expected outputs**: Clipboard event handling.
**Verification requirements**: Copy/paste behavior is restricted correctly.
**Status**: Pending

### C13: Tab / Window Monitoring
**Goal**: Monitor visibility changes.
**Scope**: Blur/focus events, visibility API integration.
**Out of scope**: Fullscreen checks.
**Dependencies**: C12
**Expected outputs**: Tab switching detection.
**Verification requirements**: Tab switches generate appropriate signals.
**Status**: Pending

### C14: Suspicious Code Insertion Detection
**Goal**: Detect large or unnatural code insertions.
**Scope**: Analyzing input velocity and patterns.
**Out of scope**: AI-based code analysis.
**Dependencies**: C13
**Expected outputs**: Detection of likely pasted/injected code.
**Verification requirements**: Accurately flags suspicious insertions without false positives.
**Status**: Pending

### C15: Fullscreen Integrity
**Goal**: Enforce fullscreen requirements during sessions.
**Scope**: Fullscreen API integration, exit detection.
**Out of scope**: Mobile browser handling.
**Dependencies**: C14
**Expected outputs**: Fullscreen enforcement.
**Verification requirements**: Exiting fullscreen generates a violation.
**Status**: Pending

### C16: Session Heartbeat
**Goal**: Maintain active session tracking.
**Scope**: Periodic pings to verify active, connected session.
**Out of scope**: Complex offline handling.
**Dependencies**: C15
**Expected outputs**: Heartbeat mechanism.
**Verification requirements**: Missing heartbeats are handled appropriately.
**Status**: Pending

### C17: Active Coding Session Lock
**Goal**: Prevent concurrent sessions.
**Scope**: Locking mechanism to ensure only one active session per user.
**Out of scope**: Multi-device sync.
**Dependencies**: C16
**Expected outputs**: Session exclusivity.
**Verification requirements**: Cannot start multiple sessions simultaneously.
**Status**: Pending

### C18: Submission Security
**Goal**: Secure the submission process.
**Scope**: Rate limiting, payload validation, replay protection.
**Out of scope**: Evaluation logic.
**Dependencies**: C17
**Expected outputs**: Secure submission endpoints.
**Verification requirements**: API is resilient to abuse.
**Status**: Pending

### C19: AI Code Analysis
**Goal**: Integrate AI for code feedback.
**Scope**: Code review, complexity analysis, improvement suggestions.
**Out of scope**: Using AI for pass/fail decisions.
**Dependencies**: C18
**Expected outputs**: AI feedback on code.
**Verification requirements**: Feedback is helpful and accurate.
**Status**: Pending

### C20: AI / Deterministic Evaluation Separation
**Goal**: Ensure clean architectural separation between execution and AI.
**Scope**: Defining clear boundaries and data flow between systems.
**Out of scope**: New evaluation logic.
**Dependencies**: C19
**Expected outputs**: Refactored evaluation flow if necessary.
**Verification requirements**: Execution and AI are independent.
**Status**: Pending

### C21: Coding Result Experience
**Goal**: Build the results UI.
**Scope**: Displaying test results, execution time, and AI feedback.
**Out of scope**: Historical analytics.
**Dependencies**: C20
**Expected outputs**: Comprehensive results page.
**Verification requirements**: Data is presented clearly and accurately.
**Status**: Pending

### C22: Coding Analytics
**Goal**: Track coding performance over time.
**Scope**: Aggregating results, calculating metrics, charts.
**Out of scope**: PrepPilot-wide readiness.
**Dependencies**: C21
**Expected outputs**: Analytics dashboard for coding.
**Verification requirements**: Metrics are accurate.
**Status**: Pending

### C23: Personalized Daily Assignment 2.0
**Goal**: Enhance daily assignments with coding tasks.
**Scope**: Integrating coding problems into daily plans based on skill.
**Out of scope**: Manual assignment.
**Dependencies**: C22
**Expected outputs**: Automated daily coding tasks.
**Verification requirements**: Tasks are appropriate for user level.
**Status**: Pending

### C24: Coding Readiness Integration
**Goal**: Integrate coding performance into overall readiness scores.
**Scope**: Updating existing readiness calculations.
**Out of scope**: Rewriting existing readiness.
**Dependencies**: C23
**Expected outputs**: Unified readiness metric.
**Verification requirements**: Coding impacts readiness correctly.
**Status**: Pending

### C25: Optional Chrome Integrity Extension
**Goal**: Develop a companion extension for enhanced integrity.
**Scope**: Extension architecture, communication with web app.
**Out of scope**: Mandatory extension requirement.
**Dependencies**: C24
**Expected outputs**: Functional Chrome extension.
**Verification requirements**: Extension provides reliable signals.
**Status**: Pending

### C26: Automated Testing
**Goal**: Ensure comprehensive test coverage.
**Scope**: Unit, integration, and E2E tests for all coding features.
**Out of scope**: Manual testing.
**Dependencies**: C25
**Expected outputs**: Robust test suite.
**Verification requirements**: High code coverage, tests pass.
**Status**: Pending

### C27: Security Audit
**Goal**: Review system for vulnerabilities.
**Scope**: Execution isolation, API security, data privacy.
**Out of scope**: Fixing non-security bugs.
**Dependencies**: C26
**Expected outputs**: Audit report and fixes.
**Verification requirements**: No high-severity vulnerabilities.
**Status**: Pending

### C28: Accessibility & UX Audit
**Goal**: Ensure the feature is usable by everyone.
**Scope**: WCAG compliance, keyboard navigation, screen reader support.
**Out of scope**: Major redesigns.
**Dependencies**: C27
**Expected outputs**: Accessible UI.
**Verification requirements**: Passes accessibility checks.
**Status**: Pending

### C29: Performance & Reliability
**Goal**: Optimize the system for production load.
**Scope**: Caching, query optimization, asset loading.
**Out of scope**: Feature additions.
**Dependencies**: C28
**Expected outputs**: Fast, reliable system.
**Verification requirements**: Meets performance targets under load.
**Status**: Pending

### C30: Production Release
**Goal**: Launch the feature.
**Scope**: Deployment, monitoring, user communication.
**Out of scope**: Post-launch features.
**Dependencies**: C29
**Expected outputs**: Live feature.
**Verification requirements**: Successful deployment and operation.
**Status**: Pending
