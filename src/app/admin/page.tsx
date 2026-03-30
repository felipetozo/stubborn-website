import { prisma } from '@/lib/prisma'
import ContactsTable from './ContactsTable'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const contacts = await prisma.footerFormSubmission.findMany({
    orderBy: { timestamp: 'desc' },
  })

  const serialized = contacts.map(c => ({
    ...c,
    timestamp: c.timestamp.toISOString(),
  }))

  return <ContactsTable contacts={serialized} />
}
