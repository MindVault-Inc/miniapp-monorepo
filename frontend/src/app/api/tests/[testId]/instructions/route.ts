import { getXataClient } from "@/lib/utils";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/tests/{testId}/instructions:
 *   get:
 *     summary: Get test instructions
 *     description: Retrieves the description and total number of questions for a specific test
 *     tags:
 *       - Tests
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the test
 *     responses:
 *       200:
 *         description: Test instructions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   example: "This test will evaluate your personality traits..."
 *                 total_questions:
 *                   type: number
 *                   example: 20
 *       404:
 *         description: Test not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: Request,
  { params }: { params: { testId: string } }
) {
  try {
    const xata = getXataClient();
    
    // Get test details and total questions count
    const test = await xata.db.Tests.filter({
      test_id: parseInt(params.testId)
    }).getFirst();

    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      description: test.test_description,
      total_questions: test.total_questions
    });

  } catch (error) {
    console.error("Error fetching test instructions:", error);
    return NextResponse.json(
      { error: "Failed to fetch test instructions" },
      { status: 500 }
    );
  }
} 