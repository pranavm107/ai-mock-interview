import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupVoiceSocket } from './websocket/voiceSocketHandler';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

import interviewRoutes from './routes/interviewRoutes';
import resumeRoutes from './routes/resumeRoutes';
import sessionRoutes from './routes/sessionRoutes';
import reportRoutes from './routes/interviewReportRoutes';
import voiceRoutes from './routes/voiceRoutes';

app.use('/api/interviews', interviewRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interview-sessions', sessionRoutes);
app.use('/api/interview-reports', reportRoutes);
app.use('/api/voice', voiceRoutes);

const server = http.createServer(app);

// Setup WebSockets
setupVoiceSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
