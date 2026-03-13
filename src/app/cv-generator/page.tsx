"use client";

import { useState } from "react";
import {
  Mail,
  Loader2,
  Copy,
  CheckCircle,
  Download,
  FileText,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { getApiKey, generateWithRetry } from "@/lib/ai/gemini";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";

type DocType = "cover-letter" | "academic-cv" | "email-intro";

const docTypes: { id: DocType; label: string; icon: typeof Mail; description: string; color: string }[] = [
  {
    id: "cover-letter",
    label: "Cover Letter",
    icon: Mail,
    description: "Professional cover letter tailored to a specific job application",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "academic-cv",
    label: "Academic CV",
    icon: GraduationCap,
    description: "Comprehensive academic curriculum vitae with research and publications",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "email-intro",
    label: "Networking Email",
    icon: Briefcase,
    description: "Professional networking or cold email introduction for job inquiries",
    color: "from-rose-500 to-pink-600",
  },
];

export default function CVGeneratorPage() {
  const [docType, setDocType] = useState<DocType>("cover-letter");
  const [formData, setFormData] = useState({
    name: "",
    targetRole: "",
    company: "",
    jobDescription: "",
    resumeText: "",
    additionalInfo: "",
  });
  const [generatedText, setGeneratedText] = useState("");
  const [latexCode, setLatexCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showLatex, setShowLatex] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generate = async () => {
    const key = getApiKey();
    if (!key) {
      setError("Please configure your Gemini API key in Settings first.");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedText("");
    setLatexCode("");

    try {
      let prompt = "";

      if (docType === "cover-letter") {
        prompt = `Write a professional, compelling cover letter for the following application. The letter should be well-structured, personalized, and demonstrate genuine interest and qualifications.

Applicant Name: ${formData.name || "Not provided"}
Target Role: ${formData.targetRole || "Not provided"}
Company: ${formData.company || "Not provided"}
${formData.jobDescription ? `Job Description:\n${formData.jobDescription}` : ""}
${formData.resumeText ? `Resume/Background:\n${formData.resumeText}` : ""}
${formData.additionalInfo ? `Additional Details:\n${formData.additionalInfo}` : ""}

Write the cover letter in a professional tone. Include:
1. Strong opening that catches attention
2. Body paragraphs connecting experience to the role
3. Specific examples of relevant achievements
4. Enthusiastic but professional closing
5. Proper letter formatting

Output the cover letter text first.

Then output a separator line: ---LATEX---

Then output ONLY the complete LaTeX code for this cover letter (compilable with pdflatex, using letter class or article class with proper formatting). Do not wrap in code blocks.`;
      } else if (docType === "academic-cv") {
        prompt = `Generate a comprehensive academic CV (curriculum vitae) for the following person. Academic CVs are longer than resumes and include research, publications, teaching, and academic service.

Name: ${formData.name || "Not provided"}
Field/Department: ${formData.targetRole || "Not provided"}
Institution: ${formData.company || "Not provided"}
${formData.resumeText ? `Background/Current CV:\n${formData.resumeText}` : ""}
${formData.additionalInfo ? `Additional Info:\n${formData.additionalInfo}` : ""}

Include sections for:
- Contact Information
- Education
- Research Interests
- Publications (if mentioned)
- Teaching Experience
- Awards & Fellowships
- Conference Presentations
- Professional Service
- Skills
- References

Output the CV text first.

Then output a separator line: ---LATEX---

Then output ONLY the complete LaTeX code (compilable with pdflatex). Do not wrap in code blocks.`;
      } else {
        prompt = `Write a professional networking/cold email for the following scenario. The email should be concise, professional, and create interest.

Sender Name: ${formData.name || "Not provided"}
Target Role/Interest: ${formData.targetRole || "Not provided"}
Target Company/Person: ${formData.company || "Not provided"}
${formData.resumeText ? `Background:\n${formData.resumeText}` : ""}
${formData.additionalInfo ? `Context:\n${formData.additionalInfo}` : ""}

Write a professional email that:
1. Has a compelling subject line
2. Brief, personal introduction
3. Clear value proposition
4. Specific ask or call to action
5. Professional sign-off

Keep it under 200 words.

Output the email text only (no LaTeX needed for emails).`;
      }

      const text = await generateWithRetry(prompt);

      if (text.includes("---LATEX---")) {
        const parts = text.split("---LATEX---");
        setGeneratedText(parts[0].trim());
        let latex = parts[1].trim();
        latex = latex.replace(/^```(?:latex|tex)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
        setLatexCode(latex);
      } else {
        setGeneratedText(text);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(showLatex ? latexCode : generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const content = showLatex ? latexCode : generatedText;
    const ext = showLatex ? "tex" : "txt";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docType}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!latexCode) return;
    setDownloadingPdf(true);
    setError("");

    const isCompilerUnavailable = (message: string) => {
      const lower = message.toLowerCase();
      return (
        lower.includes("pdflatex") &&
        (lower.includes("not installed") || lower.includes("not in path") || lower.includes("compiler not found"))
      );
    };

    const attemptCompile = async (code: string): Promise<Blob> => {
      const response = await fetch("/api/latex-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex: code }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "PDF conversion failed");
      }
      return response.blob();
    };

    try {
      let blob: Blob;
      try {
        blob = await attemptCompile(latexCode);
      } catch (firstErr: unknown) {
        const errMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);

        if (isCompilerUnavailable(errMsg)) {
          throw new Error(errMsg);
        }

        setError("Compilation failed — auto-fixing LaTeX code (attempt 1)...");

        try {
          const fixPrompt = `The following LaTeX code failed to compile with pdflatex. Fix ALL errors and return ONLY the corrected LaTeX code, nothing else. Do NOT wrap in markdown code blocks.

COMMON FIX RULES:
- If error mentions pgfutil or pgf internal macros: simplify ALL tikz code, wrap every \\clip in a scope environment, remove \\foreach loops
- If error mentions undefined control sequence: check package imports
- Always wrap \\clip inside \\begin{scope}...\\end{scope}

COMPILATION ERRORS:
${errMsg}

ORIGINAL LATEX CODE:
${latexCode}`;
          let fixedCode = await generateWithRetry(fixPrompt);
          fixedCode = fixedCode.replace(/^```(?:latex|tex)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
          setLatexCode(fixedCode);
          setError("");
          blob = await attemptCompile(fixedCode);
        } catch (fixErr: unknown) {
          // Attempt 2: aggressive simplification
          const errMsg2 = fixErr instanceof Error ? fixErr.message : String(fixErr);
          setError("Auto-fix attempt 1 failed — trying aggressive simplification (attempt 2)...");

          try {
            const fixPrompt2 = `The following LaTeX STILL fails after a first fix attempt. Apply AGGRESSIVE fixes — return ONLY corrected LaTeX:
1. REMOVE all \\foreach loops
2. REMOVE all \\pgfmath* commands
3. Wrap every \\clip in \\begin{scope}...\\end{scope}
4. Replace complex tikz with simple \\colorbox or \\rule
5. If tikz is causing issues, remove decorative tikz entirely

ERRORS: ${errMsg2}

FAILING CODE:
${latexCode}`;
            let fixedCode2 = await generateWithRetry(fixPrompt2);
            fixedCode2 = fixedCode2.replace(/^```(?:latex|tex)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
            setLatexCode(fixedCode2);
            setError("");
            blob = await attemptCompile(fixedCode2);
          } catch (fixErr2: unknown) {
            const fixMsg = fixErr2 instanceof Error ? fixErr2.message : "PDF conversion failed after auto-fix";
            throw new Error(`Auto-fix failed after 2 attempts: ${fixMsg}`);
          }
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docType}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "PDF download failed";
      setError(message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const currentDocType = docTypes.find((d) => d.id === docType)!;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="max-w-[1440px] mx-auto">
      <PageHeader
        icon={Mail}
        title="CV & Cover Letter Generator"
        subtitle="Generate professional documents with AI"
        gradient="from-cyan-500 to-blue-600"
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Doc Type Selector — Horizontal Ribbon */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-surface-1 border border-glass-border mb-6">
        {docTypes.map((dt) => (
          <button
            key={dt.id}
            onClick={() => setDocType(dt.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 flex-1 ${
              docType === dt.id
                ? "bg-primary/10 border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.12)]"
                : "border border-transparent hover:bg-surface-2"
            }`}
          >
            <div className={`h-9 w-9 rounded-lg bg-linear-to-br ${dt.color} flex items-center justify-center shrink-0 ${
              docType === dt.id ? "shadow-lg" : ""
            }`}>
              <dt.icon className="h-4 w-4 text-white" />
            </div>
            <div className="text-left min-w-0">
              <div className={`text-xs font-semibold ${docType === dt.id ? "text-foreground" : "text-muted-foreground"}`}>
                {dt.label}
              </div>
              <div className="text-[10px] text-muted-foreground/60 truncate hidden sm:block">{dt.description}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Left: Form */}
        <div className="flex-1 min-w-0 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2.5">
                  <currentDocType.icon className="h-5 w-5 text-primary" />
                  <span className="bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">{currentDocType.label} Details</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Fill in the details for your {currentDocType.label.toLowerCase()}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Your Name</label>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {docType === "academic-cv" ? "Field / Department" : "Target Role"}
                  </label>
                  <Input
                    placeholder={docType === "academic-cv" ? "e.g., Computer Science" : "e.g., Senior Software Engineer"}
                    value={formData.targetRole}
                    onChange={(e) => update("targetRole", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {docType === "academic-cv" ? "Institution" : "Company Name"}
                </label>
                <Input
                  placeholder={docType === "academic-cv" ? "e.g., MIT" : "e.g., Google"}
                  value={formData.company}
                  onChange={(e) => update("company", e.target.value)}
                />
              </div>

              {docType === "cover-letter" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Job Description</label>
                  <Textarea
                    placeholder="Paste the job description..."
                    rows={4}
                    value={formData.jobDescription}
                    onChange={(e) => update("jobDescription", e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Resume / Background</label>
                <Textarea
                  placeholder="Paste your resume or background info (helps AI personalize the output)"
                  rows={5}
                  value={formData.resumeText}
                  onChange={(e) => update("resumeText", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Additional Instructions</label>
                <Textarea
                  placeholder="Any additional details or special instructions..."
                  rows={3}
                  value={formData.additionalInfo}
                  onChange={(e) => update("additionalInfo", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sticky generate bar */}
          <div className="sticky bottom-4 z-20">
            <div className="p-3 rounded-2xl border border-glass-border bg-sticky-bg backdrop-blur-xl shadow-[0_-8px_30px_var(--shadow-heavy)]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className={`h-8 w-8 rounded-lg bg-linear-to-br ${currentDocType.color} flex items-center justify-center shrink-0`}>
                    <currentDocType.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{currentDocType.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{currentDocType.description}</div>
                  </div>
                </div>
                <Button
                  onClick={generate}
                  disabled={loading}
                  variant="glow"
                  className="gap-2 px-6 py-5 text-sm bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shrink-0"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><FileText className="h-4 w-4" /> Generate</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Output Panel (sticky) */}
        <div className="hidden lg:block w-[480px] shrink-0">
          <div className="sticky top-24">
            <Card className="flex flex-col h-[calc(100vh-8rem)] relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-cyan-500/40 to-transparent" />
              <CardContent className="p-5 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div className="flex gap-2">
                    {latexCode && (
                      <>
                        <Button
                          variant={!showLatex ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowLatex(false)}
                          className="text-xs"
                        >
                          Preview
                        </Button>
                        <Button
                          variant={showLatex ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowLatex(true)}
                          className="text-xs"
                        >
                          LaTeX Code
                        </Button>
                      </>
                    )}
                  </div>
                  {generatedText && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyText} className="gap-1.5 text-xs">
                        {copied ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadText} className="gap-1.5 text-xs">
                        <Download className="h-3.5 w-3.5" /> Save
                      </Button>
                      {latexCode && (
                        <Button size="sm" onClick={downloadPDF} disabled={downloadingPdf} className="gap-1.5 text-xs">
                          {downloadingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                          PDF
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {generatedText ? (
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {showLatex ? (
                      <pre className="latex-code">{latexCode}</pre>
                    ) : (
                      <div className="markdown-content text-sm">
                        <ReactMarkdown>{generatedText}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    <div className="text-center">
                      <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-surface-2 border border-glass-border flex items-center justify-center">
                        <Mail className="h-8 w-8 opacity-20" />
                      </div>
                      <p className="font-medium text-foreground/50">Ready to generate</p>
                      <p className="text-xs mt-1.5 opacity-50 max-w-[200px] mx-auto leading-relaxed">
                        Fill in the details and click Generate
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile output */}
      <div className="lg:hidden mt-6">
        {generatedText && (
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-cyan-500/40 to-transparent" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  {latexCode && (
                    <>
                      <Button variant={!showLatex ? "default" : "outline"} size="sm" onClick={() => setShowLatex(false)} className="text-xs">Preview</Button>
                      <Button variant={showLatex ? "default" : "outline"} size="sm" onClick={() => setShowLatex(true)} className="text-xs">LaTeX</Button>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyText} className="gap-1.5 text-xs">
                    {copied ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadText} className="gap-1.5 text-xs">
                    <Download className="h-3.5 w-3.5" /> Save
                  </Button>
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {showLatex ? <pre className="latex-code">{latexCode}</pre> : <div className="markdown-content text-sm"><ReactMarkdown>{generatedText}</ReactMarkdown></div>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
