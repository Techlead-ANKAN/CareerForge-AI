/**
 * Local ATS Scorer — no API dependency
 * Scores resumes based on keyword matching against job requirements
 */

interface KeywordMatch {
  word: string;
  frequency: number;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractKeywords(text: string): KeywordMatch[] {
  const cleaned = text.toLowerCase();
  
  // Technical keywords & skills
  const techKeywords = [
    "java", "python", "javascript", "typescript", "react", "node", "express",
    "sql", "mongodb", "postgresql", "mysql", "docker", "kubernetes", "aws",
    "azure", "gcp", "git", "linux", "html", "css", "angular", "vue",
    "spring", "django", "flask", "fastapi", "golang", "rust", "c++", "c#",
    "php", "ruby", "scala", "kotlin", "swift", "elixir",
    "rest", "graphql", "grpc", "microservices", "devops", "ci/cd",
    "agile", "scrum", "jira", "confluence", "jenkins", "gitlab", "github",
    "firebase", "supabase", "redis", "elasticsearch", "kafka", "rabbitmq",
  ];

  // Experience keywords
  const experienceKeywords = [
    "experience", "expertise", "proficiency", "skilled", "expert",
    "senior", "lead", "architect", "developer", "engineer", "analyst",
    "years", "decade", "experienced", "veteran",
  ];

  // Education keywords
  const educationKeywords = [
    "degree", "bachelor", "master", "phd", "diploma", "certificate",
    "university", "college", "institute", "graduated", "graduation",
  ];

  // Soft skills
  const softSkillsKeywords = [
    "communication", "leadership", "teamwork", "collaboration", "problem solving",
    "analytical", "creative", "organized", "detail oriented", "initiative",
  ];

  const allKeywords = [
    ...techKeywords,
    ...experienceKeywords,
    ...educationKeywords,
    ...softSkillsKeywords,
  ];

  const matches: Map<string, number> = new Map();

  for (const keyword of allKeywords) {
    const escapedKeyword = escapeRegExp(keyword);
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, "gi");
    const found = cleaned.match(regex);
    if (found) {
      matches.set(keyword, found.length);
    }
  }

  return Array.from(matches.entries())
    .map(([word, frequency]) => ({ word, frequency }))
    .sort((a, b) => b.frequency - a.frequency);
}

function calculateMatchScore(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string
): number {
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobTitle + " " + jobDescription + " " + jobRequirements);

  // Get top 30 job keywords
  const topJobKeywords = new Set(jobKeywords.slice(0, 30).map((k) => k.word));

  // Count how many job keywords appear in resume
  let matchCount = 0;
  let weightedScore = 0;

  for (const kw of resumeKeywords) {
    if (topJobKeywords.has(kw.word)) {
      matchCount++;
      // Weight by frequency (up to 5x multiplier)
      const weight = Math.min(kw.frequency, 5);
      weightedScore += weight;
    }
  }

  // Base score: percentage of job keywords found in resume
  const baseScore = Math.min((matchCount / Math.max(topJobKeywords.size, 1)) * 100, 100);

  // Bonus for high-frequency matches
  const frequencyBonus = Math.min((weightedScore / 15) * 10, 10);

  // Penalize if resume is too short (incomplete)
  const lengthPenalty = resumeText.trim().length < 300 ? -15 : 0;

  const finalScore = Math.max(Math.round(baseScore + frequencyBonus + lengthPenalty), 10);

  console.log(`[Local ATS] Matched ${matchCount}/${topJobKeywords.size} keywords, Score: ${finalScore}`);
  return finalScore;
}

export { calculateMatchScore };
