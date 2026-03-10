'use client'

import { motion } from 'framer-motion'
import type { EnvironmentStatus } from '@/lib/store'

interface TrafficLightProps {
  status: EnvironmentStatus
}

export function TrafficLight({ status }: TrafficLightProps) {
  const isOccupied = status === 'occupied'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 10px',
        background: 'linear-gradient(180deg, rgba(20, 25, 40, 0.9) 0%, rgba(10, 14, 26, 0.95) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Red light */}
      <motion.div
        animate={{
          opacity: isOccupied ? 1 : 0.15,
          scale: isOccupied ? 1 : 0.95,
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: isOccupied
            ? 'radial-gradient(circle at 35% 35%, #ff6b8a, #ff3355 50%, #cc2944)'
            : 'radial-gradient(circle at 35% 35%, #3d1a22, #2a1018)',
          boxShadow: isOccupied
            ? '0 0 20px rgba(255, 51, 85, 0.5), 0 0 60px rgba(255, 51, 85, 0.15), inset 0 -2px 4px rgba(0,0,0,0.3)'
            : 'inset 0 -2px 4px rgba(0,0,0,0.3)',
          animation: isOccupied ? 'pulse-red 2s ease-in-out infinite' : 'none',
        }}
      />

      {/* Yellow light - always dim (decorative) */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #3d3520, #2a2418)',
          opacity: 0.15,
          boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)',
        }}
      />

      {/* Green light */}
      <motion.div
        animate={{
          opacity: !isOccupied ? 1 : 0.15,
          scale: !isOccupied ? 1 : 0.95,
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: !isOccupied
            ? 'radial-gradient(circle at 35% 35%, #66ffbb, #00ff88 50%, #00cc6a)'
            : 'radial-gradient(circle at 35% 35%, #1a3d2a, #102a1a)',
          boxShadow: !isOccupied
            ? '0 0 20px rgba(0, 255, 136, 0.4), 0 0 60px rgba(0, 255, 136, 0.1), inset 0 -2px 4px rgba(0,0,0,0.3)'
            : 'inset 0 -2px 4px rgba(0,0,0,0.3)',
          animation: !isOccupied ? 'pulse-green 3s ease-in-out infinite' : 'none',
        }}
      />
    </div>
  )
}
