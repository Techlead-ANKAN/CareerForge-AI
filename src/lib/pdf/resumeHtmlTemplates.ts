export type ResumeFormData = {
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
};

export type ResumeEducationEntry = {
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
};

export type ResumePdfPayload = {
  templateId: string;
  form: ResumeFormData;
  educations: ResumeEducationEntry[];
  photoBase64?: string | null;
};

function cleanInvisible(text: string): string {
  return text
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[\u2028\u2029]/g, "\n")
    .normalize("NFKC");
}

function escapeHtml(text: string): string {
  return cleanInvisible(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitLines(value: string): string[] {
  return cleanInvisible(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*•]\s*/, ""));
}

function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

function joinNonEmpty(parts: string[], sep: string): string {
  const filtered = parts.filter((p) => p.trim().length > 0);
  return filtered.join(sep);
}

function renderSection(title: string, body: string): string {
  if (!body.trim()) return "";
  return `<section class="section"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function renderBulletLines(lines: string[]): string {
  if (lines.length === 0) return "";
  return `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
}

function renderEducation(educations: ResumeEducationEntry[], fallbackText: string): string {
  const valid = educations.filter((e) => e.degree.trim() || e.institution.trim());

  if (valid.length === 0) {
    const fallbackLines = splitLines(fallbackText);
    return renderBulletLines(fallbackLines);
  }

  return valid
    .map((e) => {
      const degree = joinNonEmpty([e.degree, e.fieldOfStudy ? `in ${e.fieldOfStudy}` : ""], " ");
      const dateRange = joinNonEmpty([e.startYear, e.endYear], " - ");
      const grade = e.gradeValue
        ? e.gradeType === "Grade"
          ? `Grade: ${e.gradeValue}`
          : `${e.gradeType}: ${e.gradeValue}${e.gradeScale ? `/${e.gradeScale}` : ""}`
        : "";
      const coursework = e.coursework ? `Relevant Coursework: ${e.coursework}` : "";

      return `<div class="edu-item">
        <div class="edu-head">
          <div class="edu-title">${escapeHtml(joinNonEmpty([degree, e.institution], ", "))}</div>
          ${dateRange ? `<div class="edu-date">${escapeHtml(dateRange)}</div>` : ""}
        </div>
        ${grade ? `<div class="edu-meta">${escapeHtml(grade)}</div>` : ""}
        ${coursework ? `<div class="edu-meta">${escapeHtml(coursework)}</div>` : ""}
      </div>`;
    })
    .join("");
}

function renderHeader(payload: ResumePdfPayload): string {
  const { form } = payload;
  const showPhoto = payload.templateId === "tech-developer" && Boolean(payload.photoBase64);

  const links: string[] = [];
  if (form.email.trim()) {
    links.push(`<a href="mailto:${escapeHtml(form.email.trim())}">${escapeHtml(form.email.trim())}</a>`);
  }
  if (form.linkedin.trim()) {
    const u = normalizeUrl(form.linkedin);
    links.push(`<a href="${escapeHtml(u)}">${escapeHtml(form.linkedin.trim())}</a>`);
  }
  if (form.github.trim()) {
    const u = normalizeUrl(form.github);
    links.push(`<a href="${escapeHtml(u)}">${escapeHtml(form.github.trim())}</a>`);
  }

  const contactLine = joinNonEmpty(
    [form.phone.trim(), form.location.trim()].map((v) => escapeHtml(v)),
    " | "
  );

  return `<header class="header">
    <div class="header-main">
      <div class="header-text">
        <h1>${escapeHtml(form.fullName || "Candidate")}</h1>
        <div class="role">${escapeHtml(form.targetRole || "Professional")}</div>
        ${contactLine ? `<div class="contact">${contactLine}</div>` : ""}
        ${links.length > 0 ? `<div class="links">${links.join(" | ")}</div>` : ""}
      </div>
      ${showPhoto ? `<img class="profile-photo" src="${payload.photoBase64}" alt="Profile photo" />` : ""}
    </div>
  </header>`;
}

type ParsedMeta = {
  technical: string[];
  subjectsOfInterest: string[];
  additionalSkills: string[];
  additionalDetails: string[];
  declaration: string;
};

