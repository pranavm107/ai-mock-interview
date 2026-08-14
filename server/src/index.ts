import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

console.log('1. Starting server initialization...');
dotenv.config();

console.log('2. Loading WebSockets & Middleware...');
import { setupVoiceSocket } from './websocket/voiceSocketHandler';
import { clerkMiddleware } from '@clerk/express';
import { setupDeepgramSocket } from './websocket/deepgramSocket';

const app = express();
app.use(
  cors({
    origin: [
      "https://preppilot-pi-sandy.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

console.log('3. Registering API Routes...');
import interviewRoutes from './routes/interviewRoutes';
import resumeRoutes from './routes/resumeRoutes';
import sessionRoutes from './routes/sessionRoutes';
import reportRoutes from './routes/interviewReportRoutes';
import voiceRoutes from './routes/voiceRoutes';
import replayRoutes from './routes/replayRoutes';
import reviewRoutes from './routes/reviewRoutes';
import careerRoutes from './routes/careerRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

app.use('/api/interviews', interviewRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interview-sessions', sessionRoutes);
app.use('/api/interview-sessions', replayRoutes);
app.use('/api/interview-reports', reportRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

console.log('4. Creating HTTP server...');
const server = http.createServer(app);

console.log('5. Attaching WebSockets...');
setupVoiceSocket(server);
setupDeepgramSocket(server);

const PORT = process.env.PORT || 3001;
console.log(`6. Binding to PORT ${PORT}...`);
server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
