'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Senha incorreta')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Image src="/img/stubborn-logotipo.svg" alt="stubborn" width={140} height={26} />
          <p style={{ color: 'rgba(221,219,225,0.5)', fontSize: '0.875rem', margin: 0 }}>
            Acesso restrito
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(221,219,225,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              required
              style={{
                background: 'rgba(221,219,225,0.06)',
                border: '1px solid rgba(221,219,225,0.12)',
                borderRadius: '0.4rem',
                padding: '0.75rem 1rem',
                color: '#DDDBE1',
                fontSize: '1rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'rgba(77,91,252,0.5)' : 'rgba(77,91,252,1)',
              border: 'none',
              borderRadius: '0.4rem',
              padding: '0.75rem 1.5rem',
              color: '#fff',
              fontSize: '1rem',
              fontFamily: 'var(--font-spaceGrotesk)',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              height: '3rem',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
