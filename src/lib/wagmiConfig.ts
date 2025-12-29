// src/lib/wagmiConfig.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { avalanche, avalancheFuji } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// ✅ Supported chains (Fuji + Mainnet)
export const chains = [avalancheFuji, avalanche] as const;

export const SUPPORTED_CHAIN_IDS = chains.map((c) => c.id) as number[];

export function isSupportedChain(chainId: number) {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
}

// ✅ Wagmi + RainbowKit config
export const wagmiConfig = getDefaultConfig({
  appName: 'Grantee',
  projectId: projectId || 'MISSING_WALLETCONNECT_PROJECT_ID',
  chains,
  transports: {
    [avalancheFuji.id]: http(),
    [avalanche.id]: http(),
  },
  ssr: false,
});