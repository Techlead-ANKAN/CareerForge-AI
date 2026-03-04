"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Wand2,
  Download,
  Copy,
  Loader2,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Trophy,
  CheckCircle,
  ImagePlus,
  X,
  Layout,
  Camera,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { getApiKey, generateWithRetry } from "@/lib/gemini";
import { RESUME_TEMPLATES, getTemplateById } from "@/lib/templates";

interface EducationEntry {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  startYear: string;
  endYear: string;
  gradeType: "GPA" | "CGPA" | "Percentage" | "Grade";
  gradeValue: string;
  gradeScale: string;
  coursework: string;
}

const emptyEducation = (): EducationEntry => ({
  id: crypto.randomUUID(),
  degree: "",
  fieldOfStudy: "",
  institution: "",
  startYear: "",
  endYear: "",
  gradeType: "CGPA",
  gradeValue: "",
  gradeScale: "10",
  coursework: "",
});

const gradeTypes = [
  { value: "GPA", label: "GPA", defaultScale: "4.0" },
  { value: "CGPA", label: "CGPA", defaultScale: "10" },
  { value: "Percentage", label: "Percentage", defaultScale: "100" },
  { value: "Grade", label: "Grade (A/B/C)", defaultScale: "" },
];

function formatEducationsToString(educations: EducationEntry[]): string {
  return educations
    .filter((e) => e.degree || e.institution)
    .map((e) => {
      const parts: string[] = [];
      const degreeLine = [e.degree, e.fieldOfStudy].filter(Boolean).join(" in ");
      if (degreeLine) parts.push(degreeLine);
      if (e.institution) parts.push(`Institution: ${e.institution}`);
      const years = [e.startYear, e.endYear].filter(Boolean).join(" - ");
      if (years) parts.push(`Duration: ${years}`);
      if (e.gradeValue) {
        if (e.gradeType === "Grade") {
          parts.push(`Grade: ${e.gradeValue}`);
        } else {
          parts.push(`${e.gradeType}: ${e.gradeValue}${e.gradeScale ? `/${e.gradeScale}` : ""}`);
        }
      }
      if (e.coursework) parts.push(`Relevant Coursework: ${e.coursework}`);
      return parts.join("\n");
    })
    .join("\n\n");
}

interface ResumeForm {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  targetRole: string;
  jobDescription: string;
  summary: string;
  education: string;
  experience: string;
  projects: string;
  skills: string;
  achievements: string;
}

const defaultForm: ResumeForm = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  targetRole: "",
  jobDescription: "",
  summary: "",
  education: "",
  experience: "",
  projects: "",
  skills: "",
  achievements: "",
};