function splitInlineValues(text: string): string[] {
  return text
    .split(/[;,|]/g)
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseMeta(form: ResumeFormData): ParsedMeta {
  const parsed: ParsedMeta = {
    technical: [],
    subjectsOfInterest: [],
    additionalSkills: [],
    additionalDetails: [],
    declaration: "",
  };

  const processLine = (line: string, source: "skills" | "achievements") => {
    const cleaned = cleanInvisible(line).trim();
    if (!cleaned) return;

    const subjectMatch = cleaned.match(/^subjects?\s+of\s+interest\s*:\s*(.+)$/i);
    if (subjectMatch) {
      parsed.subjectsOfInterest.push(...splitInlineValues(subjectMatch[1]));
      return;
    }

    const addSkillMatch = cleaned.match(/^additional\s+skills?\s*:\s*(.+)$/i);
    if (addSkillMatch) {
      parsed.additionalSkills.push(...splitInlineValues(addSkillMatch[1]));
      return;
    }

    const addDetailsMatch = cleaned.match(/^additional\s+details?\s*:\s*(.+)$/i);
    if (addDetailsMatch) {
      parsed.additionalDetails.push(addDetailsMatch[1].trim());
      return;
    }

    const declarationMatch = cleaned.match(/^declaration\s*:\s*(.+)$/i);
    if (declarationMatch) {
      parsed.declaration = declarationMatch[1].trim();
      return;
    }

    if (source === "skills") {
      parsed.technical.push(cleaned);
    } else {
      parsed.additionalSkills.push(cleaned);
    }
  };

  splitLines(form.skills).forEach((line) => processLine(line, "skills"));
  splitLines(form.achievements).forEach((line) => processLine(line, "achievements"));

  return parsed;
}

function renderTechnicalSkills(lines: string[]): string {
  if (lines.length === 0) return "";

  const rows = lines.map((line) => {
    if (line.includes(":")) {
      const [k, ...rest] = line.split(":");
      return `<div class="skill-row"><strong>${escapeHtml(k.trim())}</strong><span>${escapeHtml(rest.join(":").trim())}</span></div>`;
    }
    return `<div class="skill-row"><strong>Technical Skills</strong><span>${escapeHtml(line)}</span></div>`;
  });

  return `<div class="skills-grid">${rows.join("")}</div>`;
}

function renderBulletParagraph(lines: string[]): string {
  if (lines.length === 0) return "";
  return `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
}

function renderBody(payload: ResumePdfPayload): string {
  const { form, educations } = payload;
  const meta = parseMeta(form);

  const objective = form.summary.trim() || `${form.targetRole || "Professional"} candidate seeking suitable opportunities.`;
  const experienceLines = splitLines(form.experience);
  const projectLines = splitLines(form.projects);

  if (payload.templateId === "tech-developer") {
    const declarationText = meta.declaration || "";
    return [
      renderSection("Career Objective", `<p>${escapeHtml(objective)}</p>`),
      renderSection("Education", renderEducation(educations, form.education)),
      renderSection("Technical Skills", renderTechnicalSkills(meta.technical)),
      renderSection("Subjects Of Interest", renderBulletParagraph(meta.subjectsOfInterest)),
      renderSection("Experience", renderBulletParagraph(experienceLines)),
      renderSection("Projects", renderBulletParagraph(projectLines)),
      renderSection("Additional Skills", renderBulletParagraph(meta.additionalSkills)),
      renderSection("Additional Details", renderBulletParagraph(meta.additionalDetails)),
      renderSection("Declaration", declarationText ? `<p>${escapeHtml(declarationText)}</p>` : ""),
    ].join("");
  }

  return [
    renderSection("Objective", `<p>${escapeHtml(objective)}</p>`),
    renderSection("Education", renderEducation(educations, form.education)),
    renderSection("Skills", renderTechnicalSkills(meta.technical)),
    renderSection("Experience", renderBulletLines(experienceLines)),
    renderSection("Projects", renderBulletLines(projectLines)),
    renderSection("Extra-Curricular Activities", renderBulletLines(meta.additionalSkills)),
  ].join("");
}

function getTheme(templateId: string): { className: string; accent: string; font: string } {
  switch (templateId) {
    case "faangpath-simple":
      return { className: "theme-faang", accent: "#1f2937", font: "'Times New Roman', Times, serif" };
    case "tech-developer":
      return { className: "theme-tech", accent: "#0ea5e9", font: "'Segoe UI', Tahoma, sans-serif" };
    case "classic-elegant":
      return { className: "theme-classic", accent: "#374151", font: "Georgia, 'Times New Roman', serif" };
    case "modern-professional":
      return { className: "theme-modern", accent: "#2563eb", font: "'Segoe UI', Tahoma, sans-serif" };
    case "executive-premium":
      return { className: "theme-executive", accent: "#b45309", font: "Georgia, 'Times New Roman', serif" };
    case "creative-modern":
      return { className: "theme-creative", accent: "#7c3aed", font: "'Segoe UI', Tahoma, sans-serif" };
    default:
      return { className: "theme-minimal", accent: "#111827", font: "Arial, sans-serif" };
  }
}

export function renderResumeHtml(payload: ResumePdfPayload): string {
  const theme = getTheme(payload.templateId);
  const header = renderHeader(payload);
  const body = renderBody(payload);

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      :root {
        --accent: ${theme.accent};
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #ffffff;
        color: #111827;
        font-family: ${theme.font};
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page {
        width: 100%;
        max-width: 760px;
        margin: 0 auto;
        padding: 8px 4px 6px;
      }
      .header {
        text-align: center;
        margin-bottom: 10px;
      }
      .header-main {
        display: block;
      }
      .header-text {
        width: 100%;
      }
      .header h1 {
        margin: 0;
        font-size: 34px;
        line-height: 1.05;
        text-transform: uppercase;
        letter-spacing: 0.6px;
      }
      .profile-photo {
        display: none;
      }
      .header .role {
        margin-top: 4px;
        font-size: 14px;
      }
      .header .contact,
      .header .links {
        margin-top: 3px;
        font-size: 12px;
        line-height: 1.3;
        color: #374151;
      }
      .header .links a { color: var(--accent); text-decoration: none; }

      .section {
        margin-top: 7px;
      }
      .section h2 {
        margin: 0;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        border-bottom: 1px solid #9ca3af;
        padding-bottom: 2px;
        color: var(--accent);
      }
      .section p {
        margin: 5px 0 0;
        font-size: 12px;
        line-height: 1.35;
      }
      ul {
        margin: 4px 0 0 16px;
        padding: 0;
      }
      li {
        font-size: 12px;
        line-height: 1.32;
        margin: 0 0 2px;
      }

      .edu-item { margin-top: 6px; }
      .edu-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
      }
      .edu-title { font-size: 12.5px; font-weight: 700; }
      .edu-date { font-size: 11px; color: #374151; white-space: nowrap; }
      .edu-meta { margin-top: 2px; font-size: 11.5px; color: #374151; }

      .skills-grid { margin-top: 5px; display: grid; gap: 3px; }
      .skill-row {
        display: grid;
        grid-template-columns: 180px 1fr;
        gap: 8px;
        font-size: 12px;
      }
      .skill-row strong { font-weight: 700; }

      .theme-tech .header h1,
      .theme-modern .header h1,
      .theme-creative .header h1 {
        font-size: 32px;
        letter-spacing: 0.3px;
        text-transform: none;
      }
      .theme-tech .header {
        text-align: left;
      }
      .theme-tech .header-main {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: start;
        gap: 14px;
        border-bottom: 1.4px solid #6b7280;
        padding-bottom: 6px;
      }
      .theme-tech .profile-photo {
        display: block;
        width: 62px;
        height: 62px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #9ca3af;
      }
      .theme-tech .header h1 {
        text-transform: uppercase;
        font-size: 31px;
        letter-spacing: 0.5px;
      }
      .theme-tech .section {
        margin-top: 6px;
      }
      .theme-tech .section h2 {
        color: #0f172a;
        border-bottom: 1px solid #9ca3af;
      }
      .theme-tech .skill-row {
        grid-template-columns: 175px 1fr;
      }
      .theme-executive .header h1,
      .theme-classic .header h1 {
        letter-spacing: 0.9px;
      }
      .theme-faang .section h2 {
        color: #111827;
      }
      .theme-minimal .section h2 {
        color: #111827;
        border-color: #d1d5db;
      }
    </style>
  </head>
  <body>
    <main class="page ${theme.className}">
      ${header}
      ${body}
    </main>
  </body>
</html>`;
}
