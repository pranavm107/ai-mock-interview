# Assessment Platform Development Plan

## 1. Product Direction

Explain:
The transition from a primarily voice-based AI Mock Interview platform toward an assessment and career learning platform.

## 2. Existing Architecture

Document:
- Frontend
- Backend
- Authentication
- Firestore
- Resume Processing
- Gemini
- Interviews
- Voice System
- Analytics
- Achievements

## 3. Architecture Decisions

Clearly document:
- Voice interview system remains preserved.
- Voice interview is Coming Soon.
- MCQs will not use InterviewSession.
- Resume data will be reused.
- Backend remains authoritative.

## 4. Existing Systems to Reuse

List:
- Clerk
- Resume Processing
- Resume AI Analysis
- Gemini
- Firestore
- Analytics
- Achievements

## 5. New Architecture

Document:
Resume-Based Assessment
Aptitude Assessment
Skill Upgrade

## 6. Data Model Strategy

Document the proposed Assessment model.
assessments

Each assessment should contain:
- id
- userId
- type
- status
- resumeId
- category
- title
- createdAt
- completedAt

Possible types:
RESUME_MCQ
APTITUDE

Future question storage:
assessments/{assessmentId}/questions

Each question may contain:
- id
- question
- options
- correctAnswer
- explanation
- skill
- difficulty

## 7. API Strategy

Document the proposed API architecture.
GET /api/assessments
POST /api/assessments/resume/generate
POST /api/assessments/aptitude/generate
GET /api/assessments/:id
POST /api/assessments/:id/submit
GET /api/assessments/:id/result

## 8. Security Rules

Document:
- Clerk authentication
- User ownership
- Backend authority

## 9. Development Phases

Create the complete phase roadmap.

## 10. Phase Status

- [ ] Pending
- [~] In Progress
- [x] Completed

---

# Phase D1: Assessment Architecture and Type Design

Define:
- Assessment types
- Firestore model
- Question model
- Answer model
- Result model
- API response types

Do not build UI yet.

Status:

[x] Completed

## Phase D1 Implementation Details

### Architecture Decisions
Assessments are modeled entirely independently of Interviews. The lifecycle separates question generation from evaluation, ensuring the backend is the sole authority for scoring. Resume MCQ uses `resumeId` for context, whereas Aptitude uses a distinct `category`.

### Data Model
Separation of concerns:
Assessment (Metadata) -> Questions (Stored separately in subcollections) -> User Answers (Submitted payload) -> Result (Score and Feedback).

### Assessment Types
`RESUME_MCQ` and `APTITUDE`.

### Question Model
`AssessmentQuestion` (backend authoritative, contains `correctOptionId` and `explanation`) vs `AssessmentQuestionForUser` (safe frontend view).

### Answer Model
`AssessmentAnswerSubmission` contains only `questionId` and `selectedOptionId`.

### Result Model
`AssessmentResult` provides the final evaluation, score, percentage, and `SkillPerformance`. `QuestionResult` provides individual question feedback.

### Firestore Strategy
Assessments stored in `assessments/{assessmentId}`. Questions stored in `assessments/{assessmentId}/questions/{questionId}` subcollection to protect correct answers and avoid massive document sizes.

### API Strategy
Proposed Contracts:
- `POST /api/assessments/resume/generate` (Planned)
- `POST /api/assessments/aptitude/generate` (Planned)
- `GET /api/assessments/:id` (Planned)
- `POST /api/assessments/:id/submit` (Planned)
- `GET /api/assessments/:id/result` (Planned)

### Security Rules
- Clerk resolves backend user identity.
- Correct answers and explanations are stripped from safe question models and never exposed before submission.
- The frontend is strictly prohibited from calculating official scores.

### State Transitions
`GENERATING` -> `READY` -> `IN_PROGRESS` -> `COMPLETED` (or `FAILED` during generation).

### Retake Strategy
Retakes create a completely new assessment document to preserve analytics and history.

### Files Created
- `server/src/types/assessment.ts`
- `src/types/assessment.ts`

### Files Modified
- `docs/ASSESSMENT_PLATFORM_DEVELOPMENT_PLAN.md`