export default function ResumeBuilderPage() {
  const [form, setForm] = useState<ResumeForm>(defaultForm);
  const [latexCode, setLatexCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("template");
  const [selectedTemplate, setSelectedTemplate] = useState("modern-professional");
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [educations, setEducations] = useState<EducationEntry[]>([emptyEducation()]);
  const [jdFileName, setJdFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setEducations((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, [field]: value } : e));
      // sync to form.education
      setForm((f) => ({ ...f, education: formatEducationsToString(updated) }));
      return updated;
    });
  };

  const addEducation = () => {
    setEducations((prev) => [...prev, emptyEducation()]);
  };

  const removeEducation = (id: string) => {
    setEducations((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      const remaining = updated.length > 0 ? updated : [emptyEducation()];
      setForm((f) => ({ ...f, education: formatEducationsToString(remaining) }));
      return remaining;
    });
  };

  const updateForm = (field: keyof ResumeForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleJDUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJdFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      updateForm("jobDescription", text);
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try a .txt file or paste the text directly.");
    };
    reader.readAsText(file);
  };

  const clearJDFile = () => {
    setJdFileName(null);
    updateForm("jobDescription", "");
    if (jdFileInputRef.current) jdFileInputRef.current.value = "";
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoBase64(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoBase64(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generateResume = async () => {
    const key = getApiKey();
    if (!key) {
      setError("Please configure your Gemini API key in Settings first.");
      return;
    }

    if (!form.fullName || !form.targetRole) {
      setError("Please fill in at least your name and target role.");
      return;
    }

    setLoading(true);
    setError("");

    const template = getTemplateById(selectedTemplate);
    const hasPhoto = template.hasPhoto && photoBase64;

    try {
      const prompt = `Generate a professional, ATS-optimized LaTeX resume using the following SPECIFIC template design.

=== TEMPLATE: ${template.name} ===
${template.promptInstructions}

=== CRITICAL RULES ===
- Output ONLY the complete LaTeX code, absolutely nothing else before or after
- Do NOT wrap in markdown code blocks (\`\`\`)
- Make it compile with pdflatex WITHOUT errors
- Do NOT use any packages that require XeLaTeX or LuaLaTeX
- Keep it to 1 page (2 pages max if extensive experience)
${hasPhoto ? `- INCLUDE a profile photo: use \\includegraphics[width=2.5cm]{photo.jpg} with circular clipping via tikz:
  \\begin{tikzpicture}
    \\clip (0,0) circle (1.25cm);
    \\node at (0,0) {\\includegraphics[width=2.5cm]{photo.jpg}};
  \\end{tikzpicture}
- The photo file "photo.jpg" will be in the same directory` : "- Do NOT include any photo/image in this resume"}

=== PERSON DETAILS ===
Name: ${form.fullName}
Email: ${form.email || "Not provided"}
Phone: ${form.phone || "Not provided"}
Location: ${form.location || "Not provided"}
LinkedIn: ${form.linkedin || "Not provided"}
GitHub: ${form.github || "Not provided"}
Target Role: ${form.targetRole}

${form.jobDescription ? `=== JOB DESCRIPTION ===\n${form.jobDescription}` : ""}
${form.summary ? `=== PROFESSIONAL SUMMARY ===\n${form.summary}` : ""}
${form.education ? `=== EDUCATION ===\n${form.education}` : ""}
${form.experience ? `=== WORK EXPERIENCE ===\n${form.experience}` : ""}
${form.projects ? `=== PROJECTS ===\n${form.projects}` : ""}
${form.skills ? `=== SKILLS ===\n${form.skills}` : ""}
${form.achievements ? `=== ACHIEVEMENTS ===\n${form.achievements}` : ""}

If any section has no data provided, create compelling placeholder content appropriate for the "${form.targetRole}" role, or skip the section if not essential.

Generate the complete LaTeX code now:`;

      let text = await generateWithRetry(prompt);
      text = text.replace(/^```(?:latex|tex)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      setLatexCode(text);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!latexCode) return;
    setDownloading(true);
    setError("");

    try {
      const body: Record<string, string> = { latex: latexCode };
      if (photoBase64) {
        body.photo = photoBase64;
      }

      const response = await fetch("/api/latex-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "PDF conversion failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form.fullName.replace(/\s+/g, "_") || "resume"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Download failed";
      setError(message);
    } finally {
      setDownloading(false);
    }
  };

  const copyLatex = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { id: "template", label: "Template", icon: Layout },
    { id: "personal", label: "Personal Info", icon: User },
    { id: "photo", label: "Photo", icon: Camera },
    { id: "role", label: "Target Role", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "projects", label: "Projects", icon: Code },
    { id: "skills", label: "Skills & More", icon: Trophy },
  ];

  const currentTemplate = getTemplateById(selectedTemplate);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Resume Builder</h1>
          <p className="text-sm text-muted">
            Choose a template, add your details & photo, AI generates a professional LaTeX resume
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 mb-6 text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-4">
          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeSection === s.id
                    ? "bg-primary text-white"
                    : "bg-card border border-border text-muted hover:text-foreground"
                }`}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>

          {/* Template Selection */}
          {activeSection === "template" && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Layout className="w-4 h-4 text-primary" /> Choose Your Template
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {RESUME_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      selectedTemplate === t.id
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border hover:border-primary/30 bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-lg`}>
                        {t.preview}
                      </div>
                      {selectedTemplate === t.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <h4 className="text-xs font-semibold mb-0.5">{t.name}</h4>
                    <p className="text-xs text-muted leading-snug">{t.description}</p>
                    <div className="mt-2 flex gap-1.5">
                      {t.hasPhoto && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          📷 Photo
                        </span>
                      )}
                      <span className="text-xs bg-card border border-border px-1.5 py-0.5 rounded">
                        LaTeX
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Photo Upload */}
          {activeSection === "photo" && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" /> Profile Photo
              </h3>
              
              {!currentTemplate.hasPhoto && (
                <div className="bg-accent/10 border border-accent/30 text-accent rounded-xl px-4 py-3 text-xs">
                  ⚠️ The "{currentTemplate.name}" template doesn't support photos. Choose a photo-compatible template (Modern Professional, Creative Modern, Tech Developer, or Executive Premium).
                </div>
              )}

              <div className="flex items-start gap-6">
                {/* Upload Area */}
                <div className="flex-1">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      currentTemplate.hasPhoto
                        ? "border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                        : "border-border opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <ImagePlus className="w-8 h-8 mx-auto mb-2 text-muted" />
                    <p className="text-sm font-medium text-muted">Click to upload photo</p>
                    <p className="text-xs text-muted/60 mt-1">JPG, PNG — Max 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={!currentTemplate.hasPhoto}
                  />
                </div>

                {/* Photo Preview */}
                {photoPreview && (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-28 h-28 rounded-full object-cover border-2 border-primary shadow-lg"
                    />
                    <button
                      onClick={removePhoto}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {photoBase64 && (
                <div className="bg-success/10 border border-success/30 text-success rounded-xl px-4 py-2 text-xs flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" /> Photo uploaded successfully. It will be included in your resume.
                </div>
              )}
            </div>
          )}

          {/* Personal Info */}
          {activeSection === "personal" && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="col-span-2 bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="Full Name *"
                  value={form.fullName}
                  onChange={(e) => updateForm("fullName", e.target.value)}
                />
                <input
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                />
                <input
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                />
                <input
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                />
                <input
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="LinkedIn URL"
                  value={form.linkedin}
                  onChange={(e) => updateForm("linkedin", e.target.value)}
                />
                <input
                  className="col-span-2 bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="GitHub URL"
                  value={form.github}
                  onChange={(e) => updateForm("github", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Target Role */}
          {activeSection === "role" && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Target Role
              </h3>
              <input
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                placeholder="Target Role (e.g., Senior Software Engineer) *"
                value={form.targetRole}
                onChange={(e) => updateForm("targetRole", e.target.value)}
              />
              {/* Job Description - textarea + upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted">Job Description (optional — helps AI tailor your resume)</label>
                  <div className="flex items-center gap-2">
                    {jdFileName && (
                      <span className="flex items-center gap-1.5 text-xs text-success bg-success/10 border border-success/20 px-2 py-1 rounded-lg">
                        <CheckCircle className="w-3 h-3" /> {jdFileName}
                        <button onClick={clearJDFile} className="text-danger/60 hover:text-danger ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={() => jdFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>
                    <input
                      ref={jdFileInputRef}
                      type="file"
                      accept=".txt,.text,.md,.rtf,.doc,.docx,.pdf"
                      onChange={handleJDUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <textarea
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="Paste the job description here, or upload a file above..."
                  rows={6}
                  value={form.jobDescription}
                  onChange={(e) => {
                    updateForm("jobDescription", e.target.value);
                    if (jdFileName) setJdFileName(null);
                  }}
                />
              </div>
              <textarea
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder="Professional summary (optional - AI can generate one)"
                rows={3}
                value={form.summary}
                onChange={(e) => updateForm("summary", e.target.value)}
              />
            </div>
          )}

          {/* Education */}
          {activeSection === "education" && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" /> Education
                </h3>
                <button
                  onClick={addEducation}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Education
                </button>
              </div>

              {educations.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="bg-background border border-border rounded-xl p-4 space-y-3 relative"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted">Education {idx + 1}</span>
                    {educations.length > 1 && (
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="flex items-center gap-1 px-2 py-1 text-danger/70 hover:text-danger hover:bg-danger/10 rounded-lg text-xs transition-all"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>

                  {/* Degree & Field */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      placeholder="Degree (e.g., B.Tech, B.Sc, MBA)"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                    />
                    <input
                      className="bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      placeholder="Field of Study (e.g., Computer Science)"
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(edu.id, "fieldOfStudy", e.target.value)}
                    />
                  </div>

                  {/* Institution */}
                  <input
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    placeholder="Institution / University Name"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                  />

                  {/* Start & End Year */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted mb-1 block">Start Year</label>
                      <input
                        type="number"
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        placeholder="e.g., 2020"
                        min="1970"
                        max="2040"
                        value={edu.startYear}
                        onChange={(e) => updateEducation(edu.id, "startYear", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1 block">End Year (or Expected)</label>
                      <input
                        type="number"
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        placeholder="e.g., 2024"
                        min="1970"
                        max="2040"
                        value={edu.endYear}
                        onChange={(e) => updateEducation(edu.id, "endYear", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Marks / Grade */}
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Marks / Grade</label>
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                      <div className="flex rounded-xl border border-border overflow-hidden bg-card">
                        {gradeTypes.map((gt) => (
                          <button
                            key={gt.value}
                            onClick={() => {
                              updateEducation(edu.id, "gradeType", gt.value);
                              if (gt.defaultScale) {
                                updateEducation(edu.id, "gradeScale", gt.defaultScale);
                              } else {
                                updateEducation(edu.id, "gradeScale", "");
                              }
                            }}
                            className={`px-2.5 py-1.5 text-xs font-medium transition-all ${
                              edu.gradeType === gt.value
                                ? "bg-primary text-white"
                                : "text-muted hover:text-foreground"
                            }`}
                          >
                            {gt.label}
                          </button>
                        ))}
                      </div>
                      <input
                        className="w-20 bg-card border border-border rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:border-primary"
                        placeholder={edu.gradeType === "Grade" ? "A+" : "9.1"}
                        value={edu.gradeValue}
                        onChange={(e) => updateEducation(edu.id, "gradeValue", e.target.value)}
                      />
                      {edu.gradeType !== "Grade" && (
                        <div className="flex items-center gap-1 text-sm text-muted">
                          <span>/</span>
                          <input
                            className="w-14 bg-card border border-border rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:border-primary"
                            placeholder="10"
                            value={edu.gradeScale}
                            onChange={(e) => updateEducation(edu.id, "gradeScale", e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Relevant Coursework */}
                  <div>
                    <label className="text-xs text-muted mb-1 block">Relevant Coursework (optional)</label>
                    <input
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      placeholder="e.g., Data Structures, Algorithms, Machine Learning, DBMS"
                      value={edu.coursework}
                      onChange={(e) => updateEducation(edu.id, "coursework", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              {educations.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-xs text-muted">
                  <span className="text-primary font-medium">{educations.filter((e) => e.degree || e.institution).length}</span> education {educations.filter((e) => e.degree || e.institution).length === 1 ? "entry" : "entries"} added
                </div>
              )}
            </div>
          )}

          {/* Experience */}
          {activeSection === "experience" && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Work Experience
              </h3>
              <textarea
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder={"List your work experience\n\nExample:\nSoftware Engineer at Google, Jan 2023 - Present\n- Built microservices handling 1M+ requests/day\n- Reduced API latency by 40%"}
                rows={10}
                value={form.experience}
                onChange={(e) => updateForm("experience", e.target.value)}
              />
            </div>
          )}

          {/* Projects */}
          {activeSection === "projects" && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" /> Projects
              </h3>
              <textarea
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder={"List your key projects\n\nExample:\nAI Chat Application | React, Node.js, OpenAI API\n- Built a real-time chat app with AI responses\n- 500+ active users"}
                rows={10}
                value={form.projects}
                onChange={(e) => updateForm("projects", e.target.value)}
              />
            </div>
          )}

          {/* Skills & Achievements */}
          {activeSection === "skills" && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Skills & Achievements
              </h3>
              <textarea
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder={"Skills (comma separated)\n\nExample: Python, Java, React, Node.js, AWS, Docker, Git"}
                rows={4}
                value={form.skills}
                onChange={(e) => updateForm("skills", e.target.value)}
              />
              <textarea
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder={"Achievements & Certifications\n\nExample:\nAWS Certified\n1st in Hackathon\nPublished paper in IEEE"}
                rows={5}
                value={form.achievements}
                onChange={(e) => updateForm("achievements", e.target.value)}
              />
            </div>
          )}

          {/* Selected Template Info + Generate */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentTemplate.color} flex items-center justify-center text-lg shrink-0`}>
              {currentTemplate.preview}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold">{currentTemplate.name}</div>
              <div className="text-xs text-muted truncate">{currentTemplate.description}</div>
            </div>
            {photoPreview && currentTemplate.hasPhoto && (
              <img src={photoPreview} alt="" className="w-8 h-8 rounded-full object-cover border border-primary" />
            )}
          </div>

          <button
            onClick={generateResume}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Generating Resume...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" /> Generate {currentTemplate.name} Resume
              </>
            )}
          </button>
        </div>

        {/* Right: Output */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">LaTeX Output</h3>
              {latexCode && (
                <div className="flex gap-2">
                  <button
                    onClick={copyLatex}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg text-xs hover:border-primary/50 transition-colors"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={downloadPDF}
                    disabled={downloading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    {downloading ? "Converting..." : "Download PDF"}
                  </button>
                </div>
              )}
            </div>
            {latexCode ? (
              <pre className="latex-code flex-1">{latexCode}</pre>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted text-sm">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Your generated LaTeX resume will appear here</p>
                  <p className="text-xs mt-1 opacity-60">
                    1. Choose a template → 2. Fill details → 3. Upload photo → 4. Generate
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
