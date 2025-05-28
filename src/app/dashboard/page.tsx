// src/app/dashboard/page.tsx
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
    status: string; // Adicione esta linha
}

// ... (restante do código do DashboardPage)