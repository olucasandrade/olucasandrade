import { NextRequest, NextResponse } from 'next/server'
import { getPostStats, hasUserLiked } from '@/lib/blog-stats'

// Generate a simple user ID based on IP and User-Agent
function generateUserId(request: NextRequest): string {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Create a simple hash-like ID (in production, consider using a proper hashing function)
  return Buffer.from(`${ip}-${userAgent}`).toString('base64').slice(0, 16)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const decodedSlug = decodeURIComponent(slug)
    const userId = generateUserId(request)
    
    const stats = getPostStats(decodedSlug)
    const isLiked = hasUserLiked(decodedSlug, userId)
    
    return NextResponse.json({
      ...stats,
      isLiked,
    })
  } catch (error) {
    console.error('Error getting blog stats:', error)
    return NextResponse.json(
      { error: 'Failed to get blog stats' },
      { status: 500 }
    )
  }
}
