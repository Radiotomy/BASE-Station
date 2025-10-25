'use client'

import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign, Wallet, AlertCircle, Loader2, TrendingUp } from 'lucide-react'
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
import { parseEther, encodeFunctionData } from 'viem'
import { base } from 'wagmi/chains'
import type { AudiusTrack } from '@/types/audius'
import { getPrimaryWallet, fetchArtistWallets } from '@/services/audiusWallets'
import { addTipToHistory, getArtistTips } from '@/services/tipHistory'
import { SUPPORTED_TOKENS, ERC20_ABI, type TokenSymbol } from '@/types/tokens'
import { useToast } from '@/hooks/use-toast'

interface EnhancedTipButtonProps {
  track: AudiusTrack
}

export const EnhancedTipButton: FC<EnhancedTipButtonProps> = ({ track }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('ETH')
  const [selectedAmount, setSelectedAmount] = useState<string>('')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isCustom, setIsCustom] = useState<boolean>(false)
  const [artistAddress, setArtistAddress] = useState<string | null>(null)
  const [allWallets, setAllWallets] = useState<string[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string>('')
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const { address, isConnected } = useAccount()
  const { toast } = useToast()

  const tokenInfo = SUPPORTED_TOKENS[selectedToken]
  const previousTips = getArtistTips(track.user.id)

  // Fetch artist's wallet addresses when dialog opens
  useEffect(() => {
    if (isOpen && allWallets.length === 0 && !isLoadingWallet) {
      loadArtistWallets()
    }
  }, [isOpen, allWallets, isLoadingWallet])

  const loadArtistWallets = async (): Promise<void> => {
    setIsLoadingWallet(true)
    setWalletError(null)
    
    try {
      const wallets = await fetchArtistWallets(track.user.id)
      
      if (wallets.length > 0) {
        setAllWallets(wallets)
        setArtistAddress(wallets[0])
        setSelectedWallet(wallets[0])
      } else {
        setWalletError('Artist has no connected wallets')
      }
    } catch (error) {
      console.error('Error fetching artist wallets:', error)
      setWalletError('Failed to fetch artist wallets')
    } finally {
      setIsLoadingWallet(false)
    }
  }

  const handleTokenChange = (token: string): void => {
    setSelectedToken(token as TokenSymbol)
    setSelectedAmount('')
    setCustomAmount('')
    setIsCustom(false)
  }

  const handlePresetSelect = (amount: string): void => {
    setSelectedAmount(amount)
    setCustomAmount('')
    setIsCustom(false)
  }

  const handleCustomAmountChange = (value: string): void => {
    setCustomAmount(value)
    setSelectedAmount(value)
    setIsCustom(true)
  }

  const handleWalletChange = (wallet: string): void => {
    setSelectedWallet(wallet)
    setArtistAddress(wallet)
  }

  const getTipCalls = (amount: string) => {
    if (!artistAddress) return []

    // For native ETH
    if (selectedToken === 'ETH') {
      return [
        {
          to: artistAddress as `0x${string}`,
          value: parseEther(amount),
          data: '0x' as `0x${string}`,
        },
      ]
    }

    // For ERC20 tokens (AUDIO, BSTN)
    const tokenContract = tokenInfo.address
    if (!tokenContract) return []

    const transferData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [artistAddress as `0x${string}`, parseEther(amount)],
    })

    return [
      {
        to: tokenContract,
        value: BigInt(0),
        data: transferData as `0x${string}`,
      },
    ]
  }

  const handleOnStatus = (status: LifecycleStatus): void => {
    console.log('Tip transaction status:', status)
    
    if (status.statusName === 'success') {
      // Add to tip history
      if (address && selectedAmount) {
        const txHash = status.statusData?.transactionReceipts?.[0]?.transactionHash
        addTipToHistory(track, selectedAmount, selectedToken, address, txHash)
        
        // Show success toast
        toast({
          title: '🎉 Tip Sent Successfully!',
          description: `You tipped ${selectedAmount} ${selectedToken} to ${track.user.name}`,
          duration: 5000,
        })
      }
      
      // Reset and close
      setIsOpen(false)
      setSelectedAmount('')
      setCustomAmount('')
      setIsCustom(false)
    } else if (status.statusName === 'error') {
      toast({
        title: '❌ Tip Failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive',
        duration: 5000,
      })
    }
  }

  const finalAmount = isCustom ? customAmount : selectedAmount

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
      <DialogContent className="bg-gray-900 border-white/20 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl flex items-center gap-2">
            <span className="text-cyan-400">💙</span> Tip {track.user.name}
          </DialogTitle>
          <DialogDescription className="text-white/70 text-sm">
            Support this artist with ETH, $AUDIO, or $BSTN
          </DialogDescription>
        </DialogHeader>
        
        {/* Loading State */}
        {isLoadingWallet ? (
          <div className="space-y-4 mt-4">
            <div className="text-center py-12 px-4 bg-white/5 rounded-lg border border-white/10">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-cyan-400 animate-spin" />
              <p className="text-white/80 mb-2">Fetching artist wallets...</p>
              <p className="text-white/50 text-sm">Connecting to Audius network</p>
            </div>
          </div>
        ) : walletError || allWallets.length === 0 ? (
          /* Error State */
          <div className="space-y-4 mt-4">
            <div className="text-center py-8 px-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-400" />
              <p className="text-orange-300 mb-2 font-semibold">
                {walletError || 'No wallets connected'}
              </p>
              <p className="text-white/60 text-sm mb-4">
                This artist hasn't connected a wallet yet.
              </p>
              <Button
                onClick={loadArtistWallets}
                variant="outline"
                className="border-orange-500/50 hover:bg-orange-500/10 text-orange-300"
              >
                Try Again
              </Button>
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
            {artistAddress && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs text-green-400 flex items-start gap-2">
                  <span>✅</span>
                  <span>Artist wallet verified: {artistAddress.slice(0, 6)}...{artistAddress.slice(-4)}</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Token Selection */}
            <div className="space-y-2">
              <Label className="text-white/80">Select Token</Label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(SUPPORTED_TOKENS).map((token) => {
                  const info = SUPPORTED_TOKENS[token as TokenSymbol]
                  return (
                    <Button
                      key={token}
                      onClick={() => handleTokenChange(token)}
                      className={`${
                        selectedToken === token
                          ? `bg-gradient-to-r ${info.color} text-white`
                          : 'bg-white/10 hover:bg-white/20 text-white/80'
                      } h-14 flex-col gap-1`}
                    >
                      <span className="text-2xl">{info.icon}</span>
                      <span className="text-xs font-bold">{token}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Wallet Selection (if multiple) */}
            {allWallets.length > 1 && (
              <div className="space-y-2">
                <Label className="text-white/80">Artist Wallet</Label>
                <Select value={selectedWallet} onValueChange={handleWalletChange}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    {allWallets.map((wallet, idx) => (
                      <SelectItem key={wallet} value={wallet} className="text-white">
                        Wallet {idx + 1}: {wallet.slice(0, 6)}...{wallet.slice(-4)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Preset Amounts */}
            <div className="space-y-2">
              <Label className="text-white/80">Quick Amounts</Label>
              <div className="grid grid-cols-2 gap-2">
                {tokenInfo.presetAmounts.map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => handlePresetSelect(amount)}
                    className={`${
                      selectedAmount === amount && !isCustom
                        ? 'bg-cyan-600 hover:bg-cyan-700'
                        : 'bg-white/10 hover:bg-white/20'
                    } text-white h-14 flex-col gap-1`}
                  >
                    <span className="text-lg font-bold">{amount}</span>
                    <span className="text-xs opacity-70">{selectedToken}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="custom-amount" className="text-white/80">
                Custom Amount
              </Label>
              <Input
                id="custom-amount"
                type="number"
                step="0.0001"
                min="0"
                placeholder={`Enter ${selectedToken} amount`}
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Transaction Component */}
            {finalAmount && parseFloat(finalAmount) > 0 && (
              <div className="space-y-3 pt-2">
                <Transaction
                  chainId={base.id}
                  calls={getTipCalls(finalAmount)}
                  onStatus={handleOnStatus}
                >
                  <TransactionButton 
                    text={`Send ${finalAmount} ${selectedToken}`}
                    className="w-full btn-studio h-12 text-base"
                  />
                  <TransactionStatus>
                    <TransactionStatusLabel />
                    <TransactionStatusAction />
                  </TransactionStatus>
                </Transaction>
              </div>
            )}

            {/* Previous Tips */}
            {previousTips.length > 0 && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-xs text-purple-400 flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-semibold">
                    {previousTips.length} previous tip{previousTips.length !== 1 ? 's' : ''} to this artist
                  </span>
                </p>
              </div>
            )}

            {/* Info Section */}
            <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="text-cyan-400">⛓️</span>
                <span>Sending on Base blockchain</span>
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

            {/* Wallet Info */}
            {artistAddress && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs text-green-400 flex items-start gap-2 mb-1">
                  <span>✅</span>
                  <span className="font-semibold">Verified Wallet</span>
                </p>
                <p className="text-xs text-white/60 ml-5 font-mono break-all">
                  {artistAddress}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
