import { NextResponse } from 'next/server'
import prisma  from '@/lib/prisma'
import { z } from 'zod'

const questionRequestSchema = z.object({
  accessCode: z.string(),
  deviceId: z.string()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accessCode, deviceId } = questionRequestSchema.parse(body)

    // Find the test with the given access code
    const test = await prisma.test.findUnique({
      where: { accessCode },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 404 }
      )
    }

    // Create a new interview session
    const interview = await prisma.interview.create({
      data: {
        testId: test.id,
        deviceId,
        status: 'IN_PROGRESS',
        candidateName: '' // Will be updated later
      }
    })

    return NextResponse.json({
      interviewId: interview.id,
      testTitle: test.title,
      totalQuestions: test.questions.length,
      questions: test.questions.map(q => ({
        id: q.id,
        content: q.content,
        timeLimit: q.timeLimit,
        orderIndex: q.orderIndex
      }))
    })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}