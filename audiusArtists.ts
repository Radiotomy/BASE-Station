/**
 * Service for fetching artist/user data from Audius API
 */

export interface AudiusArtist {
  id: string
  name: string
  handle: string
  is_verified: boolean
  profile_picture?: {
    '150x150'?: string
    '480x480'?: string
    '1000x1000'?: string
  }
  cover_photo?: {
    '640x'?: string
    '2000x'?: string
  }
  bio?: string
  location?: string
  follower_count: number
  followee_count: number
  track_count: number
  playlist_count: number
  album_count: number
  supporter_count: number
  supporting_count: number
  total_audio_balance: number
  associated_wallets?: string[]
  associated_sol_wallets?: string[]
  twitter_handle?: string
  instagram_handle?: string
  tiktok_handle?: string
  website?: string
  donation?: string
}

export interface AudiusArtistResponse {
  data: AudiusArtist
}

export interface AudiusArtistTracksResponse {
  data: Array<any>
}

/**
 * Cache for storing fetched artist data
 */
interface ArtistCache {
  artist: AudiusArtist
  timestamp: number
}

const artistCache = new Map<string, ArtistCache>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

/**
 * Get Audius API host
 */
async function getAudiusHost(): Promise<string> {
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: 'api.audius.co',
        path: '/',
        method: 'GET',
        headers: {}
      })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Audius hosts')
    }

    const hostsData = await response.json()
    let host = hostsData.data?.[0] || hostsData[0]
    
    if (!host) {
      throw new Error('No hosts available')
    }

    // Clean up host URL
    host = host.replace('https://', '').replace('http://', '')
    return host
  } catch (error) {
    console.error('Error fetching Audius host:', error)
    throw error
  }
}

/**
 * Fetch artist details by user ID
 */
export async function fetchArtistById(userId: string): Promise<AudiusArtist | null> {
  // Check cache first
  const cached = artistCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.artist
  }

  try {
    const host = await getAudiusHost()

    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: host,
        path: `/v1/users/${userId}?app_name=BASE_Station`,
        method: 'GET',
        headers: {}
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch artist: ${response.status}`)
    }

    const data: AudiusArtistResponse = await response.json()
    const artist = data.data

    // Cache the result
    artistCache.set(userId, {
      artist,
      timestamp: Date.now()
    })

    return artist
  } catch (error) {
    console.error('Error fetching artist:', error)
    return null
  }
}

/**
 * Fetch artist's tracks
 */
export async function fetchArtistTracks(userId: string, limit: number = 20): Promise<any[]> {
  try {
    const host = await getAudiusHost()

    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: host,
        path: `/v1/users/${userId}/tracks?app_name=BASE_Station&limit=${limit}`,
        method: 'GET',
        headers: {}
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch artist tracks: ${response.status}`)
    }

    const data: AudiusArtistTracksResponse = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching artist tracks:', error)
    return []
  }
}

/**
 * Search for artists by name or handle
 */
export async function searchArtists(query: string, limit: number = 10): Promise<AudiusArtist[]> {
  try {
    const host = await getAudiusHost()

    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: host,
        path: `/v1/users/search?query=${encodeURIComponent(query)}&app_name=BASE_Station&limit=${limit}`,
        method: 'GET',
        headers: {}
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to search artists: ${response.status}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error searching artists:', error)
    return []
  }
}

/**
 * Clear artist cache for a specific user or all users
 */
export function clearArtistCache(userId?: string): void {
  if (userId) {
    artistCache.delete(userId)
  } else {
    artistCache.clear()
  }
}
