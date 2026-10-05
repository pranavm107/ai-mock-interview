# PrepPilot AI

PrepPilot AI is a production-grade, AI-powered mock interview and career preparation platform. It closes the loop on career preparation by letting candidates take highly realistic mock interviews, receive comprehensive professional feedback, identify specific weaknesses, and target practice.

## Architecture

PrepPilot AI relies on a modern, robust, and separated full-stack architecture:

- **Frontend**: React 19, TypeScript, Vite 8, TailwindCSS 4, Shadcn UI
- **Backend**: Node.js, Express, TypeScript
- **Authentication**: Clerk (frontend components + backend API verification)
- **Database**: Firebase Firestore (NoSQL, managed by `firebase-admin` on backend)
- **Blob Storage**: Supabase Storage (exclusively used for PDF Resumes and WebM interview video recordings)
- **AI Engine (Text/Logic)**: Groq (using Llama models)
- **AI Engine (Voice)**: Deepgram (WebSockets for real-time STT)
- **TTS**: ElevenLabs (or configurable fallback)

## Product Loop

The platform employs a closed learning loop design:
1. **Smart Setup**: Upload resumes and configure the target role/company.
2. **Generation**: Create tailored interview questions using a quality validation engine.
3. **Runtime**: Engage in realistic text or real-time voice interviews.
4. **Adaptive Follow-ups**: The AI interviewer dynamically drills down on ambiguous answers.
5. **Report Generation**: Receive a professional feedback report scoring communication, technical depth, and confidence.
6. **Readiness Intelligence**: Track overall ATS Readiness and behavioral trends.
7. **Preparation**: Practice specific weakness areas directly linked from analytics.

## Installation & Local Development

### 1. Clone the repository
```bash
git clone https://github.com/pranavm107/ai-mock-interview.git
cd ai-mock-interview
```

### 2. Setup Environment Variables
Copy the `.env.example` file to `.env` in the root directory:
```bash
cp .env.example .env
```
Fill out the necessary credentials for Clerk, Firebase, Groq, Deepgram, and Supabase. Note that the frontend variables (prefixed with `VITE_`) and backend variables are all kept in this root file for convenience, though they are loaded into respective services during build/runtime.

### 3. Install Dependencies
Install packages for both the frontend and backend:
```bash
npm install
cd server
npm install
cd ..
```

### 4. Run the Servers
You will need to run the frontend and backend concurrently in separate terminal windows.

**Start the Node/Express Backend:**
```bash
cd server
npm run dev
```

**Start the React/Vite Frontend:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3001`.

## Production Build

To build the application for production:

```bash
# Build frontend
npm run build

# Build backend
cd server
npm run build
```

## Testing

Automated end-to-end testing relies on Playwright.
*Note: Playwright tests are currently disabled/blocked due to a known path resolution incompatibility between Vite 8 and Rolldown.*
