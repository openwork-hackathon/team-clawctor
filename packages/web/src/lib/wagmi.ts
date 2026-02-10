import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

// AICC Token contract address on Base
export const AICC_TOKEN_ADDRESS = '0x6F947b45C023Ef623b39331D0C4D21FBC51C1d45' as const;

// Payment receiver address
export const PAYMENT_RECEIVER_ADDRESS = '0xA53C3d0d430c8b87E1b56f5E369fB5b31Dc3102e' as const;

// AICC Token decimals (standard ERC20 is 18)
export const AICC_TOKEN_DECIMALS = 18;

// Wagmi configuration for Base chain
export const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'Clawctor AI Security',
      preference: 'all',
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
