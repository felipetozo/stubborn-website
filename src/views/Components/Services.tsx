'use client'

import styles from '@/views/Components/Services.module.css';
import Link from 'next/link';
import Button from '@/views/UI/Button';
import { ScanSearch, Goal, SwatchBook, Gauge, Code } from 'lucide-react';

function Services() {
    const sobre = 'sobre';
    return (
        <>
            <section className={styles.processSection} id={sobre}>
                <div className={styles.processWrapper}>
                    <div className={styles.processHeader}>
                        <h2>
                            Experências digitais sob medida para marcas que querem evoluir com consistência.
                        </h2>
                        <p>
                            Construímos e evoluímos soluções digitais de forma contínua, unindo design,
                            desenvolvimento e suporte para acompanhar o crescimento da sua empresa.
                        </p>
                    </div>
                    <div className={styles.servicesBlocks}>
                        <div className={styles.servicesBlock}>
                            <SwatchBook
                                width={60}
                                height={60}
                                strokeWidth={1}
                                className={styles.blueText}
                            />
                            <h3>
                                Design de interface e experiência do usuário
                            </h3>
                            <p>
                                Layouts originais, funcionais e centrados na experiência.
                                Criamos interfaces sob medida que traduzem sua marca em design e geram resultado real.
                            </p>
                        </div>
                        <div className={styles.servicesBlock}>
                            <Code
                                width={60}
                                height={60}
                                strokeWidth={1}
                                className={styles.blueText}
                            />
                            <h3>
                                Desenvolvimento de sites e sistemas web
                            </h3>
                            <p>
                                Sites e web apps rápidos, responsivos e escaláveis.
                                Cuidamos da parte técnica para que sua ideia ganhe forma com performance, segurança e solidez.
                            </p>
                        </div>
                        <div className={styles.servicesBlock}>
                            <Gauge
                                width={60}
                                height={60}
                                strokeWidth={1}
                                className={styles.blueText}
                            />
                            <h3>
                                Manutenção e suporte contínuo
                            </h3>
                            <p>
                                Atualizações, correções, melhorias contínuas.
                                Garantimos que tudo funcione sempre bem — com suporte ágil e atenção aos detalhes.
                            </p>
                        </div>
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
                    <div className={styles.buttonsFlex}>
                        <Button variant="primary" size="medium">
                            <Link href="https://wa.me/5545991584114" target="_blank">
                                <span>
                                    Solicitar orçamento
                                </span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Services;