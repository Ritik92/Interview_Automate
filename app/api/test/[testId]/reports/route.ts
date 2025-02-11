// app/api/tests/[testId]/reports/route.ts
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: any}
) {
  try {
    let session = { user: { id: 'cm70xj8tz0001we40y8m2p2l3' } }; // Replace with your auth logic

    // First verify the test belongs to the user
    const test = await prisma.test.findFirst({
      where: {
        id:'cm70xj96h0004we40iwa7jy06',
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
          testId: 'cm70xj96h0004we40iwa7jy06',
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