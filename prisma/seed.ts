const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log('Starting seeding...');

    // Clean existing data
    await prisma.score.deleteMany();
    await prisma.report.deleteMany();
    await prisma.response.deleteMany();
    await prisma.interview.deleteMany();
    await prisma.question.deleteMany();
    await prisma.test.deleteMany();
    await prisma.user.deleteMany();

    // Create Admin and Interviewer users
    const admin = await prisma.user.create({
        data: {
            email: 'admin@company.com',
            name: 'Admin User',
            role: 'ADMIN',
        },
    });

    const interviewer1 = await prisma.user.create({
        data: {
            email: 'sarah.tech@company.com',
            name: 'Sarah Smith',
            role: 'INTERVIEWER',
        },
    });

    const interviewer2 = await prisma.user.create({
        data: {
            email: 'john.dev@company.com',
            name: 'John Davis',
            role: 'INTERVIEWER',
        },
    });

    // Create Technical Interview Test
    const technicalTest = await prisma.test.create({
        data: {
            title: 'Software Engineer Technical Interview',
            description: 'Technical assessment for senior software engineer position',
            accessCode: 'TECH2024',
            status: 'ACTIVE',
            createdById: interviewer1.id,
        },
    });

    // Create questions for technical test
    const technicalQuestions = await Promise.all([
        prisma.question.create({
            data: {
                orderIndex: 1,
                content: 'Explain the concept of dependency injection and when you would use it in your projects.',
                timeLimit: 120,
                testId: technicalTest.id,
            },
        }),
        prisma.question.create({
            data: {
                orderIndex: 2,
                content: 'Describe a challenging technical problem you solved recently and walk us through your problem-solving approach.',
                timeLimit: 180,
                testId: technicalTest.id,
            },
        }),
        prisma.question.create({
            data: {
                orderIndex: 3,
                content: 'How would you design a scalable microservices architecture for an e-commerce platform?',
                timeLimit: 240,
                testId: technicalTest.id,
            },
        }),
    ]);

    // Create Behavioral Interview Test
    const behavioralTest = await prisma.test.create({
        data: {
            title: 'Leadership Behavioral Interview',
            description: 'Behavioral assessment for engineering manager position',
            accessCode: 'LEAD2024',
            status: 'ACTIVE',
            createdById: interviewer2.id,
        },
    });

    // Create questions for behavioral test
    const behavioralQuestions = await Promise.all([
        prisma.question.create({
            data: {
                orderIndex: 1,
                content: 'Tell me about a time when you had to lead a team through a difficult project. What was your approach?',
                timeLimit: 180,
                testId: behavioralTest.id,
            },
        }),
        prisma.question.create({
            data: {
                orderIndex: 2,
                content: 'Describe a situation where you had to give constructive feedback to a team member. How did you handle it?',
                timeLimit: 150,
                testId: behavioralTest.id,
            },
        }),
        prisma.question.create({
            data: {
                orderIndex: 3,
                content: 'Share an example of how you ve handled conflicting priorities in your team.',
                timeLimit: 150,
                testId: behavioralTest.id,
            },
        }),
    ]);

    // Create Sample Interview
    const interview1 = await prisma.interview.create({
        data: {
            candidateName: 'Alex Johnson',
            testId: technicalTest.id,
            deviceId: 'PI_DEVICE_001',
            status: 'COMPLETED',
            startedAt: new Date('2024-02-01T10:00:00Z'),
            completedAt: new Date('2024-02-01T11:00:00Z'),
        },
    });

    // Create responses for technical interview
    await prisma.response.createMany({
        data: [
            {
                interviewId: interview1.id,
                questionId: technicalQuestions[0].id,
                audioUrl: 'https://storage.example.com/responses/response1.mp3',
                transcript: 'Dependency injection is a design pattern where objects receive their dependencies from external sources rather than creating them internally. This promotes loose coupling and makes testing easier...',
            },
            {
                interviewId: interview1.id,
                questionId: technicalQuestions[1].id,
                audioUrl: 'https://storage.example.com/responses/response2.mp3',
                transcript: 'Recently, I worked on optimizing a database query that was causing performance issues. I first profiled the query using explain analyze, then identified that we were missing proper indexes...',
            },
            {
                interviewId: interview1.id,
                questionId: technicalQuestions[2].id,
                audioUrl: 'https://storage.example.com/responses/response3.mp3',
                transcript: 'For an e-commerce platform, I would start by identifying core domains like product catalog, order management, and user authentication. Each would be its own microservice...',
            },
        ],
    });

    // Create report and scores
    await prisma.report.create({
        data: {
            interviewId: interview1.id,
            totalScore: 8.7,
            feedback: 'Strong technical knowledge and excellent problem-solving approach. Demonstrates good understanding of system design principles.',
            scores: {
                create: [
                    {
                        questionId: technicalQuestions[0].id,
                        score: 9.0,
                        feedback: 'Excellent understanding of dependency injection with practical examples.',
                    },
                    {
                        questionId: technicalQuestions[1].id,
                        score: 8.5,
                        feedback: 'Good problem-solving methodology with clear steps and results.',
                    },
                    {
                        questionId: technicalQuestions[2].id,
                        score: 8.6,
                        feedback: 'Strong grasp of microservices architecture and scalability considerations.',
                    },
                ],
            },
        },
    });

    // Create second interview for behavioral assessment
    const interview2 = await prisma.interview.create({
        data: {
            candidateName: 'Maria Garcia',
            testId: behavioralTest.id,
            deviceId: 'PI_DEVICE_002',
            status: 'COMPLETED',
            startedAt: new Date('2024-02-02T14:00:00Z'),
            completedAt: new Date('2024-02-02T15:00:00Z'),
        },
    });

    // Create responses for behavioral interview
    await prisma.response.createMany({
        data: behavioralQuestions.map((question, index) => ({
            interviewId: interview2.id,
            questionId: question.id,
            audioUrl: `https://storage.example.com/responses/behavioral${index + 1}.mp3`,
            transcript: [
                'In my last role, I led a team of 6 developers through a critical system migration...',
                'I had a situation with a team member who was consistently missing deadlines...',
                'When faced with conflicting priorities between a major feature release and technical debt...',
            ][index],
        })),
    });

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });