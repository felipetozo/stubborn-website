'use client';

import styles from '@/views/Components/Footer.module.css';
import Link from 'next/link';
import FormField from '@/views/UI/Form/FormField';
import FormSelection from '@/views/UI/Form/FormSelection';
import Button from '@/views/UI/Button';
import { FormEvent, useState } from 'react';

interface FormData {
  nomeCompleto: string;
  email: string;
  whatsapp: string;
  assuntoDesejado: string;
  termos: boolean;
}

interface FormErrors {
  nomeCompleto?: string;
  email?: string;
  whatsapp?: string;
  assuntoDesejado?: string;
  termos?: string;
}

interface FooterProps {
  formData?: FormData;
  formErrors?: FormErrors;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit?: (event: React.FormEvent) => void;
}

const Footer: React.FC<FooterProps> = ({ formData: externalFormData, formErrors: externalFormErrors, handleChange: externalHandleChange, handleSubmit: externalHandleSubmit }) => {
  const contato = 'Contato';
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    email: '',
    whatsapp: '',
    assuntoDesejado: '',
    termos: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (externalHandleChange) {
      externalHandleChange(e);
    }
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!formData.nomeCompleto) errors.nomeCompleto = 'Nome completo é obrigatório';
    if (!formData.email) errors.email = 'E-mail é obrigatório';
    if (!formData.whatsapp) errors.whatsapp = 'Whatsapp é obrigatório';
    if (!formData.assuntoDesejado) errors.assuntoDesejado = 'Assunto é obrigatório';
    return errors;
  };

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (typeof window !== 'undefined' && window.gtag_report_conversion) {
        window.gtag_report_conversion();
      }
      console.log('Form submitted:', formData);
      if (externalHandleSubmit) {
        externalHandleSubmit(event);
      }
    }
  };

  return (
    <section className={styles.footerSection} id={contato}>
      <div className={styles.footerWrapper}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <h5>Entre em contato</h5>
            <p>
              Tem um projeto em mente? Vamos colocá-lo no mundo juntos. Preencha o formulário e entraremos em contato em breve.
            </p>
          </div>
          <div className={styles.footerContent}>
            <form className={styles.cadastroForm} onSubmit={handleFormSubmit}>
              <div className={styles.cadastroFormFields}>
                <FormField
                  id="nomeCompleto"
                  label="Nome completo"
                  type="text"
                  value={externalFormData?.nomeCompleto ?? formData.nomeCompleto}
                  onChange={handleChange}
                  placeholder="Introduza seu nome completo"
                  error={externalFormErrors?.nomeCompleto ?? formErrors.nomeCompleto}
                />
              </div>
              <div className={styles.cadastroFormFields}>
                <FormField
                  id="email"
                  label="E-mail"
                  type="text"
                  value={externalFormData?.email ?? formData.email}
                  onChange={handleChange}
                  placeholder="Introduza seu e-mail"
                  error={externalFormErrors?.email ?? formErrors.email}
                />
                <FormField
                  id="whatsapp"
                  label="Telefone / Whatsapp"
                  type="tel"
                  value={externalFormData?.whatsapp ?? formData.whatsapp}
                  onChange={handleChange}
                  placeholder="Introduza seu Whatsapp"
                  error={externalFormErrors?.whatsapp ?? formErrors.whatsapp}
                />
              </div>
              <div className={styles.cadastroFormFields}>
                <FormSelection
                  id="assuntoDesejado"
                  label="Assunto"
                  value={externalFormData?.assuntoDesejado ?? formData.assuntoDesejado}
                  onChange={handleChange}
                  error={externalFormErrors?.assuntoDesejado ?? formErrors.assuntoDesejado}
                />
              </div>
              <div className={styles.cadastroFormFields}>
                <Button variant="primary" size="medium" type="submit">
                  <span>Enviar solicitação</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className={styles.footerCNPJ}>
          <p>
            2025® stubborn. Todos direitos reservados. CNPJ: 35.446.994/0001-59
          </p>
        </div>
      </div>
    </section>
  );
};

export default Footer;