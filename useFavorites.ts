'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AudiusTrack } from '@/types/audius'

const FAVORITES_KEY = 'base_station_favorites'

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<AudiusTrack[]>([])
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = (): void => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoaded(true)
    }
  }

  const saveFavorites = useCallback((newFavorites: AudiusTrack[]): void => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))
      setFavorites(newFavorites)
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
  }, [])

  const toggleFavorite = useCallback((track: AudiusTrack): void => {
    setFavorites(prev => {
      const exists = prev.some(t => t.id === track.id)
      const newFavorites = exists
        ? prev.filter(t => t.id !== track.id)
        : [track, ...prev]
      
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))
      } catch (error) {
        console.error('Error saving favorites:', error)
      }
      
      return newFavorites
    })
  }, [])

  const isFavorite = useCallback((trackId: string): boolean => {
    return favorites.some(t => t.id === trackId)
  }, [favorites])

  const clearFavorites = useCallback((): void => {
    try {
      localStorage.removeItem(FAVORITES_KEY)
      setFavorites([])
    } catch (error) {
      console.error('Error clearing favorites:', error)
    }
  }, [])

  return {
    favorites,
    isLoaded,
    toggleFavorite,
    isFavorite,
    clearFavorites
  }
}
