import { authOptions } from '@/auth.config';
import prisma from '@/lib/prisma';
import { TestStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

type QuestionInput = {
  content: string;
  timeLimit: number;
  orderIndex?: number;
};

type CreateTestInput = {
  title: string;
  description?: string;
  status?: TestStatus;
  questions: QuestionInput[];
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as CreateTestInput;
    const session = await getServerSession(authOptions); //@ts-ignore
    if (!session?.user?.id) {
      return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
      );
    }

    // Validate required fields
    if (!data.title?.trim()) {
      return NextResponse.json(
        { error: 'Test title is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      return NextResponse.json(
        { error: 'At least one question is required' },
        { status: 400 }
      );
    }

    // Validate questions
    const invalidQuestions = data.questions.filter(
      q => !q.content?.trim() || typeof q.timeLimit !== 'number' || q.timeLimit <= 0
    );

    if (invalidQuestions.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid questions found',
          details: 'Each question must have content and a positive time limit'
        },
        { status: 400 }
      );
    }

    // Generate access code
    const accessCode = generateAccessCode();

    const test = await prisma.$transaction(async (tx) => {
      // Check if access code is unique
      const existingTest = await tx.test.findUnique({
        where: { accessCode }
      });

      if (existingTest) {
        throw new Error('Access code collision, please try again');
      }

      const testData = {
        title: data.title.trim(),
        description: data.description?.trim(),
        status: data.status || 'DRAFT',
        accessCode,  //@ts-ignore
        createdById: session.user.id,
        questions: {
          create: data.questions.map((q: QuestionInput, index: number) => ({
            content: q.content.trim(),
            timeLimit: q.timeLimit,
            orderIndex: q.orderIndex ?? index + 1 // Use provided orderIndex or generate sequential
          }))
        }
      };

      // For testing purposes
      if (process.env.NODE_ENV === 'test') {
        (testData as any).id = 'fixed-test-id';
      }

      const newTest = await tx.test.create({
        data: testData,
        include: {
          questions: {
            orderBy: {
              orderIndex: 'asc'
            }
          }
        }
      });

      return newTest;
    });

    return NextResponse.json({
      message: 'Test created successfully',
      test
    });

  } catch (error) {
    console.error('Test creation error:', error);

    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
}

// Helper function to generate access code
function generateAccessCode(length: number = 6): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking characters
  let code = '';
  
  do {
    code = Array.from(
      { length }, 
      () => characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  } while (code.length !== length);

  return code;
}
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);  //@ts-ignore
    if (!session?.user?.id) {
      return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
      );
    } // Replace with your auth logic
    
    const tests = await prisma.test.findMany({
      where: {  //@ts-ignore
        createdById: session?.user.id,
      },
      include: {
        questions: {
          select: {
            id: true,
            content: true,
            timeLimit: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            interviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      tests,
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}
