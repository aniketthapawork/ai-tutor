import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AIFeedbackResult {
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  structureScore: number;
  strengths: string;
  improvements: string;
  suggestions: string;
}

export async function generateFeedback(
  testType: string,
  userResponse: string,
  prompt?: string
): Promise<AIFeedbackResult> {
  try {
    const systemPrompt = `You are an expert English tutor providing detailed feedback on student work. 
    Analyze the following ${testType} submission and provide constructive feedback.
    
    Please evaluate on these criteria:
    - Grammar (0-10): Sentence structure, verb tenses, punctuation
    - Vocabulary (0-10): Word choice, variety, appropriateness
    - Structure (0-10): Organization, flow, coherence
    
    Provide specific, actionable feedback that helps the student improve.
    
    Respond with JSON in this exact format:
    {
      "overallScore": number,
      "grammarScore": number,
      "vocabularyScore": number,
      "structureScore": number,
      "strengths": "specific positive observations",
      "improvements": "areas that need work",
      "suggestions": "specific next steps for improvement"
    }`;

    const userPrompt = prompt ? `${prompt}\n\nStudent Response:\n${userResponse}` : `Student Response:\n${userResponse}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure scores are within valid range
    return {
      overallScore: Math.max(0, Math.min(10, result.overallScore || 0)),
      grammarScore: Math.max(0, Math.min(10, result.grammarScore || 0)),
      vocabularyScore: Math.max(0, Math.min(10, result.vocabularyScore || 0)),
      structureScore: Math.max(0, Math.min(10, result.structureScore || 0)),
      strengths: result.strengths || "Good effort on this submission.",
      improvements: result.improvements || "Continue practicing to improve your skills.",
      suggestions: result.suggestions || "Keep up the good work and practice regularly.",
    };
  } catch (error) {
    console.error("AI feedback generation failed:", error);
    throw new Error("Failed to generate AI feedback: " + error.message);
  }
}

export async function generateTestQuestions(
  type: string,
  level: string,
  count: number = 10
): Promise<any> {
  try {
    const systemPrompt = `You are an expert English teacher creating ${type} questions for ${level} level students.
    
    Create ${count} questions appropriate for ${level} level English learners.
    
    For comprehension tests: Include a reading passage and multiple choice questions.
    For essay tests: Provide essay prompts with clear instructions.
    For letter tests: Provide letter writing scenarios (formal/informal).
    
    Respond with JSON in this format:
    {
      "type": "${type}",
      "level": "${level}",
      "content": {
        "passage": "text for comprehension (if applicable)",
        "questions": [
          {
            "id": 1,
            "question": "question text",
            "options": ["A", "B", "C", "D"] (for multiple choice),
            "correctAnswer": "A" (for multiple choice),
            "points": 1
          }
        ]
      }
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate ${count} ${type} questions for ${level} level.` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Test question generation failed:", error);
    throw new Error("Failed to generate test questions: " + error.message);
  }
}
