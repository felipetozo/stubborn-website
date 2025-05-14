import styles from '@/views/Components/Process.module.css';
import { ScanSearch, Goal, Code } from 'lucide-react';

function Process() {
    return (
        <>
            <section className={styles.processSection}>
                <div className={styles.processWrapper}>
                    <div className={styles.processHeader}>
                        <h2>
                            Crafting long <span className={styles.blueText}>-</span> lasting experiences
                        </h2>
                        <p>
                            Mais do que um site. Uma operação digital completa - feita para durar. Mensalidade fixa. Sem amarras, sem fórmulas prontas. Você traz o cenário, nós desenhamos o plano: Site, CRM, integrações, notificações, coleta de dados, automações, dashboard - tudo no seu ritmo, no tempo certo, com visão de longo prazo. É simples: Você continua no controle. Nós garantimos que tudo funcione, evolua e escale.
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
                                Análise inicial
                            </h3>
                            <p>
                                Easily adapt to changes and scale your operations with our flexible infrastructure, designed to support your business growth and evolving requirements. Core features that set us apart from the competition.
                            </p>

                        </div>
                        <div className={styles.processGridItem}>
                            <Goal
                                width={60}
                                height={60}
                                strokeWidth={1}
                                className={styles.blueText}
                            />
                            <h3>
                                Planejamento das ações
                            </h3>
                            <p>
                                Easily adapt to changes and scale your operations with our flexible infrastructure, designed to support your business growth and evolving requirements. Core features that set us apart from the competition.
                            </p>

                        </div>
                        <div className={styles.processGridItem}>
                            <Code
                                width={60}
                                height={60}
                                strokeWidth={1}
                                className={styles.blueText}
                            />
                            <h3>
                                Desenvolvimento
                            </h3>
                            <p>
                                Easily adapt to changes and scale your operations with our flexible infrastructure, designed to support your business growth and evolving requirements. Core features that set us apart from the competition.
                            </p>

                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Process;