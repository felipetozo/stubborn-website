'use client';

import styles from '@/views/Components/Footer.module.css';
import Link from 'next/link';
import FormField from '@/views/UI/Form/FormField';
import FormSelection from '@/views/UI/Form/FormSelection';
import Button from '@/views/UI/Button';

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

function Footer({ formData, formErrors, handleChange, handleSubmit }: FooterProps) {
    return (
        <section className={styles.footerSection}>
            <div className={styles.footerWrapper}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerContent}>
                        <h5>Get in touch</h5>
                        <p>
                            Possui um projeto em mente? Vamos colocá-lo no mundo juntos. Deixe suas informações de contato no formulário que logo entraremos em contato.
                        </p>
                    </div>
                    <div className={styles.footerContent}>
                        <form className={styles.cadastroForm} onSubmit={handleSubmit ?? (() => { })}>
                            <div className={styles.cadastroFormFields}>
                                <FormField
                                    id="nomeCompleto"
                                    label="Nome completo"
                                    type="text"
                                    value={formData?.nomeCompleto ?? ''}
                                    onChange={handleChange ?? (() => { })}
                                    placeholder="Introduza seu nome completo"
                                    error={formErrors?.nomeCompleto}
                                />
                            </div>
                            <div className={styles.cadastroFormFields}>
                                <FormField
                                    id="email"
                                    label="E-mail"
                                    type="text"
                                    value={formData?.email ?? ''}
                                    onChange={handleChange ?? (() => { })}
                                    placeholder="Introduza seu e-mail"
                                    error={formErrors?.email}
                                />
                                <FormField
                                    id="whatsapp"
                                    label="Telefone / Whatsapp"
                                    type="tel"
                                    value={formData?.whatsapp ?? ''}
                                    onChange={handleChange ?? (() => { })}
                                    placeholder="Introduza seu Whatsapp"
                                    error={formErrors?.whatsapp}
                                />
                            </div>
                            <div className={styles.cadastroFormFields}>
                                <FormSelection
                                    id="assuntoDesejado"
                                    label="Assunto"
                                    value={formData?.assuntoDesejado ?? ''}
                                    onChange={handleChange ?? (() => { })}
                                    error={formErrors?.assuntoDesejado}
                                />
                            </div>
                            <div className={styles.cadastroFormFields}>
                                <Link href="#">
                                    <Button variant="primary" size="medium">
                                        <span>Enviar solicitação</span>
                                    </Button>
                                </Link>
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
}

export default Footer;
