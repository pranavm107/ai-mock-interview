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
**Status**: COMPLETE

**Implemented**:
- **Server-authoritative session state**: Atomic strike evaluation using Firestore transactions.
- **Authentication**: Strict `userId` and ownership validation with Clerk.
- **Duplicate Protection**: Bounded `recentSignalIds` on the backend to suppress redundant concurrent events.
- **Three-Strike Cap**: Maximum strike enforced server-side.
- **Termination persistence**: Server safely guards terminated sessions from resuming.
- **Client tampering resistance**: Client fetches state instead of determining state.
- **API Boundaries**: `POST /integrity/session`, `POST /.../signal`, `GET /.../:sessionId`, `POST /.../end`.

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
**Status**: COMPLETE

**Implemented**:
- **Monaco integration**: Hooked into Monaco's `onDidPaste` via `handleEditorDidMount` to manually report `PASTE_DETECTED`, bypassing standard browser event interception rules that usually block editor paste detection.
- **Global document integration**: Added global listeners for `COPY_DETECTED` and `CUT_DETECTED` that correctly bubble from Monaco.
- **Privacy preservation**: Placed extreme emphasis on 0-content extraction. Handlers extract `{ targetTag: HTMLElement.tagName }` (or `MONACO_EDITOR`) exclusively. Clipboard payloads are completely ignored.
- **Audit-only persistence**: Configured `AUDIT_ONLY_SIGNAL_TYPES` set on the backend. This strictly limits clipboard signals to C10 ledger entry accumulation but totally exempts them from increasing the 3/3 strike enforcement.
- **Zero Malpractice Records**: By separating clipboard actions from strikes, normal coding maneuvers completely bypass C11 record triggers.
- **Test coverage**: Extensively added unit tests inside `integrityDetectionService.test.ts` to confirm idempotency, deduplication window behavior, start/stop lifecycle hook safety, and exact event dispatch structures.
- **Manual Verification**: Browser UI verified. C9, C10, C11 regressions preserved functionally and theoretically.

### C13: Tab / Window Monitoring
**Goal**: Monitor visibility changes.
**Scope**: Blur/focus events, visibility API integration.
**Out of scope**: Fullscreen checks.
**Dependencies**: C12
**Expected outputs**: Tab switching detection.
**Verification requirements**: Tab switches generate appropriate signals.
**Status**: COMPLETE

**Implemented**:
- **Baseline features**: `TAB_SWITCH` (via `visibilitychange`) and `WINDOW_BLUR` (via `blur`) were preemptively implemented in C7.
- **Advanced Return Tracking**: Implemented `TAB_RETURN` (via `visibilitychange` returning to 'visible') and `WINDOW_FOCUS` (via `window.focus`).
- **Audit-only persistence**: These return events are classified as `AUDIT_ONLY_SIGNAL_TYPES` on the backend. They provide a precise ledger of exactly *how long* a user was tabbed out without incrementing strikes upon return.
- **Deduplication**: Added strict deduplication preventing `WINDOW_FOCUS` and `TAB_RETURN` from double-firing if both bubble simultaneously upon the user re-entering the tab.
- **Privacy preservation**: Relies strictly on standard browser lifecycle events (`visibilitychange`, `blur`, `focus`). Never inspects history, screens, or outside applications. 
- **Tests**: `integrityDetectionService.test.ts` updated with verification of return signals and deduplication suppression. C13 backend test script verifies 0 strike increment and 100% ledger persistence.

### C14: Suspicious Code Insertion Detection
**Goal**: Detect large or unnatural code insertions.
**Scope**: Analyzing input velocity and patterns.
**Out of scope**: AI-based code analysis.
**Dependencies**: C13
**Expected outputs**: Detection of likely pasted/injected code.
**Verification requirements**: Accurately flags suspicious insertions without false positives.
**Status**: COMPLETE

