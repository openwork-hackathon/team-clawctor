import { prisma } from '@team-clawctor/db';

console.log('Prisma models:', Object.keys(prisma).filter(k => k[0] !== '_' && k[0] !== '$').join(', '));
console.log('questionnaireSubmission model exists:', 'questionnaireSubmission' in prisma);
