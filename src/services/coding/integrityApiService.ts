import type { ServerIntegritySession, IntegritySignalResponse } from '../../types/coding';
// Fixed api service

export const createServerIntegritySession = async (problemId: string, language: string, token: string): Promise<ServerIntegritySession> => {
  const res = await fetch('/api/coding/integrity/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ problemId, language, mode: 'INTEGRITY' })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const getServerIntegritySession = async (sessionId: string, token: string): Promise<ServerIntegritySession> => {
  const res = await fetch(`/api/coding/integrity/session/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const processServerIntegritySignal = async (sessionId: string, signalId: string, type: string, token: string): Promise<IntegritySignalResponse> => {
  const res = await fetch(`/api/coding/integrity/session/${sessionId}/signal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ signalId, type })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const endServerIntegritySession = async (sessionId: string, token: string): Promise<ServerIntegritySession> => {
  const res = await fetch(`/api/coding/integrity/session/${sessionId}/end`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};
