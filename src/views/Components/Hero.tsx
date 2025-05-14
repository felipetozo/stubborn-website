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
                            Sua presença digital, evoluindo com inteligência e liberdade.
                        </h1>
                        <p>
                            Assine uma solução viva, que cresce com sua empresa. Em vez de projetos isolados, oferecemos visão de longo prazo, entregas mensais e evolução constante - tudo no seu tempo, com total liberdade.
                        </p>
                        <div className={styles.buttonsFlex}>
                            <Link href="#Contato">
                                <Button variant="primary" size="medium">
                                    <span>Solicitar contato</span>
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