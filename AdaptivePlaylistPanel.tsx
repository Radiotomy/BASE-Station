'use client'

import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Music, Play } from 'lucide-react'
import type { VibePlaylist } from '@/services/vibeAnalysis'
import type { AudiusTrack } from '@/types/audius'

interface AdaptivePlaylistPanelProps {
  playlists: VibePlaylist[]
  onPlayPlaylist: (tracks: AudiusTrack[]) => void
  onSelectTrack: (track: AudiusTrack) => void
}

export const AdaptivePlaylistPanel: FC<AdaptivePlaylistPanelProps> = ({
  playlists,
  onPlayPlaylist,
  onSelectTrack
}) => {
  if (playlists.length === 0) {
    return (
      <div className="text-center py-12 metal-surface rounded-lg">
        <Music className="w-16 h-16 mx-auto mb-4 text-white/30" />
        <p className="text-pro text-white/60 mb-2">NO PLAYLISTS YET</p>
        <p className="text-tech text-sm text-white/40">
          Play some tracks to generate AI playlists
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {playlists.map((playlist, index) => (
        <Card 
          key={index} 
          className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 overflow-hidden"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                  <span className="text-2xl">{playlist.icon}</span>
                  {playlist.name}
                </CardTitle>
                <p className="text-sm text-white/60">{playlist.description}</p>
              </div>
              <Button
                onClick={() => onPlayPlaylist(playlist.tracks)}
                size="sm"
                className="flex-shrink-0"
                style={{
                  backgroundColor: playlist.color,
                  color: 'white'
                }}
              >
                <Play className="w-4 h-4 mr-1" />
                Play All
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-3 flex items-center gap-3 text-xs text-white/50">
              <span className="text-tech">{playlist.tracks.length} tracks</span>
              <span 
                className="px-2 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${playlist.color}20`,
                  color: playlist.color
                }}
              >
                {playlist.vibe}
              </span>
            </div>

            <ScrollArea className="h-48">
              <div className="space-y-2">
                {playlist.tracks.slice(0, 10).map((track, trackIndex) => (
                  <button
                    key={trackIndex}
                    onClick={() => onSelectTrack(track)}
                    className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: playlist.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate font-medium">
                          {track.title}
                        </div>
                        <div className="text-xs text-white/50 truncate">
                          {track.user.name}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {playlist.tracks.length > 10 && (
                  <div className="text-center py-2 text-xs text-white/40">
                    +{playlist.tracks.length - 10} more tracks
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
