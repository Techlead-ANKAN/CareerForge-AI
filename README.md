# CareerForge AI

> AI-powered career toolkit built with Next.js, TypeScript, Tailwind CSS, and Google Gemini 2.0 Flash.

---

## Features

# CareerForge AI 🚀
**The Ultimate AI-Powered Career Success Suite**

CareerForge is a comprehensive platform designed to bridge the gap between candidates and their dream roles using state-of-the-art Generative AI. From ATS-optimized LaTeX resumes to real-time 3D interview simulations, CareerForge provides every tool a modern job seeker needs.

---

## 🌟 New Features & Major Upgrades

### 1. 3D Live Interview Room (Upgrade)
*Beyond chat-based prep—experience a real-time, face-to-face simulation.*
- **Interactive 3D Avatar:** An AI-driven 3D interviewer with real-time lip-syncing and facial expressions.
- **Voice-to-Voice Interaction:** Hands-free interview experience using high-accuracy Speech-to-Text (STT) and low-latency Text-to-Speech (TTS).
- **Behavioral & Technical Depth:** AI personas adapt to your target role (Technical, System Design, HR, or Behavioral).
- **Real-Time Feedback:** Get instant analysis on your verbal responses and confidence.

### 2. Job Market Analyser
*Data-driven insights for the Indian tech ecosystem.*
- **Market Benchmarking:** Scans real-time job data (via Adzuna) to provide salary ranges (LPA) for specific roles in top Indian tech hubs (Bangalore, Pune, Kolkata, etc.).
- **Compatibility Scoring:** Compares your current resume against market trends to give you a "Match Score."
- **Skill-Gap Strategy:** Identifies "Critical" vs "Nice-to-have" missing skills required to reach the higher end of the salary bracket.
- **Interview Cheat-Sheets:** Generates role-specific questions based on current market demands.

### 3. Project Verifier & Analysis
*Turn your projects into your strongest proof of work.*
- **Real-World Comparison:** Compares your personal projects against verified open-source benchmarks and real-world industry standards.
- **Complexity Assessment:** Analyzes your tech stack, architecture, and feature depth to see how "Industry Ready" your projects are.
- **Optimization Suggestions:** AI-driven advice on how to improve project READMEs, add missing professional features, and scale your code.

---

## 🛠️ Core Features

### 1. Resume Builder
- **LaTeX Engine:** Select from 6 professional templates (Modern, Classic, Tech, Executive, etc.).
- **JD-Targeted:** AI generates ATS-optimized content specifically tailored to a provided Job Description.
- **Auto-Fix Logic:** Robust server-side LaTeX compilation with 2-stage AI error correction.
- **Profile Integration:** Support for circular-clipped profile photos and structured education/GPA forms.

### 2. AI Resume Enhancer
- **Multi-Level Polish:** Choose from Basic Polish, Professional Upgrade, Executive Rewrite, or Role-Targeted tailoring.
- **Quantified Achievements:** Automatically transforms vague duties into bullet points with measurable impact.

### 3. ATS Checker
- **Score Analysis:** Detailed 0–100 scoring based on formatting, keyword density, and content quality.
- **Keyword Mapping:** Visual breakdown of "Found" vs. "Missing" keywords from the Job Description.

### 4. CV & Cover Letter Generator
- **Personalized Cover Letters:** High-conversion letters exported via LaTeX.
- **Academic CVs:** Specialized templates for research and academic applications.
- **Networking Emails:** Professional cold-outreach templates for LinkedIn and Email.

---


## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **AI** | Google Gemini 2.0 Flash via `@google/generative-ai` |
| **PDF Generation** | Server-side LaTeX → PDF via `pdflatex` (TeX Live) |
| **PDF Parsing** | `pdfjs-dist` (client-side JD upload extraction) |
| **Markdown** | `react-markdown` |
| **Voice** | Web Speech API (Speech Recognition + Speech Synthesis) |
| **Icons** | Lucide React, React Icons |

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

### 1. Node.js (v18 or higher)

Check if installed:
```bash
node --version   # Should be v18+
npm --version
```

