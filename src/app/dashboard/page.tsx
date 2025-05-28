'use client';

import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';

interface FormData {
    id: string;
    nomeCompleto: string;
    email: string;
    whatsapp: string;
    assuntoDesejado: string;
    termos: boolean;
    timestamp: string;
    status: string;
}

// Remova : React.FC
const DashboardPage = () => {
    const [submissions, setSubmissions] = useState<FormData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/get-form-submissions');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.success) {
                    setSubmissions(result.data);
                } else {
                    setError(result.message || 'Erro ao carregar os dados.');
                }
            } catch (err: any) {
                console.error('Erro ao buscar dados do dashboard:', err);
                setError(err.message || 'Falha na conexão com o servidor.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className={styles.dashboardContainer}>Carregando dados...</div>;
    }

    if (error) {
        return <div className={styles.dashboardContainer} style={{ color: 'red' }}>Erro: {error}</div>;
    }

    return (
        <div className={styles.dashboardContainer}>
            <h1>Dashboard de Contatos</h1>
            <div className={styles.cardsGrid}>
                {submissions.length === 0 ? (
                    <p>Nenhum contato encontrado.</p>
                ) : (
                    submissions.map((submission) => (
                        <div key={submission.id} className={styles.card}>
                            <h3>{submission.nomeCompleto}</h3>
                            <p>Email: {submission.email}</p>
                            <p>WhatsApp: {submission.whatsapp}</p>
                            <p>Assunto: {submission.assuntoDesejado}</p>
                            <p>Termos aceitos: {submission.termos ? 'Sim' : 'Não'}</p>
                            <p>Data: {new Date(submission.timestamp).toLocaleDateString()} {new Date(submission.timestamp).toLocaleTimeString()}</p>
                            <p>Status: <span className={styles.statusBadge}>{submission.status || 'Primeiro contato'}</span></p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DashboardPage;