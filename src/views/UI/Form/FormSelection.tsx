'use client';

import React from 'react';
import styles from './FormField.module.css';

interface FormSelectionProps {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    error?: string;
}

const FormSelection: React.FC<FormSelectionProps> = ({
    id,
    label,
    value,
    onChange,
    error
}) => {
    return (
        <div className={styles.formInput}>
            <label htmlFor={id} className={styles.label}>{label}</label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                className={styles.input}
            >
                <option value="" disabled>Selecione o assunto</option>
                <option value="site">Criação de site</option>
                <option value="sistema">Sistema interno</option>
                <option value="diagnostico">Diagnóstico de maturidade</option>
                <option value="manutencao">Manutenção e evolução</option>
                <option value="outro">Outro</option>
            </select>
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

export default FormSelection;
