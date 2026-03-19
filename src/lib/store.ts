import { Redis } from '@upstash/redis'

export type EnvironmentStatus = 'free' | 'occupied'

export interface Environment {
  id: string
  name: string
  status: EnvironmentStatus
  occupiedBy: string | null
  occupiedAt: string | null
  waitlist: string[]
}

const REDIS_KEY = 'semaphore:environments'

const DEFAULT_ENVIRONMENTS: Environment[] = [
  { id: 'assistant', name: 'Assistant', status: 'free', occupiedBy: null, occupiedAt: null, waitlist: [] },
  { id: 'core', name: 'Core', status: 'free', occupiedBy: null, occupiedAt: null, waitlist: [] },
  { id: 'app', name: 'App', status: 'free', occupiedBy: null, occupiedAt: null, waitlist: [] },
  { id: 'customer-gateway', name: 'Customer Gateway', status: 'free', occupiedBy: null, occupiedAt: null, waitlist: [] },
]

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function getEnvironments(): Promise<Environment[]> {
  const data = await redis.get<Environment[]>(REDIS_KEY)
  if (!data) {
    await redis.set(REDIS_KEY, DEFAULT_ENVIRONMENTS)
    return DEFAULT_ENVIRONMENTS
  }
  // Backfill waitlist for existing data without it
  return data.map(env => ({ ...env, waitlist: env.waitlist ?? [] }))
}

export async function toggleEnvironment(id: string, userName: string): Promise<Environment[]> {
  const environments = await getEnvironments()
  const env = environments.find(e => e.id === id)
  if (!env) throw new Error(`Environment ${id} not found`)

  if (env.status === 'free') {
    env.status = 'occupied'
    env.occupiedBy = userName
    env.occupiedAt = new Date().toISOString()
  } else {
    env.status = 'free'
    env.occupiedBy = null
    env.occupiedAt = null
    env.waitlist = []
  }

  await redis.set(REDIS_KEY, environments)
  return environments
}

export async function joinWaitlist(id: string, userName: string): Promise<Environment[]> {
  const environments = await getEnvironments()
  const env = environments.find(e => e.id === id)
  if (!env) throw new Error(`Environment ${id} not found`)

  if (!env.waitlist.includes(userName)) {
    env.waitlist.push(userName)
  }

  await redis.set(REDIS_KEY, environments)
  return environments
}

export async function leaveWaitlist(id: string, userName: string): Promise<Environment[]> {
  const environments = await getEnvironments()
  const env = environments.find(e => e.id === id)
  if (!env) throw new Error(`Environment ${id} not found`)

  env.waitlist = env.waitlist.filter(u => u !== userName)

  await redis.set(REDIS_KEY, environments)
  return environments
}

export async function extendEnvironment(id: string, userName: string): Promise<Environment[]> {
  const environments = await getEnvironments()
  const env = environments.find(e => e.id === id)
  if (!env) throw new Error(`Environment ${id} not found`)
  if (env.status !== 'occupied' || env.occupiedBy !== userName) {
    throw new Error(`Environment ${id} is not occupied by ${userName}`)
  }

  env.occupiedAt = new Date().toISOString()

  await redis.set(REDIS_KEY, environments)
  return environments
}

export async function forceRelease(id: string): Promise<Environment[]> {
  const environments = await getEnvironments()
  const env = environments.find(e => e.id === id)
  if (!env) throw new Error(`Environment ${id} not found`)
  if (env.status !== 'occupied') {
    throw new Error(`Environment ${id} is not occupied`)
  }

  env.status = 'free'
  env.occupiedBy = null
  env.occupiedAt = null
  env.waitlist = []

  await redis.set(REDIS_KEY, environments)
  return environments
}
