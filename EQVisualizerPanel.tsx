'use client'

import type { FC } from 'react'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GraphicEqualizer } from '@/components/GraphicEqualizer'
import { SpectrumAnalyzer } from '@/components/SpectrumAnalyzer'
import { VisualizerSelector } from '@/components/VisualizerSelector'
import type { VisualizerType } from '@/components/VisualizerSelector'
import { Sliders, Activity } from 'lucide-react'

interface EQVisualizerPanelProps {
  onEQChange: (bandIndex: number, value: number) => void
  analyserNode: AnalyserNode | null
  isPlaying: boolean
}

export const EQVisualizerPanel: FC<EQVisualizerPanelProps> = ({
  onEQChange,
  analyserNode,
  isPlaying
}) => {
  const [activeView, setActiveView] = useState<'eq' | 'visualizer'>('eq')
  const [visualizerType, setVisualizerType] = useState<VisualizerType>('fire')

  return (
    <div className="w-full">
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'eq' | 'visualizer')}>
        {/* Tab Toggle */}
        <div className="flex items-center justify-center mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-black/40 border border-white/10 p-1 rounded">
            <TabsTrigger 
              value="eq"
              className="text-pro text-xs data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Sliders className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">5-BAND EQUALIZER</span>
              <span className="sm:hidden">EQ</span>
            </TabsTrigger>
            <TabsTrigger 
              value="visualizer"
              className="text-pro text-xs data-[state=active]:bg-gradient-to-b data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-700 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">SPECTRUM VISUALIZER</span>
              <span className="sm:hidden">VIS</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* EQ View */}
        <TabsContent value="eq" className="mt-0">
          <GraphicEqualizer onEQChange={onEQChange} />
        </TabsContent>

        {/* Visualizer View */}
        <TabsContent value="visualizer" className="mt-0">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur border border-white/10 rounded-lg p-4 shadow-2xl">
            {/* Visualizer Controls */}
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

            {/* Spectrum Analyzer */}
            <div className="mb-3">
              <SpectrumAnalyzer 
                analyserNode={analyserNode} 
                isPlaying={isPlaying}
                visualizerType={visualizerType}
              />
            </div>

            {/* Hardware-style bottom panel */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="text-[10px] text-white/30 font-mono">
                FFT: 256 | BANDS: 64 | SMOOTHING: 0.8
              </div>
              <div className="flex gap-2">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-cyan-500 shadow-[0_0_8px_rgb(6,182,212)] animate-pulse' : 'bg-gray-600'}`} />
                <div className="text-[10px] text-cyan-500 font-mono">{isPlaying ? 'ACTIVE' : 'STANDBY'}</div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
