import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getXataClient } from "@/lib/utils";

/**
 * @swagger
 * /api/tests/{testId}/finish-test:
 *   put:
 *     summary: Mark a test as completed
 *     parameters:
 *       - name: testId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test marked as completed successfully
 *       400:
 *         description: Invalid test ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test or user not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  request: Request,
  { params }: { params: { testId: string } }
) {
  try {
    // TODO: remove this once we have a proper auth method
    // Get user session
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const xata = getXataClient();
    
    // Validate test ID
    const testId = parseInt(params.testId);
    if (Number.isNaN(testId) || testId <= 0) {
      return NextResponse.json(
        { error: "Invalid test ID" },
        { status: 400 }
      );
    }

    // Get user
    const user = await xata.db.Users.filter({ email: userEmail }).getFirst();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get test
    const test = await xata.db.Tests.filter({ test_id: testId }).getFirst();
    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    // Get user test progress
    const progress = await xata.db.UserTestProgress.filter({
      "user.xata_id": user.xata_id,
      "test.test_id": testId
    }).getFirst();

    if (!progress) {
      return NextResponse.json(
        { error: "No test progress found" },
        { status: 404 }
      );
    }

    // Update progress to completed
    await progress.update({
      status: "completed",
      completed_at: new Date()
    });

    return NextResponse.json({
      message: "Test marked as completed successfully"
    });

  } catch (error) {
    console.error("Error completing test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
