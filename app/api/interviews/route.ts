import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateInterviewSchema = z.object({
  interviewId: z.string(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']),
  deviceId: z.string(),
  candidateName: z.string().optional()
})

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { interviewId, status, deviceId, candidateName } = updateInterviewSchema.parse(body)

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId }
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

    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status,
        candidateName: candidateName || interview.candidateName,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    })

    return NextResponse.json(updatedInterview)
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}