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
**Verification requirements**: Workspace layout and language toggles correctly without errors.
**Status**: Complete

**Implemented**:
- **Workspace Architecture**: `CodingWorkspace.tsx` modular split layout (Left: problem details & examples; Right: Editor & Output).
- **Editor Choice**: Integrated `@monaco-editor/react` (Monaco) configured with JetBrains Mono, vs-dark base theme, and rich syntax support.
- **Supported Languages**: Centralized configuration (`config/codingLanguages.ts`) for Python, Java, C++, C, JavaScript, TypeScript, Go, Rust, and C#.
- **Starter Code**: Defined localized starting templates mapping per language. Editor updates dynamically on switch.
- **Run Code Behavior**: Added intentional placeholder UI reflecting "Code execution is being prepared. Secure execution will be enabled in Phase C4."
- **Submit Behavior**: Added intentional placeholder UI reflecting "Submission evaluation will be available after secure code execution is implemented (Phase C4)."
- **Test Case UI**: Added examples mapped safely from C2 metadata. Did not expose hidden tests.
- **Responsive Behavior**: Stacked columns via Tailwind for small devices (`md:flex-row`). Handled overflow.
- **Authentication**: Relying safely on `ProtectedLayout` + `useAuth()`. Uses deterministic `getToken()`.
- **Known Limitations**: C3 is strictly UI boundary layout. No code is transmitted to any unsandboxed environments. 

**C3 UI Refinement / UX Hardening (Completed)**:
- **Collapsed Sidebar**: `Sidebar.tsx` intelligently auto-collapses on workspace mount for maximum horizontal space.
- **Draggable Splitter**: Implemented a responsive React splitter tracking `mousemove`, bounding left width (30-70%), and persisting layout in localStorage (`coding-workspace-split`).
- **Unified IDE Header**: Merged individual panel headers into a unified global workspace header for a cleaner IDE experience.
- **Editor Alignment & Indentation Improvements**: Configured Monaco strictly: `wordWrap: "off"`, `tabSize: 4`, `insertSpaces: true` ensuring Python and Java templates render syntactically and visually correct without squashing lines.
- **Responsive Workspace**: Workspace expands to use available viewport securely (`min-w-0`, `shrink-0`). Mobile falls back to a clean vertical stack.
- **Performance Considerations**: Draggable UI utilizes robust ref updates for `isResizing` and limits renders efficiently.
- **Output Improvements**: Retained 30% default layout flex with strict C3 placeholder logic preserving the security boundary.

**Next phase**: C4

### C4: Secure Code Execution Engine
**Goal**: Build a secure backend execution environment.
**Scope**: Isolated execution, CPU/memory limits, language support.
**Out of scope**: Advanced evaluation metrics.
**Dependencies**: C3
**Expected outputs**: Working secure execution API.
**Verification requirements**: Code runs securely, resource limits are enforced. Fails safely when sandbox unavailable. No raw host shell usage.
**Status**: COMPLETE (Real sandbox verification passed)

**Implemented**:
- **Execution Architecture**: Centralized ExecutionService exposing safe orchestration behind `POST /api/coding/execute`.
- **Sandbox Technology**: Uses `dockerode` to strictly isolate Python inside a `python:3.12-alpine` container without unsafe host fallback.
- **Resource Limits**: Concurrency limit max 10. Memory 256m, CPU 1, PIDs strict limit (64) enforced at container level. OUTPUT_LIMIT safely captured to 1MB. Source/Stdin max 256KB/64KB via validation. TIMEOUT enforced after 5s.
- **Security Limits**: Container mounts tmpfs read-write for python workspace only. Root filesystem is strictly read-only. Environment is stripped of host variables. Guest user execution without capabilities and no network mapping (`--network none`).
- **API**: Returns standard `ExecutionResult` payload parsing stderr/stdout uniformly.
- **Run Code**: Connected frontend to the new API endpoint resolving actual status outputs seamlessly with existing layout limits.
- **No Unsafe Execution**: Verified zero unsafe `child_process.exec`, `eval()`, or `spawn` containing user code exists in the application server logic.

**Supported runtimes**:
- Python (Actual verified execution)

**Unsupported runtimes**:
- Java, C++, C, JavaScript, TypeScript, Go, Rust, C# are NOT YET SUPPORTED safely because they lack a verified real sandbox runtime on this host.

**Production requirements**:
- Production architecture natively requires an isolated execution environment distinct from the web application context. Deployments must utilize sandboxes capable of `--network none` and `--read-only` root filesystems, with stringent CPU and PID limits.

**Next phase**: C5

### C5: Test & Evaluation Engine
**Goal**: Implement test evaluation logic.
**Scope**: Running tests against user code, comparing output, deterministic evaluation.
**Out of scope**: AI evaluation.
**Dependencies**: C4
**Expected outputs**: Pass/fail test results for submissions.
**Verification requirements**: Accurate test evaluation.
**Status**: COMPLETE

