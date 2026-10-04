import { db } from '../config/firebaseAdmin';
import { Assessment, AssessmentQuestion, AssessmentStatus, AssessmentQuestionForUser } from '../types/assessment';

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

export const toUserSafeQuestion = (question: AssessmentQuestion): AssessmentQuestionForUser => {
  const { correctOptionId, explanation, ...safeQuestion } = question;
  return safeQuestion;
};

export const getUserAssessments = async (
  userId: string,
  options?: {
    category?: string;
    status?: AssessmentStatus;
    limit?: number;
  }
): Promise<Assessment[]> => {
  let query: FirebaseFirestore.Query = db.collection(ASSESSMENTS_COLLECTION).where('userId', '==', userId);

  if (options?.category) {
    if (options.category === 'resume-based') {
      query = query.where('type', '==', 'RESUME_MCQ');
    } else if (options.category === 'technical-mcqs') {
      query = query.where('type', '==', 'TECHNICAL_MCQ');
    } else if (options.category === 'aptitude') {
      query = query.where('type', '==', 'APTITUDE').where('category', '==', 'QUANTITATIVE');
    } else if (options.category === 'verbal-ability') {
      query = query.where('type', '==', 'APTITUDE').where('category', '==', 'VERBAL');
    } else if (options.category === 'logical-reasoning') {
      query = query.where('type', '==', 'APTITUDE').where('category', '==', 'LOGICAL_REASONING');
    }
  }

  if (options?.status) {
    query = query.where('status', '==', options.status);
  }

  // Sort by createdAt descending
  query = query.orderBy('createdAt', 'desc');

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => doc.data() as Assessment);
};

export const getUserAssessmentStats = async (userId: string) => {
  const assessments = await getUserAssessments(userId);
  
  let totalAssessments = assessments.length;
  let completedAssessments = 0;
  
  // We can fetch results for completed assessments to calculate score trends
  // For now we'll just count them as stats
  for (const a of assessments) {
    if (a.status === 'COMPLETED') {
      completedAssessments++;
    }
  }

  return {
    totalAssessments,
    completedAssessments
  };
};
