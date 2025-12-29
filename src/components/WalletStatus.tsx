import { useAccount, useChainId, useSwitchChain, useBalance, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { Wallet, AlertTriangle, ExternalLink } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getUsdcAddress, getChainName } from "@/lib/tokens";
import { isSupportedChain } from "@/lib/wagmiConfig"; // keep this if you already have it
import { getSettings, getDebugMode } from "@/lib/config";

// ERC20 ABI for balanceOf
const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getSnowtraceBase(chainId?: number) {
  // Fuji: https://testnet.snowtrace.io
  // Avalanche C-Chain: https://snowtrace.io
  if (chainId === 43113) return "https://testnet.snowtrace.io";
  return "https://snowtrace.io";
}

export function WalletStatus() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const settings = getSettings();
  const debug = getDebugMode();

  // Native AVAX balance
  const { data: nativeBalance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  // USDC balance via contract read
  const usdcAddress = getUsdcAddress(chainId);

  const { data: usdcBalanceRaw } = useReadContract({
    address: (usdcAddress ?? undefined) as `0x${string}` | undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!usdcAddress },
  });

  const isSupported = isSupportedChain(chainId);
  const chainName = getChainName(chainId);

  const formatNative = () => {
    if (!nativeBalance) return "0.00";
    const value = parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals));
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const formatUsdc = () => {
    if (!usdcBalanceRaw) return "0.00";
    const value = parseFloat(formatUnits(usdcBalanceRaw as bigint, 6)); // USDC 6 decimals
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Wallet</span>
          </div>

          <Badge variant={isSupported ? "secondary" : "destructive"} className="text-xs">
            {chainName}
          </Badge>
        </div>

        {/* If NOT connected -> show RainbowKit connect UI */}
        {!isConnected || !address ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Connect your wallet to pay with x402 and unlock analysis.
            </div>

            <div className="flex justify-start">
              <ConnectButton
                accountStatus="avatar"
                chainStatus="icon"
                showBalance={false}
              />
            </div>

            {/* Debug section even when disconnected */}
            {debug && (
              <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground space-y-1">
                <div className="font-medium text-foreground">Debug Info</div>
                <div>Connected: {String(isConnected)}</div>
                <div>Chain ID: {chainId}</div>
                <div>API: {settings.apiBaseUrl}</div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Address */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Address</span>
              <a
                href={`${getSnowtraceBase(chainId)}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-foreground hover:text-primary flex items-center gap-1"
              >
                {truncateAddress(address)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Chain ID */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Chain ID</span>
              <span className="font-mono text-foreground">{chainId}</span>
            </div>

            {/* AVAX Balance */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AVAX</span>
              <span className="font-mono text-foreground">
                {formatNative()} {nativeBalance?.symbol ?? "AVAX"}
              </span>
            </div>

            {/* USDC Balance */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">USDC</span>
              {usdcAddress ? (
                <span className="font-mono text-foreground">{formatUsdc()} USDC</span>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  Not configured for this chain
                </span>
              )}
            </div>

            {/* Network Warning */}
            {!isSupported && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-warning mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Unsupported Network</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isPending}
                    onClick={() => switchChain({ chainId: 43113 })}
                  >
                    Switch to Fuji
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isPending}
                    onClick={() => switchChain({ chainId: 43114 })}
                  >
                    Switch to Avalanche
                  </Button>
                </div>
              </div>
            )}

            {/* Debug Section */}
            {debug && (
              <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground space-y-1">
                <div className="font-medium text-foreground">Debug Info</div>
                <div>Chain ID: {chainId}</div>
                <div>Address: {address}</div>
                <div>API: {settings.apiBaseUrl}</div>
                {usdcAddress && <div>USDC: {truncateAddress(usdcAddress)}</div>}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
