'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnvironmentCard } from './environment-card'
import { UserPrompt } from './user-prompt'
import type { Environment } from '@/lib/store'

const POLL_INTERVAL = 3000

export function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null)
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const prevEnvironmentsRef = useRef<Environment[]>([])
  const autoClaimRef = useRef<(id: string) => void>(() => {})

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('semaphore-user')
    if (stored) setUserName(stored)
  }, [])

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, ctx.currentTime)
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2)

      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.4)
    } catch {
      // Web Audio API not available
    }
  }, [])

  const fetchEnvironments = useCallback(async () => {
    try {
      const res = await fetch('/api/environments')
      const data: Environment[] = await res.json()

      // Auto-claim envs that just became free where I'm on the waitlist
      const envsToAutoClaim: string[] = []
      if (userName && prevEnvironmentsRef.current.length > 0) {
        for (const env of data) {
          const prev = prevEnvironmentsRef.current.find(e => e.id === env.id)
          if (
            prev &&
            prev.status === 'occupied' &&
            env.status === 'free' &&
            (prev.waitlist ?? []).includes(userName)
          ) {
            envsToAutoClaim.push(env.id)
          }
        }
      }

      prevEnvironmentsRef.current = data
      setEnvironments(data)
      setLastUpdated(new Date())

      // Fire auto-claims after state update
      for (const envId of envsToAutoClaim) {
        playNotificationSound()
        autoClaimRef.current(envId)
      }
    } catch (err) {
      console.error('Failed to fetch environments:', err)
    } finally {
      setLoading(false)
    }
  }, [userName, playNotificationSound])

  // Poll for updates
  useEffect(() => {
    fetchEnvironments()
    const interval = setInterval(fetchEnvironments, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchEnvironments])

  function handleSetUser(name: string) {
    localStorage.setItem('semaphore-user', name)
    setUserName(name)
  }

  async function handleToggle(id: string, autoClaim = false) {
    if (!userName) return

    // Optimistic update
    setEnvironments(prev => prev.map(env => {
      if (env.id !== id) return env
      if (env.status === 'free') {
        return { ...env, status: 'occupied', occupiedBy: userName, occupiedAt: new Date().toISOString() }
      }
      return { ...env, status: 'free', occupiedBy: null, occupiedAt: null, waitlist: [] }
    }))

    try {
      const res = await fetch('/api/environments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, userName, autoClaim }),
      })
      const data = await res.json()
      setEnvironments(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to toggle:', err)
      fetchEnvironments()
    }
  }

  autoClaimRef.current = (id: string) => {
    handleToggle(id, true)
  }

  async function handleWaitlist(id: string, action: 'join' | 'leave') {
    if (!userName) return

    // Optimistic update
    setEnvironments(prev => prev.map(env => {
      if (env.id !== id) return env
      const waitlist = action === 'join'
        ? [...env.waitlist, userName]
        : env.waitlist.filter(u => u !== userName)
      return { ...env, waitlist }
    }))

    try {
      const res = await fetch('/api/environments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id, userName }),
      })
      const data = await res.json()
      prevEnvironmentsRef.current = data
      setEnvironments(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to update waitlist:', err)
      fetchEnvironments()
    }
  }

  if (!userName) {
    return <UserPrompt onSubmit={handleSetUser} />
  }

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--cyan)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '16px',
            opacity: 0.7,
          }}
        >
          Staging Control
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 800,
            margin: '0 0 16px 0',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
          }}
        >
          Semaphore
        </h1>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <span>
            logged as <span style={{ color: 'var(--cyan)' }}>{userName}</span>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <button
            onClick={() => {
              localStorage.removeItem('semaphore-user')
              setUserName(null)
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            switch user
          </button>
          {lastUpdated && (
            <>
              <span style={{ opacity: 0.3 }}>|</span>
              <span style={{ opacity: 0.5 }}>
                synced {lastUpdated.toLocaleTimeString()}
              </span>
            </>
          )}
        </div>
      </motion.header>

      {/* Environment Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          width: '100%',
          maxWidth: '900px',
        }}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                padding: '60px',
              }}
            >
              Loading environments...
            </motion.div>
          ) : (
            environments.map((env, i) => (
              <EnvironmentCard
                key={env.id}
                environment={env}
                index={i}
                onToggle={handleToggle}
                onWaitlist={handleWaitlist}
                currentUser={userName}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        style={{
          marginTop: '32px',
          display: 'flex',
          gap: '24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: 'var(--green)',
            boxShadow: '0 0 8px rgba(0,255,136,0.4)',
          }} />
          available
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: 'var(--red)',
            boxShadow: '0 0 8px rgba(255,51,85,0.4)',
          }} />
          occupied
        </div>
        <div style={{ opacity: 0.5 }}>
          auto-sync every 3s
        </div>
      </motion.footer>
    </div>
  )
}
