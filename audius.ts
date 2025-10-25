export interface AudiusTrack {
  id: string
  title: string
  permalink: string
  duration: number
  user: {
    id: string
    name: string
    handle: string
    is_verified: boolean
    profile_picture?: {
      '150x150'?: string
      '480x480'?: string
      '1000x1000'?: string
    }
  }
  artwork?: {
    '150x150'?: string
    '480x480'?: string
    '1000x1000'?: string
  }
  play_count: number
  favorite_count: number
  repost_count: number
  genre?: string
  mood?: string
  tags?: string
  description?: string
  release_date?: string
  has_current_user_saved?: boolean
  has_current_user_reposted?: boolean
  is_unlisted?: boolean
  stem_of?: {
    parent_track_id: string
  }
  remix_of?: {
    tracks: Array<{
      parent_track_id: string
    }>
  }
  download?: {
    cid?: string
    is_downloadable: boolean
    requires_follow: boolean
  }
}

export interface AudiusAPIResponse<T> {
  data: T
}

export interface AudiusHost {
  host: string
}
