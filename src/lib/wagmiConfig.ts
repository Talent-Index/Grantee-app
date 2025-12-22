import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalancheFuji } from 'wagmi/chains';
import { config } from './config';

export const wagmiConfig = getDefaultConfig({
  appName: 'Grantee - Grant Intelligence API',
  projectId: config.walletConnectProjectId || 'demo-project-id',
  chains: [avalancheFuji],
  ssr: false,
});

export { avalancheFuji };
