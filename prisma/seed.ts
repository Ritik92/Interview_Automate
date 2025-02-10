const { PrismaClient } =require('@prisma/client');

const prisma = new PrismaClient();

function generateAccessCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function main() {
  // Clear existing data
  await prisma.answer.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.question.deleteMany();
  await prisma.test.deleteMany();
  await prisma.user.deleteMany();

  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'interviewer@example.com',
      name: 'John Doe',
      role: 'INTERVIEWER',
    },
  });

  // Create a test
  const test = await prisma.test.create({
    data: {
      title: 'Software Engineer Screening',
      userId: user.id,
      accessCode: generateAccessCode(),
      status: 'ACTIVE',
    },
  });

  // Create questions
  const questions = await Promise.all(
    [1, 2, 3].map((num) =>
      prisma.question.create({
        data: {
          content: `Question ${num}: What is your experience with TypeScript?`,
          timeLimit: 180,
          testId: test.id,
        },
      })
    )
  );

  // Create candidates
  const candidates = await Promise.all(
    ['Alice Smith', 'Bob Johnson'].map((name) =>
      prisma.candidate.create({
        data: {
          name: name,
          testId: test.id,
          status: 'COMPLETED',
          startedAt: new Date(),
          endedAt: new Date(Date.now() + 3600 * 1000),
        },
      })
    )
  );

  // Create answers
  for (const candidate of candidates) {
    for (const question of questions) {
      await prisma.answer.create({
        data: {
          audioUrl: `https://storage.example.com/audio/.mp3`,
          transcript: 'Sample transcript text...',
          score: Math.floor(Math.random() * 3) + 3, // Random score between 3-5
          candidateId: candidate.id,
          questionId: question.id,
        },
      });
    }
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });