import { Request, Response } from 'express';
import { generateQuestions } from '../services/interviewQuestionService';

export const generateInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const { company, role, experience, difficulty, skills, questionCount } = req.body;

    if (!company || !role || !questionCount) {
      return res.status(400).json({ error: 'Missing required fields: company, role, or questionCount' });
    }

    const questions = await generateQuestions({
      company,
      role,
      experience: experience || 'Mid',
      difficulty: difficulty || 'Medium',
      skills,
      questionCount
    });

    res.json(questions);
  } catch (error: any) {
    console.error('Error generating questions:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate questions.' });
  }
};
