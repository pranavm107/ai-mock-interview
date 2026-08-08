import { db } from '../config/firebaseAdmin';
import { AchievementDefinition, AchievementCategory, AchievementRarity, RequirementType } from '../types/achievement';

const initialAchievements: AchievementDefinition[] = [
  // INTERVIEW
  {
    key: 'INTERVIEW_1',
    title: 'First Step',
    description: 'Complete your first mock interview',
    category: AchievementCategory.INTERVIEW,
    rarity: AchievementRarity.COMMON,
    icon: 'trophy',
    requirementType: RequirementType.INTERVIEW_COUNT,
    requirementValue: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'INTERVIEW_5',
    title: 'Getting Started',
    description: 'Complete 5 mock interviews',
    category: AchievementCategory.INTERVIEW,
    rarity: AchievementRarity.COMMON,
    icon: 'trophy',
    requirementType: RequirementType.INTERVIEW_COUNT,
    requirementValue: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'INTERVIEW_10',
    title: 'Interview Pro',
    description: 'Complete 10 mock interviews',
    category: AchievementCategory.INTERVIEW,
    rarity: AchievementRarity.RARE,
    icon: 'trophy',
    requirementType: RequirementType.INTERVIEW_COUNT,
    requirementValue: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'INTERVIEW_25',
    title: 'Interview Master',
    description: 'Complete 25 mock interviews',
    category: AchievementCategory.INTERVIEW,
    rarity: AchievementRarity.EPIC,
    icon: 'trophy',
    requirementType: RequirementType.INTERVIEW_COUNT,
    requirementValue: 25,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'INTERVIEW_50',
    title: 'Interview Legend',
    description: 'Complete 50 mock interviews',
    category: AchievementCategory.INTERVIEW,
    rarity: AchievementRarity.LEGENDARY,
    icon: 'trophy',
    requirementType: RequirementType.INTERVIEW_COUNT,
    requirementValue: 50,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // PERFORMANCE
  {
    key: 'SCORE_70',
    title: 'Good Start',
    description: 'Achieve a score of 70 or higher',
    category: AchievementCategory.PERFORMANCE,
    rarity: AchievementRarity.COMMON,
    icon: 'target',
    requirementType: RequirementType.SCORE_THRESHOLD,
    requirementValue: 70,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'SCORE_80',
    title: 'Strong Performer',
    description: 'Achieve a score of 80 or higher',
    category: AchievementCategory.PERFORMANCE,
    rarity: AchievementRarity.RARE,
    icon: 'target',
    requirementType: RequirementType.SCORE_THRESHOLD,
    requirementValue: 80,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'SCORE_90',
    title: 'Excellent',
    description: 'Achieve a score of 90 or higher',
    category: AchievementCategory.PERFORMANCE,
    rarity: AchievementRarity.EPIC,
    icon: 'target',
    requirementType: RequirementType.SCORE_THRESHOLD,
    requirementValue: 90,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'SCORE_95',
    title: 'Outstanding',
    description: 'Achieve a score of 95 or higher',
    category: AchievementCategory.PERFORMANCE,
    rarity: AchievementRarity.LEGENDARY,
    icon: 'target',
    requirementType: RequirementType.SCORE_THRESHOLD,
    requirementValue: 95,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // CONSISTENCY
  {
    key: 'STREAK_3',
    title: 'Getting Consistent',
    description: 'Maintain a 3-day practice streak',
    category: AchievementCategory.CONSISTENCY,
    rarity: AchievementRarity.COMMON,
    icon: 'flame',
    requirementType: RequirementType.STREAK_DAYS,
    requirementValue: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'STREAK_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day practice streak',
    category: AchievementCategory.CONSISTENCY,
    rarity: AchievementRarity.RARE,
    icon: 'flame',
    requirementType: RequirementType.STREAK_DAYS,
    requirementValue: 7,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'STREAK_14',
    title: 'Dedicated',
    description: 'Maintain a 14-day practice streak',
    category: AchievementCategory.CONSISTENCY,
    rarity: AchievementRarity.EPIC,
    icon: 'flame',
    requirementType: RequirementType.STREAK_DAYS,
    requirementValue: 14,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'STREAK_30',
    title: 'Unstoppable',
    description: 'Maintain a 30-day practice streak',
    category: AchievementCategory.CONSISTENCY,
    rarity: AchievementRarity.LEGENDARY,
    icon: 'flame',
    requirementType: RequirementType.STREAK_DAYS,
    requirementValue: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // RESUME
  {
    key: 'PROFILE_COMPLETE',
    title: 'Profile Ready',
    description: 'Complete your profile',
    category: AchievementCategory.RESUME,
    rarity: AchievementRarity.COMMON,
    icon: 'file-check',
    requirementType: RequirementType.PROFILE_COMPLETION,
    requirementValue: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'RESUME_ADDED',
    title: 'Resume Ready',
    description: 'Add your resume',
    category: AchievementCategory.RESUME,
    rarity: AchievementRarity.COMMON,
    icon: 'file-check',
    requirementType: RequirementType.RESUME_ADDED,
    requirementValue: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'ATS_70',
    title: 'ATS Ready',
    description: 'Achieve an ATS score of 70 or higher',
    category: AchievementCategory.RESUME,
    rarity: AchievementRarity.RARE,
    icon: 'medal',
    requirementType: RequirementType.ATS_SCORE,
    requirementValue: 70,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'ATS_85',
    title: 'ATS Optimized',
    description: 'Achieve an ATS score of 85 or higher',
    category: AchievementCategory.RESUME,
    rarity: AchievementRarity.EPIC,
    icon: 'medal',
    requirementType: RequirementType.ATS_SCORE,
    requirementValue: 85,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function seedAchievements() {
  console.log('Starting achievements seeding...');
  const batch = db.batch();
  
  for (const achievement of initialAchievements) {
    const docRef = db.collection('achievementDefinitions').doc(achievement.key);
    
    // We only update fields we care about so we don't accidentally overwrite 'createdAt' if it exists
    // We do this by using a set with { merge: true }
    // However, we want to ensure idempotency. If it already exists, we will update other fields
    // but keep createdAt intact. 
    
    const { createdAt: _createdAt, ...updateData } = achievement;
    
    batch.set(docRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    // We also want to set createdAt only if the document doesn't exist.
    // Since merge doesn't allow setting conditionally, we'll just set it. It will overwrite createdAt, which is acceptable for seed data.
    // If exact idempotency of `createdAt` is desired, we could fetch first, but batching is faster.
    // Let's stick to simple upsert.
  }
  
  await batch.commit();
  console.log(`Successfully seeded ${initialAchievements.length} achievements.`);
}

if (require.main === module) {
  seedAchievements().then(() => {
    console.log('Seed process finished.');
    process.exit(0);
  }).catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  });
}
