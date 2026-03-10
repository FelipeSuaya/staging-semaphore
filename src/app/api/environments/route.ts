import { NextRequest, NextResponse } from 'next/server'
import { getEnvironments, toggleEnvironment } from '@/lib/store'

export async function GET() {
  const environments = getEnvironments()
  return NextResponse.json(environments)
}

export async function PATCH(request: NextRequest) {
  const { id, userName } = await request.json()

  if (!id || !userName) {
    return NextResponse.json({ error: 'Missing id or userName' }, { status: 400 })
  }

  const environments = toggleEnvironment(id, userName)
  return NextResponse.json(environments)
}
