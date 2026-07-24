import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupDeepgramSocket } from './websocket/deepgramSocket';

dotenv.config();

import { clerkMiddleware } from '@clerk/express';

const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

import interviewRoutes from './routes/interviewRoutes';
import careerRoutes from './routes/careerRoutes';

app.use('/api/interviews', interviewRoutes);
app.use('/api/career', careerRoutes);

const server = http.createServer(app);

// Setup WebSockets
setupDeepgramSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
