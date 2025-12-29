// src/components/WalletStatus.tsx
import { useAccount, useChainId, useSwitchChain, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { Wallet, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUsdcAddress, getChainName } from '@/lib/tokens';
import { isSupportedChain } from '@/lib/wagmiConfig';
import { getSettings, getDebugMode } from '@/lib/config';

// ERC20 ABI for balanceOf
const erc20Abi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletStatus() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const settings = getSettings();
  const debug = getDebugMode();

  const { data: nativeBalance } = useBalance({
    address,
  });

  const usdcAddress = getUsdcAddress(chainId);

  const { data: usdcBalanceRaw } = useReadContract({
    address: usdcAddress ?? undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(usdcAddress && address),
    },
  });

  if (!isConnected || !address) return null;

  const isSupported = isSupportedChain(chainId);
  const chainName = getChainName(chainId);

  const formatBalance = (balance: typeof nativeBalance) => {
    if (!balance) return '0.00';
    const value = parseFloat(formatUnits(balance.value, balance.decimals));
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const formatUsdcBalance = (raw: bigint | undefined) => {
    if (!raw) return '0.00';
    const value = parseFloat(formatUnits(raw, 6));
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Wallet</span>
          </div>
          <Badge variant={isSupported ? 'secondary' : 'destructive'} className="text-xs">
            {chainName}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Address</span>
          <a
            href={`https://${chainId === 43113 ? 'testnet.' : ''}snowtrace.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-foreground hover:text-primary flex items-center gap-1"
          >
            {truncateAddress(address)}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Chain ID</span>
          <span className="font-mono text-foreground">{chainId}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">AVAX</span>
          <span className="font-mono text-foreground">
            {formatBalance(nativeBalance)} {nativeBalance?.symbol ?? 'AVAX'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">USDC</span>
          {usdcAddress ? (
            <span className="font-mono text-foreground">{formatUsdcBalance(usdcBalanceRaw as bigint | undefined)} USDC</span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Not configured for this chain</span>
          )}
        </div>

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

        {debug && (
          <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground space-y-1">
            <div className="font-medium text-foreground">Debug Info</div>
            <div>Chain ID: {chainId}</div>
            <div>Address: {address}</div>
            <div>API: {settings.apiBaseUrl}</div>
            {usdcAddress && <div>USDC: {truncateAddress(usdcAddress)}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}