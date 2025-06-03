'use client';

import styles from '@/views/Components/Footer.module.css';
import Link from 'next/link';
import FormField from '@/views/UI/Form/FormField';
import FormSelection from '@/views/UI/Form/FormSelection';
import Button from '@/views/UI/Button';
import Image from 'next/image';
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

const Footer: React.FC<FooterProps> = ({
  formData: externalFormData,
  formErrors: externalFormErrors,
  handleChange: externalHandleChange,
  handleSubmit: externalHandleSubmit
}) => {
  const contato = 'Contato';
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    email: '',
    whatsapp: '',
    assuntoDesejado: '',
    termos: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));

    // Limpar erro do campo quando usuário começar a digitar
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Limpar mensagem de submit quando usuário modificar o formulário
    if (submitMessage) {
      setSubmitMessage(null);
    }

    if (externalHandleChange) {
      externalHandleChange(e);
    }
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    const currentFormData = externalFormData || formData;

    if (!currentFormData.nomeCompleto?.trim()) {
      errors.nomeCompleto = 'Nome completo é obrigatório';
    }
    if (!currentFormData.email?.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentFormData.email)) {
      errors.email = 'E-mail inválido';
    }
    if (!currentFormData.whatsapp?.trim()) {
      errors.whatsapp = 'WhatsApp é obrigatório';
    }
    if (!currentFormData.assuntoDesejado?.trim()) {
      errors.assuntoDesejado = 'Assunto é obrigatório';
    }

    return errors;
  };

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    console.log('=== DEBUG FORM SUBMIT ===');
    console.log('Form data:', externalFormData || formData);

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      console.log('Validation errors:', errors);
      setSubmitMessage({
        type: 'error',
        text: 'Por favor, corrija os erros no formulário.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const dataToSubmit = externalFormData || formData;
      console.log('Submitting data:', dataToSubmit);
      console.log('API URL:', '/api/submit-form');

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Response result:', result);

      if (result.success) {
        // Conversão do Google Ads se disponível
        if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
          (window as any).gtag_report_conversion();
        }

        setSubmitMessage({
          type: 'success',
          text: result.message
        });

        // Limpar formulário após sucesso
        if (!externalFormData) {
          setFormData({
            nomeCompleto: '',
            email: '',
            whatsapp: '',
            assuntoDesejado: '',
            termos: false,
          });
        }

        console.log('Form submitted successfully:', dataToSubmit);

        if (externalHandleSubmit) {
          externalHandleSubmit(event);
        }
      } else {
        setSubmitMessage({
          type: 'error',
          text: result.message || 'Erro ao enviar formulário. Tente novamente.'
        });
      }
    } catch (error: any) {
      console.error('=== FETCH ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);

      setSubmitMessage({
        type: 'error',
        text: 'Erro de conexão. Verifique sua internet e tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
      console.log('=== END DEBUG ===');
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
                  type="email"
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

              {/* Mensagem de sucesso/erro */}
              {submitMessage && (
                <div className={`${styles.submitMessage} ${styles[submitMessage.type]}`}>
                  {submitMessage.text}
                </div>
              )}

              <div className={styles.cadastroFormFields}>
                <Button
                  variant="black"
                  size="medium"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className={styles.footerCNPJ}>
          <p>
            {new Date().getFullYear()}® stubborn. Todos direitos reservados. CNPJ: 35.446.994/0001-59
          </p>
          <Image
            src="/img/stubborn-logotipo.svg"
            alt="stubborn criação de sites"
            width={160}
            height={30}
          />
        </div>
      </div>
    </section>
  );
};

export default Footer;