import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync, readFileSync, existsSync, unlinkSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import { randomUUID } from "crypto";
import { tmpdir } from "os";

export async function POST(req: NextRequest) {
  try {
    const { latex, photo } = await req.json();

    if (!latex) {
      return NextResponse.json({ error: "No LaTeX code provided" }, { status: 400 });
    }

    const id = randomUUID();
    const workDir = join(tmpdir(), `latex-${id}`);
    mkdirSync(workDir, { recursive: true });

    const texFile = join(workDir, "resume.tex");
    const pdfFile = join(workDir, "resume.pdf");

    // If photo base64 is provided, save it as photo.jpg in the work dir
    if (photo) {
      try {
        // Remove data URL prefix if present
        const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
        const photoBuffer = Buffer.from(base64Data, "base64");
        writeFileSync(join(workDir, "photo.jpg"), photoBuffer);
      } catch {
        // Photo processing failed, continue without photo
        console.warn("Failed to process photo, continuing without it");
      }
    }

    writeFileSync(texFile, latex);

    try {
      execSync(`cd "${workDir}" && pdflatex -interaction=nonstopmode resume.tex`, {
        timeout: 30000,
        stdio: "pipe",
      });

      // Run twice for references
      if (existsSync(pdfFile)) {
        execSync(`cd "${workDir}" && pdflatex -interaction=nonstopmode resume.tex`, {
          timeout: 30000,
          stdio: "pipe",
        });
      }
    } catch {
      // Check if PDF was still generated despite errors
      if (!existsSync(pdfFile)) {
        const logFile = join(workDir, "resume.log");
        let logContent = "";
        if (existsSync(logFile)) {
          logContent = readFileSync(logFile, "utf-8").slice(-2000);
        }
        // Cleanup
        try {
          execSync(`rm -rf "${workDir}"`);
        } catch { /* ignore */ }
        return NextResponse.json(
          { error: "LaTeX compilation failed", log: logContent },
          { status: 400 }
        );
      }
    }

    if (!existsSync(pdfFile)) {
      try {
        execSync(`rm -rf "${workDir}"`);
      } catch { /* ignore */ }
      return NextResponse.json({ error: "PDF not generated" }, { status: 500 });
    }

    const pdfBuffer = readFileSync(pdfFile);

    // Cleanup
    try {
      execSync(`rm -rf "${workDir}"`);
    } catch { /* ignore */ }

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Internal server error during PDF generation" },
      { status: 500 }
    );
  }
}