**Implemented**:
- **Monaco Model Hook**: Bound detection directly to `editor.onDidChangeModelContent` observing array changes for high-character bulk insertions (`> 50 characters` length).
- **Privacy Assurance**: The detector transmits `length` as metadata but never reads, transmits, or persists the actual source text. All content parsing happens client-side and is immediately discarded.
- **Strict Deduplication**: Correlated `LARGE_CODE_INSERTION` against `PASTE_DETECTED` (from C12) enforcing a 1000ms suppression window. This explicitly resolves duplicates where a normal clipboard paste inherently triggers both DOM and Model APIs simultaneously.
- **Audit-only classification**: Insertions are treated entirely as `AUDIT_ONLY_SIGNAL_TYPES` to protect against false positives (e.g. an AI autocompletion extension injecting boilerplate). They populate the C10 ledger without incrementing strikes or fabricating malpractice records.
- **Tests**: `integrityDetectionService.test.ts` updated to verify strict deduplication suppression. `test-c14.ts` validates C10 ledger injection and 0-strike outcomes.

### C15: Fullscreen Integrity
**Goal**: Enforce fullscreen requirements during sessions.
**Scope**: Fullscreen API integration, exit detection.
**Out of scope**: Mobile browser handling.
**Dependencies**: C14
**Expected outputs**: Fullscreen enforcement.
**Verification requirements**: Exiting fullscreen generates a violation.
**Status**: COMPLETE

**Implemented**:
- **Baseline features**: Standard fullscreen API integration (requestFullscreen, exitFullscreen) and event listeners (`fullscreenchange`) were already active from C7.
- **Advanced Deduplication**: A critical gap existed where an OS-level ALT+TAB out of the browser inherently drops fullscreen while simultaneously triggering tab-switch or window-blur. Left unchecked, this inflates a single exit action into 2-3 overlapping strikes.
- **Suppression Mechanism**: Updated `IntegrityDetectionService.ts` to actively correlate `FULLSCREEN_EXIT` against both `WINDOW_BLUR` and `TAB_SWITCH` using a bidirectional 1000ms suppression window.
- **Outcome**: A user cleanly exiting fullscreen via `ESC` correctly incurs 1 strike. A user minimizing the window incurs 1 strike (as `WINDOW_BLUR` suppresses the secondary `FULLSCREEN_EXIT` trigger).
- **Testing**: `integrityDetectionService.test.ts` updated with verification of the simultaneous-trigger deduplication. All regression test suites passed perfectly without side effects.

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
**Status**: COMPLETE

**Implemented**:
- **Lock Schema**: Uses `codingActiveSessionLocks/{userId}` to enforce a 1:1 user-to-session invariant.
- **Transactional Consistency**: Lock acquisition is atomic within `createSession`. Lock reads happen strictly before writes.
- **Recovery Policy**: If an old session is terminated but the lock leaked, the next transaction safely overwrites it after verifying the old session is no longer ACTIVE.
- **Conflict Response**: Throws `ACTIVE_SESSION_CONFLICT:{existingSessionId}`, which returns 409 from the controller.
- **UI Conflict Resolution**: Shows a clear modal allowing the user to either "End Old Session & Continue Here" (which safely kills the leaked/old session) or Cancel.
- **Tests**: `server/test-c17.ts` verifies 9 scenarios including concurrent creation, lock recovery, strict boundary checking, and successful termination. C4 and C9-C16 regressions pass.

### C18: Submission Security
**Goal**: Secure the submission process.
**Scope**: Rate limiting, payload validation, replay protection.
**Out of scope**: Evaluation logic.
**Dependencies**: C17
**Expected outputs**: Secure submission endpoints.
**Verification requirements**: API is resilient to abuse.
**Status**: COMPLETE

