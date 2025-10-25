'use client'

import type { FC } from 'react'
import { useState, useRef, useEffect } from 'react'

interface RainbowSeekBarProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

export const RainbowSeekBar: FC<RainbowSeekBarProps> = ({
  currentTime,
  duration,
  onSeek
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [hoverPosition, setHoverPosition] = useState<number | null>(null)
  const [hoverTime, setHoverTime] = useState<string>('')
  const barRef = useRef<HTMLDivElement>(null)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateTimeFromPosition = (clientX: number): number => {
    if (!barRef.current) return 0
    
    const rect = barRef.current.getBoundingClientRect()
    const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return position * duration
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsDragging(true)
    const time = calculateTimeFromPosition(e.clientX)
    onSeek(time)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsDragging(true)
    const time = calculateTimeFromPosition(e.touches[0].clientX)
    onSeek(time)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!barRef.current) return

    const rect = barRef.current.getBoundingClientRect()
    const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHoverPosition(position * 100)
    setHoverTime(formatTime(position * duration))

    if (isDragging) {
      const time = calculateTimeFromPosition(e.clientX)
      onSeek(time)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
    if (!barRef.current) return
    e.preventDefault()

    const rect = barRef.current.getBoundingClientRect()
    const position = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width))
    setHoverPosition(position * 100)
    setHoverTime(formatTime(position * duration))

    if (isDragging) {
      const time = calculateTimeFromPosition(e.touches[0].clientX)
      onSeek(time)
    }
  }

  const handleMouseLeave = (): void => {
    setHoverPosition(null)
    setHoverTime('')
  }

  useEffect(() => {
    const handleMouseUp = (): void => {
      setIsDragging(false)
    }

    const handleTouchEnd = (): void => {
      setIsDragging(false)
    }

    const handleGlobalMouseMove = (e: MouseEvent): void => {
      if (isDragging && barRef.current) {
        const time = calculateTimeFromPosition(e.clientX)
        onSeek(time)
      }
    }

    const handleGlobalTouchMove = (e: TouchEvent): void => {
      if (isDragging && barRef.current) {
        e.preventDefault()
        const time = calculateTimeFromPosition(e.touches[0].clientX)
        onSeek(time)
      }
    }

    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('touchend', handleTouchEnd)
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
    }

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchmove', handleGlobalTouchMove)
    }
  }, [isDragging, duration, onSeek])

  return (
    <div className="relative w-full">
      {/* Rainbow Seek Bar */}
      <div
        ref={barRef}
        className="relative h-4 sm:h-3 rounded-full cursor-pointer overflow-hidden group touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{
          background: 'linear-gradient(90deg, rgba(60, 60, 70, 0.8) 0%, rgba(40, 40, 50, 0.9) 100%)',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Rainbow Progress - Only shows on played portion */}
        <div
          className="absolute top-0 left-0 h-full transition-all duration-150 ease-out pointer-events-none"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 85%, #ff00ff 100%)',
            boxShadow: '0 0 15px rgba(255, 100, 255, 0.6), 0 0 25px rgba(100, 200, 255, 0.3)',
          }}
        />

        {/* Playhead Indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white shadow-lg rounded-full transition-all duration-150 ease-out pointer-events-none"
          style={{
            left: `${progress}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4)'
          }}
        />

        {/* Hover Indicator */}
        {hoverPosition !== null && (
          <div
            className="absolute top-0 w-0.5 h-full bg-white/60 pointer-events-none"
            style={{ left: `${hoverPosition}%` }}
          />
        )}

        {/* Hover Glow Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            mixBlendMode: 'overlay'
          }}
        />
      </div>

      {/* Hover Tooltip */}
      {hoverPosition !== null && hoverTime && (
        <div
          className="absolute -top-10 transform -translate-x-1/2 pointer-events-none"
          style={{ left: `${hoverPosition}%` }}
        >
          <div className="bg-black/90 text-white px-3 py-1.5 rounded-md text-xs font-mono shadow-lg border border-white/20">
            {hoverTime}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/90 border-r border-b border-white/20" />
          </div>
        </div>
      )}

      {/* Time Labels */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-tech text-xs text-white/50 font-mono">
          {formatTime(currentTime)}
        </span>
        <span className="text-tech text-xs text-white/50 font-mono">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
