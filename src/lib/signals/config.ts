// Signal Engine Configuration - Weights and Thresholds
// Easily adjustable scoring logic

export const SIGNAL_WEIGHTS = {
  // Activity signals
  commits30d: { weight: 0.15, label: 'Recent Commits (30d)' },
  commits60d: { weight: 0.08, label: 'Commits (60d)' },
  commits90d: { weight: 0.05, label: 'Commits (90d)' },
  lastCommitRecency: { weight: 0.12, label: 'Last Commit Recency' },
  
  // Community signals  
  stars: { weight: 0.10, label: 'GitHub Stars' },
  forks: { weight: 0.08, label: 'Forks' },
  contributors: { weight: 0.10, label: 'Contributors' },
  issueActivity: { weight: 0.05, label: 'Issue Activity' },
  prActivity: { weight: 0.07, label: 'PR Activity' },
  
  // Code quality signals
  hasTests: { weight: 0.08, label: 'Test Coverage' },
  hasCI: { weight: 0.05, label: 'CI/CD Setup' },
  codeStructure: { weight: 0.06, label: 'Code Structure' },
  
  // Documentation signals
  readmeQuality: { weight: 0.10, label: 'README Quality' },
  hasContributing: { weight: 0.03, label: 'Contributing Guide' },
  hasLicense: { weight: 0.02, label: 'License' },
  
  // Deployment signals
  hasDeployment: { weight: 0.08, label: 'Deployment Indicators' },
  hasContracts: { weight: 0.10, label: 'Smart Contracts' },
} as const;

// Score type weights for overall calculation
export const SCORE_TYPE_WEIGHTS = {
  grantFit: 0.35,
  capitalReadiness: 0.25,
  ecosystemAlignment: 0.25,
  engagementEase: 0.15,
} as const;

// Thresholds for signal normalization
export const SIGNAL_THRESHOLDS = {
  // Stars: what counts as "good"
  stars: { low: 10, medium: 100, high: 1000, exceptional: 10000 },
  forks: { low: 5, medium: 25, high: 100, exceptional: 500 },
  commits30d: { low: 5, medium: 20, high: 50, exceptional: 100 },
  contributors: { low: 2, medium: 5, high: 15, exceptional: 50 },
  openIssues: { low: 5, medium: 20, high: 50 }, // Lower is better for ratio
  closedIssues: { low: 10, medium: 50, high: 200 },
} as const;

// README quality indicators
export const README_QUALITY_INDICATORS = [
  'installation',
  'usage',
  'example',
  'api',
  'documentation',
  'contributing',
  'license',
  'demo',
  'screenshot',
  'getting started',
] as const;

// Ecosystem mapping for alignment scoring
export const ECOSYSTEM_KEYWORDS: Record<string, string[]> = {
  ethereum: ['ethereum', 'eth', 'evm', 'solidity', 'hardhat', 'foundry', 'ethers'],
  avalanche: ['avalanche', 'avax', 'subnet', 'c-chain'],
  polygon: ['polygon', 'matic', 'zkevm'],
  solana: ['solana', 'sol', 'anchor', 'rust'],
  arbitrum: ['arbitrum', 'arb', 'nitro'],
  optimism: ['optimism', 'op', 'superchain'],
  base: ['base', 'coinbase'],
  starknet: ['starknet', 'cairo', 'stark'],
  cosmos: ['cosmos', 'ibc', 'tendermint', 'cosmwasm'],
  near: ['near', 'aurora'],
} as const;

// Grant category mapping
export const GRANT_CATEGORY_TAGS: Record<string, string[]> = {
  defi: ['defi', 'dex', 'amm', 'lending', 'yield', 'liquidity', 'swap'],
  infrastructure: ['infra', 'infrastructure', 'sdk', 'tooling', 'indexing', 'data'],
  gaming: ['gaming', 'gamefi', 'game', 'nft', 'metaverse'],
  social: ['social', 'consumer', 'creator', 'lens', 'farcaster'],
  public_goods: ['public goods', 'open source', 'oss', 'community', 'retroactive'],
  ai: ['ai', 'ml', 'agent', 'llm', 'machine learning'],
} as const;

// Risk flag triggers
export const RISK_THRESHOLDS = {
  inactivityDays: 60, // No commits in X days = warning
  criticalInactivityDays: 180, // No commits in X days = critical
  lowStars: 5, // Below this = warning
  noTests: true, // No test files = warning
  noReadme: true, // No/empty README = critical
  highOpenIssueRatio: 0.8, // 80%+ open issues = warning
} as const;