### Verification Results
TypeScript compilation successful for frontend and backend.

### Known Limitations
AI generation, API endpoints, Firestore logic, and UI components are intentionally deferred to future phases as per D1 scope.

---

# Phase D2: Resume-Based Assessment Backend

Build:
- Resume retrieval
- Resume skill extraction
- Weakness extraction
- Missing skill extraction
- Personalized assessment generation

Reuse:
Existing Resume Analysis
Existing Gemini Service

Status:

[x] Completed

## Phase D2 Implementation Details

### Architecture Implemented
- **Services**: `assessmentService` (Firestore wrapper), `resumeAssessmentContextService` (context builder), and `resumeAssessmentGenerationService` (Gemini orchestrator).
- **Controllers**: `assessmentController` handling `/api/assessments/resume/generate`.
- **Validation**: Strict Zod validation applied to Gemini output ensuring exactly 4 options and valid correct answer mapping.

### Files Created
- `server/src/services/assessmentService.ts`
- `server/src/services/resumeAssessmentContextService.ts`
- `server/src/services/resumeAssessmentGenerationService.ts`
- `server/src/controllers/assessmentController.ts`
- `server/src/routes/assessmentRoutes.ts`
- `server/src/prompts/resumeAssessmentPrompt.ts`

### Files Modified
- `server/src/index.ts` (Registered new route)
- `firestore.indexes.json` (Added composite index for `assessments` querying by `userId` and `createdAt`)

### API Endpoint
- `POST /api/assessments/resume/generate` with `resumeId` body payload.

### Firestore Structure
- **Assessments**: Stored in `assessments/{assessmentId}` (metadata only).
- **Questions**: Stored in subcollection `assessments/{assessmentId}/questions/{questionId}`.

### Security Decisions
- Identity is strictly retrieved from the authenticated `req.auth` Clerk object.
- Ownership is verified by matching the resume `userId` before proceeding.
- Correct answers and explanations are safely omitted before returning the response to the frontend by mapping to `AssessmentQuestionForUser`.

### Verification Results
- Backend TypeScript compilation passes successfully.

### Known Limitations
- Assessment taking UI, answer submissions, and final score calculations remain intentionally deferred to future phases.

---

# Phase D3: Assessment Retrieval and Secure Question API

Build:
- Firestore assessment retrieval
- Ownership validation
- Secure question serialization
- Status handling

Status:

[x] Completed

## Phase D3 Implementation Details

### API Implemented
- `GET /api/assessments/:assessmentId` added to `assessmentRoutes.ts`.

### Architecture & Security
- **Ownership Verification**: Handled seamlessly inside the controller. The endpoint validates `assessment.userId === req.auth.userId` prior to querying any questions. Returns `403 Forbidden` if ownership fails.
- **Question Retrieval**: Questions are fetched from the `assessments/{assessmentId}/questions` subcollection using the default document ID sorting mechanism, which implicitly provides deterministic ordering based on the UUIDs assigned during generation.
- **Secure Serialization**: Created `toUserSafeQuestion()` mapping function inside `assessmentService.ts`. The backend physically strips `correctOptionId` and `explanation` from memory, guaranteeing they are never sent to the client.
- **Status Handling**: Checks if assessment status is `GENERATING` or `FAILED`. If so, questions are intentionally bypassed and only safe metadata is returned.

### Error Handling
- Invalid `assessmentId` is safely caught by Zod param validation (`400 Bad Request`).
- Missing authentication yields `401 Unauthorized`.
- Missing assessment yields `404 Not Found`.

### Verification Results
- No existing systems (voice, deepgram, interviews, etc.) were modified.
- Build succeeded.

### Git Integration Record
- **Integrated:** Phase D1, Phase D2, and Phase D3 successfully merged into `main`.
- **Integration Commit Hash:** `bc4374a`
- **GitHub Push:** Successful.
- **Backend Build Verification:** Passed.

---

# Phase D5: Resume Assessment Frontend

Build:
- Assessment generation page
- Loading state
- Error state
- Empty state
- Question UI

