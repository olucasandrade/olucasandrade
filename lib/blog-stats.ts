export interface BlogStats {
  likes: number
  views: number
}

const REST_URL = process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

function upstashConfigured(): boolean {
  return Boolean(REST_URL && REST_TOKEN)
}

async function upstashGet(key: string): Promise<string | null> {
  if (!upstashConfigured()) return null
  const res = await fetch(`${REST_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const body = (await res.json()) as { result?: string | null }
  return (body as any)?.result ?? null
}

async function upstashSet(key: string, value: string): Promise<void> {
  if (!upstashConfigured()) return
  const res = await fetch(
    `${REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${REST_TOKEN}` },
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upstash SET failed: ${res.status} ${text}`)
  }
}

async function upstashIncr(key: string): Promise<number> {
  if (!upstashConfigured()) return 0
  const res = await fetch(`${REST_URL}/incr/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
  })
  if (!res.ok) throw new Error(`Upstash INCR failed: ${res.status}`)
  const body = (await res.json()) as { result: number }
  return body.result
}

async function upstashScan(
  cursor: string,
  pattern = '*',
  count = 100
): Promise<{ cursor: string; keys: string[] }> {
  if (!upstashConfigured()) return { cursor: '0', keys: [] }
  const url = `${REST_URL}/scan/${encodeURIComponent(cursor)}?match=${encodeURIComponent(pattern)}&count=${count}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upstash SCAN failed: ${res.status} ${text}`)
  }
  const body = (await res.json()) as { result: [string, string[]] }
  const [nextCursor, keys] = body.result || ['0', []]
  return { cursor: nextCursor, keys: keys || [] }
}

async function upstashMGet(keys: string[]): Promise<(string | null)[]> {
  if (keys.length === 0 || !upstashConfigured()) return []
  const pathKeys = keys.map((k) => encodeURIComponent(k)).join('/')
  const res = await fetch(`${REST_URL}/mget/${pathKeys}`, {
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upstash MGET failed: ${res.status} ${text}`)
  }
  const body = (await res.json()) as { result?: (string | null)[] }
  return (body as any)?.result ?? []
}

async function getAllKeysAndValues(pattern = 'blog-stats:*') {
  const keys: string[] = []
  let cursor = '0'

  do {
    const reply = await upstashScan(cursor, pattern, 100)
    cursor = reply.cursor
    keys.push(...reply.keys)
  } while (cursor !== '0')

  if (keys.length === 0) return {}

  const values = await upstashMGet(keys)

  // legacy blob holds pre-2026 counts; integer key holds increments since
  return keys.reduce<Record<string, { views: number }>>((acc, key, i) => {
    const value = values[i]
    if (value === null || value === undefined) return acc

    if (key.endsWith(':views')) {
      const baseKey = key.slice(0, -':views'.length)
      const counter = Number.parseInt(value, 10)
      if (!Number.isNaN(counter)) {
        acc[baseKey] = { views: (acc[baseKey]?.views ?? 0) + counter }
      }
    } else {
      let parsed: Partial<BlogStats> = {}
      try {
        parsed = JSON.parse(value)
      } catch {
        parsed = {}
      }
      const legacyViews = typeof parsed.views === 'number' ? parsed.views : 0
      acc[key] = { views: (acc[key]?.views ?? 0) + legacyViews }
    }
    return acc
  }, {})
}

export async function getBlogStatsBySlug(slug: string): Promise<BlogStats> {
  const data = await upstashGet(`blog-stats:${slug}`)
  let parsed: Partial<BlogStats> = {}
  if (data) {
    try {
      parsed = JSON.parse(data)
    } catch {
      parsed = {}
    }
  }
  return {
    likes: typeof parsed.likes === 'number' ? parsed.likes : 0,
    views: typeof parsed.views === 'number' ? parsed.views : 0,
  }
}

// Write stats to file
export async function writeBlogStats(slug: string, stats: BlogStats): Promise<void> {
  await upstashSet(`blog-stats:${slug}`, JSON.stringify(stats))
}

// Get stats for a specific post
// legacy blob holds pre-2026 counts; integer key holds increments since
export async function getPostStats(slug: string): Promise<{ likes: number; views: number }> {
  const [legacy, counter] = await Promise.all([
    getBlogStatsBySlug(slug),
    upstashGet(`blog-stats:${slug}:views`),
  ])
  const incremented = counter ? Number.parseInt(counter, 10) : 0
  return {
    likes: legacy.likes,
    views: legacy.views + (Number.isNaN(incremented) ? 0 : incremented),
  }
}

// Increment view count (atomic INCR on a dedicated integer key)
export async function incrementViews(slug: string): Promise<{ likes: number; views: number }> {
  const views = await upstashIncr(`blog-stats:${slug}:views`)
  return { likes: 0, views }
}

// Get all posts stats (for blog list pages)
export async function getAllPostsStats(): Promise<Record<string, { views: number }>> {
  const stats = await getAllKeysAndValues('blog-stats:*')
  return stats
}
