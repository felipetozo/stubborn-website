
import styles from '@/views/Components/Manifesto.module.css';
import Image from 'next/image';


function Manifesto() {
    return (
        <>
            <section className={styles.ManifestoSection}>
                <div className={styles.ManifestoWrapper}>
                    <div className={styles.ManifestoContent}>
                        <span>
                            Para os que chamam de teimosos. Os que persistem mesmo quando a lógica os desafia, e encontram coragem onde muitos veem barreiras.
                            <br /><br />
                            Que enxergam na base digital o primeiro tijolo para algo maior, e seguem firmes, construindo cada camada com propósito e precisão, guiados por uma visão que só se revela com o tempo.
                            <br /><br />
                            Porque grandes conquistas não se erguem com pressa - elas crescem com insistência, se consolidam na constância e florescem na evolução contínua.
                            <br /><br />
                            Para quem entende que maturidade digital não é aparência, é estrutura. É ter alicerces sólidos antes de erguer sonhos grandiosos.
                        </span>
                    </div>
                    <div className={styles.CraftingMotto}>
                        <p>
                            Crafting long
                            <span className={styles.CraftingMottoLine}></span>
                            lasting experiences
                        </p>
                    </div>
                    <div className={styles.ManifestoLogo}>
                        <Image
                            src="/img/stubborn-logotipo.svg"
                            alt="stubborn criação de sites"
                            width={160}
                            height={30}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}

export default Manifesto;