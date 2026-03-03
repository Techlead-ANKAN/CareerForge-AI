# CareerForge AI

> AI-powered career toolkit built with Next.js, TypeScript, Tailwind CSS, and Google Gemini 2.0 Flash.

## Features

### 1. Resume Builder
- Input your details and target role / job description
- AI generates a complete, ATS-optimized **LaTeX resume**
- **Download as PDF** (server-side LaTeX to PDF conversion)
- Copy LaTeX code for manual editing

### 2. AI Resume Enhancer
- **4 enhancement levels:**
  - **Basic Polish** — Grammar, spelling, formatting fixes
  - **Professional Upgrade** — Action verbs, quantified achievements, ATS keywords
  - **Executive Rewrite** — Complete professional rewrite with strategic positioning
  - **Role-Targeted** — Tailored to a specific job description

### 3. ATS Checker
- Score your resume against job descriptions (0-100)
- Section-by-section analysis (formatting, keywords, content quality, etc.)
- Keyword match analysis (found vs. missing)
- Detailed actionable feedback

### 4. CV & Cover Letter Generator
- **Cover Letter** — Professional, personalized cover letters with LaTeX + PDF export
- **Academic CV** — Comprehensive academic curriculum vitae
- **Networking Email** — Professional cold email introductions

### 5. Live Interview Prep
- Real-time AI interview simulation
- **Voice interaction** — Speak your answers via microphone, AI speaks back
- Multiple interview types: Technical, Behavioral, System Design, HR, Custom
- Adjustable difficulty (Easy/Medium/Hard)
- Conversational history for natural follow-ups

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **AI:** Google Gemini 2.0 Flash via `@google/generative-ai`
- **PDF:** Server-side LaTeX → PDF conversion via `pdflatex`
- **Voice:** Web Speech API (Speech Recognition + Speech Synthesis)
- **Icons:** Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- LaTeX distribution (`texlive-latex-base`, `texlive-latex-extra`, `texlive-fonts-recommended`)
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Install

```bash
git clone https://github.com/Techlead-ANKAN/CareerForge-AI.git
cd CareerForge-AI
npm install
```

### Install LaTeX (Ubuntu/Debian)

```bash
sudo apt-get install texlive-latex-base texlive-latex-extra texlive-fonts-recommended
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to **Settings**, and enter your Gemini API key.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home / dashboard
│   ├── layout.tsx                # Global layout with sidebar
│   ├── globals.css               # Global styles
│   ├── resume-builder/page.tsx   # Resume builder
│   ├── ai-enhance/page.tsx       # AI enhancement (4 levels)
│   ├── ats-checker/page.tsx      # ATS scoring
│   ├── cv-generator/page.tsx     # Cover letter & CV
│   ├── interview-prep/page.tsx   # Live interview prep
│   ├── settings/page.tsx         # API key configuration
│   └── api/latex-to-pdf/route.ts # LaTeX → PDF API
├── components/
│   └── Sidebar.tsx               # Navigation sidebar
├── lib/
│   └── gemini.ts                 # Gemini API utilities
└── types/
    └── speech.d.ts               # Web Speech API types
```

## License

MIT
