import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const answerSchema = z.array(
  z.object({
    questionId: z.number(),
    content: z.string().min(1)
  })
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = answerSchema.parse(body.answers)
    
    const createdAnswers = await prisma.$transaction(
      validated.map(answer => 
        prisma.answer.create({
          data: {
            content: answer.content,
            questionId: answer.questionId
          }
        })
      )
    )
    
    return NextResponse.json(createdAnswers)
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid answer format" },
      { status: 400 }
    )
  }
}