// src/app/api/submit-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente, obtidas do .env.local (e depois do Vercel)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Inicializa o cliente Supabase para uso no lado do servidor
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface FormData {
    nomeCompleto: string;
    email: string;
    whatsapp: string;
    assuntoDesejado: string;
    termos: boolean;
    timestamp?: string; // O timestamp será gerado pelo DB
    id?: string;        // O ID será gerado pelo DB
    status?: string; // Adicione esta linha se você já adicionou a coluna 'status' no Supabase
}

export async function POST(request: NextRequest) {
    try {
        // Remova ESTE BLOCO de código:
        // const formDataToInsert: Omit<FormData, 'id' | 'timestamp' | 'status'> = {
        //     // ... seus campos existentes
        //     // status: 'Primeiro contato', // Adicione esta linha
        // };
        // FIM DO BLOCO A SER REMOVIDO

        const body = await request.json();
        const { nomeCompleto, email, whatsapp, assuntoDesejado, termos } = body;

        // Validação básica dos campos obrigatórios
        if (!nomeCompleto?.trim() || !email?.trim() || !whatsapp?.trim() || !assuntoDesejado?.trim()) { // Corrigi !whatsapp?.trim()
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

        // Esta é a ÚNICA declaração de formDataToInsert que deve existir
        const formDataToInsert: Omit<FormData, 'id' | 'timestamp'> = { // Se você adicionou 'status' ao DB, remova-o daqui ou inclua ele aqui.
            nomeCompleto: nomeCompleto.trim(),
            email: email.trim().toLowerCase(),
            whatsapp: whatsapp.trim(),
            assuntoDesejado: assuntoDesejado.trim(),
            termos: Boolean(termos),
            // Se você criou a coluna 'status' no DB, adicione aqui o valor inicial, por exemplo:
            // status: 'Primeiro contato',
        };

        // ... (restante do código permanece igual)
        const { data, error } = await supabase
            .from('footer_form_submissions')
            .insert([formDataToInsert])
            .select();

        if (error) {
            console.error('Erro ao salvar no Supabase:', error);
            return NextResponse.json(
                { success: false, message: 'Erro ao enviar o formulário. Tente novamente mais tarde.' },
                { status: 500 }
            );
        }

        console.log('Novo contato salvo no Supabase:', data[0]);

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