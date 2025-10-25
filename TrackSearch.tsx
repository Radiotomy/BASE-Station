'use client'

import type { FC, FormEvent, ChangeEvent } from 'react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { WalletButton } from '@/components/WalletButton'
import type { AudiusTrack } from '@/types/audius'

interface TrackSearchProps {
  onSearchResults: (tracks: AudiusTrack[]) => void
}

export const TrackSearch: FC<TrackSearchProps> = ({ onSearchResults }) => {
  const [query, setQuery] = useState<string>('')
  const [isSearching, setIsSearching] = useState<boolean>(false)

  const handleSearch = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!query.trim()) return

    try {
      setIsSearching(true)
      
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
      console.log('Search - Hosts response:', hostsData)
      
      // Extract host from response (remove protocol if present)
      let host = hostsData.data?.[0] || hostsData[0]
      if (!host) {
        throw new Error('No hosts available from Audius API')
      }
      
      // Clean up host URL
      host = host.replace('https://', '').replace('http://', '')
      console.log('Search - Using host:', host)

      // Step 2: Search tracks from the selected host
      const searchResponse = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol: 'https',
          origin: host,
          path: `/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=BASE_Station&limit=20`,
          method: 'GET',
          headers: {}
        })
      })

      if (!searchResponse.ok) {
        throw new Error(`Failed to search tracks: ${searchResponse.status}`)
      }
      
      const searchData = await searchResponse.json()
      console.log('Search results:', searchData)
      
      onSearchResults(searchData.data || [])
    } catch (error) {
      console.error('Error searching tracks:', error)
      alert('Failed to search tracks. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value)
  }

  return (
    <div className="rack-panel rounded-lg p-4 md:p-6 relative">
      {/* Rack Screws */}
      <div className="absolute top-3 left-3 rack-screw"></div>
      <div className="absolute top-3 right-3 rack-screw"></div>
      <div className="absolute bottom-3 left-3 rack-screw"></div>
      <div className="absolute bottom-3 right-3 rack-screw"></div>
      
      {/* Header with Logo and Title */}
      <div className="flex items-center justify-between mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-white/10 gap-2 md:gap-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <img
            src="https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/3c35802a-51c1-4e1c-93c4-ae41003dcbd1-BCvKRXQ3oF4OFc4XDR1jSN5H2MpTCh"
            alt="BASE Station Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain flex-shrink-0"
            onError={(e) => {
              console.error('Logo failed to load:', e)
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text-studio tracking-wider leading-tight">
              BASE STATION
            </h1>
            <p className="text-tech text-[9px] sm:text-[10px] md:text-xs text-[#6997FF]/70 mt-0.5">
              Powered by Audius Protocol
            </p>
          </div>
        </div>
        
        {/* Wallet and Status */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <WalletButton />
          <div className="hidden lg:flex items-center gap-2">
            <div className="led-indicator led-active led-pulse"></div>
            <span className="text-tech text-xs text-white/50">ONLINE</span>
          </div>
        </div>
      </div>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 md:gap-3 items-center">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`led-indicator ${query.trim() ? 'led-blue' : ''}`}></div>
          <span className="text-pro text-xs text-white/70 hidden sm:inline">SEARCH</span>
        </div>
        
        <Input
          type="text"
          placeholder="TRACK, ARTIST, GENRE..."
          value={query}
          onChange={handleInputChange}
          className="flex-1 bg-black/40 border-white/10 text-white placeholder:text-white/30 placeholder:text-xs focus:border-[#0052FF] h-11 lg:h-10 text-tech uppercase touch-manipulation"
        />
        
        <Button
          type="submit"
          disabled={isSearching}
          className="btn-studio h-11 lg:h-10 px-4 md:px-6 touch-manipulation"
        >
          {isSearching ? (
            <span className="text-xs">...</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span className="hidden md:inline ml-2">SEARCH</span>
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
