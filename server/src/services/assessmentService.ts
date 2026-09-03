import { db } from '../config/firebaseAdmin';
import { Assessment, AssessmentQuestion, AssessmentStatus, AssessmentQuestionForUser, AssessmentResult } from '../types/assessment';

const ASSESSMENTS_COLLECTION = 'assessments';

export const createAssessment = async (assessment: Assessment): Promise<void> => {
  await db.collection(ASSESSMENTS_COLLECTION).doc(assessment.id).set(assessment);
};

export const getAssessmentById = async (id: string): Promise<Assessment | null> => {
  const doc = await db.collection(ASSESSMENTS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as Assessment;
};

export const saveAssessmentQuestions = async (assessmentId: string, questions: AssessmentQuestion[]): Promise<void> => {
  const batch = db.batch();
  const questionsRef = db.collection(ASSESSMENTS_COLLECTION).doc(assessmentId).collection('questions');

  for (const q of questions) {
    const qDoc = questionsRef.doc(q.id);
    batch.set(qDoc, q);
  }

  await batch.commit();
};

export const getAssessmentQuestions = async (assessmentId: string): Promise<AssessmentQuestion[]> => {
  const snapshot = await db.collection(ASSESSMENTS_COLLECTION).doc(assessmentId).collection('questions').get();
  const questions = snapshot.docs.map(doc => doc.data() as AssessmentQuestion);
  
  // Ensure deterministic ordering (default to id since no order field exists)
  return questions.sort((a, b) => a.id.localeCompare(b.id));
};

export const updateAssessmentStatus = async (assessmentId: string, status: AssessmentStatus, additionalFields: Partial<Assessment> = {}): Promise<void> => {
  await db.collection(ASSESSMENTS_COLLECTION).doc(assessmentId).update({
    status,
    updatedAt: new Date().toISOString(),
    ...additionalFields
  });
};

export const markAssessmentFailed = async (assessmentId: string): Promise<void> => {
  await updateAssessmentStatus(assessmentId, 'FAILED');
};

export const saveAssessmentResultAtomically = async (assessmentId: string, answeredCount: number, result: AssessmentResult): Promise<boolean> => {
  return await db.runTransaction(async (transaction) => {
    const assessmentRef = db.collection(ASSESSMENTS_COLLECTION).doc(assessmentId);
    const assessmentDoc = await transaction.get(assessmentRef);
    
    if (!assessmentDoc.exists) {
      throw new Error('Assessment not found');
    }

    const currentStatus = assessmentDoc.data()?.status;
    if (currentStatus === 'COMPLETED') {
      return false; // Safely abort without throwing if already completed
    }

    const resultRef = assessmentRef.collection('results').doc('final');

    transaction.update(assessmentRef, {
      status: 'COMPLETED',
      answeredCount,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    transaction.set(resultRef, result);
    return true;
  });
};

export const getAssessmentResult = async (assessmentId: string): Promise<AssessmentResult | null> => {
  const doc = await db.collection(ASSESSMENTS_COLLECTION).doc(assessmentId).collection('results').doc('final').get();
  if (!doc.exists) return null;
  return doc.data() as AssessmentResult;
};

export const toUserSafeQuestion = (question: AssessmentQuestion): AssessmentQuestionForUser => {
  const { correctOptionId, explanation, ...safeQuestion } = question;
  return safeQuestion;
};
