'use client'

import type { FC } from 'react'
import { useState } from 'react'
import { GraphicEqualizer } from '@/components/GraphicEqualizer'
import { SpectrumAnalyzer } from '@/components/SpectrumAnalyzer'
import { VisualizerSelector } from '@/components/VisualizerSelector'
import type { VisualizerType } from '@/components/VisualizerSelector'

interface IntegratedAudioControlProps {
  onEQChange: (bandIndex: number, value: number) => void
  analyserNode: AnalyserNode | null
  isPlaying: boolean
}

export const IntegratedAudioControl: FC<IntegratedAudioControlProps> = ({
  onEQChange,
  analyserNode,
  isPlaying
}) => {
  const [visualizerType, setVisualizerType] = useState<VisualizerType>('fire')

  return (
    <div className="w-full">
      {/* Hero Section: Side-by-Side EQ & Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* LEFT: 5-Band Graphic Equalizer */}
        <div className="lg:col-span-5">
          <GraphicEqualizer onEQChange={onEQChange} />
        </div>

        {/* RIGHT: Spectrum Visualizer */}
        <div className="lg:col-span-7">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur border border-white/10 rounded-lg p-4 shadow-2xl h-full flex flex-col">
            {/* Visualizer Header & Controls */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">SPECTRUM VISUALIZER</h3>
                <p className="text-[10px] text-white/50 mt-0.5">Real-Time Audio Analysis</p>
              </div>
              <VisualizerSelector 
                currentType={visualizerType} 
                onTypeChange={setVisualizerType}
              />
            </div>

            {/* Spectrum Analyzer Canvas */}
            <div className="flex-1 mb-3">
              <SpectrumAnalyzer 
                analyserNode={analyserNode} 
                isPlaying={isPlaying}
                visualizerType={visualizerType}
              />
            </div>

            {/* Status Panel */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="text-[10px] text-white/30 font-mono">
                FFT: 256 | BANDS: 64 | SMOOTHING: 0.8
              </div>
              <div className="flex gap-2 items-center">
                <div className={`w-2 h-2 rounded-full transition-all ${isPlaying ? 'bg-[#0052FF] shadow-[0_0_8px_#0052FF] animate-pulse' : 'bg-gray-600'}`} />
                <div className="text-[10px] font-mono transition-colors" style={{ color: isPlaying ? '#0052FF' : '#9ca3af' }}>
                  {isPlaying ? 'ACTIVE' : 'STANDBY'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-4 bg-gradient-to-r from-[#0052FF]/20 via-[#6997FF]/20 to-[#5200FF]/20 border border-white/10 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <div className="text-[#6997FF] text-2xl flex-shrink-0">💎</div>
          <div>
            <p className="text-xs text-white/80 font-medium mb-1">
              Studio-Quality Audio Control
            </p>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Adjust EQ frequencies in real-time while watching the spectrum analyzer respond instantly. 
              Professional audio engineering powered by BASE with smooth, intuitive controls optimized for both desktop and mobile.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
