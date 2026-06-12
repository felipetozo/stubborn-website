'use client';

import Image from 'next/image';
import styles from './Hero.module.css';
import Button from '@/views/UI/Button';
import { TbCalendarClock } from 'react-icons/tb';
import { useTranslations } from 'next-intl';

function Hero() {
  const t = useTranslations('Hero');

  return (
    <section className={styles.HeroSection}>
      <div className={styles.HeroSectionWrapper}>
        <div className={styles.HeroSectionContainer}>
          <span className={styles.eyebrow}>{t('eyebrow')}</span>
          <h1>{t('title')}</h1>
          <p className={styles.heroDescription}>{t('description')}</p>
          <div className={styles.buttonsFlex}>
            <Button variant="primary" size="medium">
              <a href="https://wa.me/5545991584114" target="_blank" rel="noreferrer">
                <TbCalendarClock size={20} aria-hidden />
                <span>{t('cta')}</span>
              </a>
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
