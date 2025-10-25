'use client'

import type { FC } from 'react'
import { useEffect, useRef } from 'react'

export type VisualizerType = 'fire' | 'wave' | 'bars'

interface SpectrumAnalyzerProps {
  analyserNode: AnalyserNode | null
  isPlaying: boolean
  visualizerType?: VisualizerType
}

export const SpectrumAnalyzer: FC<SpectrumAnalyzerProps> = ({ analyserNode, isPlaying, visualizerType = 'fire' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number>(0)

  useEffect(() => {
    if (!canvasRef.current || !analyserNode || !isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const drawFire = (width: number, height: number, barCount: number, barWidth: number, heightScale: number): void => {
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength)
        const value = dataArray[dataIndex]
        const barHeight = value * heightScale
        const x = i * barWidth

        // Bottom layer (red core)
        const coreGradient = ctx.createLinearGradient(x, height, x, height - barHeight * 0.6)
        coreGradient.addColorStop(0, '#ff0000')
        coreGradient.addColorStop(0.5, '#ff4400')
        coreGradient.addColorStop(1, '#ff6600')
        ctx.fillStyle = coreGradient
        ctx.fillRect(x, height - barHeight * 0.6, barWidth - 2, barHeight * 0.6)

        // Middle layer (orange)
        const midGradient = ctx.createLinearGradient(x, height - barHeight * 0.6, x, height - barHeight * 0.85)
        midGradient.addColorStop(0, '#ff6600')
        midGradient.addColorStop(0.5, '#ff8800')
        midGradient.addColorStop(1, '#ffaa00')
        ctx.fillStyle = midGradient
        ctx.fillRect(x, height - barHeight * 0.85, barWidth - 2, barHeight * 0.25)

        // Top layer (yellow tip)
        const tipGradient = ctx.createLinearGradient(x, height - barHeight * 0.85, x, height - barHeight)
        tipGradient.addColorStop(0, '#ffaa00')
        tipGradient.addColorStop(0.5, '#ffcc00')
        tipGradient.addColorStop(1, '#ffff00')
        ctx.fillStyle = tipGradient
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight * 0.15)

        // Add glow effect
        ctx.shadowBlur = 20
        ctx.shadowColor = value > 200 ? '#ff6600' : value > 100 ? '#ff8800' : '#ff4400'
      }
      ctx.shadowBlur = 0
    }

    const drawWave = (width: number, height: number): void => {
      ctx.beginPath()
      ctx.moveTo(0, height / 2)

      const sliceWidth = width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255.0
        const y = (height / 2) + (v - 0.5) * height * 0.8

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineWidth = 3
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, '#3b82f6')
      gradient.addColorStop(0.5, '#06b6d4')
      gradient.addColorStop(1, '#8b5cf6')
      ctx.strokeStyle = gradient
      ctx.stroke()

      // Fill under the wave
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()
      const fillGradient = ctx.createLinearGradient(0, 0, 0, height)
      fillGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
      fillGradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)')
      ctx.fillStyle = fillGradient
      ctx.fill()
    }

    const drawBars = (width: number, height: number, barCount: number, barWidth: number, heightScale: number): void => {
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength)
        const value = dataArray[dataIndex]
        const barHeight = value * heightScale
        const x = i * barWidth

        const gradient = ctx.createLinearGradient(x, height, x, height - barHeight)
        gradient.addColorStop(0, '#a855f7')
        gradient.addColorStop(0.5, '#d946ef')
        gradient.addColorStop(1, '#ec4899')
        
        ctx.fillStyle = gradient
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight)
        
        // Add glow
        if (value > 100) {
          ctx.shadowBlur = 15
          ctx.shadowColor = '#d946ef'
          ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight)
          ctx.shadowBlur = 0
        }
      }
    }

    const draw = (): void => {
      animationFrameRef.current = requestAnimationFrame(draw)

      analyserNode.getByteFrequencyData(dataArray)

      const width = canvas.width
      const height = canvas.height

      // Create gradient background based on visualizer type
      const bgGradient = ctx.createLinearGradient(0, height, 0, 0)
      if (visualizerType === 'fire') {
        bgGradient.addColorStop(0, '#000000')
        bgGradient.addColorStop(1, '#1a0a0a')
      } else if (visualizerType === 'wave') {
        bgGradient.addColorStop(0, '#0a0a1a')
        bgGradient.addColorStop(1, '#0f0f2a')
      } else {
        bgGradient.addColorStop(0, '#0f0a1a')
        bgGradient.addColorStop(1, '#1a0a2a')
      }
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      const barCount = 64
      const barWidth = width / barCount
      const heightScale = height / 255

      if (visualizerType === 'fire') {
        drawFire(width, height, barCount, barWidth, heightScale)
      } else if (visualizerType === 'wave') {
        drawWave(width, height)
      } else if (visualizerType === 'bars') {
        drawBars(width, height, barCount, barWidth, heightScale)
      }
    }

    draw()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [analyserNode, isPlaying, visualizerType])

  return (
    <div className="w-full rounded-lg overflow-hidden bg-black/50 border border-orange-500/30">
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-48 md:h-64"
      />
    </div>
  )
}
