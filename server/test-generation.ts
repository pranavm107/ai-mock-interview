import { generateInterview } from './src/services/interview/interviewGenerationService';
import { db } from './src/config/firebaseAdmin';

async function testGeneration() {
  try {
    console.log("Starting generation...");
    const result = await generateInterview(
      "test-user-id",
      null,
      {
        targetRole: "Software Engineer",
        targetCompany: "Google",
        interviewType: "Technical",
        durationMinutes: 30,
        totalQuestions: 5,
        candidateExperienceLevel: "Junior"
      }
    );
    console.log("Generated Successfully!");
    console.log("Total Questions:", result.questions.length);
    console.log("Sample Question:", result.questions[0].question);
  } catch (error) {
    console.error("Generation failed:", error);
  }
}

testGeneration();
