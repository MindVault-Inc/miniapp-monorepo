import { Language } from "@/i18n";
import { fetchQuestions } from "@/services/api/db-translate";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Question {
  id: number;
  question: string;
  effect: unknown;
}

interface QuestionResponse {
  questions?: Question[];
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { testId: string } },
) {
  try {
    const testId = Number.parseInt(params.testId, 10);

    // Validate the test ID
    if (Number.isNaN(testId) || testId <= 0) {
      const response: QuestionResponse = { error: "Invalid test ID" };
      return NextResponse.json(response, { status: 400 });
    }

    // Get the language from the request headers or query parameters
    const language = request.nextUrl.searchParams.get('lang') || 'en';
    
    // Call the fetchQuestions function from db-translate.ts
    const result = await fetchQuestions(language as Language, testId);

    // If there's an error, return the appropriate response
    if (result.error) {
      const status = result.error.includes("Invalid") ? 400 : 
                    result.error.includes("No questions found") ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    // Return the successful response
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching questions:", error);
    const response: QuestionResponse = { error: "Failed to fetch questions" };
    return NextResponse.json(response, { status: 500 });
  }
}
