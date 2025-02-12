// app/api/tests/[testId]/reports/route.ts
import { authOptions } from '@/auth.config';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: any}
) {
  try {
    const session = await getServerSession(authOptions); // Replace with your auth logic

    // First verify the test belongs to the user
    const test = await prisma.test.findFirst({
      where: {
        id: params.testId,
        //@ts-ignore
        createdById: session.user.id,
      },
      include: {
        questions: {
          select: {
            id: true,
            content: true,
            timeLimit: true,
            orderIndex: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Fetch all completed interviews and their reports
    const reports = await prisma.report.findMany({
      where: {
        interview: {
          testId: test.id,
          status: 'COMPLETED',
        },
      },
      include: {
        scores: {
          select: {
            id: true,
            questionId: true,
            score: true,
            feedback: true,
          },
          orderBy: {
            id: 'asc',
          },
        },
        interview: {
          select: {
            id: true,
            candidateName: true,
            startedAt: true,
            completedAt: true,
            status: true,
            responses: {
              select: {
                id: true,
                questionId: true,
                transcript: true,
                audioUrl: true,
              },
              orderBy: {
                id: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        interview: {
          completedAt: 'desc',
        },
      },
    });

    return NextResponse.json({
      questions: test.questions,
      reports,
    });

  } catch (error) {
    console.error('Error fetching test reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test reports' },
      { status: 500 }
    );
  }
}