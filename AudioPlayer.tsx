'use client'

import type { FC } from 'react'
import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, Volume2, VolumeX, Heart, ExternalLink, SkipBack, SkipForward, Repeat, Repeat1, Shuffle, Music, User, Sparkles } from 'lucide-react'
import { EnhancedTipButton } from '@/components/EnhancedTipButton'
import { IntegratedAudioControl } from '@/components/IntegratedAudioControl'
import { RainbowSeekBar } from '@/components/RainbowSeekBar'
import { VibeCheckModal } from '@/components/VibeCheckModal'
import { ArtistProfile } from '@/components/ArtistProfile'
import { ArtistVerificationBadge } from '@/components/ArtistVerificationBadge'
import type { AudiusTrack } from '@/types/audius'
import type { RepeatMode } from '@/hooks/useQueue'
import { VibeAnalyzer, VibeStorage } from '@/services/vibeAnalysis'
import type { VibeProfile } from '@/services/vibeAnalysis'

interface AudioPlayerProps {
  track: AudiusTrack
  onNext?: () => void
  onPrevious?: () => void
  shuffleEnabled?: boolean
  onToggleShuffle?: () => void
  repeatMode?: RepeatMode
  onRepeatModeChange?: (mode: RepeatMode) => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  autoPlay?: boolean
  showAIFeatures?: boolean
}

