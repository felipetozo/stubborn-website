// src/app/api/submit-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Importa o cliente Supabase

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
}

export async function POST(request: NextRequest) {
    try {
        const formDataToInsert: Omit<FormData, 'id' | 'timestamp' | 'status'> = { // Adicione 'status' aqui se for padrao
            // ... seus campos existentes
            // status: 'Primeiro contato', // Adicione esta linha
        };
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

        // Prepara os dados para inserção no Supabase.
        // 'id' e 'timestamp' são omitidos pois serão gerados pelo banco de dados.
        const formDataToInsert: Omit<FormData, 'id' | 'timestamp'> = {
            nomeCompleto: nomeCompleto.trim(),
            email: email.trim().toLowerCase(),
            whatsapp: whatsapp.trim(),
            assuntoDesejado: assuntoDesejado.trim(),
            termos: Boolean(termos),
        };

        // Insere os dados na tabela 'footer_form_submissions' do Supabase
        const { data, error } = await supabase
            .from('footer_form_submissions') // Nome da tabela que você criou no Supabase
            .insert([formDataToInsert])
            .select(); // Retorna os dados inseridos (opcional, mas útil para logs)

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