export const buildResumePrompt = (resume: any): string => {
  return `
--- RESUME CONTEXT ---
${JSON.stringify(resume, null, 2)}
----------------------
When generating "RESUME" category questions, you MUST reference specific projects, experiences, and skills from the above JSON. Do NOT hallucinate technologies or projects the candidate has not listed.
`;
};
