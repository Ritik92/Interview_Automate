// app/api/interviews/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params:any}
) {
    try {
        const { id } = params;
        const { status, deviceId, candidateName } = await request.json();

        // Validate required fields
        if (!status || !deviceId) {
            return NextResponse.json(
                { error: 'Status and deviceId are required' },
                { status: 400 }
            );
        }

        // Verify status is valid
        const validStatuses = ['IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Verify the interview exists and belongs to this device
        const existingInterview = await prisma.interview.findFirst({
            where: {
                id,
                deviceId
            }
        });

        if (!existingInterview) {
            return NextResponse.json(
                { error: 'Interview not found or unauthorized device' },
                { status: 404 }
            );
        }

        // Update the interview
        const updateData: any = {
            status: status as any  // Cast to satisfy TypeScript
        };

        // Add optional fields if provided
        if (candidateName) {
            updateData.candidateName = candidateName;
        }

        // Add completion timestamp if status is terminal
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
            updateData.completedAt = new Date();
        }

        const interview = await prisma.interview.update({
            where: { id },
            data: updateData
        });

        // If interview is completed, trigger report generation
        if (status === 'COMPLETED') {
            // Get all responses for this interview
            const responses = await prisma.response.findMany({
                where: { interviewId: id },
                include: { question: true }
            });

            // Calculate a simple score based on transcript length (you should replace this with your actual scoring logic)
            const scores = responses.map(response => ({
                questionId: response.questionId,
                score: Math.min(((response.transcript?.length || 0) / 100) * 10, 10), // Simple example scoring
                feedback: 'Auto-generated score based on response length' // Replace with actual feedback generation
            }));

            const totalScore = scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length;

            // Create the report
            await prisma.report.create({
                data: {
                    interviewId: id,
                    totalScore,
                    feedback: 'Auto-generated report', // Replace with actual feedback generation
                    scores: {
                        create: scores
                    }
                }
            });
        }

        return NextResponse.json({
            message: 'Interview updated successfully',
            interview
        });

    } catch (error) {
        console.error('Error updating interview:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const interview = await prisma.interview.findUnique({
            where: { id },
            include: {
                test: {
                    include: {
                        questions: true
                    }
                },
                responses: true,
                report: {
                    include: {
                        scores: true
                    }
                }
            }
        });

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(interview);

    } catch (error) {
        console.error('Error fetching interview:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}