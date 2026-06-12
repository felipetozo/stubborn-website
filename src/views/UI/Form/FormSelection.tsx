'use client';

import React from 'react';
import styles from './FormField.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectionProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  placeholder?: string;
  options?: SelectOption[];
}

const defaultOptions: SelectOption[] = [
  { value: 'site', label: 'Criação de site corporativo, institucional ou landing page' },
  { value: 'sistema', label: 'Sistema interno, CRM ou Web App' },
  { value: 'chatbot', label: 'Chatbot com Inteligência Artificial' },
  { value: 'delivery', label: 'Sistema para Delivery ou Agendamento' },
  { value: 'outro', label: 'Outro' },
];

const FormSelection: React.FC<FormSelectionProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = 'Selecione o assunto',
  options = defaultOptions,
}) => {
  return (
    <div className={styles.formInput}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <select id={id} name={id} value={value} onChange={onChange} className={styles.input}>
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default FormSelection;
