"use client";

import { useState } from 'react';
import styles from '@/views/Components/Manifesto.module.css';
import Image from 'next/image';
import AnimatedLine from '@/views/UX/AnimatedTextLine';

function Manifesto() {
    const manifestoLines = [
        "Para os que chamam de teimosos. Os que persistem mesmo quando a lógica os desafia, e encontram coragem onde muitos veem barreiras.",
        "Que enxergam na base digital o primeiro tijolo para algo maior, e seguem firmes, construindo cada camada com propósito e precisão, guiados por uma visão que só se revela com o tempo.",
        "Porque grandes conquistas não se erguem com pressa - elas crescem com insistência, se consolidam na constância e florescem na evolução contínua.",
        "Para quem entende que maturidade digital não é aparência, é estrutura. É ter alicerces sólidos antes de erguer sonhos grandiosos.",
    ];

    // Initialize the first line to start immediately
    const [startedLines, setStartedLines] = useState([true, false, false, false]);

    return (
        <>
            <section className={styles.ManifestoSection}>
                <div className={styles.ManifestoWrapper}>
                    <div className={styles.ManifestoContent}>
                        {manifestoLines.map((line, index) => (
                            <AnimatedLine
                                key={index}
                                text={line}
                                isLastLine={index === manifestoLines.length - 1}
                                className={styles.ManifestoContentSpan}
                                shouldStart={startedLines[index]} // This prop controls when animation can begin
                                onComplete={() => {
                                    // When the current line completes its animation, enable the next one
                                    if (index + 1 < manifestoLines.length) {
                                        setStartedLines((prev) => {
                                            const updated = [...prev];
                                            updated[index + 1] = true; // Set next line to true
                                            return updated;
                                        });
                                    }
                                }}
                            />
                        ))}
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