import styles from '@/views/Components/Hero.module.css';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/views/UI/Button';
import { ArrowRight } from 'lucide-react';

function Hero() {
    return (
        <>
            <section className={styles.HeroSection}>
                <div className={styles.HeroSectionWrapper}>
                    <div className={styles.HeroSectionContainer}>
                        <h1>
                            O ecossistema digital da sua empresa, em constante evolução.
                        </h1>
                        <p>
                            Sem pacotes prontos, sem amarras. Seu ecossistema digital será seguro, escalável e preparado para acompanhar cada etapa do crescimento da sua empresa.
                        </p>
                        <div className={styles.buttonsFlex}>
                            <Link href="#Contato">
                                <Button variant="primary" size="medium">
                                    <span>
                                        Solicitar orçamento
                                    </span>
                                    <span>
                                        <ArrowRight />
                                    </span>
                                </Button>
                            </Link>
                            <Link href="#Trabalhos">
                                <Button variant="secondary" size="medium">
                                    <span>Conheça nossos trabalhos</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className={styles.HeroSectionContainer}>
                        <Image
                            src="/img/stubborn-portfolio-criacao-site-01.png"
                            alt="stubborn criação de sites"
                            width={1000}
                            height={500}
                        />
                    </div>
                </div>
            </section>
        </>
    );
};

export default Hero;