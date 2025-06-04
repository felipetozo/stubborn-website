"use client";

import { useSpring, animated } from "@react-spring/web";
import Image from "next/image";
import { useRef, useEffect, useState, useCallback } from "react";
import styles from "./Hero.module.css";
import Button from "@/views/UI/Button";
import Link from "next/link";

function Hero() {
    const inicio = "inicio";
    const heroSectionRef = useRef<HTMLElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [revealProgress, setRevealProgress] = useState(0);
    const [finalAnimationProgress, setFinalAnimationProgress] = useState(0);
    const [isInTriggerZone, setIsInTriggerZone] = useState(false);
    const [isRevealComplete, setIsRevealComplete] = useState(false);

    const handleScroll = useCallback(() => {
        if (heroSectionRef.current) {
            const { top, height } = heroSectionRef.current.getBoundingClientRect();

            // Normal scroll progress for translateY
            const newProgress = Math.min(Math.max(0, -top / height), 1);
            setScrollProgress(newProgress);

            // Check if image is in the trigger zone (around 10rem from top)
            const imageAtTriggerPoint = Math.abs(top + 160) < 200;

            if (imageAtTriggerPoint && !isInTriggerZone) {
                setIsInTriggerZone(true);
            }

            // Control reveal progress when in trigger zone
            if (isInTriggerZone) {
                // Calculate reveal based on scroll position relative to trigger zone
                const triggerTop = -80; // 10rem trigger point
                const relativeScroll = Math.max(0, triggerTop - top);
                const maxRevealDistance = 200; // Distance to fully reveal image
                const reveal = Math.min(relativeScroll / maxRevealDistance, 1);
                setRevealProgress(reveal);

                // Check if reveal is complete
                if (reveal >= 1 && !isRevealComplete) {
                    setIsRevealComplete(true);
                }

                // Final animation after reveal is complete
                if (isRevealComplete && reveal >= 1) {
                    const finalAnimationStart = maxRevealDistance;
                    const finalAnimationDistance = 300; // 3 scrolls worth of distance
                    const finalAnimationScroll = Math.max(0, relativeScroll - finalAnimationStart);
                    const finalProgress = Math.min(finalAnimationScroll / finalAnimationDistance, 1);
                    setFinalAnimationProgress(finalProgress);
                }
            }
        }
    }, [isInTriggerZone, isRevealComplete]);

    useEffect(() => {
        const scrollHandler = () => {
            handleScroll();
        };

        window.addEventListener("scroll", scrollHandler);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", scrollHandler);
        };
    }, [handleScroll]);

    // Image animation with clip-path reveal from top to bottom + final animation
    const imageSpring = useSpring({
        clipPath: `inset(0 0 ${100 - (revealProgress * 100)}% 0)`,
        transform: `translateY(${5 - scrollProgress * 5 + finalAnimationProgress * 17.5}rem) scale(${1 + finalAnimationProgress * 0.25})`,
        config: { tension: 3000, friction: 40 },
    });

    return (
        <section className={styles.HeroSection} id={inicio} ref={heroSectionRef}>
            <div className={styles.HeroSectionWrapper}>
                <div className={styles.HeroSectionContainer}>
                    <h1>
                        O ecossistema digital da sua empresa, em constante
                        evolução.
                    </h1>
                    <p>
                        Sem pacotes prontos, sem amarras. Seu ecossistema
                        digital será seguro, escalável e preparado para
                        acompanhar cada etapa do crescimento da sua empresa.
                    </p>
                    <div className={styles.buttonsFlex}>
                        <Button variant="primary" size="medium">
                            <Link
                                href="https://wa.me/5545991584114"
                                target="_blank"
                            >
                                <span>Solicitar orçamento</span>
                            </Link>
                        </Button>
                    </div>
                </div>
                <div
                    className={`${styles.HeroSectionContainer} ${styles.HeroSectionImageContainer}`}
                >
                    <animated.div
                        style={{
                            ...imageSpring,
                            display: "inline-block",
                            willChange: 'transform, clip-path',
                        }}
                    >
                        <Image
                            src="/img/stubborn-portfolio-criacao-site-01-Metal-Laran.png"
                            alt="stubborn criação de sites"
                            width={1000}
                            height={500}
                        />
                    </animated.div>
                </div>
            </div>
        </section>
    );
}

export default Hero;