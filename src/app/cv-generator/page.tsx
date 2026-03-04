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
import { getApiKey, generateWithRetry } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";

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

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">CV & Cover Letter Generator</h1>
          <p className="text-sm text-muted">Generate professional documents with AI</p>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Doc Type Selector */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {docTypes.map((dt) => (
          <button
            key={dt.id}
            onClick={() => setDocType(dt.id)}
            className={`text-left p-4 rounded-xl border transition-all ${
              docType === dt.id
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${dt.color} flex items-center justify-center mb-2`}>
              <dt.icon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold">{dt.label}</h3>
            <p className="text-xs text-muted mt-1">{dt.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => update("name", e.target.value)}
              />
              <input
                className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                placeholder={docType === "academic-cv" ? "Field/Department" : "Target Role"}
                value={formData.targetRole}
                onChange={(e) => update("targetRole", e.target.value)}
              />
            </div>
            <input
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              placeholder={docType === "academic-cv" ? "Institution" : "Company Name"}
              value={formData.company}
              onChange={(e) => update("company", e.target.value)}
            />
            {docType === "cover-letter" && (
              <textarea
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder="Paste the job description..."
                rows={4}
                value={formData.jobDescription}
                onChange={(e) => update("jobDescription", e.target.value)}
              />
            )}
            <textarea
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
              placeholder="Paste your resume/background info (helps AI personalize the output)"
              rows={5}
              value={formData.resumeText}
              onChange={(e) => update("resumeText", e.target.value)}
            />
            <textarea
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
              placeholder="Any additional details or special instructions..."
              rows={3}
              value={formData.additionalInfo}
              onChange={(e) => update("additionalInfo", e.target.value)}
            />
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
            ) : (
              <><FileText className="w-5 h-5" /> Generate {docTypes.find(d => d.id === docType)?.label}</>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {latexCode && (
                <>
                  <button
                    onClick={() => setShowLatex(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      !showLatex ? "bg-primary text-white" : "bg-background border border-border text-muted"
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setShowLatex(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      showLatex ? "bg-primary text-white" : "bg-background border border-border text-muted"
                    }`}
                  >
                    LaTeX Code
                  </button>
                </>
              )}
            </div>
            {generatedText && (
              <div className="flex gap-2">
                <button
                  onClick={copyText}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg text-xs hover:border-primary/50"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadText}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg text-xs hover:border-primary/50"
                >
                  <Download className="w-3.5 h-3.5" /> Save
                </button>
                {latexCode && (
                  <button
                    onClick={downloadPDF}
                    disabled={downloadingPdf}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs hover:bg-primary-hover disabled:opacity-50"
                  >
                    {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    PDF
                  </button>
                )}
              </div>
            )}
          </div>

          {generatedText ? (
            <div className="flex-1 overflow-y-auto">
              {showLatex ? (
                <pre className="latex-code">{latexCode}</pre>
              ) : (
                <div className="markdown-content text-sm">
                  <ReactMarkdown>{generatedText}</ReactMarkdown>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted text-sm">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Generated document will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