**Implemented**:
- **Test Case Data Model**: `testCases` added to `CodingProblem` schema in Firestore. Each case has `id`, `input`, `expectedOutput`, `isHidden`.
- **Public & Hidden Separation**: `getProblemBySlug` strips all hidden test cases from the response payload before sending to frontend.
- **Problem Seed Data**: Migrated all 30 problems to include at least 2 public cases and 3 hidden cases.
- **Deterministic Evaluation**: Implemented `evaluationService` in the backend which sequentially executes code for each test case via the C4 `executionService`. Normalizes line endings and whitespace for strict equality comparisons.
- **Run Tests (Public)**: Exposed via `POST /api/coding/run-tests`. Validates user solution against public test cases only and returns inputs/outputs.
- **Submit (All Tests)**: Exposed via `POST /api/coding/submit`. Evaluates against both public and hidden test cases, determines a final `SubmissionStatus` (e.g. ACCEPTED, WRONG_ANSWER, TIMEOUT), computes a percentage score, and returns safe results without exposing hidden cases.
- **Persistence**: Final submission results are saved to the `codingSubmissions` Firestore collection. History fetchable via `GET /api/coding/submissions`.
- **Frontend UI**: Integrated Test Results panel showing checkmarks/crosses and execution errors cleanly for both Run Tests and Submit actions.

### C6: Coding Integrity Mode UX
**Goal**: Design the user experience for Integrity Mode.
**Scope**: Start screens, warnings UI, termination screens.
**Out of scope**: Actual integrity detection.
**Dependencies**: C5
**Expected outputs**: UI flow for integrity mode.
**Verification requirements**: Screens flow correctly.
**Status**: COMPLETE

**Implemented**:
- **Practice Mode**: Normal coding experience is default and retains all C3/C4/C5 functionality.
- **Integrity Mode Entry**: Explicit "Start Integrity Mode" entry point added to workspace header.
- **Integrity Briefing**: Clean modal outlining rules (stay active, use allowed resources, etc).
- **Explicit Consent**: Checkbox enforced before the Start button is enabled.
- **Fullscreen Entry**: Utilizes browser Fullscreen API with error handling for unsupported/denied environments.
- **Active UI State**: Unobtrusive "● Integrity Mode Active" banner and "End Session" button replacing entry button.
- **Session Exit**: Provides "End Session" confirmation dialog that cleanly exits fullscreen and resets to Practice Mode without losing code state.
- **Fullscreen Sync**: Basic `fullscreenchange` listener syncs state if user exits via Esc key.
- **Execution**: Sandbox execution, test evaluation, and submissions continue operating safely.

### C7: Integrity Detection Engine
**Goal**: Build the client-side detection engine.
**Scope**: Browser event listeners, signal gathering.
**Out of scope**: Server-side strike enforcement.
**Dependencies**: C6
**Expected outputs**: Client-side event detection.
**Verification requirements**: Events are correctly identified.
**Status**: COMPLETE

**Implemented**:
- **Signals**: Reliably detects `TAB_SWITCH`, `WINDOW_BLUR`, `FULLSCREEN_EXIT`, and `NAVIGATION_ATTEMPT`.
- **Isolation**: Detection logic isolated to `IntegrityDetectionService`.
- **Gating**: Detectors are strictly active only when `integrityState === 'ACTIVE'`.
- **Deduplication**: Suppresses redundant signals (e.g. `WINDOW_BLUR` alongside `TAB_SWITCH` within 1000ms window).
- **Cleanup**: Strict removal of DOM listeners on `stop()` and React unmount to prevent leaks and React Strict Mode duplicates.
- **Privacy**: Does not record screen, keystrokes, clipboard, or sensitive metadata. Does not claim AI extension detection.
- **Storage**: Temporary client-side debug storage only; server-side enforcement deferred to C8/C9.

### C8: Three-Strike Enforcement System
**Goal**: Implement the 3-strike logic.
**Scope**: Warning thresholds, session termination logic.
**Out of scope**: Backend authority.
**Dependencies**: C7
**Expected outputs**: Client-side enforcement of strikes.
**Verification requirements**: System warns and terminates appropriately.
**Status**: COMPLETE

**Implemented**:
- **Strike State Engine**: Isolated deterministic logic in `StrikeEnforcementService` preventing race conditions.
- **Signal Tracking**: Duplicate signals are tracked by `signal.id` preventing accidental double-strikes.
- **Warnings**: Modals implemented for `Strike 1` and `Strike 2` preventing execution during warning states.
- **Termination**: Strike 3 instantly triggers session termination, stops C7 detectors, drops fullscreen, and disables Run/Test/Submit features.
- **Code Preservation**: User's editor and current state remains visible even after termination.
- **Practice Mode Isolation**: The engine entirely detaches in normal practice sessions.

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
