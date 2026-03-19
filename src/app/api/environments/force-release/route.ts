import { NextRequest, NextResponse } from 'next/server'
import { getEnvironments, forceRelease } from '@/lib/store'
import { notifyTeams } from '@/lib/notify'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const envsBefore = await getEnvironments()
    const envBefore = envsBefore.find(e => e.id === id)
    const releasedUser = envBefore?.occupiedBy ?? 'Sistema'

    const environments = await forceRelease(id)

    const env = environments.find(e => e.id === id)
    if (env) {
      notifyTeams('released', releasedUser, env.name)
    }

    return NextResponse.json({ success: true, environments })
  } catch (error) {
    console.error('POST /api/environments/force-release error:', error)
    const message = error instanceof Error ? error.message : 'Failed to release environment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
