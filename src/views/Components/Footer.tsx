'use client';

import styles from '@/views/Components/Footer.module.css';
import FormField from '@/views/UI/Form/FormField';
import FormSelection from '@/views/UI/Form/FormSelection';
import Button from '@/views/UI/Button';
import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';

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

const Footer: React.FC = () => {
  const t = useTranslations('Footer');
  const tf = useTranslations('Footer.form');

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
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (submitMessage) setSubmitMessage(null);
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!formData.nomeCompleto?.trim()) errors.nomeCompleto = tf('nameRequired');
    if (!formData.email?.trim()) errors.email = tf('emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = tf('emailInvalid');
    if (!formData.whatsapp?.trim()) errors.whatsapp = tf('phoneRequired');
    if (!formData.assuntoDesejado?.trim()) errors.assuntoDesejado = tf('subjectRequired');
    return errors;
  };

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitMessage({ type: 'error', text: tf('errorForm') });
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.success) {
        if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
          (window as any).gtag_report_conversion();
        }
        setSubmitMessage({ type: 'success', text: result.message });
        setFormData({ nomeCompleto: '', email: '', whatsapp: '', assuntoDesejado: '', termos: false });
      } else {
        setSubmitMessage({ type: 'error', text: result.message || tf('errorForm') });
      }
    } catch {
      setSubmitMessage({ type: 'error', text: tf('errorConnection') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectOptions = [
    { value: 'site', label: tf('options.site') },
    { value: 'sistema', label: tf('options.sistema') },
    { value: 'chatbot', label: tf('options.chatbot') },
    { value: 'delivery', label: tf('options.delivery') },
    { value: 'outro', label: tf('options.outro') },
  ];

  return (
    <section className={styles.footerSection} id={contato}>
      <div className={styles.footerWrapper}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <h5>{t('contactTitle')}</h5>
            <p>{t('contactDesc')}</p>
          </div>
          <div className={styles.footerContent}>
            <form className={styles.cadastroForm} onSubmit={handleFormSubmit}>
              <div className={styles.cadastroFormFields}>
                <FormField
                  id="nomeCompleto"
                  label={tf('name')}
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={handleChange}
                  placeholder={tf('namePlaceholder')}
                  error={formErrors.nomeCompleto}
                />
              </div>
              <div className={styles.cadastroFormFields}>
                <FormField
                  id="email"
                  label={tf('email')}
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={tf('emailPlaceholder')}
                  error={formErrors.email}
                />
                <FormField
                  id="whatsapp"
                  label={tf('phone')}
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder={tf('phonePlaceholder')}
                  error={formErrors.whatsapp}
                />
              </div>
              <div className={styles.cadastroFormFields}>
                <FormSelection
                  id="assuntoDesejado"
                  label={tf('subject')}
                  value={formData.assuntoDesejado}
                  onChange={handleChange}
                  error={formErrors.assuntoDesejado}
                  placeholder={tf('options.placeholder')}
                  options={selectOptions}
                />
              </div>
              {submitMessage && (
                <div className={`${styles.submitMessage} ${styles[submitMessage.type]}`}>
                  {submitMessage.text}
                </div>
              )}
              <div className={styles.cadastroFormFields}>
                <Button variant="black" size="medium" type="submit" disabled={isSubmitting}>
                  <span>{isSubmitting ? tf('submitting') : tf('submit')}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className={styles.footerCNPJ}>
          <p>{new Date().getFullYear()}® stubborn. {t('rights')}. CNPJ: 35.446.994/0001-59</p>
          <Image src="/img/stubborn-logotipo.svg" alt="stubborn criação de sites" width={160} height={30} />
        </div>
      </div>
    </section>
  );
};

export default Footer;
