'use client'

import type { FC } from 'react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface GraphicEqualizerProps {
  onEQChange: (bandIndex: number, value: number) => void
}

interface EQBand {
  frequency: string
  label: string
  value: number
}

export const GraphicEqualizer: FC<GraphicEqualizerProps> = ({ onEQChange }) => {
  const [bands, setBands] = useState<EQBand[]>([
    { frequency: '60', label: '60 Hz', value: 0 },
    { frequency: '250', label: '250 Hz', value: 0 },
    { frequency: '1k', label: '1 kHz', value: 0 },
    { frequency: '4k', label: '4 kHz', value: 0 },
    { frequency: '12k', label: '12 kHz', value: 0 }
  ])

  const handleBandChange = (index: number, newValue: number): void => {
    const newBands = [...bands]
    newBands[index].value = newValue
    setBands(newBands)
    onEQChange(index, newValue)
  }

  const resetEQ = (): void => {
    const resetBands = bands.map((band) => ({ ...band, value: 0 }))
    setBands(resetBands)
    bands.forEach((_, index) => onEQChange(index, 0))
  }

  const applyPreset = (preset: string): void => {
    let values: number[] = []
    
    switch (preset) {
      case 'bass-boost':
        values = [8, 5, 0, -2, -3]
        break
      case 'treble-boost':
        values = [-3, -2, 0, 5, 8]
        break
      case 'vocal':
        values = [-2, 3, 5, 3, -2]
        break
      case 'flat':
        values = [0, 0, 0, 0, 0]
        break
      default:
        values = [0, 0, 0, 0, 0]
    }

    const newBands = bands.map((band, index) => ({
      ...band,
      value: values[index]
    }))
    setBands(newBands)
    values.forEach((value, index) => onEQChange(index, value))
  }

  // Professional fader component
  const Fader: FC<{ band: EQBand; index: number }> = ({ band, index }) => {
    const [isDragging, setIsDragging] = useState(false)
    const minDb = -12
    const maxDb = 12
    const faderHeight = 120 // pixels - compact size

    // Convert dB value to pixel position (0 at top = +12dB, faderHeight at bottom = -12dB)
    const valueToPosition = (value: number): number => {
      const percentage = (maxDb - value) / (maxDb - minDb)
      return percentage * faderHeight
    }

    // Convert pixel position to dB value
    const positionToValue = (position: number): number => {
      const percentage = position / faderHeight
      const value = maxDb - percentage * (maxDb - minDb)
      return Math.round(value * 2) / 2 // Round to nearest 0.5
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
      e.preventDefault()
      setIsDragging(true)
      updateValue(e)
    }

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
      e.preventDefault()
      setIsDragging(true)
      updateValueFromTouch(e)
    }

    const handleMouseMove = (e: MouseEvent): void => {
      if (isDragging) {
        updateValueFromEvent(e)
      }
    }

    const handleTouchMove = (e: TouchEvent): void => {
      if (isDragging) {
        e.preventDefault()
        const faderElement = document.getElementById(`fader-track-${index}`)
        if (!faderElement) return
        
        const rect = faderElement.getBoundingClientRect()
        const y = e.touches[0].clientY - rect.top
        const clampedY = Math.max(0, Math.min(faderHeight, y))
        const newValue = positionToValue(clampedY)
        handleBandChange(index, newValue)
      }
    }

    const handleMouseUp = (): void => {
      setIsDragging(false)
    }

    const handleTouchEnd = (): void => {
      setIsDragging(false)
    }

    const updateValue = (e: React.MouseEvent<HTMLDivElement>): void => {
      const rect = e.currentTarget.getBoundingClientRect()
      const y = e.clientY - rect.top
      const clampedY = Math.max(0, Math.min(faderHeight, y))
      const newValue = positionToValue(clampedY)
      handleBandChange(index, newValue)
    }

    const updateValueFromTouch = (e: React.TouchEvent<HTMLDivElement>): void => {
      const rect = e.currentTarget.getBoundingClientRect()
      const y = e.touches[0].clientY - rect.top
      const clampedY = Math.max(0, Math.min(faderHeight, y))
      const newValue = positionToValue(clampedY)
      handleBandChange(index, newValue)
    }

    const updateValueFromEvent = (e: MouseEvent): void => {
      const faderElement = document.getElementById(`fader-track-${index}`)
      if (!faderElement) return
      
      const rect = faderElement.getBoundingClientRect()
      const y = e.clientY - rect.top
      const clampedY = Math.max(0, Math.min(faderHeight, y))
      const newValue = positionToValue(clampedY)
      handleBandChange(index, newValue)
    }

    // Add/remove event listeners for dragging
    if (typeof window !== 'undefined') {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('touchmove', handleTouchMove, { passive: false })
        window.addEventListener('touchend', handleTouchEnd)
      } else {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }

    const position = valueToPosition(band.value)
    const dbMarkers = [12, 6, 0, -6, -12]

    return (
      <div className="flex flex-col items-center">
        {/* LED Level Indicator */}
        <div className="mb-1.5 flex flex-col gap-0.5">
          {[12, 6, 0, -6, -12].map((db) => {
            const isActive = band.value >= db
            const color = db > 6 ? 'bg-red-500' : db > 0 ? 'bg-yellow-500' : db === 0 ? 'bg-green-500' : 'bg-blue-500'
            return (
              <div
                key={db}
                className={`w-6 h-0.5 rounded-sm transition-all duration-150 ${
                  isActive ? `${color} shadow-[0_0_4px_currentColor]` : 'bg-gray-700/50'
                }`}
                style={{ opacity: isActive ? 1 : 0.3 }}
              />
            )
          })}
        </div>

        {/* Fader Track */}
        <div className="relative flex items-center gap-1">
          {/* dB Scale - Left */}
          <div className="flex flex-col justify-between text-[10px] text-white/40 font-mono" style={{ height: `${faderHeight}px` }}>
            {dbMarkers.map((db) => (
              <div key={db} className="leading-none">
                {db > 0 ? '+' : ''}{db}
              </div>
            ))}
          </div>

          {/* Fader Track Container */}
          <div
            id={`fader-track-${index}`}
            className="relative cursor-pointer select-none touch-none"
            style={{ height: `${faderHeight}px`, width: '28px' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Track Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 rounded-sm border border-gray-700 shadow-inner">
              {/* Center line (0dB) */}
              <div
                className="absolute left-0 right-0 h-[2px] bg-green-500/50"
                style={{ top: `${valueToPosition(0)}px` }}
              />
              
              {/* Tick marks */}
              {dbMarkers.map((db) => (
                <div
                  key={db}
                  className="absolute left-0 right-0 h-[1px] bg-white/10"
                  style={{ top: `${valueToPosition(db)}px` }}
                />
              ))}
            </div>

            {/* Active Track Fill */}
            <div
              className="absolute left-0 right-0 transition-all duration-100"
              style={{
                top: band.value >= 0 ? `${valueToPosition(band.value)}px` : `${valueToPosition(0)}px`,
                height: band.value >= 0 
                  ? `${valueToPosition(0) - valueToPosition(band.value)}px`
                  : `${valueToPosition(band.value) - valueToPosition(0)}px`,
                background: band.value >= 0
                  ? 'linear-gradient(to bottom, rgba(34, 197, 94, 0.6), rgba(34, 197, 94, 0.3))'
                  : 'linear-gradient(to bottom, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.6))'
              }}
            />

            {/* Fader Knob/Cap */}
            <div
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-100"
              style={{ top: `${position}px` }}
            >
              <div className={`
                w-9 h-6 -ml-2 -mt-3 rounded-md
                bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500
                border border-gray-600
                shadow-lg
                ${isDragging ? 'scale-105' : 'scale-100'}
                transition-transform
              `}>
                {/* Fader indicator line */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gray-800/50" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/30" />
              </div>
            </div>
          </div>

          {/* dB Scale - Right */}
          <div className="flex flex-col justify-between text-[10px] text-white/40 font-mono" style={{ height: `${faderHeight}px` }}>
            <div>dB</div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        {/* Frequency Label & Value */}
        <div className="mt-2 text-center">
          <div className="text-xs font-bold text-white mb-0.5 tracking-wider">
            {band.label}
          </div>
          <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            band.value > 0 
              ? 'bg-green-500/20 text-green-400'
              : band.value < 0
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-white/10 text-white/60'
          }`}>
            {band.value > 0 ? '+' : ''}{band.value.toFixed(1)} dB
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur border-white/10 p-3 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">5-BAND GRAPHIC EQUALIZER</h3>
          <p className="text-[10px] text-white/50 mt-0.5">Professional Audio Control</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={resetEQ}
          className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50 font-mono text-xs"
        >
          RESET
        </Button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 pb-2 border-b border-white/10">
        <div className="text-[10px] text-white/50 w-full mb-1 font-mono">PRESETS:</div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyPreset('bass-boost')}
          className="bg-gradient-to-r from-[#0052FF]/20 to-[#6997FF]/20 border-[#0052FF]/30 text-[#6997FF] hover:bg-[#0052FF]/30 font-mono text-xs"
        >
          BASS BOOST
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyPreset('treble-boost')}
          className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 font-mono text-xs"
        >
          TREBLE BOOST
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyPreset('vocal')}
          className="bg-gradient-to-r from-[#5200FF]/20 to-[#5200FF]/30 border-[#5200FF]/30 text-[#5200FF]/90 hover:bg-[#5200FF]/30 font-mono text-xs"
        >
          VOCAL
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyPreset('flat')}
          className="bg-gradient-to-r from-gray-600/20 to-gray-500/20 border-gray-500/30 text-gray-300 hover:bg-gray-500/30 font-mono text-xs"
        >
          FLAT
        </Button>
      </div>

      {/* EQ Faders */}
      <div className="flex justify-center gap-3 sm:gap-4 overflow-x-auto pb-2 px-1">
        {bands.map((band, index) => (
          <Fader key={band.frequency} band={band} index={index} />
        ))}
      </div>

      {/* Hardware-style bottom panel */}
      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
        <div className="text-[10px] text-white/30 font-mono">
          FREQ: 60Hz - 12kHz | RANGE: ±12dB
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgb(34,197,94)] animate-pulse" />
          <div className="text-[10px] text-green-500 font-mono">ACTIVE</div>
        </div>
      </div>
    </Card>
  )
}
