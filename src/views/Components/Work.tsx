import styles from '@/views/Components/Work.module.css';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function Work() {
    return (
        <>
            <section className={styles.workSection}>
                <div className={styles.workWrapper}>
                    <div className={styles.workHeader}>
                        <h2>
                            Crafting long <span className={styles.blueText}>-</span> lasting experiences
                        </h2>
                        <p>
                            Mais do que um site. Uma operação digital completa - feita para durar. Mensalidade fixa. Sem amarras, sem fórmulas prontas. Você traz o cenário, nós desenhamos o plano: Site, CRM, integrações, notificações, coleta de dados, automações, dashboard - tudo no seu ritmo, no tempo certo, com visão de longo prazo. É simples: Você continua no controle. Nós garantimos que tudo funcione, evolua e escale.
                        </p>
                    </div>
                    <div className={styles.workGrid}>
                        <div className={styles.workGridItem}>
                            <Link
                                href="https://www.metallaran.com.br"
                                target="_blank"
                            >
                                <Image
                                    src="/img/stubborn-portfolio-criacao-site-01.png"
                                    alt="stubborn criação de sites"
                                    width={1000}
                                    height={500}
                                />
                                <div className={styles.workGridItemContent}>
                                    <span>
                                        <ExternalLink
                                            width={24}
                                            height={24}
                                            strokeWidth={1}
                                            className={styles.blueText}
                                        />
                                    </span>
                                    Metal Laran - webSite
                                </div>
                            </Link>
                        </div>
                        <div className={styles.workGridItem}>
                            <Link
                                href="https://www.metallaran.com.br"
                                target="_blank"
                            >
                                <Image
                                    src="/img/stubborn-portfolio-criacao-site-01.png"
                                    alt="stubborn criação de sites"
                                    width={1000}
                                    height={500}
                                />
                                <div className={styles.workGridItemContent}>
                                    <span>
                                        <ExternalLink
                                            width={24}
                                            height={24}
                                            strokeWidth={1}
                                            className={styles.blueText}
                                        />
                                    </span>
                                    Metal Laran - webSite
                                </div>
                            </Link>
                        </div>
                        <div className={styles.workGridItem}>
                            <Link
                                href="https://www.metallaran.com.br"
                                target="_blank"
                            >
                                <Image
                                    src="/img/stubborn-portfolio-criacao-site-01.png"
                                    alt="stubborn criação de sites"
                                    width={1000}
                                    height={500}
                                />
                                <div className={styles.workGridItemContent}>
                                    <span>
                                        <ExternalLink
                                            width={24}
                                            height={24}
                                            strokeWidth={1}
                                            className={styles.blueText}
                                        />
                                    </span>
                                    Metal Laran - webSite
                                </div>
                            </Link>
                        </div>
                        <div className={styles.workGridItem}>
                            <Link
                                href="https://www.metallaran.com.br"
                                target="_blank"
                            >
                                <Image
                                    src="/img/stubborn-portfolio-criacao-site-01.png"
                                    alt="stubborn criação de sites"
                                    width={1000}
                                    height={500}
                                />
                                <div className={styles.workGridItemContent}>
                                    <span>
                                        <ExternalLink
                                            width={24}
                                            height={24}
                                            strokeWidth={1}
                                            className={styles.blueText}
                                        />
                                    </span>
                                    Metal Laran - webSite
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section >
        </>
    );
};

export default Work;