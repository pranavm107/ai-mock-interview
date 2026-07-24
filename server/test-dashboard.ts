import * as dotenv from 'dotenv';
dotenv.config();
import { db } from './src/config/firebaseAdmin';

async function testQueries() {
  const userId = "user_3GP0DFECNbvhEZIrnNzLRCd8yBO"; 
  console.log('Testing queries for user:', userId);

  try {
    const collections = [
      'careerProfiles',
      'careerScores',
      'weeklyCoaching',
      'monthlyCoaching',
      'learningRoadmaps',
      'dailyGoals'
    ];

    if (!db) {
        console.error("No db");
        return;
    }
    for (const col of collections) {
      console.log(`Testing ${col}...`);
      if (col === 'careerProfiles') {
        await db.collection(col).doc(userId).get();
      } else {
        await db.collection(col)
          .where('userId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
      }
      console.log(`${col} query OK!`);
    }

  } catch (error: any) {
    console.error('ERROR during query test:', error.message);
  }
}

testQueries().then(() => process.exit(0));
