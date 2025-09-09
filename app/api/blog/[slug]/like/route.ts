import { NextRequest, NextResponse } from 'next/server'
import { toggleLike } from '@/lib/blog-stats'

// Generate a simple user ID based on IP and User-Agent
function generateUserId(request: NextRequest): string {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Create a simple hash-like ID (in production, consider using a proper hashing function)
  return Buffer.from(`${ip}-${userAgent}`).toString('base64').slice(0, 16)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const decodedSlug = decodeURIComponent(slug)
    const userId = generateUserId(request)
    
    const result = toggleLike(decodedSlug, userId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}
