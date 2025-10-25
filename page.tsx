'use client'

import type { FC, useEffect } from 'react'
import { useState, useEffect, useMemo } from 'react'
import { AudioPlayer } from '@/components/AudioPlayer'
import { TrackSearch } from '@/components/TrackSearch'
import { TrackList } from '@/components/TrackList'
import { QueuePanel } from '@/components/QueuePanel'
import { GenreFilter } from '@/components/GenreFilter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ListMusic, Heart, Clock, Shuffle as ShuffleIcon, Trophy, UserCheck, Music } from 'lucide-react'
import { TipLeaderboard } from '@/components/TipLeaderboard'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import Onboarding from '@/components/Onboarding'
import type { AudiusTrack } from '@/types/audius'
import { useQueue } from '@/hooks/useQueue'
import { useFavorites } from '@/hooks/useFavorites'
import { useRecentlyPlayed } from '@/hooks/useRecentlyPlayed'
import { useFollows } from '@/hooks/useFollows'
import { fetchArtistTracks } from '@/services/audiusArtists'
import { fetchGenreTracksDeep } from '@/services/audiusGenreSearch'
import { sdk } from "@farcaster/miniapp-sdk"

const Page: FC = () => {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false)
  const [onboardingChecked, setOnboardingChecked] = useState<boolean>(false)
  useEffect(() => {
    const initializeFarcaster = async (): Promise<void> => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100))
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            if (document.readyState === 'complete') {
              resolve(void 0)
            } else {
              window.addEventListener('load', () => resolve(void 0), { once: true })
            }
          })
        }

        await sdk.actions.ready()
        console.log("Farcaster SDK initialized successfully - app fully loaded")
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error)
        setTimeout(async () => {
          try {
            await sdk.actions.ready()
            console.log('Farcaster SDK initialized on retry')
          } catch (retryError) {
            console.error('Farcaster SDK retry failed:', retryError)
          }
        }, 1000)
      }
    }
    initializeFarcaster()
  }, [])

  const [trendingTracks, setTrendingTracks] = useState<AudiusTrack[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [genreTracks, setGenreTracks] = useState<AudiusTrack[]>([])
  const [isLoadingGenre, setIsLoadingGenre] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('trending')
  const [autoPlay, setAutoPlay] = useState<boolean>(false)

  // Hooks
  const queueManager = useQueue()
  const { favorites, isFavorite, toggleFavorite } = useFavorites()
  const { recentTracks, addToRecentlyPlayed } = useRecentlyPlayed()
  const { follows } = useFollows()
  const [followedArtistsTracks, setFollowedArtistsTracks] = useState<AudiusTrack[]>([])
  const [loadingFollowedTracks, setLoadingFollowedTracks] = useState<boolean>(false)

  // Check onboarding status
  useEffect(() => {
    const completed = localStorage.getItem('basestation_onboarding_completed')
    if (!completed) {
      setShowOnboarding(true)
    }
    setOnboardingChecked(true)
  }, [])

  useEffect(() => {
    loadTrendingTracks()
  }, [])

  // Initialize queue when tracks load
  useEffect(() => {
    if (trendingTracks.length > 0 && queueManager.queue.length === 0) {
      queueManager.setQueue(trendingTracks, 0)
    }
  }, [trendingTracks])

  const loadTrendingTracks = async (): Promise<void> => {
    try {
      setIsLoading(true)
      
      // Import the randomized loader dynamically
      const { loadRandomizedTracks } = await import('@/services/audiusRandomLoader')
      
      // Fetch randomized tracks from multiple sources
      const tracks = await loadRandomizedTracks(100)
      
      console.log(`Loaded ${tracks.length} randomized tracks from diverse artists and genres`)
      
      setTrendingTracks(tracks)
      
      if (tracks.length > 0) {
        queueManager.setQueue(tracks, 0)
      }
    } catch (error) {
      console.error('Error loading randomized tracks:', error)
      // Show user-friendly error
      alert('Failed to load tracks from Audius. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrackSelect = (track: AudiusTrack): void => {
    const trackIndex = queueManager.queue.findIndex(t => t.id === track.id)
    if (trackIndex !== -1) {
      queueManager.jumpToTrack(trackIndex)
    } else {
      queueManager.addToQueue(track)
      queueManager.jumpToTrack(queueManager.queue.length)
    }
    addToRecentlyPlayed(track)
    setAutoPlay(true) // Automatically start playback when track is selected
  }

  const handleSearchResults = (tracks: AudiusTrack[]): void => {
    setTrendingTracks(tracks)
    if (tracks.length > 0) {
      queueManager.setQueue(tracks, 0)
    }
  }

  const handleNext = (): void => {
    const nextTrack = queueManager.nextTrack()
    if (nextTrack) {
      addToRecentlyPlayed(nextTrack)
    }
  }

  const handlePrevious = (): void => {
    const prevTrack = queueManager.previousTrack()
    if (prevTrack) {
      addToRecentlyPlayed(prevTrack)
    }
  }

  const handleToggleFavorite = (): void => {
    const currentTrack = queueManager.getCurrentTrack()
    if (currentTrack) {
      toggleFavorite(currentTrack)
    }
  }

  const currentTrack = queueManager.getCurrentTrack()

  // Extract unique genres from tracks
  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>()
    trendingTracks.forEach(track => {
      if (track.genre) {
        genreSet.add(track.genre)
      }
    })
    return Array.from(genreSet).sort()
  }, [trendingTracks])

  // Handle genre selection with deep API search
  useEffect(() => {
    if (selectedGenre) {
      loadGenreTracks(selectedGenre)
    } else {
      setGenreTracks([])
    }
  }, [selectedGenre])

  const loadGenreTracks = async (genre: string): Promise<void> => {
    setIsLoadingGenre(true)
    try {
      const tracks = await fetchGenreTracksDeep(genre, 150)
      setGenreTracks(tracks)
      
      // Update queue with genre tracks
      if (tracks.length > 0) {
        queueManager.setQueue(tracks, 0)
      }
    } catch (error) {
      console.error(`Error loading genre tracks for ${genre}:`, error)
    } finally {
      setIsLoadingGenre(false)
    }
  }

  // Filter tracks by genre - use genre-specific tracks if available
  const filteredTracks = useMemo(() => {
    if (!selectedGenre) return trendingTracks
    return genreTracks.length > 0 ? genreTracks : trendingTracks.filter(track => track.genre === selectedGenre)
  }, [trendingTracks, selectedGenre, genreTracks])

  // Load followed artists' tracks when following tab is active
  useEffect(() => {
    if (activeTab === 'following' && follows.length > 0) {
      loadFollowedArtistsTracks()
    }
  }, [activeTab, follows])

  const loadFollowedArtistsTracks = async (): Promise<void> => {
    setLoadingFollowedTracks(true)
    try {
      const allTracks: AudiusTrack[] = []
      // Fetch tracks from each followed artist (limit to first 10 follows for performance)
      const followsToLoad = follows.slice(0, 10)
      for (const follow of followsToLoad) {
        const tracks = await fetchArtistTracks(follow.artistId, 5)
        allTracks.push(...tracks)
      }
      // Sort by release date or play count
      allTracks.sort((a, b) => b.play_count - a.play_count)
      setFollowedArtistsTracks(allTracks)
    } catch (error) {
      console.error('Error loading followed artists tracks:', error)
    } finally {
      setLoadingFollowedTracks(false)
    }
  }

  // Determine which tracks to show based on active tab
  const displayTracks = useMemo(() => {
    if (activeTab === 'favorites') return favorites
    if (activeTab === 'recent') return recentTracks
    if (activeTab === 'following') return followedArtistsTracks
    return filteredTracks
  }, [activeTab, favorites, recentTracks, followedArtistsTracks, filteredTracks])

  // Show loading or onboarding first
  if (!onboardingChecked) {
    return (
      <div className="min-h-screen bg-studio-radial flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading BASE Station...</p>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <div className="min-h-screen bg-studio-radial pb-24 lg:pb-8">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl pt-safe mobile-scroll">
        {/* Add top padding for mobile status bar */}
        <div className="h-4 sm:h-0" />
        {/* Search Panel with Logo and Title */}
        <div className="mb-4 sm:mb-6">
          <TrackSearch onSearchResults={handleSearchResults} />
        </div>

        {/* Audio Player */}
        {currentTrack && (
          <div className="mb-4 sm:mb-6">
            <AudioPlayer 
              track={currentTrack}
              onNext={handleNext}
              onPrevious={handlePrevious}
              shuffleEnabled={queueManager.shuffleEnabled}
              onToggleShuffle={queueManager.toggleShuffle}
              repeatMode={queueManager.repeatMode}
              onRepeatModeChange={queueManager.setRepeatMode}
              isFavorite={isFavorite(currentTrack.id)}
              onToggleFavorite={handleToggleFavorite}
              autoPlay={autoPlay}
              showAIFeatures={false}
            />
          </div>
        )}

        {/* Desktop Tabs - Hidden on Mobile */}
        <div className="rack-panel rounded-lg p-3 sm:p-4 relative hidden lg:block">
          {/* Rack Screws */}
          <div className="absolute top-3 left-3 rack-screw"></div>
          <div className="absolute top-3 right-3 rack-screw"></div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 bg-black/40 border border-white/10 p-1 rounded">
              <TabsTrigger 
                value="trending" 
                className="text-pro text-xs data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <ListMusic className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">TRENDING</span>
                <span className="sm:hidden">TRN</span>
              </TabsTrigger>
              <TabsTrigger 
                value="queue" 
                className="text-pro text-xs data-[state=active]:bg-gradient-to-b data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <ShuffleIcon className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">QUEUE</span>
                <span className="sm:hidden">QUE</span>
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                className="text-pro text-xs data-[state=active]:bg-gradient-to-b data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Heart className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">FAV ({favorites.length})</span>
                <span className="sm:hidden">({favorites.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="recent" 
                className="text-pro text-xs data-[state=active]:bg-gradient-to-b data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Clock className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">RECENT</span>
                <span className="sm:hidden">REC</span>
              </TabsTrigger>
              <TabsTrigger 
                value="following" 
                className="text-pro text-xs data-[state=active]:bg-gradient-to-b data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <UserCheck className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">FOLLOW ({follows.length})</span>
                <span className="sm:hidden">({follows.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard" 
                className="text-pro text-xs data-[state=active]:bg-gradient-to-b data-[state=active]:from-yellow-600 data-[state=active]:to-orange-700 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Trophy className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">TIPS</span>
                <span className="sm:hidden">TIP</span>
              </TabsTrigger>
            </TabsList>

            {/* Trending Tab */}
            <TabsContent value="trending" className="mt-4">
              {/* Genre Filter */}
              {availableGenres.length > 0 && (
                <div className="mb-4">
                  <GenreFilter
                    genres={availableGenres}
                    selectedGenre={selectedGenre}
                    onGenreSelect={setSelectedGenre}
                  />
                </div>
              )}

              <TrackList
                tracks={displayTracks}
                currentTrack={currentTrack}
                onTrackSelect={handleTrackSelect}
                isLoading={isLoading || isLoadingGenre}
              />
            </TabsContent>

            {/* Queue Tab */}
            <TabsContent value="queue" className="mt-4">
              <QueuePanel
                queue={queueManager.queue}
                currentIndex={queueManager.currentIndex}
                onJumpToTrack={(index) => {
                  queueManager.jumpToTrack(index)
                  const track = queueManager.queue[index]
                  if (track) {
                    addToRecentlyPlayed(track)
                  }
                }}
                onRemoveFromQueue={queueManager.removeFromQueue}
              />
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="mt-4">
              {favorites.length === 0 ? (
                <div className="text-center py-12 metal-surface rounded-lg">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-pro text-white/60 mb-2">NO FAVORITES</p>
                  <p className="text-tech text-sm text-white/40">Press the heart icon on tracks to add them here</p>
                </div>
              ) : (
                <TrackList
                  tracks={displayTracks}
                  currentTrack={currentTrack}
                  onTrackSelect={handleTrackSelect}
                  isLoading={false}
                />
              )}
            </TabsContent>

            {/* Recent Tab */}
            <TabsContent value="recent" className="mt-4">
              {recentTracks.length === 0 ? (
                <div className="text-center py-12 metal-surface rounded-lg">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-pro text-white/60 mb-2">NO HISTORY</p>
                  <p className="text-tech text-sm text-white/40">Start playing tracks to build your history</p>
                </div>
              ) : (
                <TrackList
                  tracks={displayTracks}
                  currentTrack={currentTrack}
                  onTrackSelect={handleTrackSelect}
                  isLoading={false}
                />
              )}
            </TabsContent>

            {/* Following Tab */}
            <TabsContent value="following" className="mt-4">
              {follows.length === 0 ? (
                <div className="text-center py-12 metal-surface rounded-lg">
                  <UserCheck className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-pro text-white/60 mb-2">NO FOLLOWED ARTISTS</p>
                  <p className="text-tech text-sm text-white/40">Follow artists to see their latest tracks here</p>
                </div>
              ) : loadingFollowedTracks ? (
                <div className="metal-surface rounded-lg p-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="led-indicator led-active led-pulse"></div>
                      <span className="text-pro text-white/70">LOADING TRACKS</span>
                    </div>
                  </div>
                </div>
              ) : followedArtistsTracks.length === 0 ? (
                <div className="text-center py-12 metal-surface rounded-lg">
                  <Music className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-pro text-white/60 mb-2">NO TRACKS FOUND</p>
                  <p className="text-tech text-sm text-white/40">Your followed artists haven't released tracks yet</p>
                </div>
              ) : (
                <TrackList
                  tracks={displayTracks}
                  currentTrack={currentTrack}
                  onTrackSelect={handleTrackSelect}
                  isLoading={false}
                />
              )}
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="mt-4">
              <TipLeaderboard />
            </TabsContent>

          </Tabs>
        </div>

        {/* Mobile Content - No Tabs UI, controlled by bottom nav */}
        <div className="lg:hidden">
          <div className="rack-panel rounded-lg p-3 relative">
            {/* Rack Screws */}
            <div className="absolute top-3 left-3 rack-screw"></div>
            <div className="absolute top-3 right-3 rack-screw"></div>
            
            {/* Genre Filter - Only show on trending tab */}
            {activeTab === 'trending' && availableGenres.length > 0 && (
              <div className="mb-4">
                <GenreFilter
                  genres={availableGenres}
                  selectedGenre={selectedGenre}
                  onGenreSelect={setSelectedGenre}
                />
              </div>
            )}

            {/* Content based on active tab */}
            {activeTab === 'trending' && (
              <TrackList
                tracks={displayTracks}
                currentTrack={currentTrack}
                onTrackSelect={handleTrackSelect}
                isLoading={isLoading || isLoadingGenre}
              />
            )}

            {activeTab === 'queue' && (
              <QueuePanel
                queue={queueManager.queue}
                currentIndex={queueManager.currentIndex}
                onJumpToTrack={(index) => {
                  queueManager.jumpToTrack(index)
                  const track = queueManager.queue[index]
                  if (track) {
                    addToRecentlyPlayed(track)
                  }
                }}
                onRemoveFromQueue={queueManager.removeFromQueue}
              />
            )}

            {activeTab === 'favorites' && (
              favorites.length === 0 ? (
                <div className="text-center py-12 metal-surface rounded-lg">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-pro text-white/60 mb-2">NO FAVORITES</p>
                  <p className="text-tech text-sm text-white/40">Press the heart icon on tracks to add them here</p>
                </div>
              ) : (
                <TrackList
                  tracks={displayTracks}
                  currentTrack={currentTrack}
                  onTrackSelect={handleTrackSelect}
                  isLoading={false}
                />
              )
            )}

            {activeTab === 'recent' && (
              recentTracks.length === 0 ? (
                <div className="text-center py-12 metal-surface rounded-lg">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-pro text-white/60 mb-2">NO HISTORY</p>
                  <p className="text-tech text-sm text-white/40">Start playing tracks to build your history</p>
                </div>
              ) : (
                <TrackList
                  tracks={displayTracks}
                  currentTrack={currentTrack}
                  onTrackSelect={handleTrackSelect}
                  isLoading={false}
                />
              )
            )}

            {activeTab === 'following' && (
              follows.length === 0 ? (
                <div className="text-center py-12 metal-surface rounded-lg">
                  <UserCheck className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-pro text-white/60 mb-2">NO FOLLOWED ARTISTS</p>
                  <p className="text-tech text-sm text-white/40">Follow artists to see their latest tracks here</p>
                </div>
              ) : loadingFollowedTracks ? (
                <div className="metal-surface rounded-lg p-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="led-indicator led-active led-pulse"></div>
                      <span className="text-pro text-white/70">LOADING TRACKS</span>
                    </div>
                  </div>
                </div>
              ) : followedArtistsTracks.length === 0 ? (
                <div className="text-center py-12 metal-surface rounded-lg">
                  <Music className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-pro text-white/60 mb-2">NO TRACKS FOUND</p>
                  <p className="text-tech text-sm text-white/40">Your followed artists haven't released tracks yet</p>
                </div>
              ) : (
                <TrackList
                  tracks={displayTracks}
                  currentTrack={currentTrack}
                  onTrackSelect={handleTrackSelect}
                  isLoading={false}
                />
              )
            )}

            {activeTab === 'leaderboard' && (
              <TipLeaderboard />
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          favoritesCount={favorites.length}
          followsCount={follows.length}
        />
      </div>
    </div>
  )
}

export default Page
