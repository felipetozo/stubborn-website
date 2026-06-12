'use client';

import styles from '@/views/Components/Services.module.css';
import Button from '@/views/UI/Button';
import { SwatchBook, Gauge, Code } from 'lucide-react';
import { useTranslations } from 'next-intl';

function Services() {
  const t = useTranslations('Services');

  return (
    <section className={styles.processSection} id="sobre">
      <div className={styles.processWrapper}>
        <div className={styles.processHeader}>
          <h2>{t('heading')}</h2>
          <p>{t('subheading')}</p>
        </div>
        <div className={styles.servicesBlocks}>
          <div className={styles.servicesBlock}>
            <SwatchBook width={60} height={60} strokeWidth={1} className={styles.blueText} />
            <h3>{t('card1Title')}</h3>
            <p>{t('card1Desc')}</p>
          </div>
          <div className={styles.servicesBlock}>
            <Code width={60} height={60} strokeWidth={1} className={styles.blueText} />
            <h3>{t('card2Title')}</h3>
            <p>{t('card2Desc')}</p>
          </div>
          <div className={styles.servicesBlock}>
            <Gauge width={60} height={60} strokeWidth={1} className={styles.blueText} />
            <h3>{t('card3Title')}</h3>
            <p>{t('card3Desc')}</p>
          </div>
        </div>
        <div className={styles.processServices}>
          <ul>
            {(['websites', 'landingPages', 'webApps', 'ecommerce', 'portaisInternos', 'newsletters', 'agendamento', 'buscadorIA', 'integracoes', 'chatbot', 'delivery'] as const).map((key) => (
              <li key={key}>{t(`items.${key}`)}</li>
            ))}
          </ul>
        </div>
        <div className={styles.buttonsFlex}>
          <Button variant="primary" size="medium">
            <a href="https://wa.me/5545991584114" target="_blank" rel="noreferrer">
              <span>{t('cta')}</span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Services;
