// Signal Engine Scoring Logic
// Deterministic, transparent scoring with explainability

import type { 
  RawSignal, 
  ScoreBreakdown, 
  ProjectScores, 
  ScoreType,
  RiskFlag,
  NextAction,
  GrantRecommendation,
  OpportunityCard
} from './types';
import type { RepoAnalysisResult, GrantMatch } from '@/lib/types';
import { 
  SIGNAL_WEIGHTS, 
  SCORE_TYPE_WEIGHTS, 
  SIGNAL_THRESHOLDS,
  README_QUALITY_INDICATORS,
  ECOSYSTEM_KEYWORDS,
  GRANT_CATEGORY_TAGS,
  RISK_THRESHOLDS
} from './config';

// ============= SAFE ACCESSORS (prevent undefined crashes) =============

function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  return fallback;
}

function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  return fallback;
}

function safeArray<T>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) return value as T[];
  return fallback;
}

function safeObject<T extends Record<string, unknown>>(value: unknown, fallback: T): T {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as T;
  return fallback;
}

// ============= SIGNAL EXTRACTION =============

export function extractSignals(result: RepoAnalysisResult | null | undefined): RawSignal[] {
  // Return empty signals if no result - NEVER crash
  if (!result) {
    return [];
  }

  const signals: RawSignal[] = [];

  // Safely access nested properties
  const activity = safeObject(result.activity, { lastCommit: '', commits30d: 0 });
  const issues = safeObject(result.issues, { open: 0, closed: 0 });
  const codeQuality = safeObject(result.codeQuality, { score: 0, notes: [] });
  const languages = safeObject(result.languages, {} as Record<string, number>);
  const grantFit = safeObject(result.grantFit, { signals: [], recommendations: [], matches: [] });

  const commits30d = safeNumber(activity.commits30d);
  const stars = safeNumber(result.stars);
  const forks = safeNumber(result.forks);

  // Activity signals
  signals.push({
    key: 'commits30d',
    category: 'activity',
    rawValue: commits30d,
    normalizedValue: normalizeValue(commits30d, SIGNAL_THRESHOLDS.commits30d),
    label: 'Recent Commits (30d)',
    description: `${commits30d} commits in the last 30 days`,
    weight: SIGNAL_WEIGHTS.commits30d.weight,
  });

  const lastCommitStr = safeString(activity.lastCommit);
  const lastCommitDate = lastCommitStr ? new Date(lastCommitStr) : new Date();
  const daysSinceCommit = lastCommitStr 
    ? Math.floor((Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999; // Very old if no commit date
  
  signals.push({
    key: 'lastCommitRecency',
    category: 'activity',
    rawValue: daysSinceCommit,
    normalizedValue: Math.max(0, 1 - (daysSinceCommit / 90)),
    label: 'Last Commit Recency',
    description: lastCommitStr ? `Last commit ${daysSinceCommit} days ago` : 'No commit data',
    weight: SIGNAL_WEIGHTS.lastCommitRecency.weight,
  });

  // Community signals
  signals.push({
    key: 'stars',
    category: 'community',
    rawValue: stars,
    normalizedValue: normalizeValue(stars, SIGNAL_THRESHOLDS.stars),
    label: 'GitHub Stars',
    description: `${stars.toLocaleString()} stars`,
    weight: SIGNAL_WEIGHTS.stars.weight,
  });

  signals.push({
    key: 'forks',
    category: 'community',
    rawValue: forks,
    normalizedValue: normalizeValue(forks, SIGNAL_THRESHOLDS.forks),
    label: 'Forks',
    description: `${forks.toLocaleString()} forks`,
    weight: SIGNAL_WEIGHTS.forks.weight,
  });

  // Issue activity
  const openIssues = safeNumber(issues.open);
  const closedIssues = safeNumber(issues.closed);
  const totalIssues = openIssues + closedIssues;
  const issueResolutionRate = totalIssues > 0 ? closedIssues / totalIssues : 0;
  signals.push({
    key: 'issueActivity',
    category: 'community',
    rawValue: issueResolutionRate,
    normalizedValue: issueResolutionRate,
    label: 'Issue Resolution Rate',
    description: `${Math.round(issueResolutionRate * 100)}% of issues resolved`,
    weight: SIGNAL_WEIGHTS.issueActivity.weight,
  });

  // Code quality
  const qualityScore = safeNumber(codeQuality.score);
  signals.push({
    key: 'codeQuality',
    category: 'code_quality',
    rawValue: qualityScore,
    normalizedValue: qualityScore / 100,
    label: 'Code Quality Score',
    description: `Quality score: ${qualityScore}/100`,
    weight: SIGNAL_WEIGHTS.codeStructure.weight,
  });

  // Check for tests in quality notes
  const qualityNotes = safeArray<string>(codeQuality.notes);
  const hasTests = qualityNotes.some(note => 
    note.toLowerCase().includes('test') || note.toLowerCase().includes('spec')
  );
  signals.push({
    key: 'hasTests',
    category: 'code_quality',
    rawValue: hasTests,
    normalizedValue: hasTests ? 1 : 0,
    label: 'Test Coverage',
    description: hasTests ? 'Has test files' : 'No tests detected',
    weight: SIGNAL_WEIGHTS.hasTests.weight,
  });

  // Language signals for ecosystem alignment
  const languageKeys = Object.keys(languages);
  const hasSolidity = languageKeys.includes('Solidity');
  
  signals.push({
    key: 'hasContracts',
    category: 'deployment',
    rawValue: hasSolidity,
    normalizedValue: hasSolidity ? 1 : 0,
    label: 'Smart Contracts',
    description: hasSolidity ? 'Contains Solidity contracts' : 'No smart contracts detected',
    weight: SIGNAL_WEIGHTS.hasContracts.weight,
  });

  return signals;
}

// ============= SCORE CALCULATION =============

export function calculateScores(signals: RawSignal[], result: RepoAnalysisResult | null | undefined): ProjectScores {
  // Return default scores if no result - NEVER crash
  const defaultBreakdown = (type: ScoreType, label: string, description: string): ScoreBreakdown => ({
    type,
    score: 0,
    label,
    description,
    factors: [],
  });

  if (!result) {
    return {
      grantFit: defaultBreakdown('grantFit', 'Grant Fit Score', 'No data available'),
      capitalReadiness: defaultBreakdown('capitalReadiness', 'Capital Readiness Score', 'No data available'),
      ecosystemAlignment: defaultBreakdown('ecosystemAlignment', 'Ecosystem Alignment Score', 'No data available'),
      engagementEase: defaultBreakdown('engagementEase', 'Engagement Ease Score', 'No data available'),
      overall: 0,
      calculatedAt: Date.now(),
    };
  }

  const grantFit = calculateGrantFitScore(signals, result);
  const capitalReadiness = calculateCapitalReadinessScore(signals, result);
  const ecosystemAlignment = calculateEcosystemAlignmentScore(signals, result);
  const engagementEase = calculateEngagementEaseScore(signals, result);

  const overall = Math.round(
    grantFit.score * SCORE_TYPE_WEIGHTS.grantFit +
    capitalReadiness.score * SCORE_TYPE_WEIGHTS.capitalReadiness +
    ecosystemAlignment.score * SCORE_TYPE_WEIGHTS.ecosystemAlignment +
    engagementEase.score * SCORE_TYPE_WEIGHTS.engagementEase
  );

  return {
    grantFit,
    capitalReadiness,
    ecosystemAlignment,
    engagementEase,
    overall,
    calculatedAt: Date.now(),
  };
}

function calculateGrantFitScore(signals: RawSignal[], result: RepoAnalysisResult): ScoreBreakdown {
  const factors: ScoreBreakdown['factors'] = [];
  let totalScore = 0;

  // Safe accessors
  const codeQuality = safeObject(result.codeQuality, { score: 0, notes: [] });
  const activity = safeObject(result.activity, { lastCommit: '', commits30d: 0 });
  const stars = safeNumber(result.stars);
  const forks = safeNumber(result.forks);

  // Technical maturity (40%)
  const codeQualitySignal = signals.find(s => s.key === 'codeQuality');
  const codeScore = (codeQualitySignal?.normalizedValue || 0) * 40;
  factors.push({
    name: 'Technical Maturity',
    contribution: Math.round(codeScore),
    explanation: `Code quality score of ${safeNumber(codeQuality.score)}/100`,
  });
  totalScore += codeScore;

  // Project activity (30%)
  const activitySignals = signals.filter(s => s.category === 'activity');
  const activityAvg = activitySignals.length > 0 
    ? activitySignals.reduce((sum, s) => sum + s.normalizedValue, 0) / activitySignals.length
    : 0;
  const activityScore = activityAvg * 30;
  factors.push({
    name: 'Project Activity',
    contribution: Math.round(activityScore),
    explanation: `${safeNumber(activity.commits30d)} commits in 30 days`,
  });
  totalScore += activityScore;

  // Community traction (30%)
  const communitySignals = signals.filter(s => s.category === 'community');
  const communityAvg = communitySignals.length > 0 
    ? communitySignals.reduce((sum, s) => sum + s.normalizedValue, 0) / communitySignals.length
    : 0;
  const communityScore = communityAvg * 30;
  factors.push({
    name: 'Community Traction',
    contribution: Math.round(communityScore),
    explanation: `${stars} stars, ${forks} forks`,
  });
  totalScore += communityScore;

  return {
    type: 'grantFit',
    score: Math.round(totalScore),
    label: 'Grant Fit Score',
    description: 'How well the project matches available grant programs',
    factors,
  };
}

function calculateCapitalReadinessScore(signals: RawSignal[], result: RepoAnalysisResult): ScoreBreakdown {
  const factors: ScoreBreakdown['factors'] = [];
  let totalScore = 0;

  // Safe accessors
  const codeQuality = safeObject(result.codeQuality, { score: 0, notes: [] });
  const activity = safeObject(result.activity, { lastCommit: '', commits30d: 0 });
  const issues = safeObject(result.issues, { open: 0, closed: 0 });
  const qualityNotes = safeArray<string>(codeQuality.notes);

  // Documentation & presentation (35%)
  const docScore = Math.min(qualityNotes.length * 7, 35);
  factors.push({
    name: 'Documentation Quality',
    contribution: docScore,
    explanation: `${qualityNotes.length} quality indicators found`,
  });
  totalScore += docScore;

  // Code quality (30%)
  const qualityScore = safeNumber(codeQuality.score);
  const codeScore = (qualityScore / 100) * 30;
  factors.push({
    name: 'Code Quality',
    contribution: Math.round(codeScore),
    explanation: `Quality score: ${qualityScore}`,
  });
  totalScore += codeScore;

  // Development velocity (20%)
  const commits = safeNumber(activity.commits30d);
  const velocityScore = Math.min(commits * 0.5, 20);
  factors.push({
    name: 'Development Velocity',
    contribution: Math.round(velocityScore),
    explanation: `${commits} recent commits`,
  });
  totalScore += velocityScore;

  // Issue management (15%)
  const openIssues = safeNumber(issues.open);
  const closedIssues = safeNumber(issues.closed);
  const issueRatio = closedIssues / Math.max(1, openIssues + closedIssues);
  const issueScore = issueRatio * 15;
  factors.push({
    name: 'Issue Management',
    contribution: Math.round(issueScore),
    explanation: `${Math.round(issueRatio * 100)}% issues resolved`,
  });
  totalScore += issueScore;

  return {
    type: 'capitalReadiness',
    score: Math.round(totalScore),
    label: 'Capital Readiness Score',
    description: 'How prepared the project is for funding',
    factors,
  };
}

function calculateEcosystemAlignmentScore(signals: RawSignal[], result: RepoAnalysisResult): ScoreBreakdown {
  const factors: ScoreBreakdown['factors'] = [];
  let totalScore = 0;

  // Safe accessors
  const languages = safeObject(result.languages, {} as Record<string, number>);
  const grantFit = safeObject(result.grantFit, { signals: [], recommendations: [], matches: [] });
  const grantSignals = safeArray<string>(grantFit.signals);

  // Language-ecosystem fit (50%)
  const languageKeys = Object.keys(languages);
  const hasSolidity = languageKeys.includes('Solidity');
  const hasRust = languageKeys.includes('Rust');
  const hasTS = languageKeys.includes('TypeScript') || languageKeys.includes('JavaScript');
  
  let langScore = 0;
  if (hasSolidity) langScore += 25;
  if (hasRust) langScore += 15;
  if (hasTS) langScore += 10;
  langScore = Math.min(langScore, 50);
  
  factors.push({
    name: 'Language Ecosystem Fit',
    contribution: langScore,
    explanation: `Primary: ${languageKeys.slice(0, 3).join(', ') || 'Unknown'}`,
  });
  totalScore += langScore;

  // Grant signal alignment (50%)
  const signalCount = grantSignals.length;
  const signalScore = Math.min(signalCount * 10, 50);
  factors.push({
    name: 'Grant Signal Alignment',
    contribution: signalScore,
    explanation: `${signalCount} grant-relevant signals detected`,
  });
  totalScore += signalScore;

  return {
    type: 'ecosystemAlignment',
    score: Math.round(totalScore),
    label: 'Ecosystem Alignment Score',
    description: 'Which ecosystems fit best for this project',
    factors,
  };
}

function calculateEngagementEaseScore(signals: RawSignal[], result: RepoAnalysisResult): ScoreBreakdown {
  const factors: ScoreBreakdown['factors'] = [];
  let totalScore = 0;

  // Safe accessors
  const activity = safeObject(result.activity, { lastCommit: '', commits30d: 0 });
  const issues = safeObject(result.issues, { open: 0, closed: 0 });
  const codeQuality = safeObject(result.codeQuality, { score: 0, notes: [] });
  const qualityNotes = safeArray<string>(codeQuality.notes);

  // Activity recency (40%)
  const lastCommitStr = safeString(activity.lastCommit);
  const lastCommitDate = lastCommitStr ? new Date(lastCommitStr) : new Date(0);
  const daysSinceCommit = lastCommitStr 
    ? Math.floor((Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const recencyScore = Math.max(0, 40 - daysSinceCommit * 0.5);
  factors.push({
    name: 'Activity Recency',
    contribution: Math.round(recencyScore),
    explanation: lastCommitStr ? `Last commit ${daysSinceCommit} days ago` : 'No commit data',
  });
  totalScore += recencyScore;

  // Responsiveness (30%)
  const openIssues = safeNumber(issues.open);
  const closedIssues = safeNumber(issues.closed);
  const issueRatio = closedIssues / Math.max(1, openIssues + closedIssues);
  const responsivenessScore = issueRatio * 30;
  factors.push({
    name: 'Team Responsiveness',
    contribution: Math.round(responsivenessScore),
    explanation: `${closedIssues} issues closed`,
  });
  totalScore += responsivenessScore;

  // Documentation (30%)
  const docScore = Math.min(qualityNotes.length * 6, 30);
  factors.push({
    name: 'Project Clarity',
    contribution: docScore,
    explanation: 'Based on code quality notes',
  });
  totalScore += docScore;

  return {
    type: 'engagementEase',
    score: Math.round(totalScore),
    label: 'Engagement Ease Score',
    description: 'How easy it is for partners to engage this team',
    factors,
  };
}

// ============= RISK FLAGS =============

export function detectRiskFlags(signals: RawSignal[], result: RepoAnalysisResult | null | undefined): RiskFlag[] {
  if (!result) return [];
  
  const flags: RiskFlag[] = [];

  // Safe accessors
  const activity = safeObject(result.activity, { lastCommit: '', commits30d: 0 });
  const issues = safeObject(result.issues, { open: 0, closed: 0 });
  const stars = safeNumber(result.stars);

  // Check activity
  const lastCommitStr = safeString(activity.lastCommit);
  if (lastCommitStr) {
    const lastCommitDate = new Date(lastCommitStr);
    const daysSinceCommit = Math.floor((Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCommit > RISK_THRESHOLDS.criticalInactivityDays) {
      flags.push({
        type: 'critical',
        message: `No commits in ${daysSinceCommit} days`,
        category: 'activity',
      });
    } else if (daysSinceCommit > RISK_THRESHOLDS.inactivityDays) {
      flags.push({
        type: 'warning',
        message: `Limited recent activity (${daysSinceCommit} days since last commit)`,
        category: 'activity',
      });
    }
  }

  // Check stars
  if (stars < RISK_THRESHOLDS.lowStars) {
    flags.push({
      type: 'warning',
      message: 'Low community visibility (few stars)',
      category: 'community',
    });
  }

  // Check tests
  const hasTests = signals.find(s => s.key === 'hasTests')?.normalizedValue === 1;
  if (!hasTests) {
    flags.push({
      type: 'warning',
      message: 'No test coverage detected',
      category: 'code_quality',
    });
  }

  // Check issue ratio
  const openIssues = safeNumber(issues.open);
  const closedIssues = safeNumber(issues.closed);
  const totalIssues = openIssues + closedIssues;
  if (totalIssues > 10 && openIssues / totalIssues > RISK_THRESHOLDS.highOpenIssueRatio) {
    flags.push({
      type: 'warning',
      message: 'High ratio of unresolved issues',
      category: 'community',
    });
  }

  return flags;
}

// ============= NEXT ACTIONS =============

export function generateNextActions(signals: RawSignal[], result: RepoAnalysisResult | null | undefined, riskFlags: RiskFlag[]): NextAction[] {
  if (!result) return [];

  const actions: NextAction[] = [];
  let actionId = 1;

  // Safe accessors
  const codeQuality = safeObject(result.codeQuality, { score: 0, notes: [] });
  const grantFit = safeObject(result.grantFit, { signals: [], recommendations: [], matches: [] });
  const qualityNotes = safeArray<string>(codeQuality.notes);
  const matches = safeArray<GrantMatch>(grantFit.matches);
  const stars = safeNumber(result.stars);

  // Activity-based actions
  if (riskFlags.some(f => f.category === 'activity')) {
    actions.push({
      id: `action-${actionId++}`,
      action: 'Increase commit frequency to show active development',
      priority: 'high',
      impact: 'Improves Grant Fit and Engagement scores by 15-20 points',
      completed: false,
    });
  }

  // Test coverage
  const hasTests = signals.find(s => s.key === 'hasTests')?.normalizedValue === 1;
  if (!hasTests) {
    actions.push({
      id: `action-${actionId++}`,
      action: 'Add unit tests and integration tests',
      priority: 'high',
      impact: 'Improves Capital Readiness score by 10-15 points',
      completed: false,
    });
  }

  // Community building
  if (stars < 50) {
    actions.push({
      id: `action-${actionId++}`,
      action: 'Promote project to increase GitHub stars',
      priority: 'medium',
      impact: 'Improves Ecosystem Alignment and visibility',
      completed: false,
    });
  }

  // Documentation
  if (qualityNotes.length < 3) {
    actions.push({
      id: `action-${actionId++}`,
      action: 'Improve README with installation, usage examples, and API docs',
      priority: 'high',
      impact: 'Improves Capital Readiness by 10-20 points',
      completed: false,
    });
  }

  // Grant application
  if (matches.length > 0) {
    actions.push({
      id: `action-${actionId++}`,
      action: `Apply to top matching grant: ${matches[0].program}`,
      priority: 'high',
      impact: 'Direct funding opportunity',
      completed: false,
    });
  }

  return actions.slice(0, 5); // Max 5 actions
}

// ============= OPPORTUNITY CARD GENERATION =============

export function generateOpportunityCard(
  result: RepoAnalysisResult | null | undefined,
  signals: RawSignal[],
  scores: ProjectScores
): OpportunityCard {
  // Return empty card if no result - NEVER crash
  if (!result) {
    return {
      id: `opp-${Date.now()}`,
      projectId: 'unknown',
      projectName: 'Unknown Project',
      projectUrl: '',
      summary: 'No analysis data available',
      strongestSignals: [],
      riskFlags: [],
      scores,
      grantRecommendations: [],
      nextActions: [],
      generatedAt: Date.now(),
    };
  }

  const riskFlags = detectRiskFlags(signals, result);
  const nextActions = generateNextActions(signals, result, riskFlags);
  
  // Find strongest signals
  const sortedSignals = [...signals].sort((a, b) => b.normalizedValue - a.normalizedValue);
  const strongestSignals = sortedSignals.slice(0, 4).map(s => ({
    label: s.label,
    value: String(s.rawValue),
    strength: (s.normalizedValue > 0.7 ? 'strong' : s.normalizedValue > 0.4 ? 'moderate' : 'weak') as 'strong' | 'moderate' | 'weak',
  }));

  // Safe accessors
  const grantFit = safeObject(result.grantFit, { signals: [], recommendations: [], matches: [] });
  const matches = safeArray<GrantMatch>(grantFit.matches);

  // Convert grant matches to recommendations
  const grantRecommendations: GrantRecommendation[] = matches.map(match => ({
    grantId: (match.program || 'unknown').toLowerCase().replace(/\s+/g, '-'),
    programName: match.program || 'Unknown Program',
    ecosystem: match.ecosystem || 'Unknown',
    confidence: safeNumber(match.fitScore),
    whyFits: safeArray<string>(match.why),
    applyUrl: match.url,
  }));

  // Generate summary
  const summary = generateProjectSummary(result, scores);

  const repoStr = safeString(result.repo);
  const repoName = repoStr.split('/').pop() || repoStr || 'Unknown';

  return {
    id: `opp-${Date.now()}`,
    projectId: repoStr,
    projectName: repoName,
    projectUrl: repoStr ? `https://github.com/${repoStr}` : '',
    summary,
    strongestSignals,
    riskFlags,
    scores,
    grantRecommendations,
    nextActions,
    generatedAt: Date.now(),
  };
}

function generateProjectSummary(result: RepoAnalysisResult, scores: ProjectScores): string {
  const languages = safeObject(result.languages, {} as Record<string, number>);
  const activity = safeObject(result.activity, { lastCommit: '', commits30d: 0 });
  
  const primaryLang = Object.keys(languages)[0] || 'Unknown';
  const commits = safeNumber(activity.commits30d);
  const activityLevel = commits > 20 ? 'highly active' : 
                   commits > 5 ? 'moderately active' : 'low activity';
  
  const readiness = scores.capitalReadiness.score >= 70 ? 'capital-ready' :
                    scores.capitalReadiness.score >= 50 ? 'developing' : 'early-stage';

  return `A ${activityLevel} ${primaryLang} project showing ${readiness} characteristics with an overall score of ${scores.overall}/100.`;
}

// ============= NORMALIZATION HELPER =============

function normalizeValue(
  value: number,
  thresholds: { low: number; medium: number; high: number; exceptional?: number }
): number {
  if (value <= thresholds.low) return value / thresholds.low * 0.25;
  if (value <= thresholds.medium) return 0.25 + (value - thresholds.low) / (thresholds.medium - thresholds.low) * 0.25;
  if (value <= thresholds.high) return 0.5 + (value - thresholds.medium) / (thresholds.high - thresholds.medium) * 0.25;
  if (thresholds.exceptional && value <= thresholds.exceptional) {
    return 0.75 + (value - thresholds.high) / (thresholds.exceptional - thresholds.high) * 0.25;
  }
  return 1;
}
