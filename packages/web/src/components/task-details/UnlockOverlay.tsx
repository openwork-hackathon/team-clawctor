import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAICCPayment, type PaymentStatus } from '../../hooks/useAICCPayment';

interface ReportStats {
  pages: number;
  insights: number;
  format: string;
}

interface UnlockOverlayProps {
  tokenCost: number;
  stats: ReportStats;
  onUnlockSuccess?: (txHash: `0x${string}`) => void;
  onTopUp?: () => void;
}

function PaymentStatusIndicator({ status, txHash }: { status: PaymentStatus; txHash?: `0x${string}` }) {
  if (status === 'pending') {
    return (
      <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        <span>Waiting for wallet confirmation...</span>
      </div>
    );
  }

  if (status === 'confirming') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <span>Confirming transaction on Base...</span>
        </div>
        {txHash && (
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View on BaseScan →
          </a>
        )}
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <span className="material-symbols-outlined">check_circle</span>
          <span>Payment successful!</span>
        </div>
        {txHash && (
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View transaction →
          </a>
        )}
      </div>
    );
  }

  return null;
}

function ConnectWalletSection() {
  const { connect, connectors, isPending, error } = useConnect();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
        Connect your wallet to pay with AICC tokens on Base
      </p>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full rounded-xl h-14 px-6 bg-primary text-white text-lg font-bold shadow-xl shadow-primary/30 active:scale-[0.98] transition-transform hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              Connecting...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
              Connect {connector.name}
            </>
          )}
        </button>
      ))}
      {error && (
        <p className="text-sm text-red-500 text-center">{error.message}</p>
      )}
    </div>
  );
}

export function UnlockOverlay({
  tokenCost,
  stats,
  onUnlockSuccess,
  onTopUp,
}: UnlockOverlayProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { 
    formattedBalance, 
    paymentStatus, 
    error, 
    txHash, 
    pay, 
    reset 
  } = useAICCPayment();
  
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setPaymentError(null);
    try {
      await pay(tokenCost);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment failed');
    }
  };

  // Handle successful payment
  if (paymentStatus === 'success' && txHash) {
    // Auto-trigger unlock success after a short delay
    setTimeout(() => {
      onUnlockSuccess?.(txHash);
    }, 2000);
  }

  const currentBalance = parseFloat(formattedBalance);
  const hasInsufficientBalance = currentBalance < tokenCost;
  const isPaymentInProgress = paymentStatus === 'pending' || paymentStatus === 'confirming';

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-20">
      <div className="max-w-md w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/40 dark:border-slate-700/50">
        {/* Lock Icon */}
        <div className="size-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl">
            {paymentStatus === 'success' ? 'lock_open' : 'lock'}
          </span>
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
          {paymentStatus === 'success' ? 'Report Unlocked!' : 'Report Ready for Review'}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          {paymentStatus === 'success' 
            ? 'Your payment was successful. Loading your full report...'
            : 'Your comprehensive AI health check report is ready. Unlock now to access detailed vulnerabilities, compliance scores, and remediation steps.'
          }
        </p>

        {/* Payment Status */}
        {(paymentStatus !== 'idle' || paymentError || error) && (
          <div className="mb-6">
            <PaymentStatusIndicator status={paymentStatus} txHash={txHash} />
            {(paymentError || error) && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {paymentError || error?.message}
                </p>
                <button
                  onClick={reset}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Wallet Connection / Payment Section */}
        {paymentStatus !== 'success' && (
          <div className="flex flex-col gap-3">
            {!isConnected ? (
              <ConnectWalletSection />
            ) : (
              <>
                {/* Connected Wallet Info */}
                <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="text-xs text-slate-500 hover:text-red-500"
                  >
                    Disconnect
                  </button>
                </div>

                {/* Unlock Button */}
                <button
                  onClick={handleUnlock}
                  disabled={isPaymentInProgress || hasInsufficientBalance}
                  className="flex items-center justify-center w-full rounded-xl h-14 px-6 bg-primary text-white text-lg font-bold shadow-xl shadow-primary/30 active:scale-[0.98] transition-transform hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPaymentInProgress ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    <>
                      Unlock Full Report
                      <span className="mx-3 h-4 w-px bg-white/30" />
                      <span className="flex items-center gap-1.5">
                        <img 
                          src="/aicc-token.svg" 
                          alt="AICC" 
                          className="w-5 h-5"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span>{tokenCost} AICC</span>
                      </span>
                    </>
                  )}
                </button>

                {/* Balance Info */}
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <span>Balance: {parseFloat(formattedBalance).toLocaleString()} AICC</span>
                  {hasInsufficientBalance && (
                    <span className="text-red-500">(Insufficient)</span>
                  )}
                  <button
                    onClick={onTopUp}
                    className="text-primary hover:underline"
                  >
                    Top up
                  </button>
                </div>

                {/* Base Network Badge */}
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" fill="currentColor"/>
                  </svg>
                  <span>Powered by Base</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Report Stats */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between">
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400">Pages</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {stats.pages} Pages
            </p>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400">Insights</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {stats.insights} Key Findings
            </p>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400">Format</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {stats.format}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
