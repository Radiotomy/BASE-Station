'use client'

import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { X, Music } from 'lucide-react'
import type { AudiusTrack } from '@/types/audius'

interface QueuePanelProps {
  queue: AudiusTrack[]
  currentIndex: number
  onJumpToTrack: (index: number) => void
  onRemoveFromQueue: (index: number) => void
}

export const QueuePanel: FC<QueuePanelProps> = ({
  queue,
  currentIndex,
  onJumpToTrack,
  onRemoveFromQueue
}) => {
  if (queue.length === 0) {
    return (
      <div className="metal-surface rounded-lg p-8">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-3 text-white/30" />
          <p className="text-pro text-white/60 mb-1">QUEUE EMPTY</p>
          <p className="text-tech text-xs text-white/40">Add tracks to build your queue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="led-indicator led-active led-pulse"></div>
          <h3 className="text-pro text-white/90">
            UP NEXT • {queue.length} {queue.length === 1 ? 'TRACK' : 'TRACKS'}
          </h3>
        </div>
        <span className="text-tech text-xs text-white/50">
          NOW PLAYING: #{currentIndex + 1}
        </span>
      </div>

      <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
        {queue.map((track, index) => {
          const isCurrentTrack = index === currentIndex
          const artworkUrl = track.artwork?.['150x150'] || track.artwork?.['480x480']

          return (
            <div
              key={`${track.id}-${index}`}
              className={`group track-item-pro rounded p-3 cursor-pointer ${
                isCurrentTrack ? 'track-item-pro-active' : ''
              }`}
              onClick={() => onJumpToTrack(index)}
            >
              <div className="flex items-center gap-3">
                {/* Position Number */}
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  {isCurrentTrack ? (
                    <div className="flex items-center gap-0.5">
                      <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" />
                      <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  ) : (
                    <span className="text-tech text-xs text-white/40">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Artwork */}
                {artworkUrl ? (
                  <img
                    src={artworkUrl}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover flex-shrink-0 border border-white/10"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0 border border-white/10">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                )}

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate text-sm ${
                    isCurrentTrack ? 'text-green-400' : 'text-white'
                  }`}>
                    {track.title}
                  </p>
                  <p className="text-tech text-xs text-white/50 truncate">
                    {track.user.name}
                  </p>
                </div>

                {/* Duration */}
                <span className="text-tech text-xs text-white/50 flex-shrink-0">
                  {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
                </span>

                {/* LED Indicator */}
                <div className={`led-indicator flex-shrink-0 ${isCurrentTrack ? 'led-active led-pulse' : ''}`}></div>

                {/* Remove Button */}
                {!isCurrentTrack && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveFromQueue(index)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 hover:bg-white/5 transition-all w-8 h-8 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
