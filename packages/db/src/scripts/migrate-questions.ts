/**
 * Migration script to separate questions from answers
 * This script:
 * 1. Extracts all unique questions from existing QuestionnaireAnswer records
 * 2. Creates Question records for each unique question
 * 3. Updates QuestionnaireAnswer records to reference the new Question records
 */

import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateQuestionsAndAnswers() {
  console.log('Starting migration: Separating questions from answers...');

  try {
    // Step 1: Get all existing answers grouped by questionCode
    const existingAnswers = await prisma.questionnaireAnswer.findMany({
      include: {
        section: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`Found ${existingAnswers.length} existing answers`);

    // Step 2: Extract unique questions
    const questionsMap = new Map<string, {
      questionCode: string;
      sectionKey: string;
      questionText: string;
      order: number;
    }>();

    for (const answer of existingAnswers) {
      const key = `${answer.section.sectionKey}:${(answer as any).questionCode}`;

      if (!questionsMap.has(key)) {
        questionsMap.set(key, {
          questionCode: (answer as any).questionCode,
          sectionKey: answer.section.sectionKey,
          questionText: (answer as any).questionText,
          order: (answer as any).order || 0,
        });
      }
    }

    console.log(`Found ${questionsMap.size} unique questions`);

    // Step 3: Create Question records
    const createdQuestions = new Map<string, string>(); // questionCode -> questionId

    for (const [key, questionData] of questionsMap) {
      const question = await prisma.question.create({
        data: {
          questionCode: questionData.questionCode,
          sectionKey: questionData.sectionKey,
          questionText: questionData.questionText,
          questionType: QuestionType.TEXT, // Default type, can be updated later
          order: questionData.order,
          required: true,
          isActive: true,
          version: 1,
        },
      });

      createdQuestions.set(questionData.questionCode, question.id);
      console.log(`Created question: ${questionData.questionCode} -> ${question.id}`);
    }

    // Step 4: Update all QuestionnaireAnswer records to reference Question records
    console.log('Updating answer records to reference questions...');

    for (const answer of existingAnswers) {
      const questionId = createdQuestions.get((answer as any).questionCode);

      if (!questionId) {
        console.error(`Could not find question ID for questionCode: ${(answer as any).questionCode}`);
        continue;
      }

      await prisma.questionnaireAnswer.update({
        where: { id: answer.id },
        data: {
          questionId,
        },
      });
    }

    console.log('Migration completed successfully!');
    console.log(`Summary:
  - Total answers processed: ${existingAnswers.length}
  - Unique questions created: ${createdQuestions.size}
  - Answers updated: ${existingAnswers.length}
    `);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateQuestionsAndAnswers()
  .then(() => {
    console.log('Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
