'use client'

import styles from '@/views/Components/Process.module.css';
import Link from 'next/link';
import Button from '@/views/UI/Button';
import { ScanSearch, Goal, Code } from 'lucide-react';

function Process() {
    const sobre = 'sobre';
    return (
        <>
            <section className={styles.processSection} id={sobre}>
                <div className={styles.processWrapper}>
                    <div className={styles.processHeader}>
                        <h2>
                            Mais que serviços, uma parceria estratégica
                            para evoluir o digital da sua empresa
                        </h2>
                        <p>
                            Somos mais que uma simlpes prestação de serviços: somos sua equipe digital estendida, focada
                            em evolução contínua. Cuidamos da sua estrutura online com inteligência e consistência, desde
                            sites até CRM's, até dashboard e integrações, para que sua empresa escale com liberdade,
                            obtendo resultados sustentáveis e livre de retrabalho.
                        </p>
                    </div>
                    <div className={styles.processServices}>
                        <ul>
                            <li>
                                Websites
                            </li>
                            <li>
                                Landing Pages
                            </li>
                            <li>
                                Web App's
                            </li>
                            <li>
                                Lojas Online / E-Commerce
                            </li>
                            <li>
                                Portais Internos
                            </li>
                            <li>
                                Newsletters
                            </li>
                            <li>
                                Sistemas de Agendamento
                            </li>
                            <li>
                                Buscador Inteligente com IA
                            </li>
                            <li>
                                Integrações e API's
                            </li>
                            <li>
                                Chatbot com IA
                            </li>
                            <li>
                                Sistemas de Delivery
                            </li>
                        </ul>
                    </div>
                    <div className={styles.processHeader}>
                        <p>
                            Nosso processo é transparente e colaborativo, focado em entregas contínuas que impulsionam
                            sua evolução digital. Do diagnóstico inicial e planejamento estratégico, passando pelo design e
                            desenvolvimento ágil das soluções, até o lançamento e acompanhamento constante, garantimos
                            que cada passo agregue valor real e prepare seu negócio para o futuro.
                        </p>
                    </div>
                    <div className={styles.processGrid}>
                        <div className={styles.processGridItem}>
                            <ScanSearch
                                width={60}
                                height={60}
                                strokeWidth={1}
                                className={styles.blueText}
                            />
                            <h3>
                                Análise Inicial e Planejamento Estratégico
                            </h3>

                        </div>
                        <div className={styles.processGridItem}>
                            <Code
                                width={60}
                                height={60}
                                strokeWidth={1}
                                className={styles.blueText}
                            />
                            <h3>
                                Design e Desenvolvimento
                            </h3>

                        </div>
                        <div className={styles.processGridItem}>
                            <Goal
                                width={60}
                                height={60}
                                strokeWidth={1}
                                className={styles.blueText}
                            />
                            <h3>
                                Lançamento e Revisões
                            </h3>
                        </div>
                    </div>
                    <div className={styles.buttonsFlex}>
                        <Link href="https://wa.me/5545991584114" target="_blank">
                            <Button variant="primary" size="medium">
                                <span>
                                    Solicitar orçamento
                                </span>
                            </Button>
                        </Link>
                        <div className={styles.vagasDisponiveis}>
                            <span className={styles.vagasDotBack}>
                                <span className={styles.vagasDot}>
                                </span>
                            </span>
                            <span>
                                2 vagas disponíveis!
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Process;