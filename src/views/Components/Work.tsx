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
                            Mais do que projetos, ativos vivos. Pensados
                            para evoluir com cada empresa.
                        </h2>
                        <p>
                            Nossa entrega não é um fim, mas sempre um começo. Acreditamos em soluções que crescem
                            junto com a sua empresa - cada entrega é parte da sua função digital.
                        </p>
                    </div>
                    <div className={styles.workGrid}>
                        <div className={styles.workGridItem}>
                            <Link
                                href="https://www.metallaran.com.br"
                                target="_blank"
                            >
                                <Image
                                    src="/img/stubborn-portfolio-criacao-site-01-Metal-Laran.png"
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
                                href="https://www.talmak.com.br"
                                target="_blank"
                            >
                                <Image
                                    src="/img/stubborn-portfolio-criacao-site-02-Talmak.png"
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
                                    Talmak Solutions - webSite
                                </div>
                            </Link>
                        </div>
                        <div className={styles.workGridItem}>
                            <Link
                                href="https://www.easycorten.com.br"
                                target="_blank"
                            >
                                <Image
                                    src="/img/stubborn-portfolio-criacao-site-03-EasyCorten.png"
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
                                    Easy Corten - webSite / eCommerce
                                </div>
                            </Link>
                        </div>
                        <div className={styles.workGridItem}>
                            <Link
                                href="https://www.palpitagem.com.br"
                                target="_blank"
                            >
                                <Image
                                    src="/img/stubborn-portfolio-criacao-site-04-Palpitagem.png"
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
                                    Palpitagem FC - webSite
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