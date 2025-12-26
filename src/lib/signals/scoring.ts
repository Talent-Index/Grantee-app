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

// ============= SIGNAL EXTRACTION =============

export function extractSignals(result: RepoAnalysisResult): RawSignal[] {
  const signals: RawSignal[] = [];

  // Activity signals
  signals.push({
    key: 'commits30d',
    category: 'activity',
    rawValue: result.activity.commits30d,
    normalizedValue: normalizeValue(result.activity.commits30d, SIGNAL_THRESHOLDS.commits30d),
    label: 'Recent Commits (30d)',
    description: `${result.activity.commits30d} commits in the last 30 days`,
    weight: SIGNAL_WEIGHTS.commits30d.weight,
  });

  const lastCommitDate = new Date(result.activity.lastCommit);
  const daysSinceCommit = Math.floor((Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24));
  signals.push({
    key: 'lastCommitRecency',
    category: 'activity',
    rawValue: daysSinceCommit,
    normalizedValue: Math.max(0, 1 - (daysSinceCommit / 90)), // 0-90 days scale
    label: 'Last Commit Recency',
    description: `Last commit ${daysSinceCommit} days ago`,
    weight: SIGNAL_WEIGHTS.lastCommitRecency.weight,
  });

  // Community signals
  signals.push({
    key: 'stars',
    category: 'community',
    rawValue: result.stars,
    normalizedValue: normalizeValue(result.stars, SIGNAL_THRESHOLDS.stars),
    label: 'GitHub Stars',
    description: `${result.stars.toLocaleString()} stars`,
    weight: SIGNAL_WEIGHTS.stars.weight,
  });

  signals.push({
    key: 'forks',
    category: 'community',
    rawValue: result.forks,
    normalizedValue: normalizeValue(result.forks, SIGNAL_THRESHOLDS.forks),
    label: 'Forks',
    description: `${result.forks.toLocaleString()} forks`,
    weight: SIGNAL_WEIGHTS.forks.weight,
  });

  // Issue activity
  const totalIssues = result.issues.open + result.issues.closed;
  const issueResolutionRate = totalIssues > 0 ? result.issues.closed / totalIssues : 0;
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
  signals.push({
    key: 'codeQuality',
    category: 'code_quality',
    rawValue: result.codeQuality.score,
    normalizedValue: result.codeQuality.score / 100,
    label: 'Code Quality Score',
    description: `Quality score: ${result.codeQuality.score}/100`,
    weight: SIGNAL_WEIGHTS.codeStructure.weight,
  });

  // Check for tests in quality notes
  const hasTests = result.codeQuality.notes.some(note => 
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
  const languages = Object.keys(result.languages);
  const hasSolidity = languages.includes('Solidity');
  const hasRust = languages.includes('Rust');
  
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

export function calculateScores(signals: RawSignal[], result: RepoAnalysisResult): ProjectScores {
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

  // Technical maturity (40%)
  const codeQualitySignal = signals.find(s => s.key === 'codeQuality');
  const codeScore = (codeQualitySignal?.normalizedValue || 0) * 40;
  factors.push({
    name: 'Technical Maturity',
    contribution: Math.round(codeScore),
    explanation: `Code quality score of ${result.codeQuality.score}/100`,
  });
  totalScore += codeScore;

  // Project activity (30%)
  const activitySignals = signals.filter(s => s.category === 'activity');
  const activityAvg = activitySignals.reduce((sum, s) => sum + s.normalizedValue, 0) / activitySignals.length;
  const activityScore = activityAvg * 30;
  factors.push({
    name: 'Project Activity',
    contribution: Math.round(activityScore),
    explanation: `${result.activity.commits30d} commits in 30 days`,
  });
  totalScore += activityScore;

  // Community traction (30%)
  const communitySignals = signals.filter(s => s.category === 'community');
  const communityAvg = communitySignals.reduce((sum, s) => sum + s.normalizedValue, 0) / communitySignals.length;
  const communityScore = communityAvg * 30;
  factors.push({
    name: 'Community Traction',
    contribution: Math.round(communityScore),
    explanation: `${result.stars} stars, ${result.forks} forks`,
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

  // Documentation & presentation (35%)
  const qualityNotes = result.codeQuality.notes;
  const docScore = Math.min(qualityNotes.length * 7, 35);
  factors.push({
    name: 'Documentation Quality',
    contribution: docScore,
    explanation: `${qualityNotes.length} quality indicators found`,
  });
  totalScore += docScore;

  // Code quality (30%)
  const codeScore = (result.codeQuality.score / 100) * 30;
  factors.push({
    name: 'Code Quality',
    contribution: Math.round(codeScore),
    explanation: `Quality score: ${result.codeQuality.score}`,
  });
  totalScore += codeScore;

  // Development velocity (20%)
  const velocityScore = Math.min(result.activity.commits30d * 0.5, 20);
  factors.push({
    name: 'Development Velocity',
    contribution: Math.round(velocityScore),
    explanation: `${result.activity.commits30d} recent commits`,
  });
  totalScore += velocityScore;

  // Issue management (15%)
  const issueRatio = result.issues.closed / Math.max(1, result.issues.open + result.issues.closed);
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

  // Language-ecosystem fit (50%)
  const languages = Object.keys(result.languages);
  const hasSolidity = languages.includes('Solidity');
  const hasRust = languages.includes('Rust');
  const hasTS = languages.includes('TypeScript') || languages.includes('JavaScript');
  
  let langScore = 0;
  if (hasSolidity) langScore += 25;
  if (hasRust) langScore += 15;
  if (hasTS) langScore += 10;
  langScore = Math.min(langScore, 50);
  
  factors.push({
    name: 'Language Ecosystem Fit',
    contribution: langScore,
    explanation: `Primary: ${Object.keys(result.languages).slice(0, 3).join(', ')}`,
  });
  totalScore += langScore;

  // Grant signal alignment (50%)
  const signalCount = result.grantFit.signals.length;
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

  // Activity recency (40%)
  const lastCommitDate = new Date(result.activity.lastCommit);
  const daysSinceCommit = Math.floor((Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24));
  const recencyScore = Math.max(0, 40 - daysSinceCommit * 0.5);
  factors.push({
    name: 'Activity Recency',
    contribution: Math.round(recencyScore),
    explanation: `Last commit ${daysSinceCommit} days ago`,
  });
  totalScore += recencyScore;

  // Responsiveness (30%)
  const issueRatio = result.issues.closed / Math.max(1, result.issues.open + result.issues.closed);
  const responsivenessScore = issueRatio * 30;
  factors.push({
    name: 'Team Responsiveness',
    contribution: Math.round(responsivenessScore),
    explanation: `${result.issues.closed} issues closed`,
  });
  totalScore += responsivenessScore;

  // Documentation (30%)
  const docScore = Math.min(result.codeQuality.notes.length * 6, 30);
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

export function detectRiskFlags(signals: RawSignal[], result: RepoAnalysisResult): RiskFlag[] {
  const flags: RiskFlag[] = [];

  // Check activity
  const lastCommitDate = new Date(result.activity.lastCommit);
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

  // Check stars
  if (result.stars < RISK_THRESHOLDS.lowStars) {
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
  const totalIssues = result.issues.open + result.issues.closed;
  if (totalIssues > 10 && result.issues.open / totalIssues > RISK_THRESHOLDS.highOpenIssueRatio) {
    flags.push({
      type: 'warning',
      message: 'High ratio of unresolved issues',
      category: 'community',
    });
  }

  return flags;
}

// ============= NEXT ACTIONS =============

export function generateNextActions(signals: RawSignal[], result: RepoAnalysisResult, riskFlags: RiskFlag[]): NextAction[] {
  const actions: NextAction[] = [];
  let actionId = 1;

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
  if (result.stars < 50) {
    actions.push({
      id: `action-${actionId++}`,
      action: 'Promote project to increase GitHub stars',
      priority: 'medium',
      impact: 'Improves Ecosystem Alignment and visibility',
      completed: false,
    });
  }

  // Documentation
  if (result.codeQuality.notes.length < 3) {
    actions.push({
      id: `action-${actionId++}`,
      action: 'Improve README with installation, usage examples, and API docs',
      priority: 'high',
      impact: 'Improves Capital Readiness by 10-20 points',
      completed: false,
    });
  }

  // Grant application
  if (result.grantFit.matches && result.grantFit.matches.length > 0) {
    actions.push({
      id: `action-${actionId++}`,
      action: `Apply to top matching grant: ${result.grantFit.matches[0].program}`,
      priority: 'high',
      impact: 'Direct funding opportunity',
      completed: false,
    });
  }

  return actions.slice(0, 5); // Max 5 actions
}

// ============= OPPORTUNITY CARD GENERATION =============

export function generateOpportunityCard(
  result: RepoAnalysisResult,
  signals: RawSignal[],
  scores: ProjectScores
): OpportunityCard {
  const riskFlags = detectRiskFlags(signals, result);
  const nextActions = generateNextActions(signals, result, riskFlags);
  
  // Find strongest signals
  const sortedSignals = [...signals].sort((a, b) => b.normalizedValue - a.normalizedValue);
  const strongestSignals = sortedSignals.slice(0, 4).map(s => ({
    label: s.label,
    value: String(s.rawValue),
    strength: (s.normalizedValue > 0.7 ? 'strong' : s.normalizedValue > 0.4 ? 'moderate' : 'weak') as 'strong' | 'moderate' | 'weak',
  }));

  // Convert grant matches to recommendations
  const grantRecommendations: GrantRecommendation[] = (result.grantFit.matches || []).map(match => ({
    grantId: match.program.toLowerCase().replace(/\s+/g, '-'),
    programName: match.program,
    ecosystem: match.ecosystem,
    confidence: match.fitScore,
    whyFits: match.why,
    applyUrl: match.url,
  }));

  // Generate summary
  const summary = generateProjectSummary(result, scores);

  const repoName = result.repo.split('/').pop() || result.repo;
  const repoOwner = result.repo.split('/').slice(-2, -1)[0] || '';

  return {
    id: `opp-${Date.now()}`,
    projectId: result.repo,
    projectName: repoName,
    projectUrl: `https://github.com/${result.repo}`,
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
  const primaryLang = Object.keys(result.languages)[0] || 'Unknown';
  const activity = result.activity.commits30d > 20 ? 'highly active' : 
                   result.activity.commits30d > 5 ? 'moderately active' : 'low activity';
  
  const readiness = scores.capitalReadiness.score >= 70 ? 'capital-ready' :
                    scores.capitalReadiness.score >= 50 ? 'developing' : 'early-stage';

  return `A ${readiness} ${primaryLang} project with ${activity} development. ` +
         `${result.stars} stars, ${result.forks} forks. ` +
         `Overall grant-readiness score: ${scores.overall}/100.`;
}

// ============= HELPERS =============

function normalizeValue(value: number, thresholds: { low: number; medium: number; high: number; exceptional?: number }): number {
  if (value <= 0) return 0;
  if (value >= (thresholds.exceptional || thresholds.high * 2)) return 1;
  if (value >= thresholds.high) return 0.8 + 0.2 * (value - thresholds.high) / ((thresholds.exceptional || thresholds.high * 2) - thresholds.high);
  if (value >= thresholds.medium) return 0.5 + 0.3 * (value - thresholds.medium) / (thresholds.high - thresholds.medium);
  if (value >= thresholds.low) return 0.2 + 0.3 * (value - thresholds.low) / (thresholds.medium - thresholds.low);
  return 0.2 * (value / thresholds.low);
}
