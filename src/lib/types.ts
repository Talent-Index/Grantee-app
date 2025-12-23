// x402 v2 Types matching backend format

export interface X402PaymentRequirement {
  scheme?: string;
  network: string;
  asset: string;
  payTo: string;
  amount?: string;
  maxAmountRequired?: string;
  maxTimeoutSeconds?: number;
  extra?: {
    name?: string;
    version?: string;
    [key: string]: unknown;
  };
}

export interface X402PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
  accepted?: {
    scheme: string;
    network: string;
    asset: string;
    payTo: string;
    amount: string;
    maxTimeoutSeconds: number;
    extra: Record<string, unknown>;
  };
}

export interface X402Response {
  x402Version: number;
  accepts: X402PaymentRequirement[];
  error?: string;
}

export interface SettlementResponse {
  success: boolean;
  transaction?: {
    hash: string;
    network: string;
  };
  error?: string;
  payer?: string;
  receiver?: string;
}

export interface RepoAnalysisResult {
  repo: string;
  stars: number;
  forks: number;
  issues: {
    open: number;
    closed: number;
  };
  languages: Record<string, number>;
  activity: {
    lastCommit: string;
    commits30d: number;
  };
  codeQuality: {
    score: number;
    notes: string[];
  };
  grantFit: {
    signals: string[];
    recommendations: string[];
    matches?: GrantMatch[];
  };
}

export interface GrantMatch {
  program: string;
  ecosystem: string;
  fitScore: number;
  why: string[];
  url?: string;
}

export interface AnalysisResponse {
  success?: boolean;
  settlement?: SettlementResponse;
  result: RepoAnalysisResult;
  payer?: string;
}

export interface HistoryItem {
  id: string;
  repoUrl: string;
  timestamp: number;
  depth: 'light' | 'full';
  chainHint: string;
  result: RepoAnalysisResult;
  settlement?: SettlementResponse;
}
