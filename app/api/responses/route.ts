import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const responseSchema = z.object({
  interviewId: z.string(),
  questionId: z.string(),
  audioUrl: z.string(),
  transcript: z.string(),
  deviceId: z.string()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { interviewId, questionId, audioUrl, transcript, deviceId } = responseSchema.parse(body)

    // Verify the interview exists and belongs to this device
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        test: {
          include: {
            questions: true
          }
        }
      }
    })

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    if (interview.deviceId !== deviceId) {
      return NextResponse.json(
        { error: 'Unauthorized device' },
        { status: 403 }
      )
    }

    // Verify the question belongs to the test
    const questionBelongsToTest = interview.test.questions.some(q => q.id === questionId)
    if (!questionBelongsToTest) {
      return NextResponse.json(
        { error: 'Question does not belong to this test' },
        { status: 400 }
      )
    }

    // Create the response
    const response = await prisma.response.create({
      data: {
        interviewId,
        questionId,
        audioUrl,
        transcript
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
