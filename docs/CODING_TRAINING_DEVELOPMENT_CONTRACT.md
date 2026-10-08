# PrepPilot AI — Coding Training Development Contract

This document establishes the architecture, boundaries, and rules for the Coding Training feature development. Future Coding Training implementation must strictly follow this contract.

## 1. ABSOLUTE RULE — NO FEATURE DEVELOPMENT IN C0
C0 is strictly Initialization + Architecture + Documentation + Git setup.

## 2. ARCHITECTURE BOUNDARY
Coding Training must remain modular. Follow existing repository conventions where they already exist.
**Frontend:**
```
src/
  features/
    coding/
      components/
      hooks/
      pages/
      services/
      types/
      utils/
```
**Backend:**
```
server/src/
  controllers/
  routes/
  services/
    coding/
  types/
```
Do not create duplicate architecture systems.

## 3. EXISTING SYSTEMS THAT MUST NOT BE MODIFIED UNNECESSARILY
Coding Training must NOT rewrite:
- Authentication (Clerk, auth middleware, existing session handling)
- Interview (Interview Runtime, Voice Interview, Deepgram, WebSockets, Interview Evaluation, Interview Reports, Adaptive Interviewer)
- Assessments (Assessment engine, Assessment scoring, Assessment analytics)
- Preparation (Preparation Dashboard, Preparation Practice, Preparation Recommendations, Preparation Analytics)
- Analytics (Existing Analytics Dashboard, Readiness Intelligence, existing readiness calculations)
- Career (Career Coach, Resume Manager)
- Public Website (marketing pages, public navigation, global marketing animations, legal pages)

Unless a future Coding phase explicitly requires a small integration point.

## 4. INTEGRATION PRINCIPLE
Coding Training may consume existing systems. It should not unnecessarily rewrite them.
Example: `Coding Performance -> Existing Readiness` (not rewrites).

## 5. DATA OWNERSHIP
Coding Training owns its own domain data. Future coding collections/documents may include:
- `codingProblems`
- `codingSessions`
- `codingDailyAssignments`
- `codingSubmissions`
- `codingPerformance`
- `codingIntegrityEvents`
Exact Firestore structure must be finalized in the relevant phase before implementation.

## 6. AUTHORIZATION RULE
Every user-specific Coding Training operation must derive the authenticated user from Clerk server-side.
Never trust `req.body.userId` when authenticated identity is available.
Every future phase must answer: "Who owns this resource?" before implementing the resource.

## 7. CODE EXECUTION RULE
**Major architectural boundary.**
NEVER execute arbitrary user code directly inside the Node.js application server, Express process, Next/Vite server, or Cloud Function without isolation.
Future code execution must use an isolated execution environment with: CPU limits, memory limits, timeout, process restrictions, filesystem isolation, network restrictions, cleanup. C4 owns this architecture. C1–C3 must not implement unsafe execution shortcuts.

## 8. LANGUAGE SUPPORT
Target languages: Python, Java, C++, C, JavaScript, TypeScript, Go, Rust, C#.
A language may only become selectable when its execution environment is actually supported and tested. Never display a language that cannot actually run.

## 9. EVALUATION AUTHORITY
Deterministic execution is the source of truth (`Execution Engine -> Ground Truth`).
AI is NOT the source of truth for: Accepted, Wrong Answer, Compilation Error, Runtime Error, Timeout, Memory Limit.
AI provides: explanation, code review, complexity feedback, learning suggestions, improvement guidance.

## 10. HIDDEN TEST SECURITY
Hidden test cases must never be exposed to the frontend.
The browser must never receive `hiddenInput`, `hiddenExpectedOutput`, or `hiddenValidationLogic` before evaluation.

## 11. CODING INTEGRITY ARCHITECTURE
Integrity Mode is a separate subsystem.
Conceptual architecture: `Coding Session -> Integrity Service -> Integrity Events -> Server-side Strike State -> Warnings -> Termination`.
The browser is responsible for detecting/reporting signals. The server is responsible for authoritative state.