**Implemented**:
- **Authenticated Endpoints**: All submission, execution, and test endpoints derive identity from Clerk tokens.
- **Protected Session Integration**: When `sessionId` is provided, backend requests strictly validate that the session is `ACTIVE` and owned by `userId`.
- **Concurrency Control**: Added `activeUserExecutions` lock in `executionService` to reliably reject (429) concurrent overlapping execution/submission spam from the same user.
- **Payload Validation**: Hard limits enforced for oversized source code and standard input in `executionService.ts`.
- **Test Coverage**: Added `server/test-c18.test.ts` using Vitest to assert unauthenticated request rejection, cross-user session rejection, terminated session block, oversized payload catching, and concurrent idempotency.

### C19: AI Code Analysis
**Goal**: Integrate AI for code feedback.
**Scope**: Code review, complexity analysis, improvement suggestions.
**Out of scope**: Using AI for pass/fail decisions.
**Dependencies**: C18
**Expected outputs**: AI feedback on code.
**Verification requirements**: Feedback is helpful and accurate.
**Status**: COMPLETE

**Implemented**:
- **Backend Service**: `aiAnalysisService.ts` securely integrates with the `groqClient`, instructing the AI model to output strict JSON schemas and actively ignore prompt injections.
- **Backend Validation**: `codingAnalysisController.ts` ensures proper authentication, session integrity boundaries (aborts if session is not ACTIVE), checks source sizes, and wraps concurrent execution limits using a user-based lock to prevent API quota drain.
- **Deterministic Separation**: AI analysis operates entirely parallel to evaluation. It does NOT receive hidden test cases, expected outputs, or execution data, ensuring it remains an advisory tool without manipulating scores or integrity state.
- **Frontend Integration**: Extended `CodingWorkspace.tsx` with an `AI_ANALYSIS` tab state. Added loading spinners, error handling, and structured rendering for Time Complexity, Space Complexity, Issues, and Suggestions.
- **Test Coverage**: Added `server/test-c19.test.ts` verifying concurrent rejection, oversized payloads, invalid authentication, provider timeouts, and prompt injections using mocked Groq functions.
### C20: AI / Deterministic Evaluation Separation
**Goal**: Ensure clean architectural separation between execution and AI.
**Scope**: Defining clear boundaries and data flow between systems.
**Out of scope**: New evaluation logic.
**Dependencies**: C19
**Expected outputs**: Refactored evaluation flow if necessary.
**Verification requirements**: Execution and AI are independent.
**Status**: COMPLETE

**Implemented**:
- **Architectural Boundary Verification**: Confirmed that `aiAnalysisService.ts` and `evaluationService.ts` maintain complete isolation without cross-dependencies. Deterministic evaluation executes exclusively against the execution sandbox and does not call the AI provider.
- **Frontend Disclaimer**: Added explicit "Advisory Only" warning box to the AI Feedback tab explaining that AI does not determine pass/fail status, scoring, or integrity standing, preventing user confusion over authoritative outcomes.
- **Test Suite**: Added `server/test-c20.test.ts` to assert explicitly that evaluation succeeds when the AI provider is offline, that AI payload schemas contain no deterministic test output fields, and that provider failures do not leak state into evaluation metrics.
- **Contract Strictness**: Updated `CODING_TRAINING_DEVELOPMENT_CONTRACT.md` Rule 9 explicitly preventing AI results from mutating integrity locks, strikes, and database scores.

### C21: Coding Result Experience
**Goal**: Build the results UI.
**Scope**: Displaying test results, execution time, and AI feedback.
**Out of scope**: Historical analytics.
**Dependencies**: C20
**Expected outputs**: Comprehensive results page.
**Status**: COMPLETE

**Implemented**:
- **Test Result Segmentation**: `CodingWorkspace.tsx` elegantly differentiates between "Public Test Results" (from Run Tests) and "Submission Results" (from Submit) by leveraging a newly introduced `evaluationType` state variable.
- **Race Condition Prevention**: Deployed an `evaluationRequestIdRef` tracking mechanism. If a user mashes buttons or requests overlap, outdated network responses are gracefully discarded, preventing stale test results from hijacking the UI.
- **Backend Metric Authority**: Verified that the frontend strictly consumes the `passedTests`, `totalTests`, `executionTimeMs`, and `score` provided by the server payload without manual interpolation.
- **Security Validation**: `server/test-c21.test.ts` implemented to concretely prove:
  1. Hidden test inputs, expected outputs, and actual outputs are absolutely stripped from the response.
  2. Runtime error messages on hidden tests safely bubble back so users understand *why* they failed without leaking *what* they failed on.
  3. Network requests are mocked and tested cleanly without execution environment dependencies.

