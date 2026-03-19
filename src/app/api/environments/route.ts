import { NextRequest, NextResponse } from 'next/server'
import { getEnvironments, toggleEnvironment, joinWaitlist, leaveWaitlist } from '@/lib/store'
import { notifyTeams } from '@/lib/notify'

export async function GET() {
  try {
    const environments = await getEnvironments()
    return NextResponse.json(environments)
  } catch (error) {
    console.error('GET /api/environments error:', error)
    return NextResponse.json({ error: 'Failed to fetch environments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, id, userName } = await request.json()

    if (!action || !id || !userName) {
      return NextResponse.json({ error: 'Missing action, id, or userName' }, { status: 400 })
    }

    if (action !== 'join' && action !== 'leave') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const environments = action === 'join'
      ? await joinWaitlist(id, userName)
      : await leaveWaitlist(id, userName)

    const env = environments.find(e => e.id === id)
    if (env) {
      notifyTeams(
        action === 'join' ? 'waitlist_joined' : 'waitlist_left',
        userName,
        env.name,
      )
    }

    return NextResponse.json(environments)
  } catch (error) {
    console.error('POST /api/environments error:', error)
    return NextResponse.json({ error: 'Failed to update waitlist' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, userName, autoClaim } = await request.json()

    if (!id || !userName) {
      return NextResponse.json({ error: 'Missing id or userName' }, { status: 400 })
    }

    const envsBefore = await getEnvironments()
    const envBefore = envsBefore.find(e => e.id === id)
    const wasFree = envBefore?.status === 'free'

    const environments = await toggleEnvironment(id, userName)

    const env = environments.find(e => e.id === id)
    if (env) {
      if (wasFree) {
        // Was free, now claimed
        notifyTeams(
          autoClaim ? 'auto_claimed' : 'claimed',
          userName,
          env.name,
        )
      } else {
        // Was occupied, now released
        notifyTeams('released', userName, env.name)
      }
    }

    return NextResponse.json(environments)
  } catch (error) {
    console.error('PATCH /api/environments error:', error)
    return NextResponse.json({ error: 'Failed to toggle environment' }, { status: 500 })
  }
}
