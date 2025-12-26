// Signal Intelligence Engine Types

// ============= SIGNAL TYPES =============

export type SignalCategory = 
  | 'activity' 
  | 'community' 
  | 'code_quality' 
  | 'documentation' 
  | 'deployment' 
  | 'team';

export interface RawSignal {
  key: string;
  category: SignalCategory;
  rawValue: number | string | boolean;
  normalizedValue: number; // 0-1 range
  label: string;
  description: string;
  weight: number;
}

export interface SignalSnapshot {
  id: string;
  projectId: string;
  timestamp: number;
  signals: RawSignal[];
}

// ============= SCORE TYPES =============

export type ScoreType = 
  | 'grantFit' 
  | 'capitalReadiness' 
  | 'ecosystemAlignment' 
  | 'engagementEase';

export interface ScoreBreakdown {
  type: ScoreType;
  score: number; // 0-100
  label: string;
  description: string;
  factors: {
    name: string;
    contribution: number;
    explanation: string;
  }[];
}

export interface ProjectScores {
  grantFit: ScoreBreakdown;
  capitalReadiness: ScoreBreakdown;
  ecosystemAlignment: ScoreBreakdown;
  engagementEase: ScoreBreakdown;
  overall: number;
  calculatedAt: number;
}

// ============= OPPORTUNITY CARD =============

export interface RiskFlag {
  type: 'warning' | 'critical';
  message: string;
  category: string;
}

export interface NextAction {
  id: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  completed: boolean;
}

export interface GrantRecommendation {
  grantId: string;
  programName: string;
  ecosystem: string;
  confidence: number; // 0-100
  whyFits: string[];
  estimatedAmount?: string;
  applyUrl?: string;
}

export interface OpportunityCard {
  id: string;
  projectId: string;
  projectName: string;
  projectUrl: string;
  summary: string;
  strongestSignals: {
    label: string;
    value: string;
    strength: 'strong' | 'moderate' | 'weak';
  }[];
  riskFlags: RiskFlag[];
  scores: ProjectScores;
  grantRecommendations: GrantRecommendation[];
  nextActions: NextAction[];
  generatedAt: number;
}

// ============= PROJECT MODEL =============

export interface Project {
  id: string;
  repoUrl: string;
  name: string;
  owner: string;
  description?: string;
  primaryLanguage?: string;
  createdAt: number;
  lastAnalyzedAt: number;
  analysisCount: number;
  signals: SignalSnapshot[];
  currentScores?: ProjectScores;
  opportunityCard?: OpportunityCard;
}

// ============= API RESPONSE TYPES =============

export interface SignalAnalysisResult {
  project: Project;
  signals: RawSignal[];
  scores: ProjectScores;
  opportunityCard: OpportunityCard;
  settlement?: {
    success: boolean;
    hash?: string;
    payer?: string;
  };
}
