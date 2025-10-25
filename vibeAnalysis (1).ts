'use client'

import type { AudiusTrack } from '@/types/audius'

export interface VibeProfile {
  energy: number // 0-100
  tempo: 'slow' | 'medium' | 'fast' | 'ultra'
  mood: string
  vibe: string
  color: string
  energySignature: number[]
  authenticity: number // 0-100
  cosigns: number
  timestamp: number
}

export interface VibePlaylist {
  name: string
  description: string
  vibe: string
  energyRange: [number, number]
  tracks: AudiusTrack[]
  color: string
  icon: string
}

/**
 * Analyzes audio using Web Audio API to generate vibe profile
 */
export class VibeAnalyzer {
  private analyserNode: AnalyserNode | null = null

  constructor(analyserNode: AnalyserNode | null) {
    this.analyserNode = analyserNode
  }

  /**
   * Analyze track and generate vibe profile
   */
  analyzeTrack(track: AudiusTrack): VibeProfile {
    const energySignature = this.getEnergySignature()
    const energy = this.calculateEnergy(energySignature)
    const tempo = this.detectTempo(track.duration, energy)
    const mood = this.detectMood(track, energy)
    const vibe = this.generateVibe(energy, tempo, mood)
    const color = this.getVibeColor(vibe)
    const authenticity = this.checkAuthenticity(track)

    return {
      energy,
      tempo,
      mood,
      vibe,
      color,
      energySignature,
      authenticity,
      cosigns: 0,
      timestamp: Date.now()
    }
  }

  /**
   * Get current energy signature from audio analysis
   */
  private getEnergySignature(): number[] {
    if (!this.analyserNode) {
      return Array(10).fill(50) // Default signature
    }

    const bufferLength = this.analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyserNode.getByteFrequencyData(dataArray)

    // Sample 10 frequency bands for signature
    const signature: number[] = []
    const step = Math.floor(bufferLength / 10)
    
    for (let i = 0; i < 10; i++) {
      const index = i * step
      signature.push(dataArray[index] || 0)
    }

    return signature
  }

  /**
   * Calculate overall energy level
   */
  private calculateEnergy(signature: number[]): number {
    const avg = signature.reduce((a, b) => a + b, 0) / signature.length
    const normalized = (avg / 255) * 100
    
    // Add some variation based on track characteristics
    return Math.min(100, Math.max(0, normalized))
  }

  /**
   * Detect tempo category
   */
  private detectTempo(duration: number, energy: number): 'slow' | 'medium' | 'fast' | 'ultra' {
    // Estimate BPM based on duration and energy
    const estimatedBPM = (240 / duration) * (energy / 50)
    
    if (estimatedBPM < 80) return 'slow'
    if (estimatedBPM < 120) return 'medium'
    if (estimatedBPM < 140) return 'fast'
    return 'ultra'
  }

  /**
   * Detect mood from track metadata and energy
   */
  private detectMood(track: AudiusTrack, energy: number): string {
    // Use Audius mood if available
    if (track.mood) {
      return track.mood.toLowerCase()
    }

    // Infer from energy and genre
    const genre = track.genre?.toLowerCase() || ''
    
    if (energy > 75) {
      if (genre.includes('electronic') || genre.includes('dance')) return 'energetic'
      if (genre.includes('rock') || genre.includes('metal')) return 'intense'
      return 'upbeat'
    }
    
    if (energy > 50) {
      if (genre.includes('hip')) return 'confident'
      if (genre.includes('pop')) return 'cheerful'
      return 'balanced'
    }
    
    if (genre.includes('ambient') || genre.includes('chill')) return 'relaxed'
    if (genre.includes('sad') || genre.includes('blues')) return 'melancholic'
    return 'mellow'
  }

  /**
   * Generate vibe category
   */
  private generateVibe(energy: number, tempo: string, mood: string): string {
    // Late Night Flow
    if (energy < 40 && (tempo === 'slow' || tempo === 'medium')) {
      return 'Late-Night Flow'
    }

    // DAO Energy
    if (energy > 70 && mood.includes('confident')) {
      return 'DAO Energy'
    }

    // Build Mode
    if (energy >= 50 && energy <= 70 && tempo === 'medium') {
      return 'Build Mode'
    }

    // Cosmic Chill
    if (energy < 50 && mood.includes('relaxed')) {
      return 'Cosmic Chill'
    }

    // Hype Wave
    if (energy > 80) {
      return 'Hype Wave'
    }

    // Default
    return 'Balanced Vibes'
  }

  /**
   * Get color for vibe
   */
  private getVibeColor(vibe: string): string {
    const colorMap: Record<string, string> = {
      'Late-Night Flow': '#9333ea', // purple
      'DAO Energy': '#0ea5e9', // cyan
      'Build Mode': '#10b981', // green
      'Cosmic Chill': '#6366f1', // indigo
      'Hype Wave': '#ef4444', // red
      'Balanced Vibes': '#f59e0b' // amber
    }

    return colorMap[vibe] || '#6b7280'
  }

