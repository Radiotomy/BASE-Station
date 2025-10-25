'use client'

import type { FC } from 'react'
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet'
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity'

export const WalletButton: FC = () => {
  return (
    <Wallet>
      <ConnectWallet className="btn-studio h-10 px-3 md:px-4 text-xs md:text-sm min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 touch-manipulation">
        <Avatar className="h-5 w-5 md:h-6 md:w-6" />
        <Name className="hidden sm:inline" />
      </ConnectWallet>
      <WalletDropdown>
        <Identity 
          className="px-4 pt-3 pb-2 hover:bg-white/5" 
          hasCopyAddressOnClick
        >
          <Avatar />
          <Name />
          <Address className="text-xs" />
          <EthBalance />
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  )
}