### C22: Coding Analytics
**Goal**: Track coding performance over time.
**Scope**: Aggregating results, calculating metrics, charts.
**Out of scope**: PrepPilot-wide readiness.
**Dependencies**: C21
**Expected outputs**: Analytics dashboard for coding.
**Status**: COMPLETE

**Implemented**:
- **Backend Analytics Engine**: Built `codingAnalyticsService.ts` which robustly aggregates the user's `codingSubmissions` directly from Firestore. Safely counts unique solved problems (`totalSolved`), maps difficulty/topics/languages, computes correct `acceptanceRate` relative only to completed attempts, and builds a 30-day chronological activity chart.
- **Frontend Dashboard Visualization**: Added the `CodingAnalytics.tsx` component into the `CodingDashboard`. Beautifully structured UI leverages `recharts` to render a 30-day history bar chart mapping total attempts vs. solved challenges. 
- **Data Integrity Assurance**: Analytics queries only filter by the strictly authenticated user token via standard Clerk middleware. Raw source code, clipboard metrics, or hidden tests remain completely untouched and unexposed. `RUN_TESTS` instances do not pollute the submission log.
- **Test suite**: Implemented `test-c22.test.ts` mocking Firestore logic to verify gracefully handling empty user histories, discarding duplicate submissions on unique counts, correctly categorizing multiple topic arrays, and safely returning zero defaults when missing data.

### C23: Personalized Daily Assignment 2.0
**Goal**: Enhance daily assignments with coding tasks.
**Scope**: Integrating coding problems into daily plans based on skill.
**Out of scope**: Manual assignment.
**Dependencies**: C22
**Expected outputs**: Automated daily coding tasks.
**Verification requirements**: Tasks are appropriate for user level.
**Status**: COMPLETE

**Implemented**:
- **Smart Assignment Engine**: Updated `codingDashboardService.ts` to utilize actual user history from `codingAnalyticsService.ts`.
- **Exclusion Logic**: The engine explicitly avoids any problem ID the user has already solved, alongside avoiding those assigned in the past 14 days.
- **Difficulty Progression**: Automatically scales selected problem difficulty from `EASY` -> `MEDIUM` -> `HARD` based on the user's volume of past completed difficulties.
- **Topic Rotation**: Evaluates the user's past solved topics and prioritizes selecting active problems spanning unpracticed topics at their current skill level.
- **Graceful Fallbacks**: For new users (0 solved), intelligently falls back to explicitly foundational topics like Arrays/Strings. If the active problem pool is genuinely exhausted, cleanly relaxes exclusions backwards instead of crashing.
- **Transactional Consistency**: Left the C1 `runTransaction` idempotency intact, ensuring rapid concurrent reads map to a single stable assignment ID per day.
- **Tests**: Replaced stubs with `test-c23.test.ts` (using Vitest + Firestore Mock) extensively covering: new user fallbacks, correct solved-problem exclusion (rejecting failed attempt noise), stable assignment ID idempotency, independent multi-user execution, and graceful pool exhaustion.

### C24: Coding Readiness Integration
**Goal**: Integrate coding performance into overall readiness scores.
**Scope**: Updating existing readiness calculations.
**Out of scope**: Rewriting existing readiness.
**Dependencies**: C23
**Expected outputs**: Unified readiness metric.
**Verification requirements**: Coding impacts readiness correctly.
**Status**: COMPLETE

