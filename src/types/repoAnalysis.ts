// Strict RepoAnalysis type with no undefined fields

export type AnalysisStatus = "idle" | "paid" | "processing" | "complete" | "error";

export interface RepoAnalysisSummary {
  niche: string;
  oneLiner: string;
  matchScore: number;
  confidence: number;
}

export interface RepoInfo {
  owner: string;
  name: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  closedIssues: number;
  topics: string[];
  homepage: string | null;
  lastPush: string | null;
}

export interface RepoActivity {
  commits30d: number;
  commits90d: number;
  contributors: number;
  lastCommitDate: string | null;
}

export interface RepoStack {
  primaryLanguage: string;
  languages: Record<string, number>;
  frameworks: string[];
}

export interface RepoQuality {
  hasReadme: boolean;
  hasLicense: boolean;
  hasTests: boolean;
  hasCI: boolean;
  documentationScore: number;
  codeHealthScore: number;
}

export interface RepoRecommendations {
  nextSteps: string[];
  missingPieces: string[];
}

export interface GrantMatchResult {
  program: string;
  ecosystem: string;
  fitScore: number;
  why: string[];
  url?: string;
}

export interface RepoAnalysis {
  status: AnalysisStatus;
  repoUrl: string;
  summary: RepoAnalysisSummary;
  repo: RepoInfo;
  activity: RepoActivity;
  stack: RepoStack;
  quality: RepoQuality;
  recommendations: RepoRecommendations;
  grantMatches: GrantMatchResult[];
  errors: string[];
}

// Factory function that creates a RepoAnalysis with all defaults (never undefined)
export const emptyAnalysis = (repoUrl = ""): RepoAnalysis => ({
  status: "idle",
  repoUrl,
  summary: {
    niche: "Unknown",
    oneLiner: "",
    matchScore: 0,
    confidence: 0,
  },
  repo: {
    owner: "",
    name: "",
    stars: 0,
    forks: 0,
    watchers: 0,
    openIssues: 0,
    closedIssues: 0,
    topics: [],
    homepage: null,
    lastPush: null,
  },
  activity: {
    commits30d: 0,
    commits90d: 0,
    contributors: 0,
    lastCommitDate: null,
  },
  stack: {
    primaryLanguage: "Unknown",
    languages: {},
    frameworks: [],
  },
  quality: {
    hasReadme: false,
    hasLicense: false,
    hasTests: false,
    hasCI: false,
    documentationScore: 0,
    codeHealthScore: 0,
  },
  recommendations: {
    nextSteps: [],
    missingPieces: [],
  },
  grantMatches: [],
  errors: [],
});

// Niche detection keywords
const NICHE_KEYWORDS: Record<string, string[]> = {
  Gaming: ["game", "gaming", "unity", "unreal", "godot", "nft", "metaverse", "web3game"],
  DeFi: ["defi", "dex", "swap", "lending", "yield", "amm", "liquidity", "staking", "vault"],
  Infrastructure: ["infra", "infrastructure", "sdk", "tooling", "devtools", "indexer", "rpc", "node", "wallet"],
  AI: ["ai", "ml", "machine-learning", "agent", "llm", "gpt", "model", "neural", "data"],
  Social: ["social", "dao", "community", "governance", "identity", "reputation", "messaging"],
  NFT: ["nft", "collectible", "marketplace", "art", "creator", "mint"],
  "Public Goods": ["public-goods", "opensource", "grants", "funding", "commons", "retroactive"],
  RWA: ["rwa", "real-world", "tokenization", "asset", "enterprise", "compliance"],
};

// Derive niche from topics, languages, and repo name (safe, handles nullish)
export function deriveNiche(
  topics: string[] | null | undefined,
  languages: Record<string, number> | null | undefined,
  repoName: string | null | undefined
): string {
  const safeTopics = topics ?? [];
  const safeLanguages = languages ?? {};
  const safeName = repoName ?? "";
  
  const searchText = [
    ...safeTopics.map((t) => (t ?? "").toLowerCase()),
    safeName.toLowerCase(),
    ...Object.keys(safeLanguages).map((l) => l.toLowerCase()),
  ].join(" ");

  for (const [niche, keywords] of Object.entries(NICHE_KEYWORDS)) {
    if (keywords.some((kw) => searchText.includes(kw))) {
      return niche;
    }
  }

  // Fallback based on primary language
  const langEntries = Object.entries(safeLanguages);
  const primaryLang = langEntries.sort(([, a], [, b]) => b - a)[0]?.[0] || "";
  if (["Solidity", "Vyper", "Move", "Rust"].includes(primaryLang)) {
    return "Infrastructure";
  }
  if (["Python", "Jupyter Notebook"].includes(primaryLang)) {
    return "AI";
  }

  return "General";
}

// Get grant filters based on analysis (safe, handles nullish values)
export function getGrantFiltersFromAnalysis(analysis: RepoAnalysis | null | undefined): Record<string, string> {
  const filters: Record<string, string> = {};
  
  if (!analysis) return filters;

  const niche = analysis.summary?.niche;
  if (niche && niche !== "Unknown") {
    filters.niche = niche;
  }

  const primaryLanguage = analysis.stack?.primaryLanguage;
  if (primaryLanguage && primaryLanguage !== "Unknown") {
    filters.lang = primaryLanguage;
  }

  const commits30d = analysis.activity?.commits30d;
  if (commits30d && commits30d > 0) {
    filters.commits30d = String(commits30d);
  }

  const matchScore = analysis.summary?.matchScore;
  if (matchScore && matchScore > 0) {
    filters.scoreMin = String(Math.max(0, matchScore - 20));
  }

  // Add ecosystem hints from topics (safe access)
  const topics = analysis.repo?.topics ?? [];
  const ecosystemTopics = topics.filter((t) =>
    ["ethereum", "avalanche", "solana", "polygon", "arbitrum", "optimism", "base", "starknet"].includes(
      (t ?? "").toLowerCase()
    )
  );
  if (ecosystemTopics.length > 0) {
    filters.ecosystem = ecosystemTopics[0];
  }

  return filters;
}

// Build grants URL with filters (safe, never throws)
export function buildGrantsUrlFromAnalysis(analysis: RepoAnalysis | null | undefined): string {
  if (!analysis) return '/grants';
  
  const filters = getGrantFiltersFromAnalysis(analysis) ?? {};
  const safeParams = Object.entries(filters).reduce((acc, [k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) {
      acc[k] = String(v);
    }
    return acc;
  }, {} as Record<string, string>);
  
  const params = new URLSearchParams(safeParams);
  const queryString = params.toString();
  return queryString ? `/grants?${queryString}` : '/grants';
}
