import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupDeepgramSocket } from './websocket/deepgramSocket';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

import interviewRoutes from './routes/interviewRoutes';

app.use('/api/interviews', interviewRoutes);

const server = http.createServer(app);

// Setup WebSockets
setupDeepgramSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
