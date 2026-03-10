'use client'

import { motion } from 'framer-motion'
import { TrafficLight } from './traffic-light'
import type { Environment } from '@/lib/store'

interface EnvironmentCardProps {
  environment: Environment
  index: number
  onToggle: (id: string) => void
  currentUser: string
}

function formatTimeSince(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`
  return `${Math.floor(hours / 24)}d ago`
}

const ICONS: Record<string, string> = {
  assistant: '01',
  'core-app': '02',
  'customer-gateway': '03',
}

export function EnvironmentCard({ environment, index, onToggle, currentUser }: EnvironmentCardProps) {
  const { id, name, status, occupiedBy, occupiedAt } = environment
  const isOccupied = status === 'occupied'
  const isOccupiedByMe = isOccupied && occupiedBy === currentUser

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: 'relative',
        display: 'flex',
        gap: '24px',
        padding: '28px 32px',
        background: 'var(--bg-card)',
        borderRadius: '20px',
        border: '1px solid var(--bg-card-border)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        cursor: (!isOccupied || isOccupiedByMe) ? 'pointer' : 'not-allowed',
      }}
      whileHover={(!isOccupied || isOccupiedByMe) ? {
        scale: 1.015,
        borderColor: isOccupied ? 'rgba(255, 51, 85, 0.2)' : 'rgba(0, 255, 136, 0.2)',
      } : {}}
      whileTap={(!isOccupied || isOccupiedByMe) ? { scale: 0.99 } : {}}
      onClick={() => {
        if (!isOccupied || isOccupiedByMe) {
          onToggle(id)
        }
      }}
    >
      {/* Status accent line */}
      <motion.div
        animate={{
          background: isOccupied
            ? 'linear-gradient(180deg, #ff3355, #cc2944)'
            : 'linear-gradient(180deg, #00ff88, #00cc6a)',
        }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          left: 0,
          top: '10%',
          bottom: '10%',
          width: 3,
          borderRadius: '0 2px 2px 0',
        }}
      />

      {/* Traffic Light */}
      <TrafficLight status={status} />

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
            }}
          >
            ENV_{ICONS[id]}
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {name}
          </h2>
        </div>

        {/* Status info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <motion.div
            animate={{
              color: isOccupied ? 'var(--red)' : 'var(--green)',
            }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <motion.span
              animate={{
                backgroundColor: isOccupied ? 'var(--red)' : 'var(--green)',
                scale: [1, 1.2, 1],
              }}
              transition={{
                backgroundColor: { duration: 0.4 },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                display: 'inline-block',
              }}
            />
            {isOccupied ? 'Occupied' : 'Available'}
          </motion.div>

          {isOccupied && occupiedBy && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>//</span>
              <span style={{ color: isOccupiedByMe ? 'var(--cyan)' : 'var(--text-secondary)' }}>
                {isOccupiedByMe ? 'you' : occupiedBy}
              </span>
              {occupiedAt && (
                <>
                  <span style={{ color: 'var(--text-muted)' }}>&middot;</span>
                  <span style={{ color: 'var(--text-muted)' }}>{formatTimeSince(occupiedAt)}</span>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Action hint */}
        <motion.div
          animate={{ opacity: (!isOccupied || isOccupiedByMe) ? 0.5 : 0.2 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
          }}
        >
          {!isOccupied
            ? 'click to claim'
            : isOccupiedByMe
              ? 'click to release'
              : `locked by ${occupiedBy}`
          }
        </motion.div>
      </div>

      {/* Corner badge */}
      <motion.div
        animate={{
          borderColor: isOccupied ? 'rgba(255, 51, 85, 0.15)' : 'rgba(0, 255, 136, 0.15)',
          color: isOccupied ? 'var(--red-dim)' : 'var(--green-dim)',
        }}
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid',
        }}
      >
        STG
      </motion.div>
    </motion.div>
  )
}
