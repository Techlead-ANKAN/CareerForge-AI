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
    promptInstructions: `Create a MODERN PROFESSIONAL resume using this EXACT LaTeX structure:

\\documentclass[a4paper,10pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=0pt]{geometry}
\\usepackage{xcolor,tikz,fontawesome5,enumitem,hyperref,graphicx,parskip}
\\setcounter{secnumdepth}{0}
\\pagestyle{empty}

CRITICAL DESIGN RULES:
- Page background MUST be WHITE — the resume will be printed on white paper
- Use minipage for two-column layout: left sidebar (0.32\\linewidth) and right main area (0.65\\linewidth)
- Sidebar: use a LIGHT colored background (\\definecolor{sidebar}{HTML}{f0f4ff} — light blue-gray) NOT dark
- All text must be dark colored for readability on white/light backgrounds
- Right column: white background with all main sections
- NEVER use \\section numbering — use \\section* or set \\setcounter{secnumdepth}{0}
- Section titles: use custom commands with colored underlines, NO numbered sections like "1 Summary"
- Photo: place circular clipped photo at top of sidebar using tikz \\clip circle INSIDE a \\begin{scope}...\\end{scope}
- Contact info in sidebar with fontawesome5 icons: \\faIcon{envelope}, \\faIcon{phone}, \\faIcon{map-marker-alt}, \\faIcon{linkedin}, \\faIcon{github}
- Skills in sidebar as small rounded tags/pills using \\colorbox{lightaccent}{\\small SkillName} (NOT tikz nodes)
- Right column sections: Professional Summary, Experience, Education, Projects, Achievements
- Experience entries: \\textbf{Role} at \\textbf{Company} \\hfill dates, then bullet items
- Use \\begin{itemize}[leftmargin=*,nosep,label={\\textbullet}] for tight bullets
- Define primary color: \\definecolor{primary}{HTML}{2563EB}
- TIKZ SAFETY: wrap all \\clip in scope, no \\foreach, no pgfmath, keep tikz minimal
- Fit everything on ONE page with compact spacing`,
  },
  {
    id: "classic-elegant",
    name: "Classic Elegant",
    description: "Traditional single-column. Timeless design ideal for corporate and finance roles",
    color: "from-gray-600 to-gray-800",
    preview: "🎩",
    hasPhoto: false,
    promptInstructions: `Create a CLASSIC ELEGANT resume using this EXACT LaTeX structure:

\\documentclass[a4paper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{charter}
\\usepackage[left=0.75in,right=0.75in,top=0.6in,bottom=0.6in]{geometry}
\\usepackage{enumitem,hyperref,titlesec,xcolor,parskip}
\\setcounter{secnumdepth}{0}
\\pagestyle{empty}

CRITICAL DESIGN RULES:
- Single column, classic layout — NO graphics, NO tikz, NO photos
- Name: \\begin{center}{\\LARGE\\bfseries NAME}\\end{center} at top
- Contact: single centered line below name using middots: email · phone · location · LinkedIn
- Section headers: \\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{} followed by \\titlerule
- NEVER numbered sections — use \\section* or \\setcounter{secnumdepth}{0}
- Experience: \\textbf{Company} \\hfill Location \\\\ \\textit{Role Title} \\hfill \\textit{Date Range}
- Then bullet items with \\begin{itemize}[leftmargin=*,nosep]
- Education: same format as experience with GPA/marks
- Skills: comma-separated list grouped by category
- Keep to 1 page, very clean scannable layout
- Black and dark gray only, serif font (charter/palatino)`,
  },
  {
    id: "creative-modern",
    name: "Creative Modern",
    description: "Bold accent colors, icons, skill bars, and a creative header with photo. Great for tech & design",
    color: "from-purple-500 to-pink-600",
    preview: "🎨",
    hasPhoto: true,
    promptInstructions: `Create a CREATIVE MODERN resume using this EXACT LaTeX structure:

\\documentclass[a4paper,10pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[left=0.6in,right=0.6in,top=0.4in,bottom=0.5in]{geometry}
\\usepackage{xcolor,tikz,fontawesome5,enumitem,hyperref,titlesec,graphicx,parskip}
\\setcounter{secnumdepth}{0}
\\pagestyle{empty}

CRITICAL DESIGN RULES:
- Page background MUST be WHITE
- Header: A colored accent banner/strip at the top (not full dark background) with name in bold dark or white text
- Photo circle on the right side of the header using tikz \\clip circle INSIDE a \\begin{scope}...\\end{scope} (if provided)
- Contact row below header with fontawesome5 icons: \\faIcon{envelope} email \\quad \\faIcon{phone} phone etc.
- Section headers: colored bold text with a thick left accent border using \\textcolor{accent}{\\rule{3pt}{12pt}} before section name
- NEVER numbered sections — use \\section* or set secnumdepth to 0
- Skills: display as colored bars using \\colorbox (NOT tikz progress bars — use \\textcolor{accent}{\\rule{Xcm}{6pt}} on \\textcolor{gray!30}{\\rule{3cm}{6pt}} background)
- Experience: \\textcolor{accent}{\\textbf{Company}} \\hfill dates, role italic below, then bullets
- Use \\begin{itemize}[leftmargin=*,nosep] for compact bullets
- Colors: \\definecolor{accent}{HTML}{8B5CF6} \\definecolor{secondary}{HTML}{EC4899}
- All text must be dark (black/dark gray) for readability on white background
- TIKZ SAFETY: wrap all \\clip in scope, no \\foreach, no pgfmath, keep tikz minimal
- Single column layout, fit on ONE page
- Professional but visually interesting`,
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Ultra-clean, lots of whitespace. Maximum readability and ATS-friendliness",
    color: "from-emerald-500 to-teal-600",
    preview: "✨",
    hasPhoto: false,
    promptInstructions: `Create a MINIMAL CLEAN resume using this EXACT LaTeX structure:

\\documentclass[a4paper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage[left=0.8in,right=0.8in,top=0.7in,bottom=0.7in]{geometry}
\\usepackage{enumitem,hyperref,titlesec,xcolor,parskip}
\\setcounter{secnumdepth}{0}
\\pagestyle{empty}

CRITICAL DESIGN RULES:
- Ultra-minimalist single-column layout — NO graphics, NO tikz, NO photos, NO colors
- Pure black and white only
- Name at top left: {\\LARGE\\bfseries Name} on its own line, large and clean
- Contact on next line: email \\textperiodcentered\\space phone \\textperiodcentered\\space location \\textperiodcentered\\space LinkedIn
- Section headers: \\titleformat{\\section}{\\normalsize\\bfseries\\uppercase}{}{0em}{} with thin \\titlerule below
- NEVER numbered sections — set secnumdepth to 0
- Experience: \\textbf{Role}, Company \\hfill Date range, then tight bullet points
- \\begin{itemize}[leftmargin=12pt,nosep,label={--}] for minimal bullets
- Maximum ATS compatibility — no tables, no columns, no graphics, no fancy formatting
- Only standard fonts, no special packages beyond basics
- Clean whitespace between sections, content-dense bullets
- MUST fit on 1 page`,
  },
  {
    id: "tech-developer",
    name: "Tech Developer",
    description: "Designed for developers. GitHub-style layout with skill tags, project links, and code-inspired design",
    color: "from-cyan-500 to-blue-600",
    preview: "💻",
    hasPhoto: true,
    promptInstructions: `Create a TECH DEVELOPER resume using this EXACT LaTeX structure:

\\documentclass[a4paper,10pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[left=0.6in,right=0.6in,top=0.5in,bottom=0.5in]{geometry}
\\usepackage{xcolor,tikz,fontawesome5,enumitem,hyperref,titlesec,graphicx,parskip}
\\setcounter{secnumdepth}{0}
\\pagestyle{empty}

CRITICAL DESIGN RULES:
- Page background MUST be WHITE — no dark theme
- Header: Name in large bold dark text with a colored accent line (\\textcolor{accent}{\\rule{\\linewidth}{2pt}}) below
- Contact row with fontawesome5 icons: \\faIcon{github} \\faIcon{linkedin} \\faIcon{envelope} \\faIcon{phone}
- Photo (if provided): small circular photo in top-right corner using tikz \\clip circle INSIDE a \\begin{scope}...\\end{scope}
- NEVER numbered sections — use \\section* or secnumdepth 0
- Section headers: \\textcolor{accent}{\\textbf{\\uppercase{Section Name}}} with thin accent-colored \\rule below
- Skills: display as rounded tag pills using \\colorbox{tagbg}{\\small SkillName} (prefer colorbox over tikz nodes)
- Define: \\definecolor{accent}{HTML}{06b6d4} \\definecolor{tagbg}{HTML}{e0f2fe}
- Technical Skills organized by category: Languages, Frameworks, Tools, Databases
- Projects section prominent: \\textbf{Project Name} | {\\small tech stack tags} \\\\ description with bullets
- Experience: \\textbf{Role} at \\textbf{Company} \\hfill dates, tech stack emphasized
- All text dark (black/charcoal) for readability
- TIKZ SAFETY: wrap all \\clip in scope, no \\foreach, no pgfmath, keep tikz minimal
- Fit on ONE page`,
  },
  {
    id: "executive-premium",
    name: "Executive Premium",
    description: "Sophisticated two-column layout for senior roles. Gold accents, refined typography",
    color: "from-amber-500 to-yellow-600",
    preview: "👔",
    hasPhoto: true,
    promptInstructions: `Create an EXECUTIVE PREMIUM resume using this EXACT LaTeX structure:

\\documentclass[a4paper,10pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{charter}
\\usepackage[margin=0pt]{geometry}
\\usepackage{xcolor,tikz,fontawesome5,enumitem,hyperref,titlesec,graphicx,parskip}
\\setcounter{secnumdepth}{0}
\\pagestyle{empty}

CRITICAL DESIGN RULES:
- Page background MUST be WHITE
- Use minipage for two columns: left column (0.33\\linewidth) and right column (0.64\\linewidth)
- Left column: LIGHT warm gray background (\\definecolor{leftbg}{HTML}{faf8f5}) using tikz filled rectangle — NOT dark
- Right column: white background with name in large navy bold at top, gold accent line below name
- NEVER use numbered sections — use \\section* or secnumdepth 0
- Section headers in right column: \\textcolor{navy}{\\textbf{\\uppercase{Section}}} with gold \\rule below
- Section headers in left column: \\textcolor{gold}{\\textbf{Section}} simple bold
- Colors: \\definecolor{gold}{HTML}{D97706} \\definecolor{navy}{HTML}{1e3a5f}
- All text must be dark for readability on white/light backgrounds
- Professional Summary at top of right column
- Experience: \\textbf{Role} \\hfill dates \\\\ \\textit{Company} \\\\ bullets
- Photo: circular clipped at top of left column INSIDE a \\begin{scope}...\\end{scope}
- Use charter serif font for elegance
- TIKZ SAFETY: wrap all \\clip in scope, no \\foreach, no pgfmath, keep tikz minimal
- Refined, sophisticated look — not flashy
- Fit on ONE page`,
  },
];

export function getTemplateById(id: string): ResumeTemplate {
  return RESUME_TEMPLATES.find((t) => t.id === id) || RESUME_TEMPLATES[0];
}
