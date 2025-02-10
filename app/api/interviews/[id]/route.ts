import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const questions = await prisma.question.findMany({
    where: { interviewId: parseInt(params.id) },
    select: {
      id: true,
      text: true,
      difficulty: true
    }
  })
  
  return NextResponse.json(questions)
}