import { getXataClient } from '@/lib';
import { Language } from '@/i18n';

interface Question {
  id: number;
  question: string;
  effect: unknown;
}

interface QuestionResponse {
  questions?: Question[];
  error?: string;
}

/**
 * Fetches questions based on the provided language
 * @param language The language code ('en', 'es', etc.)
 * @param testId Optional test ID to filter questions
 * @returns QuestionResponse object with questions array or error
 */
export async function fetchQuestions(language: Language, testId?: number): Promise<QuestionResponse> {
  try {
    const xata = getXataClient();
    
    // Validate the test ID if provided
    if (testId !== undefined && (Number.isNaN(testId) || testId <= 0)) {
      return { error: "Invalid test ID" };
    }
    
    // If language is English, fetch directly from Questions table
    if (language === 'en') {
      const questions = await xata.db.Questions
        .filter(testId ? { "test.test_id": testId } : {})
        .select(["question_id", "question", "effect", "sort_order"])
        .sort("sort_order", "asc")
        .getAll();
      
      // Check if questions were found
      if (!questions || questions.length === 0) {
        return { error: "No questions found for this test" };
      }
      
      // Transform the questions to match the expected format
      const formattedQuestions = questions.map((q) => ({
        id: q.question_id as number,
        question: q.question as string,
        effect: q.effect, // Use the effect values from the database
      }));
      
      return { questions: formattedQuestions };
    }
    
    // For other languages, join with QuestionsTranslate
    const questionsWithTranslations = await xata.db.QuestionsTranslate
      .filter({
        "language.short": language
      })
      .select([
        "translated_text",
        "question.question_id",
        "question.effect",
        "question.sort_order",
        "question.test.test_id"
      ])
      .getAll();
    
    // If test ID is provided, filter by test
    let filteredQuestions = testId 
      ? questionsWithTranslations.filter(q => q.question?.test?.test_id === testId)
      : questionsWithTranslations;
    
    // Sort by sort_order
    filteredQuestions.sort((a, b) => {
      const orderA = a.question?.sort_order || 0;
      const orderB = b.question?.sort_order || 0;
      return orderA - orderB;
    });
    
    // Check if questions were found
    if (!filteredQuestions || filteredQuestions.length === 0) {
      return { error: "No questions found for this test" };
    }
    
    // Map to match the expected format
    const formattedQuestions = filteredQuestions.map(qt => ({
      id: qt.question?.question_id as number,
      question: qt.translated_text || '',
      effect: qt.question?.effect,
    }));
    
    return { questions: formattedQuestions };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { error: "Failed to fetch questions" };
  }
}