/**
 * Service for tracking tip history and leaderboards
 */

import type { AudiusTrack } from '@/types/audius'
import type { TokenSymbol } from '@/types/tokens'

export interface TipRecord {
  id: string
  timestamp: number
  artistId: string
  artistName: string
  artistHandle: string
  trackId: string
  trackTitle: string
  amount: string
  token: TokenSymbol
  txHash: string | null
  tipper: string // wallet address
}

export interface TipStats {
  totalTips: number
  totalByToken: Record<TokenSymbol, number>
  topArtists: Array<{
    artistId: string
    artistName: string
    artistHandle: string
    tipCount: number
    totalAmount: number
  }>
  recentTips: TipRecord[]
}

const STORAGE_KEY = 'bstn_tip_history'
const MAX_HISTORY = 100

/**
 * Get all tip history from localStorage
 */
export function getTipHistory(): TipRecord[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const history: TipRecord[] = JSON.parse(stored)
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Error reading tip history:', error)
    return []
  }
}

/**
 * Add a new tip to history
 */
export function addTipToHistory(
  track: AudiusTrack,
  amount: string,
  token: TokenSymbol,
  tipper: string,
  txHash?: string
): TipRecord {
  const tip: TipRecord = {
    id: `${Date.now()}_${track.id}`,
    timestamp: Date.now(),
    artistId: track.user.id,
    artistName: track.user.name,
    artistHandle: track.user.handle,
    trackId: track.id,
    trackTitle: track.title,
    amount,
    token,
    txHash: txHash || null,
    tipper
  }

  const history = getTipHistory()
  history.unshift(tip)
  
  // Keep only last MAX_HISTORY tips
  const trimmedHistory = history.slice(0, MAX_HISTORY)
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory))
  } catch (error) {
    console.error('Error saving tip to history:', error)
  }

  return tip
}

/**
 * Get tips for a specific artist
 */
export function getArtistTips(artistId: string): TipRecord[] {
  const history = getTipHistory()
  return history.filter(tip => tip.artistId === artistId)
}

/**
 * Get tip statistics for a specific artist
 */
export function getTipStatsByArtist(artistId: string): {
  tipCount: number
  totalETH: number
  totalAUDIO: number
  totalBSTN: number
} {
  const artistTips = getArtistTips(artistId)
  
  const stats = {
    tipCount: artistTips.length,
    totalETH: 0,
    totalAUDIO: 0,
    totalBSTN: 0
  }

  artistTips.forEach(tip => {
    const amount = parseFloat(tip.amount)
    if (!isNaN(amount)) {
      if (tip.token === 'ETH') stats.totalETH += amount
      else if (tip.token === 'AUDIO') stats.totalAUDIO += amount
      else if (tip.token === 'BSTN') stats.totalBSTN += amount
    }
  })

  return stats
}

/**
 * Get tips for a specific track
 */
export function getTrackTips(trackId: string): TipRecord[] {
  const history = getTipHistory()
  return history.filter(tip => tip.trackId === trackId)
}

/**
 * Get tips sent by a specific wallet
 */
export function getTipsBySender(walletAddress: string): TipRecord[] {
  const history = getTipHistory()
  return history.filter(tip => tip.tipper.toLowerCase() === walletAddress.toLowerCase())
}

/**
 * Calculate tip statistics
 */
export function getTipStats(): TipStats {
  const history = getTipHistory()
  
  // Calculate totals by token
  const totalByToken: Record<TokenSymbol, number> = {
    ETH: 0,
    AUDIO: 0,
    BSTN: 0
  }
  
  history.forEach(tip => {
    const amount = parseFloat(tip.amount)
    if (!isNaN(amount)) {
      totalByToken[tip.token] = (totalByToken[tip.token] || 0) + amount
    }
  })

  // Calculate top artists
  const artistMap = new Map<string, {
    artistId: string
    artistName: string
    artistHandle: string
    tipCount: number
    totalAmount: number
  }>()

  history.forEach(tip => {
    const existing = artistMap.get(tip.artistId)
    const amount = parseFloat(tip.amount)
    
    if (existing) {
      existing.tipCount++
      existing.totalAmount += amount
    } else {
      artistMap.set(tip.artistId, {
        artistId: tip.artistId,
        artistName: tip.artistName,
        artistHandle: tip.artistHandle,
        tipCount: 1,
        totalAmount: amount
      })
    }
  })

  const topArtists = Array.from(artistMap.values())
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10)

  return {
    totalTips: history.length,
    totalByToken,
    topArtists,
    recentTips: history.slice(0, 10)
  }
}

/**
 * Clear all tip history
 */
export function clearTipHistory(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing tip history:', error)
  }
}

/**
 * Export tip history as JSON
 */
export function exportTipHistory(): string {
  const history = getTipHistory()
  return JSON.stringify(history, null, 2)
}
