'use client'

import type { FC } from 'react'
import { Users, Music, Heart, Coins } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getTipStatsByArtist } from '@/services/tipHistory'
import type { AudiusArtist } from '@/services/audiusArtists'

interface ArtistStatsProps {
  artist: AudiusArtist
}

export const ArtistStats: FC<ArtistStatsProps> = ({ artist }) => {
  const tipStats = getTipStatsByArtist(artist.id)
  
  // Calculate total tips in USD equivalent (rough estimate)
  const totalTipsUSD = 
    (tipStats.totalETH * 3000) + // ETH @ $3000
    (tipStats.totalAUDIO * 0.20) + // AUDIO @ $0.20
    (tipStats.totalBSTN * 0.10) // BSTN @ $0.10

  const stats = [
    {
      label: 'Followers',
      value: artist.follower_count.toLocaleString(),
      icon: Users,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      label: 'Tracks',
      value: artist.track_count.toLocaleString(),
      icon: Music,
      color: 'from-purple-600 to-pink-600'
    },
    {
      label: 'Total Tips',
      value: `$${totalTipsUSD.toFixed(2)}`,
      icon: Coins,
      color: 'from-yellow-600 to-orange-600',
      subtitle: `${tipStats.tipCount} tips`
    },
    {
      label: 'Supporters',
      value: artist.supporter_count.toLocaleString(),
      icon: Heart,
      color: 'from-red-600 to-pink-600'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card 
            key={stat.label}
            className="bg-gradient-to-br from-black/60 to-black/40 border-white/10 backdrop-blur-sm"
          >
            <div className="p-4">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-white/60">{stat.label}</div>
              {stat.subtitle && (
                <div className="text-xs text-white/40 mt-1">{stat.subtitle}</div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
