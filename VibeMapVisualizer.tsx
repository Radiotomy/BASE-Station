'use client'

import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VibeProfile } from '@/services/vibeAnalysis'

interface VibeMapVisualizerProps {
  profile: VibeProfile
  trackTitle: string
}

export const VibeMapVisualizer: FC<VibeMapVisualizerProps> = ({ 
  profile,
  trackTitle 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw vibe map based on energy signature
    drawVibeMap(ctx, rect.width, rect.height, profile)
  }, [profile])

  const drawVibeMap = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    profile: VibeProfile
  ): void => {
    const centerX = width / 2
    const centerY = height / 2

    // Parse color
    const color = profile.color
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    // Draw radial gradient background
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 2)
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`)
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.1)`)
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Draw energy signature as circular wave
    const signature = profile.energySignature
    const numPoints = signature.length * 4 // Interpolate for smoother curve
    const angleStep = (Math.PI * 2) / numPoints

    ctx.beginPath()
    for (let i = 0; i <= numPoints; i++) {
      const signatureIndex = Math.floor((i / numPoints) * signature.length)
      const value = signature[signatureIndex] || 0
      const normalizedValue = value / 255
      
      const angle = i * angleStep
      const baseRadius = Math.min(width, height) * 0.15
      const radius = baseRadius + (normalizedValue * baseRadius * 1.5)
      
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.stroke()

    // Fill with gradient
    const fillGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 3)
    fillGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`)
    fillGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.05)`)
    ctx.fillStyle = fillGradient
    ctx.fill()

    // Draw energy particles
    const numParticles = Math.floor(profile.energy / 5)
    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles
      const distance = (Math.random() * 0.3 + 0.3) * Math.min(width, height) / 2
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance
      const size = Math.random() * 3 + 1

      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.5 + 0.3})`
      ctx.fill()
    }

    // Draw center glow
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30)
    centerGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`)
    centerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = centerGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
    ctx.fill()

    // Draw vibe label
    ctx.font = 'bold 14px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillText(profile.vibe.toUpperCase(), centerX, centerY + 60)
  }

  const handleDownload = (): void => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `vibe-map-${trackTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/20 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Visual Vibe Map
          </CardTitle>
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Save NFT
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative rounded-lg overflow-hidden border border-white/20">
          <canvas
            ref={canvasRef}
            className="w-full h-64 bg-black"
            style={{ display: 'block' }}
          />
        </div>
        <p className="text-xs text-white/40 mt-2 text-center">
          Dynamic audio fingerprint • On-chain collectible
        </p>
      </CardContent>
    </Card>
  )
}
