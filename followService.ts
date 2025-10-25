/**
 * Service for managing artist follows (stored locally)
 * In a real app, this would sync with blockchain or backend
 */

export interface Follow {
  artistId: string
  artistName: string
  artistHandle: string
  timestamp: number
}

const FOLLOWS_KEY = 'base_station_follows'

/**
 * Get all followed artists
 */
export function getFollows(): Follow[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(FOLLOWS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading follows:', error)
    return []
  }
}

/**
 * Check if an artist is followed
 */
export function isFollowing(artistId: string): boolean {
  const follows = getFollows()
  return follows.some(f => f.artistId === artistId)
}

/**
 * Follow an artist
 */
export function followArtist(artistId: string, artistName: string, artistHandle: string): void {
  const follows = getFollows()
  
  // Check if already following
  if (isFollowing(artistId)) {
    return
  }

  const newFollow: Follow = {
    artistId,
    artistName,
    artistHandle,
    timestamp: Date.now()
  }

  follows.push(newFollow)
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(follows))

  // Dispatch custom event for React components to listen
  window.dispatchEvent(new CustomEvent('followsChanged'))
}

/**
 * Unfollow an artist
 */
export function unfollowArtist(artistId: string): void {
  const follows = getFollows()
  const filtered = follows.filter(f => f.artistId !== artistId)
  
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(filtered))

  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('followsChanged'))
}

/**
 * Toggle follow status for an artist
 */
export function toggleFollow(artistId: string, artistName: string, artistHandle: string): boolean {
  if (isFollowing(artistId)) {
    unfollowArtist(artistId)
    return false
  } else {
    followArtist(artistId, artistName, artistHandle)
    return true
  }
}

/**
 * Get follow count
 */
export function getFollowCount(): number {
  return getFollows().length
}

/**
 * Export follows as JSON
 */
export function exportFollows(): string {
  return JSON.stringify(getFollows(), null, 2)
}
