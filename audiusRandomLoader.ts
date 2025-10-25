import type { AudiusTrack } from '@/types/audius'

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Fetches tracks from a specific Audius API endpoint
 */
async function fetchFromEndpoint(
  host: string,
  path: string
): Promise<AudiusTrack[]> {
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: host,
        path,
        method: 'GET',
        headers: {}
      })
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error(`Error fetching from ${path}:`, error)
    return []
  }
}

/**
 * Gets an Audius API host
 */
async function getAudiusHost(): Promise<string> {
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
    throw new Error(`Failed to fetch hosts: ${response.status}`)
  }

  const hostsData = await response.json()
  let host = hostsData.data?.[0] || hostsData[0]

  if (!host) {
    throw new Error('No hosts available from Audius API')
  }

  // Clean up host URL
  return host.replace('https://', '').replace('http://', '')
}

/**
 * Loads randomized tracks from multiple sources for diverse artist discovery
 * Fetches from:
 * - Trending (week)
 * - Trending (month) 
 * - Trending (year)
 * - Multiple random genres
 * - Different time periods
 * 
 * Then shuffles and deduplicates for maximum variety
 */
export async function loadRandomizedTracks(
  totalLimit: number = 100
): Promise<AudiusTrack[]> {
  try {
    const host = await getAudiusHost()

    // Define multiple genres to fetch from
    const genres = [
      'Electronic',
      'Hip-Hop/Rap',
      'Alternative',
      'Pop',
      'R&B/Soul',
      'Rock',
      'Dance & EDM',
      'Latin',
      'House',
      'Techno'
    ]

    // Randomly select 4 genres
    const shuffledGenres = shuffleArray(genres)
    const selectedGenres = shuffledGenres.slice(0, 4)

    // Time ranges to fetch from
    const timeRanges: Array<'week' | 'month' | 'year'> = ['week', 'month', 'year']

    // Build fetch requests for maximum variety
    const fetchPromises: Promise<AudiusTrack[]>[] = []

    // 1. Fetch trending from different time periods
    timeRanges.forEach(time => {
      fetchPromises.push(
        fetchFromEndpoint(
          host,
          `/v1/tracks/trending?time=${time}&app_name=BASE_Station&limit=30`
        )
      )
    })

    // 2. Fetch from random genres
    selectedGenres.forEach(genre => {
      fetchPromises.push(
        fetchFromEndpoint(
          host,
          `/v1/tracks/trending?genre=${encodeURIComponent(genre)}&time=week&app_name=BASE_Station&limit=25`
        )
      )
    })

    // 3. Fetch some search results for variety
    const searchQueries = ['beats', 'remix', 'original', 'live']
    const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)]
    fetchPromises.push(
      fetchFromEndpoint(
        host,
        `/v1/tracks/search?query=${randomQuery}&app_name=BASE_Station&limit=30`
      )
    )

    // Execute all fetches in parallel
    const results = await Promise.all(fetchPromises)

    // Combine all tracks
    const allTracks = results.flat()

    // Deduplicate by track ID and artist to ensure variety
    const trackMap = new Map<string, AudiusTrack>()
    const artistCount = new Map<string, number>()

    // First pass: add tracks, limiting tracks per artist
    const maxTracksPerArtist = 3
    
    allTracks.forEach(track => {
      if (!track.id || !track.user?.id) return

      const artistId = track.user.id
      const currentCount = artistCount.get(artistId) || 0

      // Add track if we haven't reached the per-artist limit
      if (currentCount < maxTracksPerArtist && !trackMap.has(track.id)) {
        trackMap.set(track.id, track)
        artistCount.set(artistId, currentCount + 1)
      }
    })

    // Convert to array and shuffle
    let finalTracks = Array.from(trackMap.values())
    finalTracks = shuffleArray(finalTracks)

    // Sort by a mix of play count and randomness for quality + variety
    finalTracks.sort((a, b) => {
      const randomFactor = Math.random() - 0.5 // Add randomness
      const playCountWeight = ((b.play_count || 0) - (a.play_count || 0)) * 0.0001
      return randomFactor + playCountWeight
    })

    // Return requested limit
    return finalTracks.slice(0, totalLimit)

  } catch (error) {
    console.error('Error loading randomized tracks:', error)
    // Fallback to basic trending if randomization fails
    try {
      const host = await getAudiusHost()
      const tracks = await fetchFromEndpoint(
        host,
        '/v1/tracks/trending?time=week&app_name=BASE_Station&limit=50'
      )
      return shuffleArray(tracks)
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      return []
    }
  }
}

/**
 * Loads tracks with heavy randomization - completely different results each time
 */
export async function loadSuperRandomizedTracks(
  totalLimit: number = 100
): Promise<AudiusTrack[]> {
  try {
    const host = await getAudiusHost()

    // All available genres
    const allGenres = [
      'Electronic', 'Hip-Hop/Rap', 'Alternative', 'Pop', 'R&B/Soul',
      'Rock', 'Dance & EDM', 'Latin', 'House', 'Techno', 'Jazz',
      'Country', 'Metal', 'Classical', 'Reggae', 'Folk', 'Blues',
      'Punk', 'Indie', 'Ambient', 'Experimental', 'World'
    ]

    // Randomly select 6-8 genres
    const numGenres = 6 + Math.floor(Math.random() * 3)
    const selectedGenres = shuffleArray(allGenres).slice(0, numGenres)

    // Random time ranges
    const timeOptions: Array<'week' | 'month' | 'year' | 'allTime'> = ['week', 'month', 'year', 'allTime']
    const shuffledTimes = shuffleArray(timeOptions)

    const fetchPromises: Promise<AudiusTrack[]>[] = []

    // Fetch from random genres with random time periods
    selectedGenres.forEach((genre, index) => {
      const time = shuffledTimes[index % shuffledTimes.length]
      fetchPromises.push(
        fetchFromEndpoint(
          host,
          `/v1/tracks/trending?genre=${encodeURIComponent(genre)}&time=${time}&app_name=BASE_Station&limit=20`
        )
      )
    })

    // Add general trending from random time
    fetchPromises.push(
      fetchFromEndpoint(
        host,
        `/v1/tracks/trending?time=${shuffledTimes[0]}&app_name=BASE_Station&limit=30`
      )
    )

    const results = await Promise.all(fetchPromises)
    const allTracks = results.flat()

    // More aggressive deduplication and artist limiting
    const trackMap = new Map<string, AudiusTrack>()
    const artistCount = new Map<string, number>()
    const maxTracksPerArtist = 2 // Even fewer tracks per artist

    // Shuffle before processing to randomize which tracks get selected
    const shuffledTracks = shuffleArray(allTracks)

    shuffledTracks.forEach(track => {
      if (!track.id || !track.user?.id) return

      const artistId = track.user.id
      const currentCount = artistCount.get(artistId) || 0

      if (currentCount < maxTracksPerArtist && !trackMap.has(track.id)) {
        trackMap.set(track.id, track)
        artistCount.set(artistId, currentCount + 1)
      }
    })

    let finalTracks = Array.from(trackMap.values())
    
    // Pure shuffle - completely random order
    finalTracks = shuffleArray(finalTracks)

    return finalTracks.slice(0, totalLimit)

  } catch (error) {
    console.error('Error loading super randomized tracks:', error)
    return []
  }
}
