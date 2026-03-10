import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export type EnvironmentStatus = 'free' | 'occupied'

export interface Environment {
  id: string
  name: string
  status: EnvironmentStatus
  occupiedBy: string | null
  occupiedAt: string | null
}

const DATA_PATH = join(process.cwd(), 'data', 'environments.json')

const DEFAULT_ENVIRONMENTS: Environment[] = [
  { id: 'assistant', name: 'Assistant', status: 'free', occupiedBy: null, occupiedAt: null },
  { id: 'core-app', name: 'Core App', status: 'free', occupiedBy: null, occupiedAt: null },
  { id: 'customer-gateway', name: 'Customer Gateway', status: 'free', occupiedBy: null, occupiedAt: null },
]

function ensureDataFile(): void {
  if (!existsSync(DATA_PATH)) {
    writeFileSync(DATA_PATH, JSON.stringify(DEFAULT_ENVIRONMENTS, null, 2))
  }
}

export function getEnvironments(): Environment[] {
  ensureDataFile()
  const raw = readFileSync(DATA_PATH, 'utf-8')
  return JSON.parse(raw)
}

export function toggleEnvironment(id: string, userName: string): Environment[] {
  const environments = getEnvironments()
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

  writeFileSync(DATA_PATH, JSON.stringify(environments, null, 2))
  return environments
}
