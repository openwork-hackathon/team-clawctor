/**
 * Seed script to populate the Question table with initial questionnaire templates
 * This creates the master question bank that can be reused across submissions
 */

import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

interface QuestionTemplate {
  questionCode: string;
  sectionKey: string;
  questionText: string;
  questionType: QuestionType;
  description?: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
  order: number;
}

const questionTemplates: QuestionTemplate[] = [
  // Network Security Section
  {
    questionCode: 'Q1.1',
    sectionKey: 'network_security',
    questionText: 'Does your organization have a documented network security policy?',
    questionType: QuestionType.YES_NO,
    description: 'A network security policy defines rules and guidelines for securing network infrastructure',
    required: true,
    order: 1,
  },
  {
    questionCode: 'Q1.2',
    sectionKey: 'network_security',
    questionText: 'What firewall solutions do you currently use?',
    questionType: QuestionType.TEXTAREA,
    placeholder: 'e.g., Cisco ASA, Palo Alto, pfSense, etc.',
    required: true,
    order: 2,
  },
  {
    questionCode: 'Q1.3',
    sectionKey: 'network_security',
    questionText: 'Do you implement network segmentation?',
    questionType: QuestionType.YES_NO,
    description: 'Network segmentation divides a network into multiple segments to improve security',
    required: true,
    order: 3,
  },
  {
    questionCode: 'Q1.4',
    sectionKey: 'network_security',
    questionText: 'How often are firewall rules reviewed and updated?',
    questionType: QuestionType.MULTIPLE_CHOICE,
    options: ['Weekly', 'Monthly', 'Quarterly', 'Annually', 'Ad-hoc', 'Never'],
    required: true,
    order: 4,
  },

  // Data Privacy Section
  {
    questionCode: 'Q2.1',
    sectionKey: 'data_privacy',
    questionText: 'Does your organization have a data privacy policy?',
    questionType: QuestionType.YES_NO,
    required: true,
    order: 1,
  },
  {
    questionCode: 'Q2.2',
    sectionKey: 'data_privacy',
    questionText: 'What types of personal data do you collect and process?',
    questionType: QuestionType.MULTI_SELECT,
    options: [
      'Name and contact information',
      'Financial information',
      'Health information',
      'Biometric data',
      'Location data',
      'Behavioral data',
      'Other',
    ],
    required: true,
    order: 2,
  },
  {
    questionCode: 'Q2.3',
    sectionKey: 'data_privacy',
    questionText: 'Describe your data retention and deletion procedures',
    questionType: QuestionType.TEXTAREA,
    placeholder: 'Explain how long data is retained and how it is securely deleted',
    required: true,
    order: 3,
  },
  {
    questionCode: 'Q2.4',
    sectionKey: 'data_privacy',
    questionText: 'Do you conduct Data Protection Impact Assessments (DPIAs)?',
    questionType: QuestionType.YES_NO,
    description: 'DPIAs help identify and minimize data protection risks',
    required: true,
    order: 4,
  },

  // Access Control Section
  {
    questionCode: 'Q3.1',
    sectionKey: 'access_control',
    questionText: 'Do you implement multi-factor authentication (MFA)?',
    questionType: QuestionType.YES_NO,
    required: true,
    order: 1,
  },
  {
    questionCode: 'Q3.2',
    sectionKey: 'access_control',
    questionText: 'What authentication methods are supported?',
    questionType: QuestionType.MULTI_SELECT,
    options: [
      'Password-based',
      'SMS/Text message',
      'Authenticator app (TOTP)',
      'Hardware security keys',
      'Biometrics',
      'SSO/SAML',
    ],
    required: true,
    order: 2,
  },
  {
    questionCode: 'Q3.3',
    sectionKey: 'access_control',
    questionText: 'Describe your password policy requirements',
    questionType: QuestionType.TEXTAREA,
    placeholder: 'e.g., minimum length, complexity, rotation frequency',
    required: true,
    order: 3,
  },
  {
    questionCode: 'Q3.4',
    sectionKey: 'access_control',
    questionText: 'How often are access rights reviewed?',
    questionType: QuestionType.MULTIPLE_CHOICE,
    options: ['Monthly', 'Quarterly', 'Semi-annually', 'Annually', 'Ad-hoc', 'Never'],
    required: true,
    order: 4,
  },

  // Incident Response Section
  {
    questionCode: 'Q4.1',
    sectionKey: 'incident_response',
    questionText: 'Do you have a documented incident response plan?',
    questionType: QuestionType.YES_NO,
    required: true,
    order: 1,
  },
  {
    questionCode: 'Q4.2',
    sectionKey: 'incident_response',
    questionText: 'Upload your incident response plan document',
    questionType: QuestionType.FILE_UPLOAD,
    description: 'Please provide your incident response plan or runbook',
    required: false,
    order: 2,
  },
  {
    questionCode: 'Q4.3',
    sectionKey: 'incident_response',
    questionText: 'How often are incident response drills conducted?',
    questionType: QuestionType.MULTIPLE_CHOICE,
    options: ['Monthly', 'Quarterly', 'Semi-annually', 'Annually', 'Never'],
    required: true,
    order: 3,
  },
  {
    questionCode: 'Q4.4',
    sectionKey: 'incident_response',
    questionText: 'Describe your incident notification and escalation procedures',
    questionType: QuestionType.TEXTAREA,
    required: true,
    order: 4,
  },
];

async function seedQuestions() {
  console.log('Starting question seeding...');

  try {
    // Check if questions already exist
    const existingCount = await prisma.question.count();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing questions. Skipping seed.`);
      console.log('Run with --force to recreate questions.');
      return;
    }

    // Create questions
    for (const template of questionTemplates) {
      const question = await prisma.question.create({
        data: {
          questionCode: template.questionCode,
          sectionKey: template.sectionKey,
          questionText: template.questionText,
          questionType: template.questionType,
          description: template.description,
          placeholder: template.placeholder,
          options: template.options ? JSON.stringify(template.options) : null,
          required: template.required,
          order: template.order,
          isActive: true,
          version: 1,
        },
      });

      console.log(`Created question: ${question.questionCode} - ${question.questionText.substring(0, 50)}...`);
    }

    console.log(`\nSuccessfully seeded ${questionTemplates.length} questions!`);

    // Summary by section
    const sections = [...new Set(questionTemplates.map(q => q.sectionKey))];
    console.log('\nQuestions by section:');
    for (const section of sections) {
      const count = questionTemplates.filter(q => q.sectionKey === section).length;
      console.log(`  ${section}: ${count} questions`);
    }

  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding
seedQuestions()
  .then(() => {
    console.log('\nSeeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
