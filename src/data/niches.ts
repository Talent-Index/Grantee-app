// Builder Niches dataset - can be replaced with API endpoint later
export interface BuilderNiche {
  id: string;
  name: string;
  description: string;
  tags: string[];
  recommendedLanguages: string[];
  recommendedChains: string[];
}

export const NICHES: BuilderNiche[] = [
  {
    id: 'defi',
    name: 'DeFi',
    description: 'Decentralized finance protocols, DEXs, lending, and yield optimization.',
    tags: ['DeFi', 'AMM', 'DEX', 'Lending', 'Yield'],
    recommendedLanguages: ['Solidity', 'Rust', 'Move'],
    recommendedChains: ['ethereum', 'avalanche', 'polygon', 'arbitrum', 'base'],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Web3 games, GameFi, and on-chain gaming experiences.',
    tags: ['Gaming', 'GameFi', 'NFT', 'Metaverse'],
    recommendedLanguages: ['Solidity', 'Unity', 'C++', 'Rust'],
    recommendedChains: ['ethereum', 'polygon', 'avalanche', 'immutable'],
  },
  {
    id: 'infra',
    name: 'Infra & Tooling',
    description: 'Developer tools, indexing, SDKs, and blockchain infrastructure.',
    tags: ['Infrastructure', 'Tooling', 'Indexing', 'SDK', 'Data'],
    recommendedLanguages: ['Rust', 'Go', 'TypeScript', 'Python'],
    recommendedChains: ['multi-chain', 'ethereum', 'cosmos'],
  },
  {
    id: 'ai-crypto',
    name: 'AI x Crypto',
    description: 'AI agents, ML models on-chain, and decentralized AI infrastructure.',
    tags: ['AI', 'ML', 'Agents', 'Data', 'Compute'],
    recommendedLanguages: ['Python', 'Rust', 'TypeScript'],
    recommendedChains: ['multi-chain', 'ethereum', 'solana'],
  },
  {
    id: 'public-goods',
    name: 'Public Goods',
    description: 'Open source projects, public infrastructure, and community-owned protocols.',
    tags: ['Public Goods', 'Open Source', 'Community', 'QF', 'Retroactive'],
    recommendedLanguages: ['TypeScript', 'Solidity', 'Rust'],
    recommendedChains: ['ethereum', 'optimism', 'multi-chain'],
  },
  {
    id: 'rwa',
    name: 'RWAs',
    description: 'Real-world asset tokenization, securities, and on-chain commodities.',
    tags: ['RWA', 'Tokenization', 'DeFi', 'Enterprise'],
    recommendedLanguages: ['Solidity', 'Rust'],
    recommendedChains: ['ethereum', 'avalanche', 'polygon'],
  },
  {
    id: 'consumer',
    name: 'Consumer Apps',
    description: 'Social apps, creator tools, and user-facing Web3 experiences.',
    tags: ['Social', 'Consumer', 'Creator', 'Lens', 'Web3 Social'],
    recommendedLanguages: ['TypeScript', 'React', 'Swift'],
    recommendedChains: ['polygon', 'base', 'optimism', 'ethereum'],
  },
  {
    id: 'wallets',
    name: 'Wallets & AA',
    description: 'Smart wallets, account abstraction, and key management solutions.',
    tags: ['Wallet', 'AA', 'Account Abstraction', 'Security'],
    recommendedLanguages: ['TypeScript', 'Solidity', 'Rust'],
    recommendedChains: ['ethereum', 'polygon', 'base', 'multi-chain'],
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Stablecoin payments, remittances, and on-chain commerce.',
    tags: ['Payments', 'Stablecoin', 'Commerce', 'DeFi'],
    recommendedLanguages: ['Solidity', 'TypeScript', 'Go'],
    recommendedChains: ['ethereum', 'avalanche', 'polygon', 'solana'],
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Learn-to-earn, developer education, and onboarding resources.',
    tags: ['Education', 'Learn', 'Developer', 'Onboarding', 'Community'],
    recommendedLanguages: ['TypeScript', 'Python', 'Solidity'],
    recommendedChains: ['multi-chain', 'ethereum', 'polygon'],
  },
];
