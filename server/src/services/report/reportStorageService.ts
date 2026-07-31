import { db } from "../../config/firebase.config";
import { collection, doc, setDoc, getDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { InterviewReport } from "../../types/interviewReport";

export const saveReport = async (report: InterviewReport): Promise<string> => {
  const docRef = doc(db, "interviewReports", report.id);
  await setDoc(docRef, report);
  return report.id;
};

export const getReport = async (reportId: string): Promise<InterviewReport | null> => {
  const docRef = doc(db, "interviewReports", reportId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as InterviewReport;
  }
  return null;
};

export const getReportBySessionId = async (sessionId: string): Promise<InterviewReport | null> => {
  const q = query(collection(db, "interviewReports"), where("sessionId", "==", sessionId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].data() as InterviewReport;
  }
  return null;
};

export const listReportsByUser = async (userId: string): Promise<InterviewReport[]> => {
  const q = query(collection(db, "interviewReports"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as InterviewReport);
};

export const deleteReport = async (reportId: string): Promise<void> => {
  const docRef = doc(db, "interviewReports", reportId);
  await deleteDoc(docRef);
};
