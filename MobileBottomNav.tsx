'use client'

import type { FC } from 'react'
import { ListMusic, Shuffle as ShuffleIcon, Heart, Clock, UserCheck, Trophy } from 'lucide-react'

interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  favoritesCount: number
  followsCount: number
}

export const MobileBottomNav: FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  favoritesCount,
  followsCount
}) => {
  const tabs = [
    { id: 'trending', icon: ListMusic, label: 'Trending', color: 'text-[#0052FF]' },
    { id: 'queue', icon: ShuffleIcon, label: 'Queue', color: 'text-green-500' },
    { id: 'favorites', icon: Heart, label: 'Favorites', color: 'text-red-500', count: favoritesCount },
    { id: 'recent', icon: Clock, label: 'Recent', color: 'text-cyan-500' },
    { id: 'following', icon: UserCheck, label: 'Following', color: 'text-purple-500', count: followsCount },
    { id: 'leaderboard', icon: Trophy, label: 'Tips', color: 'text-yellow-500' }
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10 bottom-nav-safe">
      <div className="grid grid-cols-6 gap-0">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center py-2 px-1 touch-manipulation relative
                transition-all duration-200
                ${isActive ? 'bg-white/10' : 'hover:bg-white/5 active:bg-white/10'}
              `}
            >
              <div className={`
                relative
                ${isActive ? tab.color : 'text-white/50'}
              `}>
                <Icon className="w-5 h-5" />
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {tab.count > 9 ? '9+' : tab.count}
                  </span>
                )}
              </div>
              <span className={`
                text-[10px] mt-1 font-medium
                ${isActive ? tab.color : 'text-white/50'}
              `}>
                {tab.label}
              </span>
              {isActive && (
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${tab.color.replace('text-', 'bg-')}`} />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
