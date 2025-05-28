import styles from '@/views/Components/Hero.module.css';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/views/UI/Button';

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
                            <Link href="https://wa.me/5545991584114" target="_blank">
                                <Button variant="primary" size="medium">
                                    <span>
                                        Solicitar orçamento
                                    </span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className={styles.HeroSectionContainer}>
                        <Image
                            src="/img/stubborn-portfolio-criacao-site-01-Metal-Laran.png"
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