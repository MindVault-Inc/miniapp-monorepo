import { getXataClient } from "@/lib/utils";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

type Answer = {
  question: string;
  answer: string;
};

type UserAnswers = {
  [key: string]: Answer;
};

/**
 * @swagger
 * /api/tests/{testId}/questions/{questionId}:
 *   get:
 *     summary: Get a specific question from a test
 *     description: Retrieves a specific question and its options from a test
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the test
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question_text:
 *                   type: string
 *                   example: "How do you feel about the intervention of the government in the economy?"
 *                 options:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]
 *       400:
 *         description: Invalid test or question ID
 *       404:
 *         description: Question not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Submit an answer for a question
 *     description: Records the user's answer for a specific question in a test
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the test
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *                 example: "Strongly Agree"
 *     responses:
 *       200:
 *         description: Answer recorded successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: Request,
  { params }: { params: { testId: string; questionId: string } }
) {
  try {
    const xata = getXataClient();
    
    // Validate IDs
    const testId = parseInt(params.testId);
    const questionId = parseInt(params.questionId);
    
    if (Number.isNaN(testId) || testId <= 0 || Number.isNaN(questionId) || questionId <= 0) {
      return NextResponse.json(
        { error: "Invalid test or question ID" },
        { status: 400 }
      );
    }

    // Get question details
    const question = await xata.db.Questions.filter({
      "test.test_id": testId,
      question_id: questionId
    }).getFirst();

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const mapAnswers = (options: any[]) => options.map((option) => option.answer);
    
    if (question.std_answer) {
        const options = await xata.db.StandardAnswers.getMany();
        // Make options an array of strings which are the answers
        const answers = mapAnswers(options);

        return NextResponse.json({
            question_text: question.question,
            answers: answers
        });
    } else {

        // Get personalized answers if the question is not standard
        const options = await xata.db.PersonalizedAnswers.filter({
            "question.question_id": questionId
        }).getMany();
        // Make options an array of strings which are the answers
        const answers = mapAnswers(options);
        return NextResponse.json({
            question_text: question.question,
            answers: answers
        });
    }

  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { testId: string; questionId: string } }
) {
  try {
    // TODO: remove this once we have a proper auth system
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const xata = getXataClient();
    
    // Validate IDs
    const testId = parseInt(params.testId);
    const questionId = parseInt(params.questionId);
    
    if (Number.isNaN(testId) || testId <= 0 || Number.isNaN(questionId) || questionId <= 0) {
      return NextResponse.json(
        { error: "Invalid test or question ID" },
        { status: 400 }
      );
    }

    // Get user
    const userRecord = await xata.db.Users.filter({ email: userEmail }).getFirst();
    if (!userRecord) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get question
    const question = await xata.db.Questions.filter({
      "test.test_id": testId,
      question_id: questionId
    }).getFirst();

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const answer = body.answer;

    if (!answer || typeof answer !== "string") {
      return NextResponse.json(
        { error: "Invalid answer format" },
        { status: 400 }
      );
    }

    // Fetch valid answers for the question
    let validAnswers;
    if (question.std_answer) {
        const options = await xata.db.StandardAnswers.getMany();
        validAnswers = options.map((option) => option.answer);
    } else {
        const options = await xata.db.PersonalizedAnswers.filter({
            "question.question_id": questionId
        }).getMany();
        validAnswers = options.map((option) => option.answer);
    }

    // Check if the answer is valid
    if (!validAnswers.includes(answer)) {
        return NextResponse.json(
            { error: "Invalid answer" },
            { status: 400 }
        );
    }

    // Get test record
    const test = await xata.db.Tests.filter({ test_id: testId }).getFirst();
    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    // Get or create user test progress
    let progress = await xata.db.UserTestProgress.filter({
      "user": userRecord.xata_id,
      "test.test_id": testId
    }).getFirst();


    // Get the latest user_progress_id
    const latestProgress = await xata.db.UserTestProgress.sort('user_progress_id', 'desc').getFirst();
    const nextProgressId = (latestProgress?.user_progress_id || 0) + 1;


    if (!progress) {
      // Create new progress record
      progress = await xata.db.UserTestProgress.create({
        user: userRecord,
        test: test,
        question: question,
        answers: {
          [questionId]: {
            question: question.question,
            answer: answer
          }
        },
        started_at: new Date(),
        status: "in_progress",
        user_progress_id: nextProgressId
      });
    } else {
      // Update existing progress
      const currentAnswers = progress.answers as UserAnswers || {};
      await progress.update({
        answers: {
          ...currentAnswers,
          [questionId]: {
            question: question.question,
            answer: answer
          }
        },
        question: question
      });
    }

    return NextResponse.json({
      message: "Answer recorded successfully"
    });

  } catch (error) {
    console.error("Error recording answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 