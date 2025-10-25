'use client'

import type { FC } from 'react'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArtistVerificationBadgeProps {
  isVerified: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export const ArtistVerificationBadge: FC<ArtistVerificationBadgeProps> = ({ 
  isVerified, 
  size = 'sm',
  showLabel = false,
  className 
}) => {
  if (!isVerified) return null

  const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <CheckCircle 
        className={cn(
          sizeMap[size],
          'text-blue-500 fill-blue-500'
        )} 
      />
      {showLabel && (
        <span className="text-xs text-blue-500 font-semibold">VERIFIED</span>
      )}
    </div>
  )
}
