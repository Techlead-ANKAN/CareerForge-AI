import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Application from "@/lib/db/models/Application";
// These imports register the Job and User models in Mongoose's registry,
// which is required for .populate() to resolve the refs correctly.
import "@/lib/db/models/Job";
import "@/lib/db/models/User";
import { getSessionFromRequest } from "@/lib/auth/session";

// GET /api/jobs/applied — jobs the current candidate has applied to
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "candidate") {
      return NextResponse.json({ error: "Candidates only." }, { status: 403 });
    }

    await connectDB();

    const applications = await Application.find({ candidateId: session.userId })
      .populate({
        path: "jobId",
        populate: { path: "employerId", select: "username" },
      })
      .sort({ createdAt: -1 })
      .lean();

    const result = applications.map((app) => {
      const job = app.jobId as {
        _id: unknown;
        title?: string;
        description?: string;
        employerId?: { username?: string };
      } | null;
      return {
        applicationId: String(app._id),
        jobId: String(job?._id ?? ""),
        jobTitle: job?.title ?? "Unknown Job",
        jobDescription: job?.description ?? "",
        employer: job?.employerId?.username ?? "Unknown",
        resumeFilename: app.resumeFilename,
        appliedAt: app.createdAt,
      };
    });

    return NextResponse.json({ applications: result });
  } catch (err) {
    console.error("[/api/jobs/applied]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