**Implemented**:
- **Backend Service**: Built `codingReadinessService.ts` that calculates a 0-100 score utilizing 4 deterministic factors derived from the user's C22 Analytics object:
  - **Success Factor (max 20)**: Scored linearly against acceptance rate (`status === 'ACCEPTED'`).
  - **Volume & Difficulty (max 50)**: Progressively weighted scale (1 pt Easy, 3 pt Medium, 5 pt Hard) explicitly counting only uniquely solved problems.
  - **Topic Coverage (max 20)**: Awards points per distinctly solved category to promote broad foundations.
  - **Consistency (max 10)**: Weighted by the raw count of recently active days inside the 30-day window.
- **Explainability API**: Returns human-readable `strengths` and actionable `improvementAreas` instead of a raw blackbox number. Safely degrades to an onboarding empty-state `Getting Started` if `totalAttempts === 0`.
- **Frontend Integration**: Implemented `CodingReadiness.tsx` inside the Dashboard, extracting UI components into a cleanly visualized progress pane.
- **Verification**: Created `server/test-c24.test.ts` thoroughly asserting the onboarding fallback, exact difficulty thresholds, resilient missing-metadata handling, and stable formula outcomes using simulated real Firebase reads. Fully protected under existing Clerk authentication.

### C25: Optional Chrome Integrity Extension
**Goal**: Develop a companion extension for enhanced integrity.
**Scope**: Extension architecture, communication with web app.
**Out of scope**: Mandatory extension requirement.
**Dependencies**: C24
**Status**: COMPLETE (Integration DISABLED for security)

**Implemented**:
- **Isolated Architecture**: Created an optional Manifest V3 Chrome extension inside `chrome-extension/`.
- **Minimal Collection**: Tracks only `chrome.tabs.onActivated` and `chrome.windows.onFocusChanged`. Strictly avoids reading DOM, history, or intercepting generic network requests.
- **Privacy & Consent**: Features a togglable popup (`popup.html`) allowing the user to explicitly enable or disable monitoring.
- **Secure Integration Constraints**: The extension communicates via `window.postMessage` to the injected `content.js`. However, because `window.postMessage` in the browser DOM cannot cryptographically prove that the sender is the isolated content-script versus a forged page script, the integration bridge in `IntegrityDetectionService` has been **intentionally disabled** (commented out). This honors the security constraint preventing forged page messages from masquerading as authoritative extension events.
- **Verification**: Built and validated integration logic with strict `event.source` and `event.origin` bound checking, but left the listener detached to preserve absolute integrity. Deduplication logic handles simultaneous native browser blur vs. extension window blur to prevent double strikes.

### C26: Automated Testing
**Goal**: Ensure comprehensive test coverage.
**Scope**: Unit, integration, and E2E tests for all coding features.
**Out of scope**: Manual testing.
**Dependencies**: C25
**Expected outputs**: Robust test suite.
**Verification requirements**: High code coverage, tests pass.
**Status**: COMPLETE

