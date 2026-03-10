import { Redis } from '@upstash/redis'

export type EnvironmentStatus = 'free' | 'occupied'

export interface Environment {
  id: string
  name: string
  status: EnvironmentStatus
  occupiedBy: string | null
  occupiedAt: string | null
}

const REDIS_KEY = 'semaphore:environments'

const DEFAULT_ENVIRONMENTS: Environment[] = [
  { id: 'assistant', name: 'Assistant', status: 'free', occupiedBy: null, occupiedAt: null },
  { id: 'core', name: 'Core', status: 'free', occupiedBy: null, occupiedAt: null },
  { id: 'app', name: 'App', status: 'free', occupiedBy: null, occupiedAt: null },
  { id: 'customer-gateway', name: 'Customer Gateway', status: 'free', occupiedBy: null, occupiedAt: null },
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
  return data
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
  }

  await redis.set(REDIS_KEY, environments)
  return environments
}
