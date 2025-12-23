// Grants dataset - can be replaced with API endpoint later
export interface Grant {
  id: string;
  title: string;
  organization: string;
  description: string;
  amount: string;
  deadline: string;
  category: 'defi' | 'infrastructure' | 'tooling' | 'nft' | 'gaming' | 'social' | 'dao' | 'other';
  ecosystem: 'ethereum' | 'avalanche' | 'polygon' | 'solana' | 'cosmos' | 'multi-chain' | 'other';
  region: 'global' | 'north-america' | 'europe' | 'asia' | 'latam';
  grantType: 'grant' | 'bounty' | 'retroactive' | 'equity-free' | 'accelerator';
  link: string;
  tags: string[];
  featured?: boolean;
}

export const grantsData: Grant[] = [
  {
    id: '1',
    title: 'Avalanche Foundation Grant',
    organization: 'Avalanche Foundation',
    description: 'Building innovative DeFi applications on Avalanche C-Chain with focus on capital efficiency and user experience.',
    amount: '$50,000 - $200,000',
    deadline: '2024-03-31',
    category: 'defi',
    ecosystem: 'avalanche',
    region: 'global',
    grantType: 'grant',
    link: 'https://www.avax.network/grants',
    tags: ['DeFi', 'Avalanche', 'Smart Contracts'],
    featured: true,
  },
  {
    id: '2',
    title: 'Ethereum Foundation Ecosystem Support',
    organization: 'Ethereum Foundation',
    description: 'Supporting projects that strengthen the Ethereum ecosystem through research, development, and community building.',
    amount: 'Up to $500,000',
    deadline: 'Rolling',
    category: 'infrastructure',
    ecosystem: 'ethereum',
    region: 'global',
    grantType: 'grant',
    link: 'https://ethereum.org/en/community/grants/',
    tags: ['Ethereum', 'Infrastructure', 'Research'],
    featured: true,
  },
  {
    id: '3',
    title: 'Polygon Village Grants',
    organization: 'Polygon',
    description: 'Funding for developers building on Polygon zkEVM, Polygon PoS, and other Polygon solutions.',
    amount: '$10,000 - $100,000',
    deadline: '2024-04-15',
    category: 'tooling',
    ecosystem: 'polygon',
    region: 'global',
    grantType: 'grant',
    link: 'https://polygon.technology/village',
    tags: ['Polygon', 'L2', 'zkEVM'],
  },
  {
    id: '4',
    title: 'Uniswap Foundation Grants',
    organization: 'Uniswap Foundation',
    description: 'Supporting projects that grow the Uniswap ecosystem, including DEX tooling, analytics, and integrations.',
    amount: '$25,000 - $150,000',
    deadline: 'Rolling',
    category: 'defi',
    ecosystem: 'multi-chain',
    region: 'global',
    grantType: 'grant',
    link: 'https://www.uniswapfoundation.org/grants',
    tags: ['DEX', 'AMM', 'DeFi'],
  },
  {
    id: '5',
    title: 'Filecoin Dev Grants',
    organization: 'Filecoin Foundation',
    description: 'Building decentralized storage solutions and tools for the Filecoin and IPFS ecosystem.',
    amount: '$5,000 - $50,000',
    deadline: '2024-02-28',
    category: 'infrastructure',
    ecosystem: 'other',
    region: 'global',
    grantType: 'grant',
    link: 'https://grants.filecoin.io/',
    tags: ['Storage', 'IPFS', 'Filecoin'],
  },
  {
    id: '6',
    title: 'The Graph Grants',
    organization: 'The Graph Foundation',
    description: 'Funding for subgraph development, indexing tools, and Graph ecosystem improvements.',
    amount: '$10,000 - $75,000',
    deadline: 'Rolling',
    category: 'tooling',
    ecosystem: 'multi-chain',
    region: 'global',
    grantType: 'grant',
    link: 'https://thegraph.com/ecosystem/grants/',
    tags: ['Indexing', 'Subgraphs', 'Data'],
  },
  {
    id: '7',
    title: 'Optimism RetroPGF',
    organization: 'Optimism Foundation',
    description: 'Retroactive public goods funding for projects that have contributed to the Optimism ecosystem.',
    amount: 'Variable (pool-based)',
    deadline: '2024-05-01',
    category: 'infrastructure',
    ecosystem: 'ethereum',
    region: 'global',
    grantType: 'retroactive',
    link: 'https://app.optimism.io/retropgf',
    tags: ['L2', 'Public Goods', 'Retroactive'],
    featured: true,
  },
  {
    id: '8',
    title: 'Gitcoin Grants',
    organization: 'Gitcoin',
    description: 'Quadratic funding rounds for open source projects across multiple ecosystems.',
    amount: 'Variable (QF)',
    deadline: 'Quarterly rounds',
    category: 'other',
    ecosystem: 'multi-chain',
    region: 'global',
    grantType: 'grant',
    link: 'https://grants.gitcoin.co/',
    tags: ['Open Source', 'QF', 'Community'],
  },
  {
    id: '9',
    title: 'Aave Grants DAO',
    organization: 'Aave Grants DAO',
    description: 'Supporting development of tools, integrations, and research for the Aave protocol.',
    amount: '$5,000 - $100,000',
    deadline: 'Rolling',
    category: 'defi',
    ecosystem: 'multi-chain',
    region: 'global',
    grantType: 'grant',
    link: 'https://aavegrants.org/',
    tags: ['Lending', 'DeFi', 'Aave'],
  },
  {
    id: '10',
    title: 'Cosmos Ecosystem Grants',
    organization: 'Interchain Foundation',
    description: 'Building interoperability solutions and IBC-enabled applications in the Cosmos ecosystem.',
    amount: '$20,000 - $250,000',
    deadline: '2024-03-15',
    category: 'infrastructure',
    ecosystem: 'cosmos',
    region: 'global',
    grantType: 'grant',
    link: 'https://interchain.io/',
    tags: ['IBC', 'Cosmos', 'Interoperability'],
  },
  {
    id: '11',
    title: 'NFT Developer Bounties',
    organization: 'OpenSea',
    description: 'Bug bounties and feature bounties for NFT marketplace integrations and tooling.',
    amount: '$1,000 - $25,000',
    deadline: 'Ongoing',
    category: 'nft',
    ecosystem: 'multi-chain',
    region: 'global',
    grantType: 'bounty',
    link: 'https://opensea.io/blog',
    tags: ['NFT', 'Marketplace', 'Bounty'],
  },
  {
    id: '12',
    title: 'GameFi Accelerator',
    organization: 'Immutable X',
    description: 'Accelerator program for Web3 gaming studios building on Immutable.',
    amount: '$100,000 + support',
    deadline: '2024-04-30',
    category: 'gaming',
    ecosystem: 'ethereum',
    region: 'global',
    grantType: 'accelerator',
    link: 'https://www.immutable.com/',
    tags: ['Gaming', 'NFT', 'Accelerator'],
  },
  {
    id: '13',
    title: 'Social Protocol Grant',
    organization: 'Lens Protocol',
    description: 'Building social applications and integrations on Lens Protocol.',
    amount: '$15,000 - $80,000',
    deadline: 'Rolling',
    category: 'social',
    ecosystem: 'polygon',
    region: 'global',
    grantType: 'grant',
    link: 'https://lens.xyz/',
    tags: ['Social', 'Lens', 'Web3 Social'],
  },
  {
    id: '14',
    title: 'DAO Tooling Grants',
    organization: 'Aragon',
    description: 'Funding for DAO infrastructure, governance tools, and organizational primitives.',
    amount: '$10,000 - $50,000',
    deadline: '2024-03-01',
    category: 'dao',
    ecosystem: 'ethereum',
    region: 'global',
    grantType: 'grant',
    link: 'https://aragon.org/grants',
    tags: ['DAO', 'Governance', 'Tooling'],
  },
  {
    id: '15',
    title: 'European Blockchain Grant',
    organization: 'EU Blockchain Observatory',
    description: 'Funding for blockchain research and development projects based in Europe.',
    amount: '€50,000 - €500,000',
    deadline: '2024-06-30',
    category: 'infrastructure',
    ecosystem: 'multi-chain',
    region: 'europe',
    grantType: 'grant',
    link: 'https://www.eublockchainforum.eu/',
    tags: ['Research', 'Europe', 'Enterprise'],
  },
  {
    id: '16',
    title: 'Arbitrum Foundation Grants',
    organization: 'Arbitrum Foundation',
    description: 'Building scalable DeFi and infrastructure on Arbitrum One and Nova.',
    amount: '$25,000 - $150,000',
    deadline: 'Rolling',
    category: 'defi',
    ecosystem: 'ethereum',
    region: 'global',
    grantType: 'grant',
    link: 'https://arbitrum.foundation/grants',
    tags: ['L2', 'DeFi', 'Arbitrum', 'Scaling'],
  },
  {
    id: '17',
    title: 'Base Ecosystem Fund',
    organization: 'Base',
    description: 'Supporting builders creating consumer-friendly apps on Base.',
    amount: '$10,000 - $100,000',
    deadline: 'Rolling',
    category: 'social',
    ecosystem: 'ethereum',
    region: 'global',
    grantType: 'grant',
    link: 'https://base.org/ecosystem',
    tags: ['Consumer', 'Social', 'Base', 'L2'],
    featured: true,
  },
  {
    id: '18',
    title: 'Starknet Grants',
    organization: 'StarkWare',
    description: 'Funding for ZK-powered applications and Cairo development on Starknet.',
    amount: '$20,000 - $200,000',
    deadline: '2024-05-31',
    category: 'infrastructure',
    ecosystem: 'ethereum',
    region: 'global',
    grantType: 'grant',
    link: 'https://starkware.co/grants/',
    tags: ['ZK', 'Cairo', 'Starknet', 'L2'],
  },
  {
    id: '19',
    title: 'Solana Foundation Grants',
    organization: 'Solana Foundation',
    description: 'Building high-performance dApps and infrastructure on Solana.',
    amount: '$50,000 - $500,000',
    deadline: 'Rolling',
    category: 'infrastructure',
    ecosystem: 'solana',
    region: 'global',
    grantType: 'grant',
    link: 'https://solana.org/grants',
    tags: ['Solana', 'High-Performance', 'DeFi', 'NFT'],
    featured: true,
  },
  {
    id: '20',
    title: 'NEAR Grants Program',
    organization: 'NEAR Foundation',
    description: 'Supporting user-friendly Web3 applications built on NEAR Protocol.',
    amount: '$10,000 - $250,000',
    deadline: 'Rolling',
    category: 'tooling',
    ecosystem: 'other',
    region: 'global',
    grantType: 'grant',
    link: 'https://near.org/grants',
    tags: ['NEAR', 'Sharding', 'Consumer', 'AI'],
  },
  {
    id: '21',
    title: 'Chainlink Community Grants',
    organization: 'Chainlink',
    description: 'Oracle integrations, data feeds, and cross-chain infrastructure.',
    amount: '$5,000 - $100,000',
    deadline: 'Rolling',
    category: 'infrastructure',
    ecosystem: 'multi-chain',
    region: 'global',
    grantType: 'grant',
    link: 'https://chain.link/community/grants',
    tags: ['Oracle', 'Data', 'Chainlink', 'CCIP'],
  },
];

