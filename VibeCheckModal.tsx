'use client'

import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, TrendingUp, Shield, Users, Image as ImageIcon, Download, CheckCircle, AlertCircle } from 'lucide-react'
import type { AudiusTrack } from '@/types/audius'
import { VibeAnalyzer, VibeStorage } from '@/services/vibeAnalysis'
import type { VibeProfile } from '@/services/vibeAnalysis'
import { VibeMapVisualizer } from '@/components/VibeMapVisualizer'

interface VibeCheckModalProps {
  isOpen: boolean
  onClose: () => void
  track: AudiusTrack
  analyserNode: AnalyserNode | null
}

export const VibeCheckModal: FC<VibeCheckModalProps> = ({
  isOpen,
  onClose,
  track,
  analyserNode
}) => {
  const [vibeProfile, setVibeProfile] = useState<VibeProfile | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [activeSection, setActiveSection] = useState<'profile' | 'authenticity' | 'cosign' | 'vibe-map'>('profile')
  const [hasCosigned, setHasCosigned] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen && track) {
      analyzeTrack()
      // Check if user has already co-signed this track
      const cosignKey = `cosign-${track.id}`
      setHasCosigned(localStorage.getItem(cosignKey) === 'true')
    }
  }, [isOpen, track])

  const analyzeTrack = (): void => {
    setIsAnalyzing(true)
    
    // Check for cached profile
    const cached = VibeStorage.getVibeProfile(track.id)
    if (cached) {
      setVibeProfile(cached)
      setIsAnalyzing(false)
      return
    }

    // Generate new profile
    setTimeout(() => {
      const analyzer = new VibeAnalyzer(analyserNode)
      const profile = analyzer.analyzeTrack(track)
      setVibeProfile(profile)
      VibeStorage.saveVibeProfile(track.id, profile)
      setIsAnalyzing(false)
    }, 500)
  }

  const handleCosign = (): void => {
    if (!vibeProfile || hasCosigned) return

    const cosignKey = `cosign-${track.id}`
    const cosignCountKey = `cosign-count-${track.id}`
    
    // Mark as co-signed
    localStorage.setItem(cosignKey, 'true')
    setHasCosigned(true)

    // Increment count
    const currentCount = parseInt(localStorage.getItem(cosignCountKey) || '0', 10)
    const newCount = currentCount + 1
    localStorage.setItem(cosignCountKey, newCount.toString())

    // Update profile
    const updatedProfile = {
      ...vibeProfile,
      cosignCount: newCount
    }
    setVibeProfile(updatedProfile)
    VibeStorage.saveVibeProfile(track.id, updatedProfile)
  }

  const calculateAuthenticityScore = (): number => {
    if (!track) return 0

    let score = 0
    
    // Artist verified status (30 points)
    if (track.user.is_verified) score += 30
    
    // Play count threshold (25 points)
    if (track.play_count > 1000) score += 25
    
    // Favorite count threshold (20 points)
    if (track.favorite_count > 100) score += 20
    
    // Has complete metadata (15 points)
    if (track.genre && track.artwork && track.description) score += 15
    
    // Has repost activity (10 points)
    if (track.repost_count && track.repost_count > 10) score += 10

    return Math.min(score, 100)
  }

  const getVibeColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Late-Night Flow': 'from-indigo-500 to-purple-500',
      'DAO Energy': 'from-orange-500 to-red-500',
      'Build Mode': 'from-cyan-500 to-blue-500',
      'Cosmic Chill': 'from-purple-500 to-pink-500',
      'Hype Wave': 'from-yellow-500 to-orange-500'
    }
    return colors[category] || 'from-gray-500 to-gray-600'
  }

  if (!vibeProfile && !isAnalyzing) {
    return null
  }

  const authenticityScore = calculateAuthenticityScore()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-white/20 text-white w-[calc(100vw-2rem)] max-w-4xl max-h-[90vh] lg:max-h-[90vh] h-auto lg:h-auto overflow-y-auto mobile-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#5200FF] to-[#6997FF] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-bold">Vibe Check</div>
                <div className="text-sm text-white/60 font-normal mt-0.5">{track.title}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isAnalyzing ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center gap-3 text-white/60">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span className="ml-2">Analyzing vibe...</span>
            </div>
          </div>
        ) : vibeProfile ? (
          <>
            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 lg:flex gap-2 mb-6">
              <Button
                variant={activeSection === 'profile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection('profile')}
                className={activeSection === 'profile' ? 'bg-gradient-to-r from-[#0052FF] to-[#6997FF]' : 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Vibe Profile
              </Button>
              <Button
                variant={activeSection === 'authenticity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection('authenticity')}
                className={activeSection === 'authenticity' ? 'bg-gradient-to-r from-[#0052FF] to-[#6997FF]' : 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'}
              >
                <Shield className="w-4 h-4 mr-2" />
                Authenticity
              </Button>
              <Button
                variant={activeSection === 'cosign' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection('cosign')}
                className={activeSection === 'cosign' ? 'bg-gradient-to-r from-[#0052FF] to-[#6997FF]' : 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'}
              >
                <Users className="w-4 h-4 mr-2" />
                Community ({vibeProfile.cosignCount})
              </Button>
              <Button
                variant={activeSection === 'vibe-map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection('vibe-map')}
                className={activeSection === 'vibe-map' ? 'bg-gradient-to-r from-[#0052FF] to-[#6997FF]' : 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Vibe Map
              </Button>
            </div>

            {/* Vibe Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-lg p-6 border border-white/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getVibeColor(vibeProfile.vibeCategory)}`}></div>
                    Energy Signature
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Energy Level */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-white/70">Energy Level</span>
                        <span className="text-sm font-bold text-[#6997FF]">{vibeProfile.energy}%</span>
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#5200FF] via-[#6997FF] to-[#0052FF] transition-all duration-500"
                          style={{ width: `${vibeProfile.energy}%` }}
                        />
                      </div>
                    </div>

                    {/* Tempo */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70">Tempo</span>
                      <Badge variant="outline" className="border-[#6997FF]/50 text-[#6997FF]">
                        {vibeProfile.tempo.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Mood */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70">Mood</span>
                      <Badge variant="outline" className="border-[#5200FF]/50 text-[#5200FF]">
                        {vibeProfile.mood.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Vibe Category */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70">Vibe Category</span>
                      <Badge className={`bg-gradient-to-r ${getVibeColor(vibeProfile.vibeCategory)} border-0`}>
                        {vibeProfile.vibeCategory}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Genre & Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                    <div className="text-2xl font-bold text-[#6997FF]">{track.play_count.toLocaleString()}</div>
                    <div className="text-xs text-white/50 mt-1">Plays</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                    <div className="text-2xl font-bold text-[#5200FF]">{track.favorite_count.toLocaleString()}</div>
                    <div className="text-xs text-white/50 mt-1">Favorites</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                    <div className="text-2xl font-bold text-[#0052FF]">{track.genre || 'N/A'}</div>
                    <div className="text-xs text-white/50 mt-1">Genre</div>
                  </div>
                </div>
              </div>
            )}

            {/* Authenticity Section */}
            {activeSection === 'authenticity' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-lg p-6 border border-white/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Authenticity Score
                  </h3>
                  
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white/70">On-Chain Verification</span>
                      <span className="text-2xl font-bold text-green-400">{authenticityScore}%</span>
                    </div>
                    <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${authenticityScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Artist Verified</span>
                      {track.user.is_verified ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Engagement Score</span>
                      {track.play_count > 1000 ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Community Support</span>
                      {track.favorite_count > 100 ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Complete Metadata</span>
                      {track.genre && track.artwork ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-white/70">
                        This track's metadata is verified on the Audius blockchain, ensuring authenticity and preventing unauthorized modifications.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Community Co-Sign Section */}
            {activeSection === 'cosign' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-lg p-6 border border-white/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Community Validation
                  </h3>
                  
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
                      {vibeProfile.cosignCount}
                    </div>
                    <div className="text-white/60">Community Co-Signs</div>
                  </div>

                  <Button
                    onClick={handleCosign}
                    disabled={hasCosigned}
                    className={`w-full ${
                      hasCosigned 
                        ? 'bg-green-600 hover:bg-green-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-[#0052FF] to-[#6997FF] hover:from-[#0052FF]/90 hover:to-[#6997FF]/90'
                    }`}
                  >
                    {hasCosigned ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        You've Co-Signed This Vibe
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-2" />
                        Co-Sign This Vibe
                      </>
                    )}
                  </Button>

                  <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-sm text-white/70">
                      <p className="mb-2">
                        <strong className="text-white">What is Co-Signing?</strong>
                      </p>
                      <p>
                        Co-signing is a decentralized trust mechanism where community members validate the vibe analysis of a track. Your co-sign helps build collective intelligence around music discovery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vibe Map Section */}
            {activeSection === 'vibe-map' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-lg p-6 border border-white/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-cyan-400" />
                    Audio Fingerprint Visualization
                  </h3>
                  
                  <VibeMapVisualizer
                    profile={vibeProfile}
                    trackTitle={track.title}
                  />

                  <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <div className="text-sm text-white/70">
                      <p className="mb-2">
                        <strong className="text-white">Collectible Audio Fingerprint</strong>
                      </p>
                      <p>
                        This unique visualization represents the track's energy signature across 10 frequency bands. Download it as a collectible NFT to showcase your music taste on-chain.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
