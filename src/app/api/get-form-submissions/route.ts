// src/app/api/get-form-submissions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const data = await prisma.footerFormSubmission.findMany({
            orderBy: { timestamp: 'desc' },
        });

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Erro geral ao buscar dados:', error);
        return NextResponse.json(
            { success: false, message: 'Erro interno do servidor ao buscar dados.' },
            { status: 500 }
        );
    }
}
