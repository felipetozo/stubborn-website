'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['Novo', 'Em contato', 'Proposta enviada', 'Fechado'] as const
type Status = typeof STATUSES[number]

const STATUS_STYLES: Record<Status, { bg: string; color: string }> = {
  'Novo':              { bg: 'rgba(77,91,252,0.15)',  color: 'rgba(77,91,252,1)'   },
  'Em contato':        { bg: 'rgba(255,196,0,0.15)',  color: 'rgba(255,196,0,1)'   },
  'Proposta enviada':  { bg: 'rgba(180,100,255,0.15)',color: 'rgba(180,100,255,1)' },
  'Fechado':           { bg: 'rgba(0,173,26,0.15)',   color: 'rgba(0,173,26,1)'    },
}

const ASSUNTO_LABELS: Record<string, string> = {
  site:        'Site / Landing page',
  sistema:     'Sistema / CRM / Web App',
  diagnostico: 'Chatbot com IA',
  manutencao:  'Delivery / Agendamento',
  outro:       'Outro',
}

interface Contact {
  id: string
  nomeCompleto: string
  email: string
  whatsapp: string
  assuntoDesejado: string
  termos: boolean
  status: string | null
  timestamp: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatusBadge({ contactId, current }: { contactId: string; current: string | null }) {
  const [open, setOpen] = useState(false)
  const [optimistic, setOptimistic] = useState<string | null>(current)
  const [, startTransition] = useTransition()

  const status = (optimistic || 'Novo') as Status
  const style = STATUS_STYLES[status] || STATUS_STYLES['Novo']

  async function updateStatus(next: Status) {
    setOptimistic(next)
    setOpen(false)
    startTransition(async () => {
      await fetch('/api/admin/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contactId, status: next }),
      })
    })
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: style.bg,
          color: style.color,
          border: `1px solid ${style.color}33`,
          borderRadius: '2rem',
          padding: '0.25rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-spaceGrotesk)',
        }}
      >
        {status}
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 20,
            background: '#131518',
            border: '1px solid rgba(221,219,225,0.1)',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            minWidth: '160px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {STATUSES.map(s => {
              const st = STATUS_STYLES[s]
              return (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.6rem 1rem',
                    background: s === status ? 'rgba(221,219,225,0.06)' : 'transparent',
                    color: st.color,
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-spaceGrotesk)',
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copy}
      title="Copiar"
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: copied ? 'rgba(0,173,26,1)' : 'rgba(221,219,225,0.3)',
        padding: '0 0.25rem',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-spaceGrotesk)',
        flexShrink: 0,
      }}
    >
      {copied ? '✓' : '⎘'}
    </button>
  )
}

export default function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Todos')

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || [c.nomeCompleto, c.email, c.whatsapp, c.assuntoDesejado]
      .some(v => v.toLowerCase().includes(q))
    const matchStatus = statusFilter === 'Todos' || (c.status || 'Novo') === statusFilter
    return matchSearch && matchStatus
  })

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const countByStatus = (s: string) => contacts.filter(c => (c.status || 'Novo') === s).length

  return (
    <div style={{ minHeight: '100vh', background: '#07090C', color: '#DDDBE1', fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(221,219,225,0.08)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, marginBottom: 0, fontFamily: 'var(--font-spaceGrotesk)' }}>
            CRM
          </h1>
          <span style={{ color: 'rgba(221,219,225,0.3)', fontSize: '0.875rem' }}>
            {contacts.length} contato{contacts.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(221,219,225,0.12)',
            borderRadius: '0.4rem',
            padding: '0.375rem 0.875rem',
            color: 'rgba(221,219,225,0.5)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-spaceGrotesk)',
          }}
        >
          Sair
        </button>
      </div>

      <div style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {STATUSES.map(s => {
            const st = STATUS_STYLES[s]
            return (
              <div
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'Todos' : s)}
                style={{
                  background: statusFilter === s ? st.bg : 'rgba(221,219,225,0.04)',
                  border: `1px solid ${statusFilter === s ? st.color + '44' : 'rgba(221,219,225,0.08)'}`,
                  borderRadius: '0.5rem',
                  padding: '0.875rem 1.25rem',
                  cursor: 'pointer',
                  minWidth: '120px',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: statusFilter === s ? st.color : '#DDDBE1', fontFamily: 'var(--font-spaceGrotesk)', lineHeight: 1 }}>
                  {countByStatus(s)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(221,219,225,0.4)', marginTop: '0.25rem' }}>
                  {s}
                </div>
              </div>
            )
          })}
        </div>

        {/* Search & filter */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Buscar por nome, email, telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              background: 'rgba(221,219,225,0.06)',
              border: '1px solid rgba(221,219,225,0.12)',
              borderRadius: '0.4rem',
              padding: '0.625rem 1rem',
              color: '#DDDBE1',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
          {statusFilter !== 'Todos' && (
            <button
              onClick={() => setStatusFilter('Todos')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(221,219,225,0.12)',
                borderRadius: '0.4rem',
                padding: '0.625rem 0.875rem',
                color: 'rgba(221,219,225,0.5)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-spaceGrotesk)',
                whiteSpace: 'nowrap',
              }}
            >
              ✕ {statusFilter}
            </button>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(221,219,225,0.3)' }}>
            Nenhum contato encontrado.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(221,219,225,0.08)' }}>
                  {['Nome', 'Email', 'WhatsApp', 'Assunto', 'Data', 'Status'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left',
                      padding: '0.625rem 0.75rem',
                      color: 'rgba(221,219,225,0.4)',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-spaceGrotesk)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: '1px solid rgba(221,219,225,0.05)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(221,219,225,0.02)',
                    }}
                  >
                    <td style={{ padding: '0.875rem 0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {c.nomeCompleto}
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ color: 'rgba(221,219,225,0.7)' }}>{c.email}</span>
                        <CopyButton value={c.email} />
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ color: 'rgba(221,219,225,0.7)', whiteSpace: 'nowrap' }}>{c.whatsapp}</span>
                        <CopyButton value={c.whatsapp} />
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem', color: 'rgba(221,219,225,0.6)', whiteSpace: 'nowrap' }}>
                      {ASSUNTO_LABELS[c.assuntoDesejado] || c.assuntoDesejado}
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem', color: 'rgba(221,219,225,0.4)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {formatDate(c.timestamp)}
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      <StatusBadge contactId={c.id} current={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
