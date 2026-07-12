import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  clerkId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  username: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
