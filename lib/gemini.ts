// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI('AIzaSyB0E5S67zjEjtgYFbmun0qU_pWusSbYli8');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface QuestionResponse {
  question: {
    id: string;
    content: string;
  };
  transcript: string;
}

export async function evaluateInterview(responses: QuestionResponse[]) {
  try {
    const prompt = `You are an expert technical interviewer tasked with evaluating candidate responses. 
    Analyze the following interview responses and generate a comprehensive evaluation report.
    
    For each response:
    1. Score it on a scale of 0-10 based on:
       - Technical accuracy
       - Clarity of explanation
       - Problem-solving approach
       - Communication skills
    2. Provide specific feedback highlighting strengths and areas for improvement
    
    Questions and Responses:
    ${responses.map((r, i) => `
    Question ${i + 1}: ${r.question.content}
    Candidate's Response: ${r.transcript}
    `).join('\n')}
    
    IMPORTANT: Return ONLY a raw JSON object with NO markdown formatting, code blocks, or additional text.
    The response must be a valid JSON object in this exact format:
    {
      "totalScore": number between 0-10,
      "feedback": "Overall evaluation summary",
      "scores": [
        {
          "questionId": "exact question ID string",
          "score": number between 0-10,
          "feedback": "Specific feedback for this question"
        }
      ]
    }

    Ensure scores array contains exactly one entry for each question ID in the original responses.
    The totalScore should be the mathematical average of all individual scores.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text
    const cleanedText = text
      .replace(/```json\s*/, '') // Remove opening ```json
      .replace(/```\s*$/, '')    // Remove closing ```
      .trim();                   // Remove any extra whitespace
    
    // Parse the JSON response
    try {
      const evaluation = JSON.parse(cleanedText);
      
      // Validate the response format and data
      if (typeof evaluation !== 'object' || evaluation === null) {
        throw new Error("Invalid evaluation object");
      }
      
      if (typeof evaluation.totalScore !== 'number' || 
          evaluation.totalScore < 0 || 
          evaluation.totalScore > 10) {
        throw new Error("Invalid total score");
      }
      
      if (typeof evaluation.feedback !== 'string' || evaluation.feedback.length === 0) {
        throw new Error("Invalid feedback");
      }
      
      if (!Array.isArray(evaluation.scores) || 
          evaluation.scores.length !== responses.length) {
        throw new Error("Invalid scores array");
      }
      
      // Validate each score object
      evaluation.scores.forEach((score: any, index: number) => {
        if (typeof score.score !== 'number' || 
            score.score < 0 || 
            score.score > 10 ||
            typeof score.feedback !== 'string' ||
            !responses.some(r => r.question.id === score.questionId)) {
          throw new Error(`Invalid score object at index ${index}`);
        }
      });
      console.log("This is my test result", evaluation);
      return evaluation;
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      console.error("Raw response:", text);
      console.error("Cleaned response:", cleanedText);
      throw new Error(`Failed to parse evaluation results: ${error.message}`);
    }
  } catch (error) {
    console.error("Gemini evaluation error:", error);
    throw error;
  }
}

// Helper function to validate score range
function isValidScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 10;
}

// Test the evaluation (can be used for debugging)
export async function testEvaluation() {
  const testResponses = [
    {
      question: {
        id: "q1",
        content: "What is dependency injection?"
      },
      transcript: "Dependency injection is a design pattern where dependencies are passed into an object rather than being created inside the object. This promotes loose coupling and makes testing easier."
    }
  ];

  try {
    const result = await evaluateInterview(testResponses);
    console.log("Test evaluation result:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Test evaluation failed:", error);
    throw error;
  }
}

