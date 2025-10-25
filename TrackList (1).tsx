'use client'

import type { FC } from 'react'
import { useState } from 'react'
import { Music, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VibeCheckModal } from '@/components/VibeCheckModal'
import { ArtistProfile } from '@/components/ArtistProfile'
import { ArtistVerificationBadge } from '@/components/ArtistVerificationBadge'
import type { AudiusTrack } from '@/types/audius'

interface TrackListProps {
  tracks: AudiusTrack[]
  currentTrack: AudiusTrack | null
  onTrackSelect: (track: AudiusTrack) => void
  isLoading: boolean
}

export const TrackList: FC<TrackListProps> = ({
  tracks,
  currentTrack,
  onTrackSelect,
  isLoading
}) => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [vibeCheckTrack, setVibeCheckTrack] = useState<AudiusTrack | null>(null)
  const [artistProfileId, setArtistProfileId] = useState<string | null>(null)

  const handleImageError = (trackId: string): void => {
    setFailedImages(prev => new Set(prev).add(trackId))
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="metal-surface rounded-lg p-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="led-indicator led-active led-pulse"></div>
            <span className="text-pro text-white/70">LOADING TRACKS</span>
          </div>
          <div className="flex justify-center gap-1">
            <div className="w-1 h-8 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-8 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-8 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className="metal-surface rounded-lg p-8">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-3 text-white/30" />
          <p className="text-pro text-white/60">NO TRACKS FOUND</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto mobile-scroll pb-safe">
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id
        const artworkUrl = track.artwork?.['150x150'] || track.artwork?.['480x480']

        return (
          <div
            key={track.id}
            className={`track-item-pro rounded p-3 ${
              isCurrentTrack ? 'track-item-pro-active' : ''
            }`}
            onClick={() => onTrackSelect(track)}
          >
            <div className="flex items-center gap-3">
              {/* Track Number / Play Indicator */}
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                {isCurrentTrack ? (
                  <div className="flex items-center gap-0.5">
                    <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" />
                    <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                ) : (
                  <div className="text-tech text-xs text-white/40">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                )}
              </div>

              {/* Play Button */}
              <button
                className="w-10 h-10 lg:w-8 lg:h-8 rounded-full bg-gradient-to-b from-[#0052FF] to-[#0052FF]/80 hover:from-[#0052FF]/90 hover:to-[#0052FF]/70 active:scale-95 flex items-center justify-center flex-shrink-0 border border-[#6997FF]/30 touch-manipulation transition-transform"
                onClick={(e) => {
                  e.stopPropagation()
                  onTrackSelect(track)
                }}
              >
                <Play className="w-4 h-4 lg:w-3 lg:h-3 text-white ml-0.5" />
              </button>

              {/* Artwork */}
              {artworkUrl && !failedImages.has(track.id) ? (
                <img
                  src={artworkUrl}
                  alt={track.title}
                  className="w-14 h-14 lg:w-12 lg:h-12 rounded object-cover flex-shrink-0 border border-white/10"
                  onError={() => handleImageError(track.id)}
                />
              ) : (
                <div className="w-14 h-14 lg:w-12 lg:h-12 rounded bg-gradient-to-br from-[#0052FF] to-[#6997FF] flex items-center justify-center flex-shrink-0 border border-white/10">
                  <Music className="w-7 h-7 lg:w-6 lg:h-6 text-white" />
                </div>
              )}

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate text-sm lg:text-sm">
                  {track.title}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setArtistProfileId(track.user.id)
                    }}
                    className="text-tech text-xs text-white/50 truncate hover:text-[#6997FF] transition-colors"
                  >
                    {track.user.name}
                  </button>
                  <ArtistVerificationBadge isVerified={track.user.is_verified} size="sm" />
                </div>
              </div>

              {/* Vibe Check Button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  setVibeCheckTrack(track)
                }}
                className="text-[#5200FF] hover:text-[#5200FF]/80 hover:bg-[#5200FF]/10 active:bg-[#5200FF]/20 active:scale-95 transition-all flex-shrink-0 touch-manipulation min-w-[44px] min-h-[44px] lg:min-w-0 lg:min-h-0"
                title="Vibe Check"
              >
                <Sparkles className="w-5 h-5 lg:w-4 lg:h-4" />
              </Button>

              {/* Stats & Duration */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-tech text-xs text-white/70">
                  {formatDuration(track.duration)}
                </span>
                <span className="text-tech text-xs text-white/40">
                  {(track.play_count / 1000).toFixed(1)}K
                </span>
              </div>

              {/* LED Indicator */}
              <div className={`led-indicator flex-shrink-0 ${isCurrentTrack ? 'led-active led-pulse' : ''}`}></div>
            </div>

            {/* Genre Tag */}
            {track.genre && (
              <div className="mt-2 ml-20">
                <span className="inline-block px-2 py-0.5 bg-black/40 rounded text-tech text-xs text-white/60 border border-white/10">
                  {track.genre.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )
      })}

      {/* Vibe Check Modal */}
      {vibeCheckTrack && (
        <VibeCheckModal
          isOpen={!!vibeCheckTrack}
          onClose={() => setVibeCheckTrack(null)}
          track={vibeCheckTrack}
          analyserNode={null}
        />
      )}

      {/* Artist Profile Modal */}
      {artistProfileId && (
        <ArtistProfile
          artistId={artistProfileId}
          isOpen={!!artistProfileId}
          onClose={() => setArtistProfileId(null)}
          onTrackSelect={onTrackSelect}
          currentTrack={currentTrack}
        />
      )}
    </div>
  )
}
