'use client'

import { useState, useEffect, useRef } from 'react'
import { validateSubdomain, isSubdomainTaken } from '@/lib/tenant'

interface SubdomainPickerProps {
  value: string
  onChange: (value: string) => void
  onValidChange?: (valid: boolean) => void
}

export default function SubdomainPicker({ value, onChange, onValidChange }: SubdomainPickerProps) {
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid' | 'taken'>('idle')
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!value) {
      setStatus('idle')
      setError('')
      onValidChange?.(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const result = validateSubdomain(value)
      if (!result.valid) {
        setStatus('invalid')
        setError(result.error || 'Invalid')
        onValidChange?.(false)
        return
      }
      if (isSubdomainTaken(value)) {
        setStatus('taken')
        setError('This subdomain is already taken')
        onValidChange?.(false)
        return
      }
      setStatus('valid')
      setError('')
      onValidChange?.(true)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, onValidChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    onChange(v)
  }

  const borderColor = status === 'valid' ? '#22c55e' : status === 'invalid' || status === 'taken' ? '#ef4444' : 'var(--border)'

  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>
        Choose your URL
      </label>
      <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${borderColor}`, background: 'var(--bg)' }}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="your-workspace"
          maxLength={30}
          className="flex-1 px-4 py-3 text-sm bg-transparent outline-none"
          style={{ color: 'var(--text)', border: 'none' }}
        />
        <span className="px-3 py-3 text-sm font-medium flex-shrink-0" style={{ color: 'var(--text4)', background: 'rgba(255,255,255,0.03)', borderLeft: '1px solid var(--border)' }}>
          .zynthr.ai
        </span>
        <span className="px-2 flex-shrink-0" style={{ fontSize: 16 }}>
          {status === 'valid' && '✅'}
          {(status === 'invalid' || status === 'taken') && '❌'}
        </span>
      </div>
      {error && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{error}</p>}
      {status === 'valid' && value && (
        <p className="text-xs mt-1" style={{ color: '#22c55e' }}>
          Your workspace will be at <strong>{value}.zynthr.ai</strong>
        </p>
      )}
    </div>
  )
}
