// USDC token addresses by chain ID
export const USDC_BY_CHAIN: Record<number, `0x${string}`> = {
  43113: '0x5425890298aed601595a70AB815c96711a31Bc65', // Avalanche Fuji USDC
  43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // Avalanche Mainnet USDC
};

export function getUsdcAddress(chainId: number): `0x${string}` | null {
  return USDC_BY_CHAIN[chainId] ?? null;
}

// Chain names for display
export const CHAIN_NAMES: Record<number, string> = {
  43113: 'Avalanche Fuji',
  43114: 'Avalanche',
};

export function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId] ?? `Chain ${chainId}`;
}
