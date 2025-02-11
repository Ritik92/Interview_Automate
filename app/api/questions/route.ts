import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// /app/api/questions/route.ts
export async function POST(request: Request) {
    try {
        const { accessCode, deviceId } = await request.json();

        // Validate required fields
        if (!accessCode || !deviceId) {
            return NextResponse.json(
                { 
                    error: 'Access code and device ID are required' 
                },
                { status: 400 }
            );
        }
        
        // Find test and check if it's active
        const test = await prisma.test.findUnique({
            where: { 
                accessCode,
                status: 'ACTIVE'  // Only allow access to active tests
            },
            include: {
                questions: {
                    orderBy: {
                        orderIndex: 'asc'  // Get questions in correct order
                    },
                    select: {
                        id: true,
                        content: true,
                        timeLimit: true,
                        orderIndex: true,
                    },
                },
            },
        });

        if (!test) {
            return NextResponse.json(
                { error: 'Test not found or not active' },
                { status: 404 }
            );
        }

        // Check if there's an ongoing interview for this device
        const existingInterview = await prisma.interview.findFirst({
            where: {
                testId: test.id,
                deviceId,
                status: 'IN_PROGRESS'
            }
        });

        if (existingInterview) {
            return NextResponse.json(
                { error: 'An interview is already in progress on this device' },
                { status: 409 }
            );
        }

        // Create a new interview session
        const interview = await prisma.interview.create({
            data: {
                testId: test.id,
                deviceId,
                status: 'IN_PROGRESS',
                candidateName: '',  // Will be updated later when candidate starts
            }
        });

        return NextResponse.json({ 
            interviewId: interview.id,
            questions: test.questions,
            testTitle: test.title,
            totalQuestions: test.questions.length
        });

    } catch (error) {
        console.error('Error handling question request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}