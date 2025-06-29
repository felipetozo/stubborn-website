// src/views/Sections/Hero.tsx - Seção Hero com imagem estática

"use client";

import Image from "next/image";
import styles from "./Hero.module.css";
import Button from "@/views/UI/Button";
import Link from "next/link";

function Hero() {
    return (
        <section className={styles.HeroSection}>
            <div className={styles.HeroSectionWrapper}>
                <div className={styles.HeroSectionContainer}>
                    <h1>
                        O ecossistema digital da sua empresa, em constante evolução.
                    </h1>
                    <p>
                        Sem pacotes prontos, sem amarras. Seu ecossistema
                        digital será seguro, escalável e preparado para
                        acompanhar cada etapa do crescimento da sua empresa.
                    </p>
                    <div className={styles.buttonsFlex}>
                        <Button variant="primary" size="medium">
                            <Link href="https://wa.me/5545991584114" target="_blank">
                                <span>Solicitar orçamento</span>
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