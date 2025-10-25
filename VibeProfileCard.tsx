'use client'

import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, CheckCircle, TrendingUp, Users, Shield } from 'lucide-react'
import type { VibeProfile } from '@/services/vibeAnalysis'
import { VibeStorage } from '@/services/vibeAnalysis'

interface VibeProfileCardProps {
  trackId: string
  profile: VibeProfile
  onCosign?: () => void
}

export const VibeProfileCard: FC<VibeProfileCardProps> = ({ 
  trackId, 
  profile,
  onCosign
}) => {
  const [hasUserCosigned, setHasUserCosigned] = useState<boolean>(false)
  const [localCosigns, setLocalCosigns] = useState<number>(profile.cosigns)

  useEffect(() => {
    // Check if user has already cosigned
    if (typeof window !== 'undefined') {
      const key = `cosigned_${trackId}`
      setHasUserCosigned(localStorage.getItem(key) === 'true')
    }
  }, [trackId])

  const handleCosign = (): void => {
    if (hasUserCosigned) return

    const newCount = VibeStorage.addCosign(trackId)
    setLocalCosigns(newCount)
    setHasUserCosigned(true)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cosigned_${trackId}`, 'true')
    }

    if (onCosign) {
      onCosign()
    }
  }

  const getTempoLabel = (tempo: string): string => {
    const labels: Record<string, string> = {
      slow: 'Chill',
      medium: 'Steady',
      fast: 'Energetic',
      ultra: 'Hyper'
    }
    return labels[tempo] || tempo
  }

  const getTempoEmoji = (tempo: string): string => {
    const emojis: Record<string, string> = {
      slow: '🐢',
      medium: '🚶',
      fast: '🏃',
      ultra: '⚡'
    }
    return emojis[tempo] || '🎵'
  }

  return (
    <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: profile.color }} />
            AI Vibe Analysis
          </CardTitle>
          <Badge 
            className="text-xs"
            style={{ 
              backgroundColor: `${profile.color}20`, 
              color: profile.color,
              borderColor: profile.color
            }}
          >
            {profile.vibe}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Energy Level */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/70">Energy Level</span>
            <span className="text-sm font-bold text-white">{Math.round(profile.energy)}%</span>
          </div>
          <Progress 
            value={profile.energy} 
            className="h-2"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)'
            }}
          />
        </div>

        {/* Tempo & Mood */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-white/50 mb-1">Tempo</div>
            <div className="text-sm font-bold text-white flex items-center gap-1">
              <span>{getTempoEmoji(profile.tempo)}</span>
              {getTempoLabel(profile.tempo)}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-white/50 mb-1">Mood</div>
            <div className="text-sm font-bold text-white capitalize truncate">
              {profile.mood}
            </div>
          </div>
        </div>

        {/* Authenticity Score */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-3 border border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/70">Authenticity</span>
            </div>
            <span className="text-sm font-bold text-green-400">
              {Math.round(profile.authenticity)}%
            </span>
          </div>
          <Progress 
            value={profile.authenticity} 
            className="h-1.5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)'
            }}
          />
          <p className="text-xs text-white/40 mt-1">
            Verified on-chain via Audius network
          </p>
        </div>

        {/* Community Co-Sign */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-4 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">Community Co-Signs</span>
              </div>
              <p className="text-xs text-white/40">
                Help verify the vibe
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-400">{localCosigns}</div>
              <div className="text-xs text-white/40">signatures</div>
            </div>
          </div>
          
          <Button
            onClick={handleCosign}
            disabled={hasUserCosigned}
            className={`w-full ${
              hasUserCosigned 
                ? 'bg-green-600/20 hover:bg-green-600/20 text-green-400 cursor-default' 
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
            }`}
          >
            {hasUserCosigned ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Vibe Verified ✓
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Co-Sign This Vibe
              </>
            )}
          </Button>
        </div>

        {/* Energy Signature Visualization */}
        <div>
          <div className="text-xs text-white/50 mb-2">Energy Signature</div>
          <div className="flex items-end gap-1 h-12">
            {profile.energySignature.map((value, index) => (
              <div
                key={index}
                className="flex-1 rounded-t transition-all duration-300"
                style={{
                  height: `${(value / 255) * 100}%`,
                  backgroundColor: profile.color,
                  opacity: 0.8
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