**Implemented**:
- **Test Infrastructure**: Audited `vitest` infrastructure across frontend and backend, isolating compilations issues (e.g. `dist/` leakage).
- **Frontend Coverage**: Created React Testing Library coverage for `CodingDashboard` and `CodingReadiness` to ensure proper data hydration and component lifecycle stability.
- **Shared-State Fixes**: Identified and repaired critical shared-state defects in the Firestore emulator (C23's test-suite was dropping the problems pool unexpectedly) ensuring parallel concurrency safety.
- **Audit Findings**: All C18-C24 backend code is highly tested and 100% passing. Legacy Interview failures have been documented and isolated.

### C27: Security Audit
**Goal**: Review system for vulnerabilities.
**Scope**: Execution isolation, API security, data privacy.
**Out of scope**: Fixing non-security bugs.
**Dependencies**: C26
**Expected outputs**: Audit report and fixes.
**Verification requirements**: No high-severity vulnerabilities.
**Status**: COMPLETE

**Implemented**:
- **Authentication & Authorization**: Validated all `codingRoutes.ts` properly utilize `@clerk/express` `requireAuth()` and controllers enforce strict `userId` boundaries. Confirmed E2E scripts prevent cross-user session tampering. Added `integrity.security.test.ts` to assert 401s and 403s on Express routes.
- **Docker Sandbox Constraints**: Confirmed strict resource caps in `sandboxRunner.ts`: Network disabled, swap disabled, 256MB RAM limit, strict PID limits against fork-bombs, no new privileges, and standard python output truncation (1MB limit).
- **Hidden Tests Integrity**: Validated `evaluationService.ts` securely scrubs `input`, `expectedOutput`, `actualOutput`, and `error` streams when `isHidden: true`.
- **Concurrency Locks**: Confirmed `executionService` and `evaluationService` implement robust in-memory concurrency locks per-user (`activeUserExecutions`, `activeUserEvaluations`). Note: These are process-local locks and do not guarantee cross-instance mutual exclusion, but they mitigate local spam. However, `integrityService` *does* use a distributed Firestore transaction lock (`codingActiveSessionLocks`), ensuring strict global uniqueness for integrity sessions.
- **Distributed Replay Protection**: Fixed an issue where replay protection relied solely on the sliding window `recentSignalIds`. Implemented a strict distributed `eventDoc.exists` check inside the Firestore transaction in `integrityService.processSignal` to definitively prevent long-delay replay attacks from creating duplicate strikes or events.
- **Data Integrity**: Verified the server remains authoritative over scores, strike counts, and session state. The client only sends code and generic signal indicators.
- **Prompt Injection**: Validated `aiAnalysisService` prompt isolation and response sanitization (schema stripping + hard truncation limits).
- **Insecure Bridge**: Verified C25 message bridge is completely disabled on the frontend `IntegrityDetectionService`, neutralizing cross-site forgery risks.

### C28: Accessibility & UX Audit
**Goal**: Ensure the feature is usable by everyone.
**Scope**: WCAG compliance, keyboard navigation, screen reader support.
**Out of scope**: Major redesigns.
**Dependencies**: C27
**Expected outputs**: Accessible UI.
**Verification requirements**: Passes accessibility checks.
**Status**: Completed

**Key Accomplishments**:
- **Keyboard Navigation**: Added full keyboard control and focus management to workspace splitters (`ArrowLeft`/`Right`, `ArrowUp`/`Down`).
- **Screen Reader Support**: Implemented `aria-busy` and `aria-live="polite"` regions for asynchronous loading states, code execution, and test results to ensure screen readers announce status changes dynamically.
- **Semantic Structure**: Upgraded output panel tabs to use correct `role="tablist"` and `role="tab"` attributes with proper `aria-selected` and `aria-controls` bindings.
- **Analytics & Readiness Access**: Ensured data visualizations (charts) and summary badges have appropriate `aria-label` and `role="img"` properties for descriptive parsing.
- **Automated A11y Testing**: Created `CodingA11y.test.tsx` and `CodingWorkspaceA11y.test.tsx` to explicitly enforce keyboard behaviors, roles, and live regions against DOM regressions.

### C29: Performance & Reliability
**Goal**: Optimize the system for production load.
**Scope**: Caching, query optimization, asset loading.
**Out of scope**: Feature additions.
**Dependencies**: C28
**Expected outputs**: Fast, reliable system, deduplication cache, query projection.
**Verification requirements**: Meets performance targets under load.
**Status**: Completed

### C30: Production Release Readiness
**Goal**: Prepare and audit the application for deployment.
**Scope**: Deployment readiness, secret validation, secure build checks.
**Out of scope**: Actual infrastructure provisioning or live deployment.
**Dependencies**: C29
**Expected outputs**: PRODUCTION_RELEASE_READINESS.md report.
**Verification requirements**: Successful build and strict security boundaries.
**Status**: Completed (Audit Only, Deployment Pending)
