import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { 
  AICC_TOKEN_ADDRESS, 
  PAYMENT_RECEIVER_ADDRESS, 
  ERC20_ABI, 
  AICC_TOKEN_DECIMALS 
} from '../lib/wagmi';

export type PaymentStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

export interface UseAICCPaymentReturn {
  // State
  isConnected: boolean;
  address: `0x${string}` | undefined;
  balance: bigint | undefined;
  formattedBalance: string;
  paymentStatus: PaymentStatus;
  error: Error | null;
  txHash: `0x${string}` | undefined;
  
  // Actions
  pay: (amount: number) => Promise<void>;
  reset: () => void;
}

export function useAICCPayment(): UseAICCPaymentReturn {
  const { address, isConnected } = useAccount();
  
  // Read AICC token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: AICC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Write contract for token transfer
  const { 
    writeContract, 
    data: txHash, 
    error: writeError, 
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Calculate payment status
  const getPaymentStatus = (): PaymentStatus => {
    if (isWritePending) return 'pending';
    if (isConfirming) return 'confirming';
    if (isConfirmed) return 'success';
    if (writeError || confirmError) return 'error';
    return 'idle';
  };

  // Format balance for display
  const formattedBalance = balance 
    ? formatUnits(balance, AICC_TOKEN_DECIMALS) 
    : '0';

  // Pay function
  const pay = async (amount: number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    const amountInWei = parseUnits(amount.toString(), AICC_TOKEN_DECIMALS);

    // Check if user has enough balance
    if (balance && balance < amountInWei) {
      throw new Error('Insufficient AICC token balance');
    }

    writeContract({
      address: AICC_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [PAYMENT_RECEIVER_ADDRESS, amountInWei],
    });
  };

  // Reset function
  const reset = () => {
    resetWrite();
    refetchBalance();
  };

  return {
    isConnected,
    address,
    balance,
    formattedBalance,
    paymentStatus: getPaymentStatus(),
    error: writeError || confirmError || null,
    txHash,
    pay,
    reset,
  };
}
