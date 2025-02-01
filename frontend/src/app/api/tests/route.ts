import { getXataClient } from "@/lib/utils";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * @swagger
 * /api/fetch-test:
 *   get:
 *     summary: Fetch all tests with user progress
 *     description: |
 *       Retrieves all available tests along with:
 *       - Test details (name, description)
 *       - Total number of questions per test
 *       - User's progress (answered questions)
 *       - Progress percentage
 *       - Test status
 *       - Achievements (if any)
 *       
 *     tags:
 *       - Tests
 *     security:
 *       - ClerkAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved tests with progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required:
 *                       - testId
 *                       - testName
 *                       - description
 *                       - totalQuestions
 *                       - answeredQuestions
 *                       - progressPercentage
 *                       - status
 *                     properties:
 *                       testId:
 *                         type: integer
 *                         description: Unique identifier for the test
 *                         example: 1
 *                       testName:
 *                         type: string
 *                         description: Name of the test
 *                         example: "Personality Assessment"
 *                       description:
 *                         type: string
 *                         description: Detailed description of the test
 *                         example: "Comprehensive personality assessment test"
 *                       totalQuestions:
 *                         type: integer
 *                         description: Total number of questions in the test
 *                         example: 20
 *                       answeredQuestions:
 *                         type: integer
 *                         description: Number of questions answered by the user
 *                         example: 8
 *                       progressPercentage:
 *                         type: integer
 *                         description: Percentage of test completion
 *                         example: 40
 *                       status:
 *                         type: string
 *                         description: Current status of the test for the user
 *                         enum: [not_started, in_progress, completed]
 *                         example: "in_progress"
 *                       achievements:
 *                         type: array
 *                         description: List of achievements earned for this test
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               description: Unique identifier for the achievement
 *                               example: "ach_123"
 *                             title:
 *                               type: string
 *                               description: Title of the achievement
 *                               example: "Quick Thinker"
 *                             description:
 *                               type: string
 *                               description: Description of the achievement
 *                               example: "Completed test in under 10 minutes"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch tests"
 */

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');

}
const secret = new TextEncoder().encode(JWT_SECRET);

export async function GET() {
  try {
    const xata = getXataClient();
    let user;

    // Get token from cookies
    const token = cookies().get('session')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.address) {
        user = await xata.db.Users.filter({ 
          wallet_address: payload.address 
        }).getFirst();
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Fetch all tests with total_questions
    const tests = await xata.db.Tests.getAll({
      columns: ["test_id", "test_name", "test_description", "total_questions"],
      sort: { "test_id": "asc" }
    });

    // Fetch user progress for all tests
    const allProgress = await xata.db.UserTestProgress.filter({
      "test.test_id": { $any: tests.map(t => t.test_id) },
      "user.xata_id": user.xata_id
    }).getMany();

    type ProgressRecord = typeof allProgress[0];
    
    // Create a map of test progress
    const progressByTest = allProgress.reduce<Record<string, ProgressRecord>>((acc, p) => {
      const testId = p.test?.xata_id
      if (testId) {
        acc[testId] = p
      }
      return acc
    }, {});

    const testsWithProgress = tests.map(test => {
      // Get user's progress for this test
      const userProgress = progressByTest[test.xata_id];

      // Count answered questions from the progress.answers JSON
      const answeredQuestions = userProgress?.answers 
        ? Object.keys(userProgress.answers as object).length 
        : 0;

      return {
        testId: test.test_id,
        testName: test.test_name,
        description: test.test_description,
        totalQuestions: test.total_questions,
        answeredQuestions,
        progressPercentage: Math.round((answeredQuestions / test.total_questions) * 100),
        status: userProgress?.status || "not_started",
        // TODO: Add achievements when implemented
        achievements: [] 
      };
    });

    return NextResponse.json(
      { tests: testsWithProgress },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}