// Helper to get recommended grants based on repo analysis
export function getRecommendedGrants(
  languages: string[],
  tags: string[]
): Grant[] {
  const normalizedLanguages = languages.map(l => l.toLowerCase());
  const normalizedTags = tags.map(t => t.toLowerCase());
  
  return grantsData
    .map(grant => {
      let score = 0;
      
      // Check tag matches
      grant.tags.forEach(tag => {
        if (normalizedTags.some(t => t.includes(tag.toLowerCase()) || tag.toLowerCase().includes(t))) {
          score += 2;
        }
      });
      
      // Solidity/smart contracts -> DeFi grants
      if (normalizedLanguages.includes('solidity')) {
        if (['defi', 'infrastructure'].includes(grant.category)) {
          score += 3;
        }
      }
      
      // TypeScript/JavaScript -> Tooling grants
      if (normalizedLanguages.includes('typescript') || normalizedLanguages.includes('javascript')) {
        if (['tooling', 'infrastructure'].includes(grant.category)) {
          score += 2;
        }
      }
      
      // Rust -> Infrastructure grants
      if (normalizedLanguages.includes('rust')) {
        if (['infrastructure', 'tooling'].includes(grant.category)) {
          score += 3;
        }
      }
      
      // Featured grants get bonus
      if (grant.featured) {
        score += 1;
      }
      
      return { grant, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ grant }) => grant);
}
