'use client';

import styles from '@/views/Components/NavBar.module.css';
import { Link, useRouter, usePathname } from '@/navigation';
import Image from 'next/image';
import Button from '@/views/UI/Button';
import { TbCalendarClock } from 'react-icons/tb';
import { IoGlobeOutline } from 'react-icons/io5';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

const locales = [
  { code: 'pt-BR', label: 'Português', short: 'PT' },
  { code: 'en-GB', label: 'English',   short: 'EN' },
  { code: 'es-ES', label: 'Español',   short: 'ES' },
] as const;

function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(code: string) {
    router.replace(pathname, { locale: code });
    setOpen(false);
  }

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <div className={styles.langSwitcher} ref={ref}>
      <button className={styles.langTrigger} onClick={() => setOpen((v) => !v)} aria-label="Selecionar idioma">
        <IoGlobeOutline size={18} />
      </button>
      <ul className={`${styles.langDropdown} ${open ? styles.langDropdownOpen : ''}`}>
        {locales.map((l) => (
          <li key={l.code}>
            <button
              className={`${styles.langOption} ${l.code === locale ? styles.langOptionActive : ''}`}
              onClick={() => switchLocale(l.code)}
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavBar() {
  const t = useTranslations('Nav');

  const handleConversionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.gtag_report_conversion) {
      window.gtag_report_conversion();
      const contactSection = document.querySelector('#Contato');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <nav className={styles.navBar}>
        <div className={styles.navBarWrapper}>
          <div className={styles.navBarLogo}>
            <Link href="/">
              <Image
                src="/img/stubborn-logotipo.svg"
                alt="stubborn criação de sites"
                width={100}
                height={20}
              />
            </Link>
          </div>
          <div className={styles.navBarItems}>
            <ul>
              <li>
                <Button variant="secondary" size="medium">
                  <a href="#inicio"><span>{t('inicio')}</span></a>
                </Button>
              </li>
              <li>
                <Button variant="secondary" size="medium">
                  <a href="#sobre"><span>{t('sobre')}</span></a>
                </Button>
              </li>
              <li>
                <Button variant="secondary" size="medium">
                  <a href="#portfolio"><span>{t('portfolio')}</span></a>
                </Button>
              </li>
              <li>
                <Button variant="secondary" size="medium">
                  <a href="#Contato"><span>{t('contato')}</span></a>
                </Button>
              </li>
            </ul>
          </div>
          <div className={styles.navBarButton}>
            <LangSwitcher />
            <Button variant="primary" size="medium">
              <a href="https://wa.me/5545991584114" target="_blank" rel="noreferrer">
                <TbCalendarClock size={20} aria-hidden />
                <span>{t('cta')}</span>
              </a>
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
