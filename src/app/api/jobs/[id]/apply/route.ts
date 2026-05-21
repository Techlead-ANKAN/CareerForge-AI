import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Application from "@/lib/db/models/Application";
import { getSessionFromRequest } from "@/lib/auth/session";
import { calculateMatchScore } from "@/lib/ats/localScorer";

async function scoreResumeAgainstJob(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string
): Promise<number> {
  // Use local keyword matching scorer (no API dependency)
  const score = calculateMatchScore(resumeText, jobTitle, jobDescription, jobRequirements);
  return score;
}

// POST /api/jobs/[id]/apply — candidate applies with resume
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (session.role !== "candidate") {
    return NextResponse.json({ error: "Only candidates can apply to jobs." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { resumeText, resumeFilename, resumeFileBase64, resumeMimeType } = body as {
    resumeText: string;
    resumeFilename: string;
    resumeFileBase64?: string;
    resumeMimeType?: string;
  };

  if (!resumeText || resumeText.trim().length < 50) {
    return NextResponse.json(
      { error: "Resume text is too short or empty. Please upload a valid resume." },
      { status: 400 }
    );
  }

  await connectDB();

  const job = await Job.findById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  // Check duplicate application
  const existing = await Application.findOne({
    jobId: id,
    candidateId: session.userId,
  });
  if (existing) {
    return NextResponse.json(
      { error: "You have already applied to this job." },
      { status: 409 }
    );
  }

  // Score in background — fire and don't await for faster response,
  // but we do await here to persist before returning success
  const score = await scoreResumeAgainstJob(
    resumeText,
    job.title,
    job.description,
    job.requirements
  );

  await Application.create({
    jobId: id,
    candidateId: session.userId,
    resumeText,
    resumeFilename: resumeFilename || "resume",
    resumeFile: resumeFileBase64 || "",
    resumeMimeType: resumeMimeType || "",
    score,
  });

  // Do NOT expose score to candidate
  return NextResponse.json(
    { message: "Application submitted successfully! The employer will review your resume." },
    { status: 201 }
  );
}
