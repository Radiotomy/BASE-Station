'use client'

import type { FC } from 'react'
import { X } from 'lucide-react'

interface GenreFilterProps {
  genres: string[]
  selectedGenre: string | null
  onGenreSelect: (genre: string | null) => void
}

export const GenreFilter: FC<GenreFilterProps> = ({
  genres,
  selectedGenre,
  onGenreSelect
}) => {
  if (genres.length === 0) return null

  return (
    <div className="metal-surface rounded-lg p-3 lg:p-4">
      <div className="flex overflow-x-auto gap-2 items-center mobile-scroll pb-2 lg:pb-0 lg:flex-wrap">
        <div className="flex items-center gap-2 mr-2">
          <div className={`led-indicator ${selectedGenre ? 'led-blue' : 'led-active'}`}></div>
          <span className="text-pro text-xs text-white/70">FILTER</span>
        </div>
        
        <button
          onClick={() => onGenreSelect(null)}
          className={`btn-studio text-xs px-4 py-2 lg:px-3 lg:py-1.5 whitespace-nowrap touch-manipulation ${
            selectedGenre === null ? 'btn-studio-active' : ''
          }`}
        >
          ALL
        </button>

        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => onGenreSelect(genre)}
            className={`btn-studio text-xs px-4 py-2 lg:px-3 lg:py-1.5 flex items-center gap-1 whitespace-nowrap touch-manipulation ${
              selectedGenre === genre ? 'btn-studio-active' : ''
            }`}
          >
            {genre.toUpperCase()}
            {selectedGenre === genre && (
              <X 
                className="w-3 h-3" 
                onClick={(e) => {
                  e.stopPropagation()
                  onGenreSelect(null)
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
