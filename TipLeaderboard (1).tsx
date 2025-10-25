'use client'

import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, TrendingUp, Clock, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ArtistVerificationBadge } from '@/components/ArtistVerificationBadge'
import { getTipStats, exportTipHistory } from '@/services/tipHistory'
import type { TipStats } from '@/services/tipHistory'
import { SUPPORTED_TOKENS } from '@/types/tokens'

export const TipLeaderboard: FC = () => {
  const [stats, setStats] = useState<TipStats | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = (): void => {
    const tipStats = getTipStats()
    setStats(tipStats)
  }

  const handleExport = (): void => {
    const json = exportTipHistory()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bstn-tips-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!stats) {
    return (
      <Card className="bg-gray-900/80 border-white/20">
        <CardContent className="p-6 text-center text-white/60">
          Loading stats...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/80 border-white/20 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Tip Leaderboard
            </CardTitle>
            <CardDescription className="text-white/60">
              Community support statistics
            </CardDescription>
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="border-white/20 hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="artists" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/10">
            <TabsTrigger value="artists">Top Artists</TabsTrigger>
            <TabsTrigger value="tokens">By Token</TabsTrigger>
            <TabsTrigger value="recent">Recent Tips</TabsTrigger>
          </TabsList>

          {/* Top Artists Tab */}
          <TabsContent value="artists" className="space-y-3 mt-4">
            {stats.topArtists.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No tips recorded yet</p>
              </div>
            ) : (
              stats.topArtists.map((artist, index) => (
                <div
                  key={artist.artistId}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      index === 0
                        ? 'bg-yellow-500 text-black'
                        : index === 1
                        ? 'bg-gray-400 text-black'
                        : index === 2
                        ? 'bg-orange-600 text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold">{artist.artistName}</p>
                      {/* Note: We'd need to fetch full artist data to get verification status */}
                    </div>
                    <p className="text-xs text-white/60">@{artist.artistHandle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-400">{artist.tipCount} tips</p>
                    <p className="text-xs text-white/60">
                      {artist.totalAmount.toFixed(4)} total
                    </p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* By Token Tab */}
          <TabsContent value="tokens" className="space-y-3 mt-4">
            {Object.entries(stats.totalByToken).map(([token, amount]) => {
              const tokenInfo = SUPPORTED_TOKENS[token as keyof typeof SUPPORTED_TOKENS]
              if (!tokenInfo) return null

              return (
                <div
                  key={token}
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className={`text-3xl bg-gradient-to-r ${tokenInfo.color} bg-clip-text text-transparent`}>
                    {tokenInfo.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{tokenInfo.name}</p>
                    <p className="text-xs text-white/60">${token}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-cyan-400">
                      {amount.toFixed(4)}
                    </p>
                    <p className="text-xs text-white/60">{token}</p>
                  </div>
                </div>
              )
            })}

            <div className="mt-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30">
              <p className="text-sm text-white/80 mb-1">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Total Tips Sent
              </p>
              <p className="text-2xl font-bold text-cyan-400">{stats.totalTips}</p>
            </div>
          </TabsContent>

          {/* Recent Tips Tab */}
          <TabsContent value="recent" className="space-y-2 mt-4">
            {stats.recentTips.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No recent tips</p>
              </div>
            ) : (
              stats.recentTips.map((tip) => {
                const tokenInfo = SUPPORTED_TOKENS[tip.token]
                return (
                  <div
                    key={tip.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{tip.artistName}</p>
                        <p className="text-xs text-white/60 truncate">{tip.trackTitle}</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-bold text-cyan-400">
                          {tokenInfo.icon} {tip.amount}
                        </p>
                        <p className="text-xs text-white/60">{tip.token}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>{new Date(tip.timestamp).toLocaleDateString()}</span>
                      {tip.txHash && (
                        <span className="font-mono truncate max-w-[120px]">
                          {tip.txHash.slice(0, 6)}...{tip.txHash.slice(-4)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
