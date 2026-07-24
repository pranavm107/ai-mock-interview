import { db } from "../../config/firebase.config";
import { doc, setDoc, getDoc, deleteDoc, query, collection, where, getDocs, writeBatch } from "firebase/firestore";
import { InterviewReview, QuestionReview } from "../../types/review";

export const saveInterviewReview = async (review: InterviewReview, questionReviews: QuestionReview[]): Promise<void> => {
  const batch = writeBatch(db);

  // Save overall review
  const reviewRef = doc(db, "interviewReviews", review.id!);
  batch.set(reviewRef, review);

  // Save per-question reviews
  for (const qRev of questionReviews) {
    const qRef = doc(db, "questionReviews", qRev.id!);
    batch.set(qRef, qRev);
  }

  await batch.commit();
};

export const getInterviewReviewBySessionId = async (sessionId: string): Promise<{ review: InterviewReview, questionReviews: QuestionReview[] } | null> => {
  // Query interview review
  const reviewQuery = query(collection(db, "interviewReviews"), where("sessionId", "==", sessionId));
  const reviewSnap = await getDocs(reviewQuery);
  
  if (reviewSnap.empty) {
    return null;
  }
  
  const review = reviewSnap.docs[0].data() as InterviewReview;
  
  // Query question reviews
  const qrQuery = query(collection(db, "questionReviews"), where("reviewId", "==", review.id));
  const qrSnap = await getDocs(qrQuery);
  const questionReviews = qrSnap.docs.map(doc => doc.data() as QuestionReview);

  return { review, questionReviews };
};

export const getInterviewReviewById = async (reviewId: string): Promise<InterviewReview | null> => {
  const docRef = doc(db, "interviewReviews", reviewId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as InterviewReview;
  }
  return null;
};

export const listInterviewReviewsByUser = async (userId: string): Promise<InterviewReview[]> => {
  const q = query(collection(db, "interviewReviews"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as InterviewReview);
};

export const deleteInterviewReview = async (reviewId: string): Promise<void> => {
  const batch = writeBatch(db);

  // Delete main review
  const reviewRef = doc(db, "interviewReviews", reviewId);
  batch.delete(reviewRef);

  // Delete associated question reviews
  const qrQuery = query(collection(db, "questionReviews"), where("reviewId", "==", reviewId));
  const qrSnap = await getDocs(qrQuery);
  qrSnap.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};
