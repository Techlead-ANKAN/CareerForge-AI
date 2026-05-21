import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Application from "@/lib/db/models/Application";
// User import registers the model so populate('candidateId') can resolve it.
import "@/lib/db/models/User";
import { getSessionFromRequest } from "@/lib/auth/session";

// GET /api/jobs/[id]/applications — employer views applications sorted by score
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "employer") {
      return NextResponse.json({ error: "Only employers can view applications." }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }
    if (String(job.employerId) !== session.userId) {
      return NextResponse.json(
        { error: "You do not have permission to view applications for this job." },
        { status: 403 }
      );
    }

    const applications = await Application.find({ jobId: id })
      .populate("candidateId", "username email")
      .sort({ score: -1, createdAt: 1 })
      .lean();

    const result = applications.map((app, index) => ({
      rank: index + 1,
      applicationId: String(app._id),
      candidate: (app.candidateId as { username?: string; email?: string })?.username ?? "Unknown",
      email: (app.candidateId as { username?: string; email?: string })?.email ?? "",
      resumeFilename: app.resumeFilename,
      resumeText: app.resumeText,
      resumeFile: app.resumeFile ?? "",
      resumeMimeType: app.resumeMimeType ?? "",
      score: app.score ?? 0,
      appliedAt: app.createdAt,
    }));

    return NextResponse.json({ applications: result, total: result.length });
  } catch (err) {
    console.error("[/api/jobs/[id]/applications]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