Status:

[ ] Pending

---

# Phase D6: Assessment Answer and Submission

Build:
- Answer selection
- Progress tracking
- Submission confirmation
- Backend answer submission

The frontend must not calculate official scores.

Status:

[ ] Pending

---

# Phase D7: Assessment Evaluation and Results

Build:
- Backend score calculation
- Correct/incorrect evaluation
- Performance summary
- Skill performance breakdown
- Result API

Status:

[ ] Pending

---

# Phase D8: Aptitude Assessment Backend

Build:
- Aptitude categories
- AI generation
- Assessment creation
- Storage

Status:

[ ] Pending

---

# Phase D9: Aptitude Assessment Frontend

Build:
- Category selection
- Difficulty selection if supported
- Question UI
- Submission
- Results

Status:

[ ] Pending

---

# Phase D10: Skill Upgrade Recommendation Engine

Build:
Recommendations using:
- Resume missing skills
- Resume weaknesses
- Assessment results
- Skill performance

Output:
- Recommended skills
- Priority
- Reason
- Learning objective

Status:

[ ] Pending

---

# Phase D11: Learning Resource Integration

Design a safe resource architecture.

Resources may include:
- YouTube
- Official documentation
- Trusted learning platforms

Do not hardcode random URLs.

Determine whether resources are:
- AI recommended
- Backend curated
- Search-provider generated

Status:

[ ] Pending

---

# Phase D12: Skill Upgrade Frontend

Build:
- Skill recommendations
- Priority badges
- Learning cards
- Resource buttons
- External links

Status:

[ ] Pending

---

# Phase D13: Analytics Integration

Extend existing analytics carefully.

Potential metrics:
- Assessments completed
- Average assessment score
- Aptitude performance
- Skill performance
- Improvement trend

Do not break existing analytics.

Status:

[ ] Pending

---

# Phase D14: Achievement Integration

Extend the existing rule engine.

Potential events:
ASSESSMENT_COMPLETED
APTITUDE_COMPLETED
PERFECT_ASSESSMENT
LEARNING_STARTED

Add achievements only if consistent with the existing architecture.

Status:

[ ] Pending

---

# Phase D15: Dashboard Integration

Update the existing dashboard.

The dashboard should eventually surface:
- Latest assessment
- Assessment performance
- Recommended skills
- Aptitude progress
- Next action

Do not display fake data.

Status:

[ ] Pending

---

# Phase D16: Coming Soon Voice Interview Transition

Update the existing voice interview UI.

Requirements:
- Preserve existing backend functionality.
- Preserve Deepgram.
- Preserve WebSocket infrastructure.
- Preserve interview evaluation.

Update the primary UI messaging to:
AI Voice Interview
Coming Soon

Do not delete existing code.

Status:

[ ] Pending

---

# Phase D17: Navigation and Product Flow

Review:
Sidebar
Dashboard buttons
Resume flow
Assessment flow
Aptitude flow
Skill Upgrade flow

Ensure all buttons perform real actions.

No dead buttons.

Status:

[ ] Pending

---

# Phase D18: Loading, Error and Empty States

Implement consistent states for:
- Resume missing
- Resume processing
- AI generation failure
- Network failure
- No assessments
- No recommendations

Status:

[ ] Pending

---

# Phase D19: Security and Data Ownership Audit

Verify:
- Clerk authentication
- User ownership
- Firestore queries
- API authorization
- Assessment access
- Result access

Status:

[ ] Pending

---

# Phase D20: Build, Type Check, Lint and Integration Verification

Run:
Frontend:
npm run build
Type checking
Linting

Backend:
npm run build
Type checking
Linting

Also verify:
Resume
↓
Resume Assessment
↓
AI Generation
↓
MCQ Questions
↓
Submission
↓
Evaluation
↓
Results
↓
Analytics
↓
Achievements

And:
Aptitude
↓
Generation
↓
Assessment
↓
Results

And:
Resume
↓
Skill Gap
↓
Recommendations
↓
Learning Resources

No mock data.
No fake success states.
No broken navigation.

Status:

[ ] Pending
