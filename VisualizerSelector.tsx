'use client'

import type { FC } from 'react'
import { Flame, Waves, BarChart3 } from 'lucide-react'

export type VisualizerType = 'fire' | 'wave' | 'bars'

interface VisualizerSelectorProps {
  currentType: VisualizerType
  onTypeChange: (type: VisualizerType) => void
}

export const VisualizerSelector: FC<VisualizerSelectorProps> = ({
  currentType,
  onTypeChange
}) => {
  const visualizers: Array<{ type: VisualizerType; label: string; icon: typeof Flame; color: string }> = [
    { type: 'fire', label: 'FIRE', icon: Flame, color: 'from-orange-600 to-red-600' },
    { type: 'wave', label: 'WAVE', icon: Waves, color: 'from-cyan-600 to-blue-600' },
    { type: 'bars', label: 'BARS', icon: BarChart3, color: 'from-purple-600 to-pink-600' }
  ]

  return (
    <div className="flex items-center gap-2">
      {visualizers.map(({ type, label, icon: Icon, color }) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all border ${
            currentType === type
              ? `bg-gradient-to-r ${color} text-white border-white/30 shadow-lg`
              : 'bg-gradient-to-b from-gray-700 to-gray-800 text-white/60 border-white/10 hover:border-white/20 hover:text-white'
          }`}
        >
          <Icon className="w-3 h-3" />
          <span className="text-pro text-[10px]">{label}</span>
        </button>
      ))}
    </div>
  )
}
