// LaTeX resume template definitions

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  preview: string; // emoji/icon indicator
  hasPhoto: boolean;
  promptInstructions: string;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Clean two-column design with colored sidebar, profile photo support, and modern typography",
    color: "from-blue-500 to-indigo-600",
    preview: "💼",
    hasPhoto: true,
    promptInstructions: `Create a MODERN PROFESSIONAL resume with these LaTeX design rules:
- Use a two-column layout: left sidebar (30%) with dark/colored background for contact info, photo, and skills; right main area (70%) for experience, education, projects
- Use \\documentclass[a4paper,10pt]{article}
- Required packages: geometry, xcolor, tikz, fontawesome5, enumitem, hyperref, titlesec, multicol, graphicx, fontenc, inputenc, parskip, tabularx
- Define a primary color: \\definecolor{primary}{HTML}{2563EB} and \\definecolor{sidebar}{HTML}{1e293b}
- Use tikz for the sidebar background: a filled rectangle on the left
- In the sidebar: photo (circular clipped if provided), name, contact details with fontawesome icons (\\faEnvelope, \\faPhone, \\faMapMarker, \\faLinkedin, \\faGithub), skills as tag-style items
- Main area: Professional Summary, Experience, Education, Projects, Achievements sections
- Use \\titlerule or colored underlines for section headings
- Use compact spacing, no excessive whitespace
- Ensure it compiles with pdflatex`,
  },
  {
    id: "classic-elegant",
    name: "Classic Elegant",
    description: "Traditional single-column. Timeless design ideal for corporate and finance roles",
    color: "from-gray-600 to-gray-800",
    preview: "🎩",
    hasPhoto: false,
    promptInstructions: `Create a CLASSIC ELEGANT resume with these LaTeX design rules:
- Single column, clean traditional layout
- Use \\documentclass[a4paper,11pt]{article}
- Required packages: geometry, enumitem, hyperref, titlesec, fontenc, inputenc, parskip, xcolor, tabularx
- Set margins: \\geometry{left=0.75in,right=0.75in,top=0.6in,bottom=0.6in}
- Name centered at top in large bold, contact info on one line below with vertical bars as separators
- Section headers: uppercase, bold, with a full-width horizontal rule underneath (\\titlerule)
- Experience entries: Company and role bold, dates right-aligned, bullet points with tight spacing
- Use Georgia/Times-like feel: add \\usepackage{charter} or \\usepackage{palatino}
- Minimal color - use black and dark gray only
- Keep it 1 page, very clean and scannable
- Ensure it compiles with pdflatex`,
  },
  {
    id: "creative-modern",
    name: "Creative Modern",
    description: "Bold accent colors, icons, skill bars, and a creative header with photo. Great for tech & design",
    color: "from-purple-500 to-pink-600",
    preview: "🎨",
    hasPhoto: true,
    promptInstructions: `Create a CREATIVE MODERN resume with these LaTeX design rules:
- Use a striking header section with a colored band/banner at the top
- Use \\documentclass[a4paper,10pt]{article}
- Required packages: geometry, xcolor, tikz, fontawesome5, enumitem, hyperref, titlesec, graphicx, fontenc, inputenc, parskip, progressbar or tikz for skill bars, tabularx
- Define vibrant colors: \\definecolor{accent}{HTML}{8B5CF6} \\definecolor{secondary}{HTML}{EC4899}
- Header: colored background band with name in white/large text, photo circle on the right (if provided), contact info with icons below
- Section headers: colored, bold, with decorative left border or accent line
- Skills: display as progress bars or filled circles using tikz
- Use icons (fontawesome5) for contact details and section decorations
- Experience: clean entries with accent-colored company names and dates
- Add subtle color touches throughout without overdoing it
- Keep it professional despite being creative
- Ensure it compiles with pdflatex`,
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Ultra-clean, lots of whitespace. Maximum readability and ATS-friendliness",
    color: "from-emerald-500 to-teal-600",
    preview: "✨",
    hasPhoto: false,
    promptInstructions: `Create a MINIMAL CLEAN resume with these LaTeX design rules:
- Ultra-minimalist single-column layout with generous whitespace
- Use \\documentclass[a4paper,11pt]{article}
- Required packages: geometry, enumitem, hyperref, titlesec, fontenc, inputenc, parskip, xcolor
- Set margins: \\geometry{left=1in,right=1in,top=0.8in,bottom=0.8in}
- Use a clean sans-serif font: \\usepackage[sfdefault]{roboto} or \\renewcommand{\\familydefault}{\\sfdefault}
- Name: large and clean at top left, no boxes or colors
- Contact: single line, items separated by middot (·)
- Section headers: simple bold text with subtle thin line underneath
- Very tight bullet points with minimal indentation
- No colors at all - pure black and white
- Maximum ATS compatibility - no tables, no columns, no graphics
- Focus on content density and readability
- Ensure it compiles with pdflatex`,
  },
  {
    id: "tech-developer",
    name: "Tech Developer",
    description: "Designed for developers. GitHub-style layout with skill tags, project links, and code-inspired design",
    color: "from-cyan-500 to-blue-600",
    preview: "💻",
    hasPhoto: true,
    promptInstructions: `Create a TECH DEVELOPER resume with these LaTeX design rules:
- Developer-focused layout with code/tech aesthetic
- Use \\documentclass[a4paper,10pt]{article}
- Required packages: geometry, xcolor, tikz, fontawesome5, enumitem, hyperref, titlesec, graphicx, fontenc, inputenc, parskip, fancyhdr, tabularx
- Define colors: \\definecolor{darkbg}{HTML}{0f172a} \\definecolor{accent}{HTML}{06b6d4} \\definecolor{tag}{HTML}{1e293b}
- Header: Name bold with a colored accent line, contact info with \\faGithub \\faLinkedin \\faEnvelope icons, optional photo
- Skills section: display as rounded tag/badge shapes using tikz (like GitHub topic tags)
- Projects section prominent: project name, tech stack tags, description, links
- Experience: emphasized tech stack for each role
- Use monospace font for technical terms: \\texttt{} 
- Section dividers: thin accent-colored lines
- Add a "Technical Skills" section organized by category (Languages, Frameworks, Tools, etc.)
- Ensure it compiles with pdflatex`,
  },
  {
    id: "executive-premium",
    name: "Executive Premium",
    description: "Sophisticated two-column layout for senior roles. Gold accents, refined typography",
    color: "from-amber-500 to-yellow-600",
    preview: "👔",
    hasPhoto: true,
    promptInstructions: `Create an EXECUTIVE PREMIUM resume with these LaTeX design rules:
- Sophisticated two-column layout for senior/executive positions
- Use \\documentclass[a4paper,10pt]{article}
- Required packages: geometry, xcolor, tikz, fontawesome5, enumitem, hyperref, titlesec, graphicx, fontenc, inputenc, parskip, tabularx
- Define colors: \\definecolor{gold}{HTML}{D97706} \\definecolor{navy}{HTML}{1e3a5f} \\definecolor{darktext}{HTML}{1f2937}
- Left column (35%): Photo (if provided), contact info, skills, certifications, languages
- Right column (65%): Name in large navy text, gold accent line, professional summary, experience, education
- Use gold accent lines and navy text for headers
- Section headers: navy colored, small caps or uppercase, with gold underline
- Experience: sophisticated formatting with company logo placeholder area, role title bold
- Use \\usepackage{charter} or similar serif font for elegance
- Professional summary section at top of main column
- Keep it refined, not flashy
- Ensure it compiles with pdflatex`,
  },
];

export function getTemplateById(id: string): ResumeTemplate {
  return RESUME_TEMPLATES.find((t) => t.id === id) || RESUME_TEMPLATES[0];
}
