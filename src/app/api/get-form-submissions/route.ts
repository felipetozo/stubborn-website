// src/app/api/get-form-submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET(request: NextRequest) {
    try {
        // Busca todos os dados da tabela footer_form_submissions
        // O .order('timestamp', { ascending: false }) organiza os mais recentes primeiro
        const { data, error } = await supabase
            .from('footer_form_submissions')
            .select('*') // Seleciona todas as colunas
            .order('timestamp', { ascending: false }); // Ordena por data, do mais novo para o mais antigo

        if (error) {
            console.error('Erro ao buscar dados do Supabase:', error);
            return NextResponse.json(
                { success: false, message: 'Erro ao carregar os dados do dashboard.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Erro geral ao buscar dados:', error);
        return NextResponse.json(
            { success: false, message: 'Erro interno do servidor ao buscar dados.' },
            { status: 500 }
        );
    }
}