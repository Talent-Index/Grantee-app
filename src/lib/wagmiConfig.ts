import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalancheFuji, avalanche } from 'wagmi/chains';

// WalletConnect Project ID
const WALLETCONNECT_PROJECT_ID = '44df16e20cb88f941df56ee77d0f7918';

export const wagmiConfig = getDefaultConfig({
  appName: 'Grantee - Grant Intelligence API',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [avalancheFuji, avalanche],
  ssr: false,
});

export { avalancheFuji, avalanche };

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = [43113, 43114] as const;
export type SupportedChainId = typeof SUPPORTED_CHAIN_IDS[number];

export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId as SupportedChainId);
}
