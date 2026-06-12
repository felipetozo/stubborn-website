// src/views/Sections/Hero.tsx - Seção Hero com imagem estática

"use client";

import Image from "next/image";
import styles from "./Hero.module.css";
import Button from "@/views/UI/Button";
import Link from "next/link";
import { TbCalendarClock } from "react-icons/tb";

function Hero() {
    return (
        <section className={styles.HeroSection}>
            <div className={styles.HeroSectionWrapper}>
                <div className={styles.HeroSectionContainer}>
                    <span className={styles.eyebrow}>Painel + Agência. Tudo em uma assinatura.</span>
                    <h1>
                        Seu negócio organizado, crescendo e com alguém olhando junto.
                    </h1>
                    <p className={styles.heroDescription}>
                        A Stubborn combina um painel completo com IA e os serviços de uma agência de marketing. Em planos que crescem com você, do básico ao integral.
                    </p>
                    <div className={styles.buttonsFlex}>
                        <Button variant="primary" size="medium">
                            <Link href="https://wa.me/5545991584114" target="_blank">
                                <TbCalendarClock size={20} aria-hidden />
                                <span>Agendar Call</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className={styles.pinnedImageContainer}>
                    <Image
                        src="/img/stubborn-portfolio-criacao-site-01-Metal-Laran.png"
                        alt="Exemplo de projeto de site da Stubborn"
                        layout="fill"
                        objectFit="cover"
                        priority
                    />
                </div>
            </div>
        </section>
    );
}

export default Hero;