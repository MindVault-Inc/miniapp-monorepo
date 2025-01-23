import { getXataClient } from "@/lib/utils";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Fetch a specific question by ID
 *     description: |
 *       Retrieves a specific question and its details.
 *       If the question requires standard answers, those are included in the response.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The question ID
 *     security:
 *       - ClerkAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question:
 *                   type: object
 *                   properties:
 *                     question_id:
 *                       type: integer
 *                     question:
 *                       type: string
 *                     std_answer:
 *                       type: boolean
 *                     sort_order:
 *                       type: integer
 *                     area:
 *                       type: object
 *                       properties:
 *                         area_id:
 *                           type: integer
 *                         area_name:
 *                           type: string
 *                 standardAnswers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       std_answer_id:
 *                         type: integer
 *                       answer:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // const { userId } = auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    const xata = getXataClient();
    const questionId = parseInt(params.id)
    if (Number.isNaN(questionId) || questionId <= 0) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      )
    }
    
    // Fetch the question with its area relationship
    const question = await xata.db.Questions
      .filter({ question_id: questionId })
      .select([
        "question_id",
        "question",
        "std_answer",
        "sort_order",
        "area.area_id",
        "area.area_name"
      ])
      .getFirst();

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // If it's a standard answer question, fetch the standard answers
    let standardAnswers = null;
    if (question.std_answer) {
      standardAnswers = await xata.db.StandardAnswers
        .select(["std_answer_id", "answer"])
        .sort("std_answer_id", "asc")
        .getAll();
    }

    return NextResponse.json({
      question,
      standardAnswers
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
} 