import type { AudiusTrack } from '@/types/audius'

/**
 * Fetches tracks from Audius API filtered by genre
 * @param genre - The genre to search for (e.g., "Electronic", "Hip-Hop/Rap")
 * @param limit - Number of tracks to fetch (default: 100)
 * @returns Array of tracks matching the genre
 */
export async function fetchTracksByGenre(
  genre: string,
  limit: number = 100
): Promise<AudiusTrack[]> {
  try {
    // Step 1: Get available Audius API hosts
    const hostsResponse = await fetch('/api/proxy', {
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

    if (!hostsResponse.ok) {
      throw new Error(`Failed to fetch hosts: ${hostsResponse.status}`)
    }

    const hostsData = await hostsResponse.json()
    let host = hostsData.data?.[0] || hostsData[0]
    
    if (!host) {
      throw new Error('No hosts available from Audius API')
    }

    // Clean up host URL
    host = host.replace('https://', '').replace('http://', '')

    // Step 2: Search tracks with genre query
    // Use both genre search and trending with genre filter for better results
    const searchResponse = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: host,
        path: `/v1/tracks/search?query=${encodeURIComponent(genre)}&app_name=BASE_Station&limit=${limit}`,
        method: 'GET',
        headers: {}
      })
    })

    if (!searchResponse.ok) {
      throw new Error(`Failed to search tracks: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()
    const tracks = searchData.data || []

    // Filter to only include tracks that actually match the genre
    const filteredTracks = tracks.filter((track: AudiusTrack) => 
      track.genre?.toLowerCase() === genre.toLowerCase()
    )

    return filteredTracks
  } catch (error) {
    console.error(`Error fetching tracks for genre ${genre}:`, error)
    return []
  }
}

/**
 * Fetches trending tracks filtered by genre
 * @param genre - The genre to filter by
 * @param timeRange - Time range for trending (week, month, year, allTime)
 * @param limit - Number of tracks to fetch (default: 100)
 * @returns Array of trending tracks matching the genre
 */
export async function fetchTrendingByGenre(
  genre: string,
  timeRange: 'week' | 'month' | 'year' | 'allTime' = 'week',
  limit: number = 100
): Promise<AudiusTrack[]> {
  try {
    // Step 1: Get available Audius API hosts
    const hostsResponse = await fetch('/api/proxy', {
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

    if (!hostsResponse.ok) {
      throw new Error(`Failed to fetch hosts: ${hostsResponse.status}`)
    }

    const hostsData = await hostsResponse.json()
    let host = hostsData.data?.[0] || hostsData[0]
    
    if (!host) {
      throw new Error('No hosts available from Audius API')
    }

    // Clean up host URL
    host = host.replace('https://', '').replace('http://', '')

    // Step 2: Fetch trending tracks with genre filter
    const trendingResponse = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: host,
        path: `/v1/tracks/trending?genre=${encodeURIComponent(genre)}&time=${timeRange}&app_name=BASE_Station&limit=${limit}`,
        method: 'GET',
        headers: {}
      })
    })

    if (!trendingResponse.ok) {
      throw new Error(`Failed to fetch trending tracks: ${trendingResponse.status}`)
    }

    const trendingData = await trendingResponse.json()
    return trendingData.data || []
  } catch (error) {
    console.error(`Error fetching trending tracks for genre ${genre}:`, error)
    return []
  }
}

/**
 * Fetches tracks by genre using multiple strategies for maximum results
 * Combines search results and trending results
 */
export async function fetchGenreTracksDeep(
  genre: string,
  limit: number = 150
): Promise<AudiusTrack[]> {
  try {
    // Fetch from both endpoints in parallel
    const [searchTracks, trendingTracks] = await Promise.all([
      fetchTracksByGenre(genre, Math.floor(limit / 2)),
      fetchTrendingByGenre(genre, 'month', Math.floor(limit / 2))
    ])

    // Combine and deduplicate by track ID
    const trackMap = new Map<string, AudiusTrack>()
    
    const allTracks: AudiusTrack[] = [...trendingTracks, ...searchTracks]
    allTracks.forEach((track: AudiusTrack) => {
      if (track.id && !trackMap.has(track.id)) {
        trackMap.set(track.id, track)
      }
    })

    const combinedTracks = Array.from(trackMap.values())
    
    // Sort by play count for better results
    combinedTracks.sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
    
    return combinedTracks.slice(0, limit)
  } catch (error) {
    console.error(`Error in deep genre search for ${genre}:`, error)
    return []
  }
}
