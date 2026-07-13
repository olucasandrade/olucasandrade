import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Lucas Andrade'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0a0a0a',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          Lucas Andrade
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 700,
            color: '#16a34a',
            lineHeight: 1.2,
            maxWidth: '90%',
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#9ca3af',
          }}
        >
          olucasandrade.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