## 12. THREE-STRIKE POLICY
Violation 1: Warning.
Violation 2: Final warning.
Violation 3: Terminate session + mark malpractice.
This must be enforced server-side.

## 13. INTEGRITY EVENTS
Future implementation may support: `TAB_SWITCH`, `WINDOW_BLUR`, `PASTE_ATTEMPT`, `COPY_ATTEMPT`, `CUT_ATTEMPT`, `FULLSCREEN_EXIT`, `NAVIGATION_ATTEMPT`, `LARGE_CODE_INSERTION`, `HEARTBEAT_FAILURE`.
Not every browser event automatically equals a violation. Avoid false positives. Duplicate browser signals representing one user action must be deduplicated.

## 14. PRIVACY / TRANSPARENCY
Integrity monitoring must never be hidden from the user.
Before monitoring begins, explain: what is monitored, why, how violations work, what happens at 3 violations.
Never silently claim to inspect information the browser cannot actually provide. Use accurate terminology (Integrity signals, Integrity violations, Suspicious activity).

## 15. CHROME EXTENSION
The future Chrome extension is optional and belongs exclusively to C25.
Do not implement extension functionality before C25. Do not make the website depend on an extension during C1–C24.

## 16. AI RULES
AI calls must be: server-side, authenticated where appropriate, validated, schema-constrained, failure-tolerant.
Never make the coding platform unusable merely because an AI provider fails. Coding execution and deterministic evaluation must continue independently.

## 17. PERFORMANCE RULES
Avoid: code execution on every keystroke, AI analysis on every keystroke, unnecessary Firestore writes, continuous large payload transmission, duplicated polling loops, unbounded logs.
AI analysis should happen after "Run" or "Submit", not continuously.

## 18. UX PRINCIPLE
Coding Practice must feel like a natural PrepPilot feature. Use the existing design system, typography, spacing, components, buttons, cards, responsive behavior, and accessibility patterns.

## 19. MOBILE RULE
The Coding Dashboard must be responsive. The future Coding Workspace may require a desktop-first experience. Do not force a poor mobile editor experience just to claim mobile support. The dashboard should remain responsive.

## 20. TESTING RULE
Every phase must include:
- Unit tests for business logic.
- Integration tests for APIs and persistence where applicable.
- Security tests for ownership/authentication.
- Manual verification for UI behavior.
No phase is complete merely because `npm run build` passes.

## 21. GIT RULE
The entire Coding Training development stream uses: `feature/coding-training`.
At the end of each implementation phase: 1. inspect status, 2. inspect diff, 3. run validation, 4. report, 5. STOP. Commit only when explicitly instructed.

## 22. NO UNRELATED REFACTORING
If you discover an unrelated issue: Do NOT fix it automatically.
Report "UNRELATED ISSUE FOUND" with file, problem, impact. Continue only if it does not block the current phase.

## 23. PHASE BOUNDARY RULE
When instructed to "Implement CX", implement ONLY CX. When complete: STOP. Do NOT automatically implement subsequent phases.

## 24. CHANGE CONTROL
If implementation reveals that a future phase requires a major architectural change:
Do NOT silently expand scope. Report "ARCHITECTURE DECISION REQUIRED".
Explain: 1. Current architecture, 2. Problem, 3. Proposed change, 4. Why it is required, 5. Which future phases are affected. Wait for approval.

## 25. DOCUMENTATION UPDATE RULE
At the completion of every Coding phase, update `docs/CODING_TRAINING_DEVELOPMENT_PLAN.md` with: Status, Implemented, Files, APIs, Data model, Tests, Manual verification, Known limitations, Next phase.
Do not mark a phase complete without actual verification.

## 26. FINAL COMMANDMENT
Follow this Coding Training Development Contract before making implementation decisions.
The sequence is: C0 -> C1 -> C2 -> ... -> C30.
Never skip phases. Never silently combine phases. Never modify unrelated PrepPilot systems. Never invent unsupported capabilities. Never claim security guarantees the browser cannot actually provide. Build the Coding Training platform incrementally, securely, testably, and with explicit phase boundaries.
