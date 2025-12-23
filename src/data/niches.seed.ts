import type { BuilderNiche } from '@/types/grants';

export const BUILDER_NICHES: BuilderNiche[] = [
  {
    id: 'defi',
    name: 'DeFi',
    description: 'Decentralized exchanges, lending protocols, and yield optimization.',
    icon: 'coins',
    tags: ['DeFi', 'DEX', 'Lending', 'AMM', 'Yield', 'Liquidity'],
  },
  {
    id: 'fintech',
    name: 'Fintech',
    description: 'Payments, stablecoins, and financial infrastructure.',
    icon: 'credit-card',
    tags: ['Payments', 'Stablecoin', 'Fintech', 'Banking', 'Commerce'],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Web3 games, GameFi, and metaverse experiences.',
    icon: 'gamepad-2',
    tags: ['Gaming', 'GameFi', 'Metaverse', 'Play-to-Earn', 'NFT'],
  },
  {
    id: 'infra',
    name: 'Infra / Tooling',
    description: 'Developer tools, SDKs, and blockchain infrastructure.',
    icon: 'wrench',
    tags: ['Infrastructure', 'DevTools', 'Tooling', 'SDKs', 'Developer', 'Tools'],
  },
  {
    id: 'ai-crypto',
    name: 'AI + Crypto',
    description: 'AI agents, oracles, and decentralized data infrastructure.',
    icon: 'brain',
    tags: ['AI', 'Agents', 'Oracles', 'Data', 'ML', 'Machine Learning'],
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Social apps, creator tools, and community platforms.',
    icon: 'users',
    tags: ['Social', 'Consumer', 'Creator', 'Community', 'Identity'],
  },
  {
    id: 'rwa-enterprise',
    name: 'RWA / Enterprise',
    description: 'Real-world asset tokenization and enterprise solutions.',
    icon: 'building-2',
    tags: ['RWA', 'Enterprise', 'Tokenization', 'Real World', 'Compliance'],
  },
  {
    id: 'public-goods',
    name: 'Public Goods',
    description: 'Open source projects and community-owned infrastructure.',
    icon: 'heart',
    tags: ['Public Goods', 'Open Source', 'Retroactive', 'Grants', 'Community'],
  },
];