  /**
   * Check authenticity using Audius metadata
   */
  private checkAuthenticity(track: AudiusTrack): number {
    let score = 0

    // Verified artist
    if (track.user.is_verified) score += 30

    // Has artwork
    if (track.artwork) score += 15

    // High play count (popular = likely authentic)
    if (track.play_count > 10000) score += 20
    else if (track.play_count > 1000) score += 10

    // Has favorites
    if (track.favorite_count > 100) score += 15
    else if (track.favorite_count > 10) score += 10

    // Has genre metadata
    if (track.genre) score += 10

    // Not unlisted
    if (!track.is_unlisted) score += 10

    return Math.min(100, score)
  }
}

/**
 * Generate adaptive playlists based on vibe analysis
 */
export function generateAdaptivePlaylists(
  tracks: AudiusTrack[],
  vibeProfiles: Map<string, VibeProfile>
): VibePlaylist[] {
  const playlists: VibePlaylist[] = [
    {
      name: 'Late-Night Flow',
      description: 'Smooth, low-energy vibes for coding at 2 AM',
      vibe: 'Late-Night Flow',
      energyRange: [0, 40],
      tracks: [],
      color: '#9333ea',
      icon: '🌙'
    },
    {
      name: 'DAO Energy',
      description: 'High-energy tracks for building with your crew',
      vibe: 'DAO Energy',
      energyRange: [70, 100],
      tracks: [],
      color: '#0ea5e9',
      icon: '⚡'
    },
    {
      name: 'Build Mode',
      description: 'Focused, balanced energy for deep work',
      vibe: 'Build Mode',
      energyRange: [45, 70],
      tracks: [],
      color: '#10b981',
      icon: '🏗️'
    },
    {
      name: 'Cosmic Chill',
      description: 'Relaxed atmospheric sounds for exploration',
      vibe: 'Cosmic Chill',
      energyRange: [0, 50],
      tracks: [],
      color: '#6366f1',
      icon: '🌌'
    },
    {
      name: 'Hype Wave',
      description: 'Maximum energy for launches and celebrations',
      vibe: 'Hype Wave',
      energyRange: [80, 100],
      tracks: [],
      color: '#ef4444',
      icon: '🚀'
    }
  ]

  // Sort tracks into playlists
  tracks.forEach(track => {
    const profile = vibeProfiles.get(track.id)
    if (!profile) return

    playlists.forEach(playlist => {
      const [min, max] = playlist.energyRange
      if (profile.energy >= min && profile.energy <= max && profile.vibe === playlist.vibe) {
        playlist.tracks.push(track)
      }
    })
  })

  // Filter out empty playlists and sort by track count
  return playlists
    .filter(p => p.tracks.length > 0)
    .sort((a, b) => b.tracks.length - a.tracks.length)
}

/**
 * Storage for vibe profiles and cosigns
 */
export class VibeStorage {
  private static STORAGE_KEY = 'base_station_vibes'
  private static COSIGN_KEY = 'base_station_cosigns'

  static saveVibeProfile(trackId: string, profile: VibeProfile): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const profiles = stored ? JSON.parse(stored) : {}
      profiles[trackId] = profile
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles))
    } catch (error) {
      console.error('Failed to save vibe profile:', error)
    }
  }

  static getVibeProfile(trackId: string): VibeProfile | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null
      const profiles = JSON.parse(stored)
      return profiles[trackId] || null
    } catch (error) {
      console.error('Failed to load vibe profile:', error)
      return null
    }
  }

  static getAllVibeProfiles(): Map<string, VibeProfile> {
    if (typeof window === 'undefined') return new Map()
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return new Map()
      const profiles = JSON.parse(stored)
      return new Map(Object.entries(profiles))
    } catch (error) {
      console.error('Failed to load vibe profiles:', error)
      return new Map()
    }
  }

  static addCosign(trackId: string): number {
    if (typeof window === 'undefined') return 0
    
    try {
      const stored = localStorage.getItem(this.COSIGN_KEY)
      const cosigns = stored ? JSON.parse(stored) : {}
      cosigns[trackId] = (cosigns[trackId] || 0) + 1
      localStorage.setItem(this.COSIGN_KEY, JSON.stringify(cosigns))
      
      // Update vibe profile with new cosign count
      const profile = this.getVibeProfile(trackId)
      if (profile) {
        profile.cosigns = cosigns[trackId]
        this.saveVibeProfile(trackId, profile)
      }
      
      return cosigns[trackId]
    } catch (error) {
      console.error('Failed to add cosign:', error)
      return 0
    }
  }

  static getCosigns(trackId: string): number {
    if (typeof window === 'undefined') return 0
    
    try {
      const stored = localStorage.getItem(this.COSIGN_KEY)
      if (!stored) return 0
      const cosigns = JSON.parse(stored)
      return cosigns[trackId] || 0
    } catch (error) {
      console.error('Failed to get cosigns:', error)
      return 0
    }
  }
}
