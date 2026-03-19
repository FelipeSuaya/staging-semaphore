import { NextRequest, NextResponse } from 'next/server'
import { extendEnvironment } from '@/lib/store'
import { notifyTeams } from '@/lib/notify'

export async function POST(request: NextRequest) {
  try {
    const { id, userName } = await request.json()

    if (!id || !userName) {
      return NextResponse.json({ error: 'Missing id or userName' }, { status: 400 })
    }

    const environments = await extendEnvironment(id, userName)

    const env = environments.find(e => e.id === id)
    if (env) {
      notifyTeams('claimed', userName, env.name)
    }

    return NextResponse.json({ success: true, environments })
  } catch (error) {
    console.error('POST /api/environments/extend error:', error)
    const message = error instanceof Error ? error.message : 'Failed to extend environment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
