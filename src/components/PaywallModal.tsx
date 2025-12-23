import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, AlertCircle, CreditCard, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { X402PaymentRequirement } from '@/lib/types';
import { formatAmount, getNetworkName, truncateAddress } from '@/lib/x402';
import { devLog } from '@/lib/config';

type PaywallStep = 'info' | 'signing' | 'settling' | 'success' | 'error';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requirement: X402PaymentRequirement | null;
  step: PaywallStep;
  error?: string;
}

const stepInfo: Record<PaywallStep, { icon: React.ReactNode; title: string; description: string }> = {
  info: {
    icon: <CreditCard className="h-8 w-8 text-primary" />,
    title: 'Payment Required',
    description: 'This analysis requires a small payment via the x402 protocol.',
  },
  signing: {
    icon: <Wallet className="h-8 w-8 text-primary animate-pulse" />,
    title: 'Sign Transaction',
    description: 'Please sign the payment authorization in your wallet.',
  },
  settling: {
    icon: <Loader2 className="h-8 w-8 text-primary animate-spin" />,
    title: 'Processing Payment',
    description: 'Your payment is being verified and settled on-chain.',
  },
  success: {
    icon: <CheckCircle2 className="h-8 w-8 text-success" />,
    title: 'Payment Successful',
    description: 'Your payment has been processed. Fetching results...',
  },
  error: {
    icon: <AlertCircle className="h-8 w-8 text-destructive" />,
    title: 'Payment Failed',
    description: 'There was an issue processing your payment.',
  },
};

export function PaywallModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  requirement, 
  step, 
  error 
}: PaywallModalProps) {
  const currentStep = stepInfo[step];
  
  // Safely get amount from requirement
  const displayAmount = requirement ? (requirement.amount ?? requirement.maxAmountRequired) : undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && step !== 'signing' && step !== 'settling') {
              devLog('paywall-backdrop-close');
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <Card variant="glass" className="w-full max-w-md p-6 relative">
              {/* Close button */}
              {step !== 'signing' && step !== 'settling' && (
                <button
                  onClick={() => {
                    devLog('paywall-close');
                    onClose();
                  }}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* Content */}
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-4 p-3 rounded-full bg-secondary">
                  {currentStep.icon}
                </div>

                {/* Title & Description */}
                <h2 className="text-xl font-semibold mb-2">{currentStep.title}</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {error || currentStep.description}
                </p>

                {/* Payment Details */}
                {requirement && step === 'info' && (
                  <div className="w-full space-y-3 mb-6 p-4 rounded-lg bg-secondary/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-mono font-semibold text-primary">
                        {formatAmount(displayAmount)} USDC
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Network</span>
                      <span className="font-medium">
                        {getNetworkName(requirement.network)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pay to</span>
                      <span className="font-mono text-xs">
                        {truncateAddress(requirement.payTo)}
                      </span>
                    </div>
                    {requirement.maxTimeoutSeconds && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Timeout</span>
                        <span className="font-medium">
                          {requirement.maxTimeoutSeconds}s
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress indicator for signing/settling */}
                {(step === 'signing' || step === 'settling') && (
                  <div className="w-full mb-6">
                    <div className="flex justify-between mb-2 text-xs text-muted-foreground">
                      <span className={step === 'signing' ? 'text-primary' : 'text-success'}>
                        Sign
                      </span>
                      <span className={step === 'settling' ? 'text-primary' : ''}>
                        Settle
                      </span>
                      <span>Complete</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ 
                          width: step === 'signing' ? '33%' : step === 'settling' ? '66%' : '100%' 
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="w-full flex gap-3">
                  {step === 'info' && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          devLog('paywall-cancel');
                          onClose();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="hero"
                        className="flex-1"
                        onClick={() => {
                          devLog('paywall-confirm');
                          onConfirm();
                        }}
                      >
                        Pay {formatAmount(displayAmount)} USDC
                      </Button>
                    </>
                  )}
                  
                  {step === 'error' && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          devLog('paywall-dismiss-error');
                          onClose();
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => {
                          devLog('paywall-retry');
                          onConfirm();
                        }}
                      >
                        Retry
                      </Button>
                    </>
                  )}

                  {step === 'success' && (
                    <Button
                      variant="success"
                      className="flex-1"
                      onClick={() => {
                        devLog('paywall-success-close');
                        onClose();
                      }}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
