import { useState, useEffect } from 'react'
import { getFollows, isFollowing, toggleFollow } from '@/services/followService'
import type { Follow } from '@/services/followService'

export function useFollows() {
  const [follows, setFollows] = useState<Follow[]>([])

  // Load follows on mount
  useEffect(() => {
    setFollows(getFollows())

    // Listen for follow changes
    const handleFollowsChanged = (): void => {
      setFollows(getFollows())
    }

    window.addEventListener('followsChanged', handleFollowsChanged)
    return () => window.removeEventListener('followsChanged', handleFollowsChanged)
  }, [])

  const isArtistFollowed = (artistId: string): boolean => {
    return isFollowing(artistId)
  }

  const toggleArtistFollow = (artistId: string, artistName: string, artistHandle: string): void => {
    toggleFollow(artistId, artistName, artistHandle)
  }

  return {
    follows,
    isArtistFollowed,
    toggleArtistFollow
  }
}
