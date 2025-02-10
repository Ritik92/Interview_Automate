import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

// /app/api/questions/route.ts

export async function POST(request: Request) {
    try {
        const { accessCode } = await request.json();

        if (!accessCode) {
            return NextResponse.json(
                { error: 'Access code is required' },
                { status: 400 }
            );
        }

        const test = await prisma.test.findUnique({
            where: { accessCode },
            include: {
                questions: {
                    select: {
                        id: true,
                        content: true,
                        timeLimit: true,
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

        return NextResponse.json({ questions: test.questions });
        
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}