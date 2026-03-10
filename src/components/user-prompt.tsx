'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface UserPromptProps {
  onSubmit: (name: string) => void
}

export function UserPrompt({ onSubmit }: UserPromptProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        background: 'rgba(6, 11, 24, 0.95)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <motion.form
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '40px',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-card-border)',
          borderRadius: '20px',
          maxWidth: '420px',
          width: '100%',
          margin: '0 20px',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 700,
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Identify yourself
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Enter your name so others know who&apos;s using the environment.
          </p>
        </div>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="your name..."
          autoFocus
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '15px',
            padding: '14px 18px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(0, 212, 255, 0.15)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(0, 212, 255, 0.4)'}
          onBlur={e => e.target.style.borderColor = 'rgba(0, 212, 255, 0.15)'}
        />

        <motion.button
          type="submit"
          disabled={!name.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '14px',
            background: name.trim()
              ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 255, 136, 0.15))'
              : 'rgba(255, 255, 255, 0.03)',
            border: name.trim()
              ? '1px solid rgba(0, 212, 255, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            color: name.trim() ? 'var(--cyan)' : 'var(--text-muted)',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'all 0.2s',
          }}
        >
          Enter Dashboard
        </motion.button>
      </motion.form>
    </motion.div>
  )
}
