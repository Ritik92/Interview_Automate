import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI('AIzaSyB0E5S67zjEjtgYFbmun0qU_pWusSbYli8')
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

const reportRequestSchema = z.object({
  interviewId: z.string(),
  deviceId: z.string()
})

// Schema for Gemini's structured response
const analysisResponseSchema = z.object({
  scores: z.array(z.object({
    questionId: z.string(),
    score: z.number().min(0).max(10),
    feedback: z.string()
  })),
  totalScore: z.number().min(0).max(10),
  overallFeedback: z.string()
})

// Function to clean Gemini's response and extract JSON
function extractJsonFromResponse(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\n?|\n?```/g, '')
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim()
  
  // If response starts with a newline, remove it
  cleaned = cleaned.replace(/^\n+/, '')
  
  return cleaned
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { interviewId, deviceId } = reportRequestSchema.parse(body)

    // Verify the interview exists and belongs to this device
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        test: {
          include: {
            questions: true
          }
        },
        responses: {
          include: {
            question: true
          },
          orderBy: {
            question: {
              orderIndex: 'asc'
            }
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

    // Check if report already exists
    const existingReport = await prisma.report.findUnique({
      where: { interviewId }
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'Report already exists for this interview' },
        { status: 400 }
      )
    }

    // Format interview data for Gemini
    const interviewData = interview.responses.map(response => ({
      questionId: response.questionId,
      question: response.question.content,
      transcript: response.transcript
    }))

    // Generate report using Gemini with structured output requirement
    const prompt = `You are an expert AI interviewer tasked with evaluating candidate responses. Analyze the following interview and provide a structured evaluation.

Candidate: ${interview.candidateName}

Interview Responses:
${interviewData.map((data, index) => `
Question ${index + 1}: ${data.question}
Candidate's Answer: ${data.transcript}
`).join('\n')}

Respond with ONLY a JSON object in the following format (no markdown, no code blocks, no additional text):
{
  "scores": [
    {
      "questionId": "${interviewData[0].questionId}",
      "score": 8.5,
      "feedback": "Detailed constructive feedback here"
    }
  ],
  "totalScore": 8.5,
  "overallFeedback": "Comprehensive evaluation here"
}

Evaluation Guidelines:
- Score each answer from 0-10 based on relevance, clarity, depth, examples, and communication
- Provide specific, constructive feedback for each answer
- Include strengths, improvements, and recommendations in overall feedback
- Ensure JSON is valid and matches the exact format above
- Do not include any text outside the JSON object

Remember: Return ONLY the JSON object, no markdown formatting or additional text.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = extractJsonFromResponse(response.text())
    
    try {
      // Parse and validate the JSON response
      const analysis = analysisResponseSchema.parse(JSON.parse(analysisText))

      // Create report in database
      const report = await prisma.report.create({
        data: {
          interviewId,
          totalScore: analysis.totalScore,
          feedback: analysis.overallFeedback,
          scores: {
            create: analysis.scores.map(score => ({
              questionId: score.questionId,
              score: score.score,
              feedback: score.feedback
            }))
          }
        },
        include: {
          scores: true
        }
      })

      return NextResponse.json(report)
    } catch (parseError) {
      console.error('Response parsing error:', parseError)
      console.error('Raw response:', analysisText)
      return NextResponse.json(
        { 
          error: 'Invalid AI response format',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          rawResponse: analysisText
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error generating report:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid response format from AI', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}