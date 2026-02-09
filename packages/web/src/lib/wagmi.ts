import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

// AICC Token contract address on Base
export const AICC_TOKEN_ADDRESS = '0x919e2E7B0E6F1F2f0f0A0a0a0a0a0a0a0a0a0a0a' as const; // TODO: Replace with actual AICC token address

// Payment receiver address
export const PAYMENT_RECEIVER_ADDRESS = '0x1234567890123456789012345678901234567890' as const; // TODO: Replace with actual receiver address

// AICC Token decimals (standard ERC20 is 18)
export const AICC_TOKEN_DECIMALS = 18;

// Wagmi configuration for Base chain
export const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Clawctor AI Security',
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

// ERC20 ABI for token transfers
export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;
