# Production Deployment Checklist

This document provides a comprehensive pre-flight checklist for deploying the PrepPilot AI platform to a production environment.

## 1. Environment & Secrets
- [ ] **Frontend Variables**: Ensure `VITE_API_URL` points to the production backend URL (e.g., `https://api.preppilot.com`).
- [ ] **Clerk Configuration**: Set `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to Clerk production instance keys.
- [ ] **Firebase Credentials**: Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` for the backend admin SDK. Ensure frontend `VITE_FIREBASE_*` variables match the production Firebase project.
- [ ] **Supabase Credentials**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the production storage project.
- [ ] **AI Credentials**: Set `GROQ_API_KEY`, `DEEPGRAM_API_KEY`, and `TTS_API_KEY` with production-grade API keys that have appropriate billing/rate limits enabled.
- [ ] **Security**: Ensure `NODE_ENV=production` is set so the logger enforces JSON-only output and suppresses debug statements.

## 2. Infrastructure & Hosting
- [ ] **Frontend Hosting**: Ensure the SPA routing is configured to fallback to `index.html` (e.g., Vercel rewrites or Nginx try_files).
- [ ] **Backend Hosting**: Ensure the deployment platform (e.g., Render, Heroku, AWS) supports WebSockets (for Deepgram voice streaming).
- [ ] **CORS**: Verify that `server/src/index.ts` is configured with the production frontend origin (`https://preppilot.com`) in the CORS allowed origins list.

## 3. Database & Storage
- [ ] **Firestore Indexes**: Ensure all composite indexes used by queries (e.g., `userId` + `createdAt` DESC) are built and active in the production Firebase project.
- [ ] **Firestore Rules**: Verify that Firestore Security Rules are deployed and strictly prevent unauthorized client-side reads/writes (though the backend uses Admin SDK, any direct client access must be restricted).
- [ ] **Supabase Buckets**: Ensure the `resumes` and `interview-recordings` storage buckets exist in Supabase.
- [ ] **Supabase Policies**: Configure RLS (Row Level Security) and Storage Policies so users can only upload/access their own files.

## 4. Third-Party Configurations
- [ ] **Clerk Domain**: Add the production domain to Clerk's allowed domains list.
- [ ] **Clerk Redirects**: Ensure sign-in/sign-up redirect URLs are mapped to the production domain.
- [ ] **Microphone Permissions**: The platform MUST be served over `https://` for browsers to allow microphone and webcam access.

## 5. Build Verification
- [ ] **Frontend Build**: `npm run build` completes without TypeScript or Vite errors.
- [ ] **Backend Build**: `tsc` completes without TypeScript errors.

## 6. Smoke Tests
Run these manual tests against a staging or production-like environment before fully releasing:
- [ ] **Authentication**: Sign up, sign in, and log out successfully.
- [ ] **Setup**: Upload a resume (verify it saves to Supabase and updates Firestore user stats).
- [ ] **Generation**: Generate an interview and verify questions align with the uploaded resume.
- [ ] **Runtime**: Start an interview, answer a question (text), pause, resume, and finish.
- [ ] **Voice**: Start an interview with voice enabled, speak into the microphone, verify Deepgram real-time transcription, and listen to TTS playback.
- [ ] **Report**: Complete an interview and verify the Professional Feedback Report loads without fabricating scores.
- [ ] **Analytics**: Check the Analytics dashboard to ensure the Readiness Intelligence panel accurately reflects the completed interview data.

## 7. Monitoring & Rollback
- [ ] **Observability**: Ensure server logs are aggregating correctly (e.g., Datadog, CloudWatch) for error tracking.
- [ ] **Rollback Procedure**: Have a strategy to revert the frontend deployment and backend docker image/deployment to the previous git SHA if critical failures occur.
