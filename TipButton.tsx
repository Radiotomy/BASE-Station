'use client'

import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DollarSign, Wallet, AlertCircle, Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { 
  Transaction, 
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from '@coinbase/onchainkit/transaction'
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction'
import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import { Avatar } from '@coinbase/onchainkit/identity'
import { parseEther } from 'viem'
import { base } from 'wagmi/chains'
import type { AudiusTrack } from '@/types/audius'
import { getPrimaryWallet } from '@/services/audiusWallets'

interface TipButtonProps {
  track: AudiusTrack
}

export const TipButton: FC<TipButtonProps> = ({ track }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedAmount, setSelectedAmount] = useState<string>('')
  const [artistAddress, setArtistAddress] = useState<string | null>(null)
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const { address, isConnected } = useAccount()

  // Fetch artist's wallet address when dialog opens
  useEffect(() => {
    if (isOpen && !artistAddress && !isLoadingWallet) {
      fetchArtistWallet()
    }
  }, [isOpen, artistAddress, isLoadingWallet])

  const fetchArtistWallet = async (): Promise<void> => {
    setIsLoadingWallet(true)
    setWalletError(null)
    
    try {
      const wallet = await getPrimaryWallet(track.user.id)
      
      if (wallet) {
        setArtistAddress(wallet)
      } else {
        setWalletError('Artist has no connected wallet')
      }
    } catch (error) {
      console.error('Error fetching artist wallet:', error)
      setWalletError('Failed to fetch artist wallet')
    } finally {
      setIsLoadingWallet(false)
    }
  }

  const handleTipSelect = (amount: string): void => {
    setSelectedAmount(amount)
  }

  const getTipCalls = (ethAmount: string) => {
    return [
      {
        to: artistAddress as `0x${string}`,
        value: parseEther(ethAmount),
        data: '0x' as `0x${string}`,
      },
    ]
  }

  const handleOnStatus = (status: LifecycleStatus): void => {
    console.log('Tip transaction status:', status)
    if (status.statusName === 'success') {
      setIsOpen(false)
      setSelectedAmount('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-white/70 hover:text-cyan-400 hover:bg-white/10 active:bg-white/20 touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
          title="Tip Artist"
        >
          <DollarSign className="w-5 h-5 sm:w-4 sm:h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl flex items-center gap-2">
            <span className="text-cyan-400">💙</span> Tip {track.user.name}
          </DialogTitle>
          <DialogDescription className="text-white/70 text-sm">
            Support this artist directly on Base blockchain
          </DialogDescription>
        </DialogHeader>
        
        {/* Loading State */}
        {isLoadingWallet ? (
          <div className="space-y-4 mt-4">
            <div className="text-center py-12 px-4 bg-white/5 rounded-lg border border-white/10">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-cyan-400 animate-spin" />
              <p className="text-white/80 mb-2">Fetching artist's wallet...</p>
              <p className="text-white/50 text-sm">Connecting to Audius network</p>
            </div>
          </div>
        ) : walletError || !artistAddress ? (
          /* Error State - No Wallet Connected */
          <div className="space-y-4 mt-4">
            <div className="text-center py-8 px-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-400" />
              <p className="text-orange-300 mb-2 font-semibold">
                {walletError || 'Artist has no connected wallet'}
              </p>
              <p className="text-white/60 text-sm mb-4">
                This artist hasn't connected a wallet to receive tips yet.
              </p>
              <Button
                onClick={fetchArtistWallet}
                variant="outline"
                className="border-orange-500/50 hover:bg-orange-500/10 text-orange-300"
              >
                Try Again
              </Button>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-white/60">
                💡 Tip: Artists can connect their wallets on Audius to receive tips directly on Base blockchain.
              </p>
            </div>
          </div>
        ) : !isConnected ? (
          <div className="space-y-4 mt-4">
            <div className="text-center py-8 px-4 bg-white/5 rounded-lg border border-white/10">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
              <p className="text-white/80 mb-4">
                Connect your wallet to tip this artist
              </p>
              <ConnectWallet className="w-full btn-studio">
                <Avatar className="h-5 w-5" />
                <span>Connect Wallet</span>
              </ConnectWallet>
            </div>
            {/* Show artist wallet info */}
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-400 flex items-start gap-2">
                <span>✅</span>
                <span>Artist wallet verified: {artistAddress.slice(0, 6)}...{artistAddress.slice(-4)}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Tip Amount Selection */}
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <Button
                onClick={() => handleTipSelect('0.001')}
                className={`${
                  selectedAmount === '0.001'
                    ? 'bg-cyan-600 hover:bg-cyan-700'
                    : 'bg-white/10 hover:bg-white/20'
                } text-white h-16 md:h-20 flex-col gap-1 touch-manipulation`}
              >
                <span className="text-lg md:text-2xl font-bold">0.001 ETH</span>
                <span className="text-[10px] md:text-xs opacity-70">Small Tip</span>
              </Button>
              <Button
                onClick={() => handleTipSelect('0.005')}
                className={`${
                  selectedAmount === '0.005'
                    ? 'bg-cyan-600 hover:bg-cyan-700'
                    : 'bg-white/10 hover:bg-white/20'
                } text-white h-16 md:h-20 flex-col gap-1 touch-manipulation`}
              >
                <span className="text-lg md:text-2xl font-bold">0.005 ETH</span>
                <span className="text-[10px] md:text-xs opacity-70">Medium Tip</span>
              </Button>
              <Button
                onClick={() => handleTipSelect('0.01')}
                className={`${
                  selectedAmount === '0.01'
                    ? 'bg-cyan-600 hover:bg-cyan-700'
                    : 'bg-white/10 hover:bg-white/20'
                } text-white h-16 md:h-20 flex-col gap-1 touch-manipulation`}
              >
                <span className="text-lg md:text-2xl font-bold">0.01 ETH</span>
                <span className="text-[10px] md:text-xs opacity-70">Large Tip</span>
              </Button>
            </div>

            {/* Transaction Component */}
            {selectedAmount && (
              <div className="space-y-3">
                <Transaction
                  chainId={base.id}
                  calls={getTipCalls(selectedAmount)}
                  onStatus={handleOnStatus}
                >
                  <TransactionButton 
                    text={`Send ${selectedAmount} ETH`}
                    className="w-full btn-studio h-12 text-base touch-manipulation"
                  />
                  <TransactionStatus>
                    <TransactionStatusLabel />
                    <TransactionStatusAction />
                  </TransactionStatus>
                </Transaction>
              </div>
            )}

            {/* Info Section */}
            <div className="space-y-2 mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="text-cyan-400">⛓️</span>
                <span>Sending on Base</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="text-cyan-400">💰</span>
                <span>100% goes to the artist</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="text-cyan-400">🎵</span>
                <span>@{track.user.handle}</span>
              </div>
            </div>

            {track.download?.is_downloadable && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs text-green-400 flex items-center gap-2">
                  <span>💎</span>
                  <span>This track is available for download!</span>
                </p>
              </div>
            )}

            {/* Artist wallet info */}
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-400 flex items-start gap-2 mb-1">
                <span>✅</span>
                <span className="font-semibold">Artist Wallet Verified</span>
              </p>
              <p className="text-xs text-white/60 ml-5 font-mono">
                {artistAddress.slice(0, 10)}...{artistAddress.slice(-8)}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
