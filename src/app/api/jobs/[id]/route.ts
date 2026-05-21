import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Application from "@/lib/db/models/Application";
import "@/lib/db/models/User"; // register User model for populate
import { getSessionFromRequest } from "@/lib/auth/session";

// GET /api/jobs/[id] — single job details (requires login)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const job = await Job.findById(id).populate("employerId", "username").lean();
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  const applicationCount = await Application.countDocuments({ jobId: id });

  // Check if current candidate has already applied
  let hasApplied = false;
  if (session.role === "candidate") {
    const existing = await Application.findOne({
      jobId: id,
      candidateId: session.userId,
    });
    hasApplied = !!existing;
  }

  const empObj = job.employerId as { _id: unknown; username?: string } | null;

  return NextResponse.json({
    job: {
      _id: String(job._id),
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      employer: empObj?.username ?? "Unknown",
      employerId: String(empObj?._id ?? ""),
      applicationCount,
      hasApplied,
      createdAt: job.createdAt,
    },
  });
}
