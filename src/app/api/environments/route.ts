import { NextRequest, NextResponse } from 'next/server'
import { getEnvironments, toggleEnvironment, joinWaitlist, leaveWaitlist } from '@/lib/store'

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

    return NextResponse.json(environments)
  } catch (error) {
    console.error('POST /api/environments error:', error)
    return NextResponse.json({ error: 'Failed to update waitlist' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, userName } = await request.json()

    if (!id || !userName) {
      return NextResponse.json({ error: 'Missing id or userName' }, { status: 400 })
    }

    const environments = await toggleEnvironment(id, userName)
    return NextResponse.json(environments)
  } catch (error) {
    console.error('PATCH /api/environments error:', error)
    return NextResponse.json({ error: 'Failed to toggle environment' }, { status: 500 })
  }
}
