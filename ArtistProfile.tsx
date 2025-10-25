'use client'

import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { X, UserPlus, UserCheck, ExternalLink, Music2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArtistVerificationBadge } from './ArtistVerificationBadge'
import { ArtistStats } from './ArtistStats'
import { TrackList } from './TrackList'
import { fetchArtistById, fetchArtistTracks } from '@/services/audiusArtists'
import { useFollows } from '@/hooks/useFollows'
import { useToast } from '@/hooks/use-toast'
import type { AudiusArtist } from '@/services/audiusArtists'
import type { AudiusTrack } from '@/types/audius'

interface ArtistProfileProps {
  artistId: string
  isOpen: boolean
  onClose: () => void
  onTrackSelect?: (track: AudiusTrack) => void
  currentTrack?: AudiusTrack | null
}

export const ArtistProfile: FC<ArtistProfileProps> = ({ 
  artistId, 
  isOpen, 
  onClose,
  onTrackSelect,
  currentTrack
}) => {
  const [artist, setArtist] = useState<AudiusArtist | null>(null)
  const [tracks, setTracks] = useState<AudiusTrack[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { isArtistFollowed, toggleArtistFollow } = useFollows()
  const { toast } = useToast()

  const isFollowing = artist ? isArtistFollowed(artist.id) : false

  useEffect(() => {
    if (isOpen && artistId) {
      loadArtistData()
    }
  }, [isOpen, artistId])

  const loadArtistData = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const [artistData, artistTracks] = await Promise.all([
        fetchArtistById(artistId),
        fetchArtistTracks(artistId, 50)
      ])

      setArtist(artistData)
      setTracks(artistTracks)
    } catch (error) {
      console.error('Error loading artist data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load artist profile',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowToggle = (): void => {
    if (!artist) return

    toggleArtistFollow(artist.id, artist.name, artist.handle)
    
    toast({
      title: isFollowing ? 'Unfollowed' : 'Following!',
      description: isFollowing 
        ? `You unfollowed ${artist.name}` 
        : `You're now following ${artist.name}`,
    })
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1rem)] lg:max-w-4xl max-h-[95vh] lg:max-h-[90vh] p-0 bg-gradient-to-br from-black via-gray-900 to-black border-2 border-white/20 mobile-scroll">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : artist ? (
          <ScrollArea className="h-[95vh] lg:h-[90vh] mobile-scroll">
            <div className="relative">
              {/* Cover Photo */}
              <div 
                className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 relative"
                style={{
                  backgroundImage: artist.cover_photo?.['2000x'] 
                    ? `url(${artist.cover_photo['2000x']})` 
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Close Button */}
                <Button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 border border-white/20"
                  size="icon"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Profile Content */}
              <div className="p-6">
                {/* Artist Header */}
                <div className="flex items-start gap-4 -mt-20 mb-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-black/60 bg-gray-800 overflow-hidden">
                      {artist.profile_picture?.['480x480'] ? (
                        <img 
                          src={artist.profile_picture['480x480']} 
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music2 className="w-12 h-12 text-white/40" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Artist Info */}
                  <div className="flex-1 mt-16">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-white">{artist.name}</h1>
                      <ArtistVerificationBadge 
                        isVerified={artist.is_verified} 
                        size="lg"
                      />
                    </div>
                    <p className="text-white/60 mb-4">@{artist.handle}</p>
                    
                    {/* Bio */}
                    {artist.bio && (
                      <p className="text-white/80 mb-4 max-w-2xl">{artist.bio}</p>
                    )}

                    {/* Social Links */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {artist.twitter_handle && (
                        <a 
                          href={`https://twitter.com/${artist.twitter_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600/30 flex items-center gap-1"
                        >
                          Twitter <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {artist.instagram_handle && (
                        <a 
                          href={`https://instagram.com/${artist.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1 bg-pink-600/20 text-pink-400 rounded-full hover:bg-pink-600/30 flex items-center gap-1"
                        >
                          Instagram <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {artist.website && (
                        <a 
                          href={artist.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full hover:bg-purple-600/30 flex items-center gap-1"
                        >
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Follow Button */}
                    <Button
                      onClick={handleFollowToggle}
                      className={
                        isFollowing
                          ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      }
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="mb-8">
                  <ArtistStats artist={artist} />
                </div>

                {/* Tracks Section */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Music2 className="w-5 h-5" />
                    Tracks ({tracks.length})
                  </h2>
                  
                  {tracks.length > 0 ? (
                    <TrackList
                      tracks={tracks}
                      currentTrack={currentTrack || null}
                      onTrackSelect={onTrackSelect || (() => {})}
                      isLoading={false}
                    />
                  ) : (
                    <div className="text-center py-12 bg-white/5 rounded-lg">
                      <Music2 className="w-12 h-12 mx-auto mb-3 text-white/30" />
                      <p className="text-white/60">No tracks available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-white/60">Artist not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
