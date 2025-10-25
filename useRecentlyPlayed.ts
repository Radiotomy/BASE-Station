'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AudiusTrack } from '@/types/audius'

const RECENTLY_PLAYED_KEY = 'base_station_recently_played'
const MAX_RECENT_TRACKS = 50

interface RecentTrack {
  track: AudiusTrack
  playedAt: number
}

export const useRecentlyPlayed = () => {
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([])
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    loadRecentlyPlayed()
  }, [])

  const loadRecentlyPlayed = (): void => {
    try {
      const stored = localStorage.getItem(RECENTLY_PLAYED_KEY)
      if (stored) {
        setRecentTracks(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading recently played:', error)
    } finally {
      setIsLoaded(true)
    }
  }

  const addToRecentlyPlayed = useCallback((track: AudiusTrack): void => {
    setRecentTracks(prev => {
      // Remove if already exists
      const filtered = prev.filter(rt => rt.track.id !== track.id)
      
      // Add to beginning
      const newRecent: RecentTrack = {
        track,
        playedAt: Date.now()
      }
      
      const updated = [newRecent, ...filtered].slice(0, MAX_RECENT_TRACKS)
      
      try {
        localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Error saving recently played:', error)
      }
      
      return updated
    })
  }, [])

  const clearRecentlyPlayed = useCallback((): void => {
    try {
      localStorage.removeItem(RECENTLY_PLAYED_KEY)
      setRecentTracks([])
    } catch (error) {
      console.error('Error clearing recently played:', error)
    }
  }, [])

  return {
    recentTracks: recentTracks.map(rt => rt.track),
    isLoaded,
    addToRecentlyPlayed,
    clearRecentlyPlayed
  }
}
