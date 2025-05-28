// src/app/api/submit-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface FormData {
    nomeCompleto: string;
    email: string;
    whatsapp: string;
    assuntoDesejado: string;
    termos: boolean;
    timestamp: string;
    id: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nomeCompleto, email, whatsapp, assuntoDesejado, termos } = body;

        // Validação básica
        if (!nomeCompleto?.trim() || !email?.trim() || !whatsapp?.trim() || !assuntoDesejado?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: 'E-mail inválido' },
                { status: 400 }
            );
        }

        // Criar dados do formulário com timestamp e ID único
        const formData: FormData = {
            nomeCompleto: nomeCompleto.trim(),
            email: email.trim().toLowerCase(),
            whatsapp: whatsapp.trim(),
            assuntoDesejado: assuntoDesejado.trim(),
            termos: Boolean(termos),
            timestamp: new Date().toISOString(),
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };

        // Caminho do arquivo JSON
        const jsonPath = path.join(process.cwd(), 'src/storage/footerForm.json');

        try {
            // Criar diretório se não existir
            const storageDir = path.dirname(jsonPath);
            await fs.mkdir(storageDir, { recursive: true });

            // Ler dados existentes ou criar array vazio
            let existingData: FormData[] = [];
            try {
                const fileContent = await fs.readFile(jsonPath, 'utf8');
                existingData = JSON.parse(fileContent);

                // Verificar se é um array válido
                if (!Array.isArray(existingData)) {
                    existingData = [];
                }
            } catch (readError) {
                // Arquivo não existe ou está corrompido, começar com array vazio
                console.log('Criando novo arquivo de dados:', readError);
                existingData = [];
            }

            // Adicionar novo envio
            existingData.push(formData);

            // Salvar no arquivo
            await fs.writeFile(jsonPath, JSON.stringify(existingData, null, 2), 'utf8');

            console.log('Novo contato salvo:', {
                id: formData.id,
                email: formData.email,
                timestamp: formData.timestamp
            });

            return NextResponse.json({
                success: true,
                message: 'Formulário enviado com sucesso! Entraremos em contato em breve.',
            });

        } catch (fileError) {
            console.error('Erro ao manipular arquivo:', fileError);

            // Fallback: apenas log no console se não conseguir salvar
            console.log('CONTATO RECEBIDO (não salvo):', formData);

            return NextResponse.json({
                success: true,
                message: 'Formulário enviado com sucesso! Entraremos em contato em breve.',
            });
        }

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

// Opcional: Função para limpar dados antigos (executar periodicamente)
async function cleanupOldData() {
    try {
        const jsonPath = path.join(process.cwd(), 'src/storage/footerForm.json');
        const fileContent = await fs.readFile(jsonPath, 'utf8');
        const data: FormData[] = JSON.parse(fileContent);

        // Manter apenas dados dos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const filteredData = data.filter(item =>
            new Date(item.timestamp) > thirtyDaysAgo
        );

        if (filteredData.length !== data.length) {
            await fs.writeFile(jsonPath, JSON.stringify(filteredData, null, 2), 'utf8');
            console.log(`Limpeza realizada: ${data.length - filteredData.length} registros removidos`);
        }
    } catch (error) {
        console.error('Erro na limpeza dos dados:', error);
    }
}