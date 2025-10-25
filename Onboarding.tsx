'use client'

import React, { useState, useEffect } from 'react'
import { X, Sparkles, Waves, Zap, Music, Users, Coins, Rocket, ChevronRight, ChevronLeft } from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)

  const slides = [
    {
      id: 'welcome',
      title: 'Welcome to BASE Station',
      subtitle: 'The Future of Audio on Base',
      icon: Rocket,
      gradient: 'from-[#6997FF] via-[#0052FF] to-[#5200FF]',
      content: (
        <div className="space-y-6 text-center">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6997FF] to-[#0052FF] rounded-full animate-pulse opacity-50 blur-xl"></div>
            <div className="relative bg-gradient-to-r from-[#6997FF] to-[#0052FF] rounded-full w-32 h-32 flex items-center justify-center p-4">
              <img 
                src="https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/3c35802a-51c1-4e1c-93c4-ae41003dcbd1-BCvKRXQ3oF4OFc4XDR1jSN5H2MpTCh" 
                alt="BASE Station Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <p className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed">
            Stream music from <span className="text-purple-400 font-bold">Audius</span> with 
            studio-grade audio controls, AI-powered vibe analysis, and blockchain tipping.
          </p>
          <div className="bg-gradient-to-r from-[#6997FF]/10 to-[#0052FF]/10 border border-[#6997FF]/30 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-[#6997FF] font-semibold text-sm">
              🚀 Paving the Way for AUDIOBASE
            </p>
            <p className="text-gray-400 text-xs mt-2">
              The next-generation decentralized audio platform on Base
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'vibe-check',
      title: 'AI Vibe Check System',
      subtitle: 'Intelligent Audio Analysis',
      icon: Sparkles,
      gradient: 'from-[#5200FF] via-[#6997FF] to-[#0052FF]',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <h4 className="text-white font-semibold">Vibe Profiling</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Analyzes tempo, energy, mood, and lyrical tone to classify the "energy signature" of each track.
              </p>
            </div>

            <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4 hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-400" />
                </div>
                <h4 className="text-white font-semibold">Community Co-Sign</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Let listeners validate vibes, creating a decentralized trust layer backed by the community.
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-red-400" />
                </div>
                <h4 className="text-white font-semibold">Adaptive Playlists</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Auto-generates vibe-based playlists like "Late-Night Flow," "DAO Energy," and "Build Mode."
              </p>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold">Visual Vibe Maps</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Turns audio fingerprints into dynamic visuals that can be downloaded as collectibles.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
            <p className="text-purple-300 text-sm">
              ✨ Click the sparkle <Sparkles className="w-4 h-4 inline text-purple-400" /> button on any track to open the Vibe Check modal
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'daw-features',
      title: 'Studio-Grade Audio System',
      subtitle: 'Professional DAW Controls',
      icon: Waves,
      gradient: 'from-[#0052FF] via-[#6997FF] to-[#5200FF]',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-0.5">
                    <div className="w-1 h-3 bg-green-400 rounded"></div>
                    <div className="w-1 h-4 bg-green-400 rounded"></div>
                    <div className="w-1 h-5 bg-green-400 rounded"></div>
                    <div className="w-1 h-4 bg-green-400 rounded"></div>
                    <div className="w-1 h-3 bg-green-400 rounded"></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-semibold">5-Band Graphic Equalizer</h4>
                  <p className="text-gray-400 text-xs">60Hz • 230Hz • 910Hz • 4kHz • 14kHz</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Professional-grade frequency control with preset modes: Flat, Bass Boost, Treble Boost, Vocal, and Custom.
              </p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Waves className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Real-Time Spectrum Visualizer</h4>
                  <p className="text-gray-400 text-xs">64 Frequency Bands • 256 FFT Size</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Choose between Fire, Wave, or Bar visualization modes. Watch your audio come alive with stunning real-time visuals.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 to-blue-500 rounded-full"></div>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Rainbow Seek Bar</h4>
                  <p className="text-gray-400 text-xs">Interactive Progress Control</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Beautiful gradient seek bar with precise time control and smooth animations.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#0052FF]/10 to-[#6997FF]/10 border border-[#6997FF]/30 rounded-lg p-3 text-center">
            <p className="text-[#6997FF] text-sm">
              🎚️ EQ and Visualizer are displayed side-by-side for seamless interaction
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'tipping-community',
      title: 'Multi-Token Tipping System',
      subtitle: 'Support Artists on Base',
      icon: Coins,
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💎</span>
              </div>
              <h4 className="text-white font-semibold text-center mb-2">ETH</h4>
              <p className="text-gray-400 text-xs text-center">
                Native Base token for direct tips to artists
              </p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎵</span>
              </div>
              <h4 className="text-white font-semibold text-center mb-2">$AUDIO</h4>
              <p className="text-gray-400 text-xs text-center">
                Native Audius token for ecosystem support
              </p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className="text-white font-semibold text-center mb-2">$BSTN</h4>
              <p className="text-gray-400 text-xs text-center">
                BASE Station token for community rewards
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-orange-400" />
                <h4 className="text-white font-semibold">Artist Profiles & Verification</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Click any artist name to view their full profile, bio, stats, and verify their authenticity with blockchain badges.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <h4 className="text-white font-semibold">Tip Leaderboard & History</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Track community support with public leaderboards. See top artists, tip breakdowns by token, and recent community tips.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#5200FF]/10 to-[#6997FF]/10 border border-[#6997FF]/30 rounded-lg p-3 text-center">
            <p className="text-[#6997FF] text-sm">
              💲 Click the tip button on any track to support artists directly on Base blockchain
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'baseaudio',
      title: 'The Future is AUDIOBASE',
      subtitle: 'Next-Gen Decentralized Audio Platform',
      icon: Rocket,
      gradient: 'from-[#0052FF] via-[#6997FF] to-[#5200FF]',
      content: (
        <div className="space-y-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0052FF] to-[#5200FF] rounded-lg blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-[#0052FF] to-[#5200FF] rounded-lg p-8 border border-[#6997FF]/50">
              <Rocket className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-3">AUDIOBASE</h3>
              <p className="text-[#6997FF] text-lg mb-4">
                Coming Soon to Base Network
              </p>
              <p className="text-gray-300 text-sm max-w-md mx-auto">
                BASE Station is the foundation. A testbed for innovation. A bridge between Audius and the future of decentralized audio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-[#0052FF]/10 border border-[#0052FF]/30 rounded-lg p-4">
              <h4 className="text-[#0052FF] font-semibold mb-2">🎵 For Artists</h4>
              <p className="text-gray-400 text-sm">
                Own your music, control your revenue, connect directly with fans on Base.
              </p>
            </div>

            <div className="bg-[#5200FF]/10 border border-[#5200FF]/30 rounded-lg p-4">
              <h4 className="text-[#5200FF] font-semibold mb-2">🎧 For Listeners</h4>
              <p className="text-gray-400 text-sm">
                Discover music, support artists, earn rewards in the AUDIOBASE ecosystem.
              </p>
            </div>

            <div className="bg-[#6997FF]/10 border border-[#6997FF]/30 rounded-lg p-4">
              <h4 className="text-[#6997FF] font-semibold mb-2">💎 For Collectors</h4>
              <p className="text-gray-400 text-sm">
                Collect music NFTs, trade audio assets, own a piece of music history.
              </p>
            </div>

            <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
              <h4 className="text-pink-400 font-semibold mb-2">🏗️ For Builders</h4>
              <p className="text-gray-400 text-sm">
                Build on open infrastructure, create audio dApps, shape the future.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#0052FF]/10 via-[#6997FF]/10 to-[#5200FF]/10 border border-[#0052FF]/50 rounded-lg p-6">
            <p className="text-white font-semibold mb-2">
              BASE Station is just the beginning.
            </p>
            <p className="text-gray-300 text-sm">
              Experience the future of audio today. Help us build AUDIOBASE tomorrow.
            </p>
          </div>
        </div>
      )
    }
  ]

  const handleNext = (): void => {
    if (currentSlide < slides.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handlePrevious = (): void => {
    if (currentSlide > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleComplete = (): void => {
    localStorage.setItem('basestation_onboarding_completed', 'true')
    onComplete()
  }

  const handleSkip = (): void => {
    localStorage.setItem('basestation_onboarding_completed', 'true')
    onComplete()
  }

  const currentSlideData = slides[currentSlide]
  const Icon = currentSlideData?.icon || Rocket

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentSlideData?.gradient || 'from-cyan-500 to-blue-600'} p-6 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentSlideData?.title || 'Welcome'}</h2>
                <p className="text-white/80 text-sm">{currentSlideData?.subtitle || 'Get Started'}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-white/80 hover:text-white transition-colors p-2"
              aria-label="Skip onboarding"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {currentSlideData?.content}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-6">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => {
                  setIsAnimating(true)
                  setTimeout(() => {
                    setCurrentSlide(index)
                    setIsAnimating(false)
                  }, 300)
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-gradient-to-r from-cyan-500 to-blue-600'
                    : 'w-2 bg-gray-700 hover:bg-gray-600'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentSlide === 0
                  ? 'opacity-50 cursor-not-allowed bg-gray-800'
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <div className="text-sm text-gray-400">
              {currentSlide + 1} / {slides.length}
            </div>

            {currentSlide === slides.length - 1 ? (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0052FF] to-[#6997FF] hover:from-[#0052FF]/90 hover:to-[#6997FF]/90 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
              >
                <span>Get Started</span>
                <Rocket className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0052FF] to-[#6997FF] hover:from-[#0052FF]/90 hover:to-[#6997FF]/90 text-white font-semibold rounded-lg transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
