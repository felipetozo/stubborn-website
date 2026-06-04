'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { RiContactsBookLine, RiBarChartBoxLine, RiArticleLine, RiLogoutBoxRLine } from 'react-icons/ri'

const NAV = [
  { href: '/admin', label: 'CRM', Icon: RiContactsBookLine },
  { href: '/admin/analytics', label: 'Analytics', Icon: RiBarChartBoxLine },
  { href: '/admin/blog', label: 'Blog', Icon: RiArticleLine },
] as const

export default function AdminSidebar() {
  const pathname = usePathname() || '/admin'
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: '#0B0E13',
        borderRight: '1px solid rgba(221,219,225,0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        fontFamily: 'var(--font-inter)',
      }}
    >
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(221,219,225,0.08)',
          fontFamily: 'var(--font-spaceGrotesk)',
          fontWeight: 700,
          fontSize: '1.05rem',
          color: '#DDDBE1',
          letterSpacing: '-0.01em',
        }}
      >
        stubborn<span style={{ color: 'rgb(77,91,252)' }}>.</span>
      </div>

      <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.7rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: active ? 'rgb(77,91,252)' : 'rgba(221,219,225,0.6)',
                background: active ? 'rgba(77,91,252,0.12)' : 'transparent',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon style={{ fontSize: '1.15rem', flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        style={{
          margin: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          padding: '0.65rem 0.85rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(221,219,225,0.1)',
          background: 'transparent',
          color: 'rgba(221,219,225,0.5)',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-spaceGrotesk)',
        }}
      >
        <RiLogoutBoxRLine style={{ fontSize: '1.1rem' }} />
        Sair
      </button>
    </aside>
  )
}
