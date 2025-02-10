const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data in safe order
  await prisma.answer.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.question.deleteMany();
  await prisma.test.deleteMany();
  await prisma.user.deleteMany();

  // Create primary user
  const user = await prisma.user.create({
    data: {
      email: 'admin@hirefast.com',
      name: 'Alex Johnson',
    },
  });

  // Create test with nested questions
  const test = await prisma.test.create({
    data: {
      title: 'Frontend Developer Technical Screen',
      userId: user.id,
      accessCode: 'DEV2023', // Fixed code for testing
      status: 'ACTIVE',
      questions: {
        create: [
          {
            content: 'Explain the box model in CSS',
            timeLimit: 120
          },
          {
            content: 'What is the virtual DOM in React?',
            timeLimit: 180
          },
          {
            content: 'Implement a debounce function in JavaScript',
            timeLimit: 300
          }
        ]
      }
    },
    include: { questions: true }
  });

  // Create candidates with nested answers
  const candidates = await Promise.all([
    // Completed candidate
    prisma.candidate.create({
      data: {
        name: 'Sarah Wilson',
        testId: test.id,
        status: 'COMPLETED',
        startedAt: new Date('2023-08-01T09:00:00Z'),
        endedAt: new Date('2023-08-01T09:35:00Z'),
        answers: {
          create: [
            {
              questionId: test.questions[0].id,
              audioUrl: 'https://storage.example.com/sarah-wilson-q1.mp3',
              transcript: 'The CSS box model consists of content, padding, border, and margin...',
              score: 4
            },
            {
              questionId: test.questions[1].id,
              audioUrl: 'https://storage.example.com/sarah-wilson-q2.mp3',
              transcript: 'The virtual DOM is a lightweight representation of the real DOM...',
              score: 5
            }
          ]
        }
      }
    }),
    // In-progress candidate
    prisma.candidate.create({
      data: {
        name: 'James Miller',
        testId: test.id,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        answers: {
          create: {
            questionId: test.questions[0].id,
            audioUrl: 'https://storage.example.com/james-miller-q1.mp3',
            transcript: 'The box model defines how elements are rendered in the browser...',
            score: 3
          }
        }
      }
    })
  ]);

  console.log('Seed data created successfully!');
  console.log(`Test access code: ${test.accessCode}`);
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });