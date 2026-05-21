import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Application from "@/lib/db/models/Application";
import "@/lib/db/models/User"; // register User model for populate
import { getSessionFromRequest } from "@/lib/auth/session";

// GET /api/jobs — list all jobs (requires login)
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  await connectDB();

  const jobs = await Job.find()
    .populate("employerId", "username")
    .sort({ createdAt: -1 })
    .lean();

  // Attach application count to each job
  const jobIds = jobs.map((j) => j._id);
  const counts = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: "$jobId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const jobsWithCount = jobs.map((job) => {
    const empObj = job.employerId as { _id: unknown; username?: string } | null;
    return {
      _id: String(job._id),
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      employer: empObj?.username ?? "Unknown",
      // Use _id from the populated object, NOT the object itself
      employerId: String(empObj?._id ?? ""),
      applicationCount: countMap.get(String(job._id)) ?? 0,
      createdAt: job.createdAt,
    };
  });

  return NextResponse.json({ jobs: jobsWithCount });
}

// POST /api/jobs — create a job (employer only)
export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (session.role !== "employer") {
    return NextResponse.json({ error: "Only employers can post jobs." }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, requirements } = body as {
    title: string;
    description: string;
    requirements: string;
  };

  if (!title || !description || !requirements) {
    return NextResponse.json({ error: "Title, description, and requirements are required." }, { status: 400 });
  }

  await connectDB();

  const job = await Job.create({
    title,
    description,
    requirements,
    employerId: session.userId,
  });

  return NextResponse.json(
    { job: { _id: String(job._id), title: job.title, createdAt: job.createdAt } },
    { status: 201 }
  );
}
