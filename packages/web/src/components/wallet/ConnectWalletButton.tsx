import { useAccount, useConnect, useDisconnect } from 'wagmi';

interface ConnectWalletButtonProps {
  className?: string;
}

export function ConnectWalletButton({ className = '' }: ConnectWalletButtonProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              Connecting...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              Connect {connector.name}
            </>
          )}
        </button>
      ))}
    </div>
  );
}
