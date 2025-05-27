// src/app/api/submit-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
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
        if (!nomeCompleto || !email || !whatsapp || !assuntoDesejado) {
            return NextResponse.json(
                { success: false, message: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        // Criar dados do formulário com timestamp e ID único
        const formData: FormData = {
            nomeCompleto,
            email,
            whatsapp,
            assuntoDesejado,
            termos,
            timestamp: new Date().toISOString(),
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };

        // Salvar no JSON
        const jsonPath = path.join(process.cwd(), 'src/storage/footerForm.json');

        // Criar diretório se não existir
        const storageDir = path.dirname(jsonPath);
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        // Ler dados existentes ou criar array vazio
        let existingData: FormData[] = [];
        if (fs.existsSync(jsonPath)) {
            const fileContent = fs.readFileSync(jsonPath, 'utf8');
            existingData = JSON.parse(fileContent);
        }

        // Adicionar novo envio
        existingData.push(formData);

        // Salvar no arquivo
        fs.writeFileSync(jsonPath, JSON.stringify(existingData, null, 2));

        console.log('Novo contato salvo:', formData);

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