/**
 * Service for fetching artist wallet addresses from Audius API
 */

export interface AudiusWallet {
  wallets: string[]
}

export interface AudiusWalletResponse {
  data: AudiusWallet
}

/**
 * Cache for storing fetched wallet addresses
 * Key: userId, Value: { wallets: string[], timestamp: number }
 */
interface WalletCache {
  wallets: string[]
  timestamp: number
}

const walletCache = new Map<string, WalletCache>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

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
 * Fetch connected wallets for an Audius user
 * @param userId - The Audius user ID
 * @returns Array of wallet addresses
 */
export async function fetchArtistWallets(userId: string): Promise<string[]> {
  // Check cache first
  const cached = walletCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.wallets
  }

  try {
    // Get Audius host
    const host = await getAudiusHost()

    // Fetch connected wallets
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'https',
        origin: host,
        path: `/v1/users/${userId}/connected_wallets?app_name=BASE_Station`,
        method: 'GET',
        headers: {}
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch wallets: ${response.status}`)
    }

    const data: AudiusWalletResponse = await response.json()
    const wallets = data.data?.wallets || []

    // Cache the result
    walletCache.set(userId, {
      wallets,
      timestamp: Date.now()
    })

    return wallets
  } catch (error) {
    console.error('Error fetching artist wallets:', error)
    return []
  }
}

/**
 * Get the primary wallet address for tipping
 * @param userId - The Audius user ID
 * @returns Primary wallet address or null if none available
 */
export async function getPrimaryWallet(userId: string): Promise<string | null> {
  const wallets = await fetchArtistWallets(userId)
  
  // Return the first wallet if available
  // In the future, we could add logic to determine the "primary" wallet
  return wallets.length > 0 ? wallets[0] : null
}

/**
 * Check if a user has any connected wallets
 * @param userId - The Audius user ID
 * @returns True if user has at least one wallet connected
 */
export async function hasConnectedWallet(userId: string): Promise<boolean> {
  const wallets = await fetchArtistWallets(userId)
  return wallets.length > 0
}

/**
 * Clear wallet cache for a specific user or all users
 * @param userId - Optional user ID. If not provided, clears entire cache
 */
export function clearWalletCache(userId?: string): void {
  if (userId) {
    walletCache.delete(userId)
  } else {
    walletCache.clear()
  }
}
