import { getXataClient } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { testId: string } }
) {
  try {
    const testId = parseInt(params.testId);

    // Validate the test ID
    if (isNaN(testId) || testId <= 0) {
      return NextResponse.json(
        { error: "Invalid test ID" },
        { status: 400 }
      );
    }

    const xata = getXataClient();

    // Fetch all questions for the specified test
    const questions = await xata.db.Questions
      .filter({ "test.test_id": testId }) // Filter by the test ID
      .select(["question_id", "question", "effect", "sort_order"]) // Select necessary fields
      .sort("sort_order", "asc") // Sort by sort_order
      .getAll();

    // Check if questions were found
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for this test" },
        { status: 404 }
      );
    }

    // Transform the questions to match the expected format
    const formattedQuestions = questions.map((q) => ({
      id: q.question_id,
      question: q.question,
      effect: q.effect, // Use the effect values from the database
    }));

    // Return the formatted questions
    return NextResponse.json(
      { questions: formattedQuestions },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}