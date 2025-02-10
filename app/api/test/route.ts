import prisma from '@/lib/prisma';
import { TestStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    let session = { user: { id: 'cm6zg577r0000wewo6h93i82x' } };

    if (!data.title || !data.questions?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate consistent access code for testing
    const accessCode = process.env.NODE_ENV === 'test' 
      ? 'TEST123' 
      : Math.random().toString(36).substring(2, 8).toUpperCase();

    const test = await prisma.$transaction(async (tx) => {
      const testData: any = {
        title: data.title,
        status: data.status,
        accessCode,
        userId: session.user.id,
        questions: {
          create: data.questions.map((q: any) => ({
            content: q.content,
            timeLimit: q.timeLimit
          }))
        }
      };

      // For testing, use fixed ID if needed
      if (process.env.NODE_ENV === 'test') {
        testData.id = 'fixed-test-id';
      }

      const newTest = await tx.test.create({
        data: testData,
        include: { questions: true }
      });

      return newTest;
    });

    return NextResponse.json(test);
  } catch (error) {
    console.error('Test creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
}

