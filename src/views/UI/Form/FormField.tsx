import React from 'react';
import styles from './FormField.module.css';

interface FormInputProps {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
    id,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
}) => {
    return (
        <div className={styles.formInput}>
            <label htmlFor={id} className={styles.label}>{label}</label>  {/* Add className */}
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={styles.input}
            />
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

export default FormInput;