// src/app/api/submit-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nomeCompleto, email, whatsapp, assuntoDesejado, termos } = body;

        // Validação básica dos campos obrigatórios
        if (!nomeCompleto?.trim() || !email?.trim() || !whatsapp?.trim() || !assuntoDesejado?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        // Validação de email usando Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: 'E-mail inválido' },
                { status: 400 }
            );
        }

        const submission = await prisma.footerFormSubmission.create({
            data: {
                nomeCompleto: nomeCompleto.trim(),
                email: email.trim().toLowerCase(),
                whatsapp: whatsapp.trim(),
                assuntoDesejado: assuntoDesejado.trim(),
                termos: Boolean(termos),
            },
        });

        console.log('Novo contato salvo:', submission);

        return NextResponse.json({
            success: true,
            message: 'Formulário enviado com sucesso! Entraremos em contato em breve.',
        });

    } catch (error) {
        console.error('Erro ao processar formulário:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Erro interno do servidor. Tente novamente mais tarde.'
            },
            { status: 500 }
        );
    }
}
