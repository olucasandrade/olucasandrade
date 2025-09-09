import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'

export interface BlogStats {
  [slug: string]: {
    likes: number
    views: number
    likedBy: string[] // Store user IDs/IPs who liked
  }
}

const STATS_FILE_PATH = path.join(process.cwd(), 'data', 'blog-stats.json')

// Initialize stats file if it doesn't exist
function initializeStatsFile(): void {
  if (!existsSync(STATS_FILE_PATH)) {
    writeFileSync(STATS_FILE_PATH, JSON.stringify({}))
  }
}

// Read stats from file
export function readBlogStats(): BlogStats {
  try {
    initializeStatsFile()
    const data = readFileSync(STATS_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading blog stats:', error)
    return {}
  }
}

// Write stats to file
export function writeBlogStats(stats: BlogStats): void {
  try {
    writeFileSync(STATS_FILE_PATH, JSON.stringify(stats, null, 2))
  } catch (error) {
    console.error('Error writing blog stats:', error)
  }
}

// Get stats for a specific post
export function getPostStats(slug: string): { likes: number; views: number } {
  const stats = readBlogStats()
  return {
    likes: stats[slug]?.likes || 0,
    views: stats[slug]?.views || 0,
  }
}

// Increment view count
export function incrementViews(slug: string): { likes: number; views: number } {
  const stats = readBlogStats()
  
  if (!stats[slug]) {
    stats[slug] = { likes: 0, views: 0, likedBy: [] }
  }
  
  stats[slug].views += 1
  writeBlogStats(stats)
  
  return {
    likes: stats[slug].likes,
    views: stats[slug].views,
  }
}

// Toggle like (add or remove)
export function toggleLike(slug: string, userId: string): { 
  likes: number; 
  views: number; 
  isLiked: boolean 
} {
  const stats = readBlogStats()
  
  if (!stats[slug]) {
    stats[slug] = { likes: 0, views: 0, likedBy: [] }
  }
  
  const likedBy = stats[slug].likedBy || []
  const isCurrentlyLiked = likedBy.includes(userId)
  
  if (isCurrentlyLiked) {
    // Remove like
    stats[slug].likedBy = likedBy.filter(id => id !== userId)
    stats[slug].likes = Math.max(0, stats[slug].likes - 1)
  } else {
    // Add like
    stats[slug].likedBy.push(userId)
    stats[slug].likes += 1
  }
  
  writeBlogStats(stats)
  
  return {
    likes: stats[slug].likes,
    views: stats[slug].views,
    isLiked: !isCurrentlyLiked,
  }
}

// Check if user has liked a post
export function hasUserLiked(slug: string, userId: string): boolean {
  const stats = readBlogStats()
  return stats[slug]?.likedBy?.includes(userId) || false
}

// Get all posts stats (for blog list pages)
export function getAllPostsStats(): Record<string, { likes: number; views: number }> {
  const stats = readBlogStats()
  const result: Record<string, { likes: number; views: number }> = {}
  
  Object.keys(stats).forEach(slug => {
    result[slug] = {
      likes: stats[slug].likes,
      views: stats[slug].views,
    }
  })
  
  return result
}
