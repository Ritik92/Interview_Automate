// app/api/responses/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { interviewId, questionId, audioUrl, transcript, deviceId } = await request.json();

        // Validate required fields
        if (!interviewId || !questionId || !audioUrl || !transcript || !deviceId) {
            return NextResponse.json(
                { error: 'All fields are required: interviewId, questionId, audioUrl, transcript, deviceId' },
                { status: 400 }
            );
        }

        // Verify the interview exists and belongs to this device
        const interview = await prisma.interview.findFirst({
            where: {
                id: interviewId,
                deviceId,
                status: 'IN_PROGRESS'
            }
        });

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview not found or not in progress' },
                { status: 404 }
            );
        }

        // Check if this question belongs to the test
        const question = await prisma.question.findFirst({
            where: {
                id: questionId,
                test: {
                    interviews: {
                        some: {
                            id: interviewId
                        }
                    }
                }
            }
        });

        if (!question) {
            return NextResponse.json(
                { error: 'Question not found or does not belong to this test' },
                { status: 404 }
            );
        }

        // Check if response already exists
        const existingResponse = await prisma.response.findFirst({
            where: {
                interviewId,
                questionId
            }
        });

        if (existingResponse) {
            return NextResponse.json(
                { error: 'Response already exists for this question' },
                { status: 409 }
            );
        }

        // Create the response
        const response = await prisma.response.create({
            data: {
                audioUrl,
                transcript,
                interview: {
                    connect: { id: interviewId }
                },
                question: {
                    connect: { id: questionId }
                }
            }
        });

        return NextResponse.json({
            message: 'Response recorded successfully',
            responseId: response.id
        });

    } catch (error) {
        console.error('Error handling response submission:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}