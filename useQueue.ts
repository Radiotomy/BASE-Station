'use client'

import { useState, useCallback } from 'react'
import type { AudiusTrack } from '@/types/audius'

export type RepeatMode = 'off' | 'one' | 'all'

interface QueueState {
  queue: AudiusTrack[]
  currentIndex: number
  shuffleEnabled: boolean
  repeatMode: RepeatMode
  originalQueue: AudiusTrack[]
}

export const useQueue = () => {
  const [queueState, setQueueState] = useState<QueueState>({
    queue: [],
    currentIndex: -1,
    shuffleEnabled: false,
    repeatMode: 'off',
    originalQueue: []
  })

  const setQueue = useCallback((tracks: AudiusTrack[], startIndex: number = 0) => {
    setQueueState(prev => ({
      ...prev,
      queue: tracks,
      originalQueue: tracks,
      currentIndex: startIndex
    }))
  }, [])

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const toggleShuffle = useCallback(() => {
    setQueueState(prev => {
      const newShuffleEnabled = !prev.shuffleEnabled
      const currentTrack = prev.queue[prev.currentIndex]
      
      if (newShuffleEnabled) {
        // Shuffle the queue but keep current track at current position
        const shuffled = shuffleArray(prev.originalQueue)
        const currentTrackIndex = shuffled.findIndex(t => t.id === currentTrack?.id)
        if (currentTrackIndex !== -1 && currentTrackIndex !== prev.currentIndex) {
          [shuffled[prev.currentIndex], shuffled[currentTrackIndex]] = 
            [shuffled[currentTrackIndex], shuffled[prev.currentIndex]]
        }
        return {
          ...prev,
          queue: shuffled,
          shuffleEnabled: true
        }
      } else {
        // Restore original order
        const currentTrackId = currentTrack?.id
        const newIndex = prev.originalQueue.findIndex(t => t.id === currentTrackId)
        return {
          ...prev,
          queue: prev.originalQueue,
          currentIndex: newIndex !== -1 ? newIndex : prev.currentIndex,
          shuffleEnabled: false
        }
      }
    })
  }, [])

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setQueueState(prev => ({ ...prev, repeatMode: mode }))
  }, [])

  const nextTrack = useCallback((): AudiusTrack | null => {
    let nextIndex = -1
    
    setQueueState(prev => {
      if (prev.queue.length === 0) return prev

      if (prev.repeatMode === 'one') {
        nextIndex = prev.currentIndex
      } else if (prev.currentIndex < prev.queue.length - 1) {
        nextIndex = prev.currentIndex + 1
      } else if (prev.repeatMode === 'all') {
        nextIndex = 0
      } else {
        nextIndex = prev.currentIndex // Stay at last track
      }

      return { ...prev, currentIndex: nextIndex }
    })

    return nextIndex !== -1 ? queueState.queue[nextIndex] : null
  }, [queueState.queue])

  const previousTrack = useCallback((): AudiusTrack | null => {
    let prevIndex = -1

    setQueueState(prev => {
      if (prev.queue.length === 0) return prev

      if (prev.currentIndex > 0) {
        prevIndex = prev.currentIndex - 1
      } else if (prev.repeatMode === 'all') {
        prevIndex = prev.queue.length - 1
      } else {
        prevIndex = 0 // Stay at first track
      }

      return { ...prev, currentIndex: prevIndex }
    })

    return prevIndex !== -1 ? queueState.queue[prevIndex] : null
  }, [queueState.queue])

  const jumpToTrack = useCallback((index: number) => {
    setQueueState(prev => ({
      ...prev,
      currentIndex: Math.max(0, Math.min(index, prev.queue.length - 1))
    }))
  }, [])

  const addToQueue = useCallback((track: AudiusTrack) => {
    setQueueState(prev => ({
      ...prev,
      queue: [...prev.queue, track],
      originalQueue: [...prev.originalQueue, track]
    }))
  }, [])

  const removeFromQueue = useCallback((index: number) => {
    setQueueState(prev => {
      const newQueue = prev.queue.filter((_, i) => i !== index)
      const newOriginalQueue = prev.originalQueue.filter(
        t => t.id !== prev.queue[index].id
      )
      const newIndex = index <= prev.currentIndex && prev.currentIndex > 0
        ? prev.currentIndex - 1
        : prev.currentIndex

      return {
        ...prev,
        queue: newQueue,
        originalQueue: newOriginalQueue,
        currentIndex: newIndex
      }
    })
  }, [])

  const getCurrentTrack = useCallback((): AudiusTrack | null => {
    if (queueState.currentIndex >= 0 && queueState.currentIndex < queueState.queue.length) {
      return queueState.queue[queueState.currentIndex]
    }
    return null
  }, [queueState.queue, queueState.currentIndex])

  return {
    queue: queueState.queue,
    currentIndex: queueState.currentIndex,
    shuffleEnabled: queueState.shuffleEnabled,
    repeatMode: queueState.repeatMode,
    setQueue,
    toggleShuffle,
    setRepeatMode,
    nextTrack,
    previousTrack,
    jumpToTrack,
    addToQueue,
    removeFromQueue,
    getCurrentTrack
  }
}
