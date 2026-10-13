# C29: Performance & Reliability Report

## 1. Scope & Findings

This phase optimized database queries, mitigated concurrency issues, and validated execution sandbox safety.

**Backend Performance:**
- Identifed Unbounded Queries in Analytics & Dashboard Services: 
  - `codingAnalyticsService.ts` was downloading the entire payload for submissions without projecting required fields.
  - `codingDashboardService.ts` was redundantly querying `codingDailyAssignments` multiple times during page loads to fetch recent tasks, generate daily assignments, and aggregate user progress.

**Frontend Performance:**
- Identifed Duplicate API requests: `CodingReadiness.tsx` and `CodingAnalytics.tsx` fired simultaneous API requests to backend endpoints that triggered heavy user analytics queries under the hood.

**Reliability & Failure Handling:**
- Validated Docker container teardown (in `sandboxRunner.ts`) to ensure strict cleanup via `finally { await container.remove({ force: true }); }`, securing execution isolation against arbitrary OOM, timeout, and compilation bugs.
- Validated AI analysis request timeout and concurrency locks. The server implements a proper Set-based user lock (`activeUserAnalyses`) coupled with an `AbortController` timeout for upstream AI dependencies.

## 2. Optimizations

**1. Database Query Efficiency (Fixed)**
- Replaced redundant dashboard assignments queries with a single, unified database fetch per request in `CodingDashboardService`. The resulting `allTasks` slice is shared synchronously to hydrate `dailyAssignment`, `recentTasks`, and `progressMetrics` internally.
- Implemented Firestore query projection (`.select('problemId', 'status', 'language', 'submittedAt')`) in `getUserAnalytics` to minimize memory allocation and network payload size by excluding heavy fields (like source code) from historical aggregation.

**2. Request Deduplication (Fixed)**
- Implemented a short-lived, request-level Promise memoization cache in `CodingAnalyticsService` (`activeRequests`). This guarantees that concurrent backend requests from the frontend UI (for readiness and analytics) automatically share the execution thread, avoiding duplicate aggregate queries against Firestore.

## 3. Test & Build Results
- Run C18-C28 backend regression suites: **PASS**
- Verified test stability around assignment generation logic since the queries were updated to run from in-memory slices.
- Executed full frontend and server Vite/TypeScript builds: **PASS**

## 4. Remaining Limitations
- **Firestore `IN` Query Limits**: Aggregation still queries `codingProblems` in batches of 10. For long-term scale (thousands of solved problems per user), maintaining a denormalized 'User Summary Document' would be highly recommended.
- **Process-Local Locks**: The AI concurrency lock (`activeUserAnalyses`) is stored in-memory. If the Node backend is horizontally scaled, users could bypass the concurrency limit by routing to different servers. Distributed locking (e.g., Redis) is required for full-scale deployments.
