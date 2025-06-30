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
                        Soluções digitais que crescem junto com o seu negócio - com estrutura, identidade e propósito.
                    </h1>
                    <p>
                        Design, desenvolvimento e suporte contínuo em um modelo de assinatura feito para empresas que precisam evoluir com consistência e autonomia.
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