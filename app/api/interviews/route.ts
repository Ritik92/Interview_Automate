import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const interviewSchema = z.object({
  title: z.string().min(3),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questions: z.array(z.object({
    text: z.string().min(10),
    difficulty: z.enum(['easy', 'medium', 'hard'])
  }))
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = interviewSchema.parse(body)
    
    const interview = await prisma.interview.create({
      data: {
        title: validated.title,
        difficulty: validated.difficulty,
        questions: {
          create: validated.questions
        }
      },
      include: { questions: true }
    })
    
    return NextResponse.json(interview)
  } catch (error) {
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 400 }
    )
  }
}