export const AudioPlayer: FC<AudioPlayerProps> = ({ 
  track, 
  onNext, 
  onPrevious,
  shuffleEnabled = false,
  onToggleShuffle,
  repeatMode = 'off',
  onRepeatModeChange,
  isFavorite = false,
  onToggleFavorite,
  autoPlay = false,
  showAIFeatures = false
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [volume, setVolume] = useState<number>(0.7)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [audioHost, setAudioHost] = useState<string>('')
  const [artworkError, setArtworkError] = useState<boolean>(false)
  const [profilePicError, setProfilePicError] = useState<boolean>(false)
  const [shouldAutoPlay, setShouldAutoPlay] = useState<boolean>(false)
  const [vibeProfile, setVibeProfile] = useState<VibeProfile | null>(null)
  const [showVibeCheckModal, setShowVibeCheckModal] = useState<boolean>(false)
  const [showArtistProfile, setShowArtistProfile] = useState<boolean>(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const eqNodesRef = useRef<BiquadFilterNode[]>([])

  useEffect(() => {
    fetchAudioHost()
  }, [])

  // Generate vibe profile when track changes or when playing
  useEffect(() => {
    if (!track || !showAIFeatures) return

    // Check if we have a cached profile
    const cached = VibeStorage.getVibeProfile(track.id)
    if (cached) {
      setVibeProfile(cached)
      return
    }

    // Generate new profile after a short delay to ensure analyser is ready
    const timer = setTimeout(() => {
      const analyzer = new VibeAnalyzer(analyserRef.current)
      const profile = analyzer.analyzeTrack(track)
      setVibeProfile(profile)
      VibeStorage.saveVibeProfile(track.id, profile)
    }, 1000)

    return () => clearTimeout(timer)
  }, [track, isPlaying, showAIFeatures])

  useEffect(() => {
    const loadAndPlayTrack = async (): Promise<void> => {
      if (audioRef.current && audioHost) {
        const wasPlaying = isPlaying
        audioRef.current.src = `https://${audioHost}/v1/tracks/${track.id}/stream?app_name=BASE_Station`
        audioRef.current.load()
        setCurrentTime(0)
        setArtworkError(false)
        setProfilePicError(false)
        
        // Auto-play if user had previously started playback, shouldAutoPlay is true, or autoPlay prop is true
        if (wasPlaying || shouldAutoPlay || autoPlay) {
          // Wait for audio to be loaded
          audioRef.current.oncanplay = async () => {
            if (!audioRef.current) return
            
            try {
              if (!audioContextRef.current) {
                initializeAudioContext()
              }
              
              if (audioContextRef.current?.state === 'suspended') {
                await audioContextRef.current.resume()
              }
              
              await audioRef.current.play()
              setIsPlaying(true)
              setShouldAutoPlay(true)
            } catch (error) {
              console.error('Autoplay failed:', error)
              setIsPlaying(false)
            }
          }
        } else {
          setIsPlaying(false)
        }
      }
    }
    
    loadAndPlayTrack()
  }, [track, audioHost, autoPlay])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const fetchAudioHost = async (): Promise<void> => {
    try {
      const response = await fetch('/api/proxy', {
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

      if (!response.ok) throw new Error('Failed to fetch hosts')
      
      const hostsData = await response.json()
      const host = hostsData.data[0].replace('https://', '')
      setAudioHost(host)
    } catch (error) {
      console.error('Error fetching audio host:', error)
    }
  }

  const initializeAudioContext = (): void => {
    if (!audioRef.current || audioContextRef.current) return

    const audioContext = new AudioContext()
    const source = audioContext.createMediaElementSource(audioRef.current)
    const analyser = audioContext.createAnalyser()
    const gainNode = audioContext.createGain()

    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8

    // Create 5-band EQ
    const frequencies = [60, 250, 1000, 4000, 12000]
    const eqNodes = frequencies.map((freq) => {
      const filter = audioContext.createBiquadFilter()
      filter.type = 'peaking'
      filter.frequency.value = freq
      filter.Q.value = 1
      filter.gain.value = 0
      return filter
    })

    // Connect nodes
    let currentNode: AudioNode = source
    eqNodes.forEach((node) => {
      currentNode.connect(node)
      currentNode = node
    })
    currentNode.connect(analyser)
    analyser.connect(gainNode)
    gainNode.connect(audioContext.destination)

    audioContextRef.current = audioContext
    analyserRef.current = analyser
    sourceRef.current = source
    gainNodeRef.current = gainNode
    eqNodesRef.current = eqNodes
  }

  const togglePlay = async (): Promise<void> => {
    if (!audioRef.current) return

    if (!audioContextRef.current) {
      initializeAudioContext()
    }

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
        setShouldAutoPlay(true) // Enable autoplay for subsequent tracks
      } catch (error) {
        console.error('Play failed:', error)
        setIsPlaying(false)
      }
    }
  }

  const handleTimeUpdate = (): void => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleSeek = (time: number): void => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (value: number[]): void => {
    setVolume(value[0])
    setIsMuted(false)
  }

  const toggleMute = (): void => {
    setIsMuted(!isMuted)
  }

  const handleToggleFavorite = (): void => {
    if (onToggleFavorite) {
      onToggleFavorite()
    }
  }

  const handleRepeatModeClick = (): void => {
    if (!onRepeatModeChange) return
    const modes: RepeatMode[] = ['off', 'all', 'one']
    const currentIndex = modes.indexOf(repeatMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    onRepeatModeChange(nextMode)
  }

  const handleTrackEnd = (): void => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } else if (onNext) {
      onNext()
    } else {
      setIsPlaying(false)
    }
  }

  const handleEQChange = (bandIndex: number, value: number): void => {
    if (eqNodesRef.current[bandIndex]) {
      eqNodesRef.current[bandIndex].gain.value = value
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const artworkUrl = track.artwork?.['480x480'] || track.artwork?.['1000x1000'] || track.artwork?.['150x150']
  const profilePicUrl = track.user.profile_picture?.['150x150'] || track.user.profile_picture?.['480x480']

  return (
    <div className="rack-panel rounded-lg overflow-hidden relative">
      {/* Rack Screws */}
      <div className="absolute top-3 left-3 rack-screw z-10"></div>
      <div className="absolute top-3 right-3 rack-screw z-10"></div>
      <div className="absolute bottom-3 left-3 rack-screw z-10"></div>
      <div className="absolute bottom-3 right-3 rack-screw z-10"></div>
      
      <div className="p-4 sm:p-6 md:p-8">
        {/* Track Info Panel */}
        <div className="metal-surface rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start gap-4">
            {artworkUrl && !artworkError ? (
              <img
                src={artworkUrl}
                alt={track.title}
                className="w-20 h-20 md:w-24 md:h-24 rounded object-cover border-2 border-white/10"
                onError={() => setArtworkError(true)}
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded bg-gradient-to-br from-[#0052FF] to-[#6997FF] flex items-center justify-center border-2 border-white/10">
                <Music className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-white truncate mb-1">
                {track.title}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setShowArtistProfile(true)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {profilePicUrl && !profilePicError ? (
                    <img
                      src={profilePicUrl}
                      alt={track.user.name}
                      className="w-6 h-6 rounded-full border border-white/20"
                      onError={() => setProfilePicError(true)}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6997FF] to-[#0052FF] flex items-center justify-center border border-white/20">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <p className="text-white/80 text-sm md:text-base hover:text-[#6997FF] transition-colors">
                    {track.user.name}
                  </p>
                </button>
                <ArtistVerificationBadge isVerified={track.user.is_verified} size="md" />
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-tech text-white/50">
                <span>▶ {track.play_count.toLocaleString()}</span>
                <span>♥ {track.favorite_count.toLocaleString()}</span>
                {track.genre && <span className="uppercase">{track.genre}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Rainbow Seek Bar */}
        <div className="mb-4 sm:mb-6">
          <RainbowSeekBar
            currentTime={currentTime}
            duration={track.duration}
            onSeek={handleSeek}
          />
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {/* Shuffle */}
            {onToggleShuffle && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onToggleShuffle}
                className={`${shuffleEnabled ? 'text-[#6997FF]' : 'text-white/40'} hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
            )}

            {/* Previous */}
            {onPrevious && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onPrevious}
                className="text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
            )}

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-14 h-14 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-b from-[#0052FF] to-[#0052FF]/80 hover:from-[#0052FF]/90 hover:to-[#0052FF]/70 active:from-[#0052FF] active:to-[#0052FF]/90 flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-[#0052FF]/50 transition-all border-2 border-[#6997FF]/30 flex-shrink-0 touch-manipulation"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6 md:w-6 md:h-6 text-white" /> : <Play className="w-6 h-6 md:w-6 md:h-6 ml-0.5 text-white" />}
            </button>

            {/* Next */}
            {onNext && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onNext}
                className="text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
            )}

            {/* Repeat */}
            {onRepeatModeChange && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleRepeatModeClick}
                className={`${repeatMode !== 'off' ? 'text-[#6997FF]' : 'text-white/40'} hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5 sm:w-4 sm:h-4" />
                ) : (
                  <Repeat className="w-5 h-5 sm:w-4 sm:h-4" />
                )}
              </Button>
            )}
            
            {/* Favorite */}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggleFavorite}
              className={`${isFavorite ? 'text-red-500' : 'text-white/40'} hover:text-red-400 hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0`}
              title="Favorite"
            >
              <Heart className="w-6 h-6 sm:w-5 sm:h-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>

            {/* Tip Button */}
            <EnhancedTipButton track={track} />

            {/* Vibe Check Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                if (!audioContextRef.current) {
                  initializeAudioContext()
                }
                setShowVibeCheckModal(true)
              }}
              className="text-[#5200FF] hover:text-[#5200FF]/80 hover:bg-[#5200FF]/10 active:bg-[#5200FF]/20 transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              title="Vibe Check"
            >
              <Sparkles className="w-5 h-5 sm:w-4 sm:h-4" />
            </Button>

            {/* External Link */}
            <a
              href={`https://audius.co${track.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors p-2"
              title="View on Audius"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="text-white/70 hover:text-white hover:bg-white/10"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <div className="w-20 md:w-24">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
            <span className="text-tech text-xs text-white/50 w-8">{Math.round((isMuted ? 0 : volume) * 100)}</span>
          </div>
        </div>

        {/* Mobile Volume Control */}
        <div className="sm:hidden mb-4">
          <div className="flex items-center gap-3 metal-surface rounded-lg p-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 touch-manipulation min-w-[44px] min-h-[44px] flex-shrink-0"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <div className="flex-1">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
            <span className="text-tech text-sm text-white/50 w-10 text-right">{Math.round((isMuted ? 0 : volume) * 100)}</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`led-indicator ${isPlaying ? 'led-active led-pulse' : ''}`}></div>
            <span className="text-tech text-xs text-white/50">{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
          </div>
          {shuffleEnabled && (
            <div className="flex items-center gap-2">
              <div className="led-indicator led-blue"></div>
              <span className="text-tech text-xs text-white/50">SHUFFLE</span>
            </div>
          )}
          {repeatMode !== 'off' && (
            <div className="flex items-center gap-2">
              <div className="led-indicator led-blue"></div>
              <span className="text-tech text-xs text-white/50">REPEAT {repeatMode.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Integrated EQ & Visualizer - Side by Side */}
        <IntegratedAudioControl 
          onEQChange={handleEQChange}
          analyserNode={analyserRef.current}
          isPlaying={isPlaying}
        />

        {/* AI Vibe Analysis - Only show when enabled */}
        {showAIFeatures && vibeProfile && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <VibeProfileCard
              trackId={track.id}
              profile={vibeProfile}
              onCosign={() => {
                // Refresh profile with updated cosign count
                const updated = VibeStorage.getVibeProfile(track.id)
                if (updated) {
                  setVibeProfile(updated)
                }
              }}
            />
            <VibeMapVisualizer
              profile={vibeProfile}
              trackTitle={track.title}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/10">
          <p className="text-center text-xs text-white/40 font-tech">
            Developed with <span className="text-red-500">❤️</span> for Indie Artists by <span className="text-cyan-400">Radiotomy</span>
          </p>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        crossOrigin="anonymous"
      />

      {/* Vibe Check Modal */}
      <VibeCheckModal
        isOpen={showVibeCheckModal}
        onClose={() => setShowVibeCheckModal(false)}
        track={track}
        analyserNode={analyserRef.current}
      />

      {/* Artist Profile Modal */}
      <ArtistProfile
        artistId={track.user.id}
        isOpen={showArtistProfile}
        onClose={() => setShowArtistProfile(false)}
        currentTrack={track}
      />
    </div>
  )
}
