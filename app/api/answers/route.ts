import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const reportData = await prisma.candidate.findUnique({
      where: { id: "cm6zisdlh0007wewoqi4gwjeh" },
      include: {
        test: {
          include: {
            questions: true // Get all questions in the test
          }
        },
        answers: {
          include: {
            question: true // Get question details for each answer
          }
        }
      }
    });
    
    return NextResponse.json(reportData);
  } catch (error) {
    return NextResponse.json({ error:error }, { status: 500 });
  }
}