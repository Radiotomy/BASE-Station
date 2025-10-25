/**
 * Token definitions for tipping on BASE Station
 */

export interface Token {
  symbol: string
  name: string
  address: `0x${string}` | null // null for native ETH
  decimals: number
  icon: string
  color: string
  presetAmounts: string[]
}

/**
 * Supported tokens for tipping
 * ETH - Native Base token
 * AUDIO - Audius token (would need bridge/wrapped version on Base)
 * BSTN - BASE Station native token
 */
export const SUPPORTED_TOKENS: Record<string, Token> = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    address: null, // Native token
    decimals: 18,
    icon: '⚡',
    color: 'from-blue-500 to-cyan-500',
    presetAmounts: ['0.001', '0.005', '0.01', '0.05']
  },
  AUDIO: {
    symbol: 'AUDIO',
    name: 'Audius',
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`, // Placeholder - would need real wrapped AUDIO address on Base
    decimals: 18,
    icon: '🎵',
    color: 'from-purple-500 to-pink-500',
    presetAmounts: ['10', '50', '100', '500']
  },
  BSTN: {
    symbol: 'BSTN',
    name: 'BASE Station',
    address: '0x0987654321098765432109876543210987654321' as `0x${string}`, // Placeholder - would need real BSTN token address
    decimals: 18,
    icon: '🎧',
    color: 'from-cyan-500 to-blue-500',
    presetAmounts: ['100', '500', '1000', '5000']
  }
}

export type TokenSymbol = keyof typeof SUPPORTED_TOKENS

/**
 * ERC20 Token ABI for transfer function
 */
export const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
] as const
