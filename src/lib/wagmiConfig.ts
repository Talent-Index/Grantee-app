// src/lib/wagmiConfig.ts
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalancheFuji, avalanche } from "wagmi/chains";

// NOTE: You MUST set VITE_WALLETCONNECT_PROJECT_ID in Vercel + local .env
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  // This prevents silent failures where RainbowKit never shows
  console.warn(
    "[wagmiConfig] Missing VITE_WALLETCONNECT_PROJECT_ID. Wallet connect will not work."
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: "Grantees",
  projectId: projectId || "MISSING_PROJECT_ID",
  chains: [avalancheFuji, avalanche],
  ssr: false,
});
