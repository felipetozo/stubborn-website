import styles from '@/views/Components/NavBar.module.css';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/views/UI/Button';

function NavBar() {

    return (
        <>
            <nav className={styles.navBar}>
                <div className={styles.navBarWrapper}>
                    <div className={styles.navBarLogo}>
                        <Link href="/">
                            <Image
                                src="/img/stubborn-logotipo.svg"
                                alt="stubborn criação de sites"
                                width={160}
                                height={30}
                            />
                        </Link>
                    </div>
                    <div className={styles.navBarItems}>
                        <ul>
                            <li>
                                <Button variant="secondary" size="medium">
                                    <span>Home</span>
                                </Button>
                            </li>
                            <li>
                                <Button variant="secondary" size="medium">
                                    <span>About</span>
                                </Button>
                            </li>
                            <li>
                                <Button variant="secondary" size="medium">
                                    <span>Work</span>
                                </Button>
                            </li>
                            <li>
                                <Button variant="secondary" size="medium">
                                    <span>Contact</span>
                                </Button>
                            </li>
                        </ul>
                    </div>
                    <div className={styles.navBarButton}>
                        <Link href="#Contato">
                            <Button variant="primary" size="medium">
                                <span>Solicitar contato</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default NavBar;