import type { ServerIntegritySession, IntegritySignalResponse, CodingMalpracticeRecord } from '../../types/coding';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const createServerIntegritySession = async (problemId: string, language: string, token: string): Promise<ServerIntegritySession> => {
  const res = await fetch(`${API_BASE_URL}/api/coding/integrity/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ problemId, language, mode: 'INTEGRITY' })
  });
  const data = await res.json();
  if (!data.success) {
    const err: any = new Error(data.error);
    if (data.existingSessionId) err.existingSessionId = data.existingSessionId;
    throw err;
  }
  return data.data;
};

export const getServerIntegritySession = async (sessionId: string, token: string): Promise<ServerIntegritySession> => {
  const res = await fetch(`${API_BASE_URL}/api/coding/integrity/session/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const processServerIntegritySignal = async (sessionId: string, signalId: string, type: string, token: string, occurredAt?: string, metadata?: Record<string, any>): Promise<IntegritySignalResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/coding/integrity/session/${sessionId}/signal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ signalId, type, occurredAt, metadata })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const endServerIntegritySession = async (sessionId: string, token: string): Promise<ServerIntegritySession> => {
  const res = await fetch(`${API_BASE_URL}/api/coding/integrity/session/${sessionId}/end`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const heartbeatServerIntegritySession = async (sessionId: string, token: string): Promise<ServerIntegritySession> => {
  const res = await fetch(`${API_BASE_URL}/api/coding/integrity/session/${sessionId}/heartbeat`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};