If not installed, download from [nodejs.org](https://nodejs.org/) or use nvm:
```bash
# Install via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 2. LaTeX Distribution (required for PDF export)

PDF generation uses `pdflatex` under the hood. You need a TeX Live installation with extra packages for fonts, icons, and TikZ graphics.

**Ubuntu / Debian:**
```bash
sudo apt-get update
sudo apt-get install -y \
  texlive-latex-base \
  texlive-latex-extra \
  texlive-latex-recommended \
  texlive-fonts-recommended \
  texlive-fonts-extra \
  texlive-pictures
```

**Fedora / RHEL:**
```bash
sudo dnf install -y \
  texlive-scheme-medium \
  texlive-collection-fontsrecommended \
  texlive-collection-fontsextra \
  texlive-collection-latexextra \
  texlive-fontawesome5
```

**macOS (via Homebrew):**
```bash
brew install --cask mactex-no-gui
# Or for a smaller install:
brew install --cask basictex
sudo tlmgr update --self
sudo tlmgr install fontawesome5 enumitem titlesec parskip charter hyperref xcolor pgf
```

**Windows:**
- Install [MiKTeX](https://miktex.org/download) (auto-installs missing packages)
- Or install [TeX Live for Windows](https://tug.org/texlive/windows.html)
- Make sure `pdflatex` is in your system PATH

**Verify installation:**
```bash
pdflatex --version
# Should output something like: pdfTeX 3.141592653-2.6-1.40.25 (TeX Live)

# Verify required packages:
kpsewhich fontawesome5.sty    # Should return a path
kpsewhich enumitem.sty        # Should return a path
kpsewhich tikz.sty            # Should return a path
```

### 3. Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key (free tier available)
3. You'll enter this key in the app's **Settings** page after setup

---

### 4. Set up Environment Variables
   - `ADZUNA_APP_ID`
   - `ADZUNA_APP_KEY`
You can get these by registering in Adzuna official site

---

## Installation

### Clone the repository

```bash
git clone https://github.com/Techlead-ANKAN/CareerForge-AI.git
cd CareerForge-AI
```

### Install Node.js dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Configure your API key

1. Open [http://localhost:3000/settings](http://localhost:3000/settings)
2. Enter your **Google Gemini API key**
3. Click Save — the key is stored in your browser's localStorage

---

## Production Build

```bash
npm run build
npm start
```

This creates an optimized production build and starts the server on port 3000.

---

## Key LaTeX Packages Used

The resume templates rely on these LaTeX packages (installed via `texlive-latex-extra`, `texlive-fonts-extra`, and `texlive-pictures`):

| Package | Purpose |
|---------|---------|
| `fontawesome5` | Contact icons (email, phone, GitHub, LinkedIn) |
| `tikz` / `pgf` | Circular photo clipping, sidebar backgrounds, decorative elements |
| `xcolor` | Custom colors for accents and sections |
| `enumitem` | Compact bullet point lists |
| `hyperref` | Clickable links |
| `geometry` | Page margins |
| `titlesec` | Custom section header formatting |
| `parskip` | Paragraph spacing |
| `charter` | Serif font (Executive Premium template) |
| `graphicx` | Profile photo inclusion |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home / dashboard
│   ├── layout.tsx                  # Global layout with sidebar
│   ├── globals.css                 # Global styles (dark theme)
│   ├── resume-builder/page.tsx     # Resume builder (6 templates, photo, JD upload)
│   ├── ai-enhance/page.tsx         # AI enhancement (4 levels)
│   ├── ats-checker/page.tsx        # ATS scoring
│   ├── cv-generator/page.tsx       # Cover letter, CV & email generator
│   ├── interview-prep/page.tsx     # Live interview prep (voice)
│   ├── settings/page.tsx           # API key configuration
│   └── api/
│       └── latex-to-pdf/route.ts   # LaTeX → PDF server API
├── components/
│   └── Sidebar.tsx                 # Navigation sidebar
├── lib/
│   ├── gemini.ts                   # Gemini API client & utilities
│   └── templates.ts                # 6 LaTeX resume template definitions
└── types/
    └── speech.d.ts                 # Web Speech API TypeScript types
```

---

## Troubleshooting

### "LaTeX compilation failed" on PDF download

- **Missing packages:** Run the full TeX Live install command above. The most common missing package is `fontawesome5` (in `texlive-fonts-extra`).
- **`pdflatex` not found:** Ensure TeX Live is installed and `pdflatex` is in your PATH. Run `which pdflatex` to verify.
- **TikZ/PGF errors (`\pgfutil@next`):** The app has a built-in auto-fix that retries compilation up to 2 times. If it still fails, try regenerating the resume or switching to the **Minimal Clean** or **Classic Elegant** template (no TikZ).

### "Please configure your Gemini API key"

Go to [http://localhost:3000/settings](http://localhost:3000/settings) and enter your API key. It's saved in `localStorage`.

### Port 3000 already in use

```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9
# Then restart
npm run dev
```

### PDF upload for Job Description shows garbled text

The app uses `pdfjs-dist` for client-side PDF text extraction. If extraction fails, try copying the JD text manually into the text field.

---

## License

MIT
