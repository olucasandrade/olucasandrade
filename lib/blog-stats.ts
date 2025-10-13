import { createClient } from "redis";

export interface BlogStats {
    likes: number
    views: number
    likedBy: string[] // Store user IDs/IPs who liked
}

const URL = `rediss://default:${process.env.UPSTASH_REDIS_REST_TOKEN}@${process.env.UPSTASH_REDIS_REST_URL}:6379`

const connectRedis = async () => {
  const redisClient = createClient({
    url: URL,
  });
  await redisClient.connect();
  return redisClient;
}

async function getAllKeysAndValues(pattern = '*') {
  const keys: string[] = [];
  let cursor = "0";
  const redisClient = await connectRedis();

  do {
    const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
    cursor = reply.cursor;
    keys.push(...reply.keys);
  } while (cursor !== "0");

  if (keys.length === 0) return {};

  const values = await redisClient.mGet(keys);

  console.log(keys, values[0])

  return keys.reduce<Record<string, BlogStats | null>>((acc, key, i) => {
    acc[key] = values[i] ? JSON.parse(values[i]) : null;
    return acc;
  }, {});
}

export async function getBlogStatsBySlug(slug: string): Promise<BlogStats> {
  const redisClient = await connectRedis();
  const data = await redisClient.get(`blog-stats:${slug}`) || '{}';
  return JSON.parse(data) || { likes: 0, views: 0, likedBy: [] };
}

// Write stats to file
export async function writeBlogStats(slug: string, stats: BlogStats): Promise<void> {
  const redisClient = await connectRedis();
  await redisClient.set(`blog-stats:${slug}`, JSON.stringify(stats));
}

// Get stats for a specific post
export async function getPostStats(slug: string): Promise<{ likes: number; views: number }> {
  const stats = await getBlogStatsBySlug(slug)
  return {
    likes: stats?.likes || 0,
    views: stats?.views || 0,
  }
}

// Increment view count
export async function incrementViews(slug: string): Promise<{ likes: number; views: number }> {
  const stats = await getBlogStatsBySlug(slug)
  
  stats.views += 1
  await writeBlogStats(slug, stats)
  
  return {
    likes: stats.likes,
    views: stats.views,
  }
}

// Toggle like (add or remove)
export async function toggleLike(slug: string, userId: string): Promise<{ 
  likes: number; 
  views: number; 
  isLiked: boolean 
}> {
  const stats = await getBlogStatsBySlug(slug)

  if (!stats.likedBy) {
    stats.likedBy = []
  }
  
  const likedBy = stats.likedBy
  const isCurrentlyLiked = likedBy.includes(userId)
  
  if (isCurrentlyLiked) {
    stats.likedBy = likedBy.filter(id => id !== userId)
    stats.likes = Math.max(0, stats.likes - 1)
  } else {
    stats.likedBy.push(userId)
    stats.likes += 1
  }
  
  await writeBlogStats(slug, stats)
  
  return {
    likes: stats.likes,
    views: stats.views,
    isLiked: !isCurrentlyLiked,
  }
}

// Check if user has liked a post
export async function hasUserLiked(slug: string, userId: string): Promise<boolean> {
  const stats = await getBlogStatsBySlug(slug)
  return stats?.likedBy?.includes(userId) || false
}

// Get all posts stats (for blog list pages)
export async function getAllPostsStats(): Promise<Record<string, BlogStats | null>> {
  const stats = await getAllKeysAndValues('blog-stats:*')
  return stats
}
