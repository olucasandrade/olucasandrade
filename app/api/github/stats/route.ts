import { NextResponse } from 'next/server'

export const revalidate = 3600

interface ContributionDay {
  contributionCount: number
  date: string
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface GraphQLResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number
          weeks: ContributionWeek[]
        }
      }
      repositories: {
        nodes: { stargazerCount: number }[]
      }
    }
  }
  errors?: unknown[]
}

function formatISODate(date: Date) {
  return date.toISOString().split('T')[0] + 'T00:00:00Z'
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    return NextResponse.json({ unavailable: true })
  }

  const to = new Date()
  const from = new Date()
  from.setFullYear(from.getFullYear() - 1)

  const query = `
    query {
      user(login: "olucasandrade") {
        contributionsCollection(from: "${formatISODate(from)}", to: "${formatISODate(to)}") {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
        repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC) {
          nodes {
            stargazerCount
          }
        }
      }
    }
  `

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 },
    })

    const json: GraphQLResponse = await res.json()

    if (!res.ok || json.errors || !json.data?.user) {
      return NextResponse.json({ unavailable: true })
    }

    const totalStars = json.data.user.repositories.nodes.reduce(
      (sum, repo) => sum + repo.stargazerCount,
      0
    )

    const weeks = json.data.user.contributionsCollection.contributionCalendar.weeks
    const totalContributions =
      json.data.user.contributionsCollection.contributionCalendar.totalContributions

    const weekly = weeks.map((week) => ({
      date: week.contributionDays[0]?.date ?? '',
      count: week.contributionDays.reduce((sum, day) => sum + day.contributionCount, 0),
    }))

    return NextResponse.json({
      totalStars,
      totalContributions,
      weekly,
      unavailable: false,
    })
  } catch {
    return NextResponse.json({ unavailable: true })
  }
}
