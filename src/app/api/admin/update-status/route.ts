export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = ['Novo', 'Em contato', 'Proposta enviada', 'Fechado']

export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json()

  if (!id || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const updated = await prisma.footerFormSubmission.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ success: true, data: updated })
}
