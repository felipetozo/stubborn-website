'use client';

import styles from '@/views/Components/NavBar.module.css';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/views/UI/Button';

function NavBar() {
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
                  <span>Início</span>
                </Button>
              </li>
              <li>
                <Button variant="secondary" size="medium">
                  <span>Sobre</span>
                </Button>
              </li>
              <li>
                <Button variant="secondary" size="medium">
                  <span>Portfolio</span>
                </Button>
              </li>
              <li>
                <Button variant="secondary" size="medium">
                  <span>Contato</span>
                </Button>
              </li>
            </ul>
          </div>
          <div className={styles.navBarButton}>
            <Link href="https://wa.me/5545991584114" target="_blank">
              <Button variant="primary" size="medium">
                <span>
                  Solicitar orçamento
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavBar;