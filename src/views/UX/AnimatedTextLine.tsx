"use client";

import { useSpring, animated } from '@react-spring/web';
import { useEffect, useRef, useState, useCallback } from 'react';

interface AnimatedLetterProps {
    char: string;
    index: number;
    totalChars: number;
    lineProgress: number;
}

const AnimatedLetter = ({ char, index, totalChars, lineProgress }: AnimatedLetterProps) => {
    // Ensure totalChars is not zero to prevent division by zero or NaN
    const characterProgressThreshold = totalChars > 0 ? (index / totalChars) : 0;

    // The target opacity is 1 if lineProgress is beyond the character's threshold, else 0.1
    const targetOpacity = lineProgress > characterProgressThreshold ? 1.0 : 0.1;

    const spring = useSpring({
        opacity: targetOpacity,
        // Softer spring config for a smoother fade, but still relatively fast
        config: { tension: 100, friction: 15 },
    });

    return (
        <animated.span
            style={{
                display: 'inline-block',
                opacity: spring.opacity,
            }}
        >
            {char}
        </animated.span>
    );
};

interface AnimatedLineProps {
    text: string;
    isLastLine?: boolean;
    className?: string;
    shouldStart: boolean;
    onComplete: () => void;
}

function AnimatedLine({ text, isLastLine, className, shouldStart, onComplete }: AnimatedLineProps) {
    const lineRef = useRef<HTMLDivElement>(null);
    const [lineProgress, setLineProgress] = useState(0);
    const hasAnimationCompleted = useRef(false);

    const handleScroll = useCallback(() => {
        if (!lineRef.current) return;

        const rect = lineRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // --- ADJUSTED THRESHOLDS ---
        // Animation starts when the bottom of the element is visible at a certain point (e.g., halfway up the screen).
        // Animation completes when the top of the element reaches a higher point (e.g., 20% from top).
        const startVisibilityThreshold = windowHeight * 0.7; // Start when element's bottom is at 70% from top of viewport.
        const endVisibilityThreshold = windowHeight * 0.7;   // Finish when element's top is at 30% from top of viewport.
        // This creates a narrower and higher animation zone.
        // You might need to fine-tune these values based on your specific layout and menu height.

        let calculatedProgress = 0;

        // Check if the element is currently in the scrollable animation zone
        if (rect.top < startVisibilityThreshold && rect.bottom > endVisibilityThreshold) {
            // Calculate progress based on the element's top position relative to the scroll zone
            calculatedProgress = (startVisibilityThreshold - rect.top) / (startVisibilityThreshold - endVisibilityThreshold);

            // Clamp the progress to ensure it's always between 0 and 1
            calculatedProgress = Math.min(Math.max(calculatedProgress, 0), 1);
        } else if (rect.top >= startVisibilityThreshold) {
            // Element is completely below the starting point, so progress is 0
            calculatedProgress = 0;
        } else {
            // Element is completely above the ending point, so progress is 1 (fully visible)
            calculatedProgress = 1;
        }

        setLineProgress(calculatedProgress);

        // Trigger onComplete when the line reaches 100% visibility for the first time
        if (calculatedProgress >= 1 && !hasAnimationCompleted.current) {
            hasAnimationCompleted.current = true;
            onComplete();
        } else if (calculatedProgress < 1 && hasAnimationCompleted.current) {
            // If we scroll back up and the line is no longer fully visible, reset the flag
            hasAnimationCompleted.current = false;
        }
    }, [onComplete]);

    useEffect(() => {
        if (!shouldStart) {
            setLineProgress(0);
            hasAnimationCompleted.current = false;
            return;
        }

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [shouldStart, handleScroll]);

    // Dividir o texto em palavras
    const words = text ? text.split(' ') : [];

    // Contar o total de caracteres (incluindo espaços) para calcular o progresso
    const letters = text ? text.split(/(?!$)/u) : [];
    const totalChars = letters.length;

    // Índice global para rastrear a posição de cada letra no texto completo
    let charIndex = 0;

    return (
        <div
            ref={lineRef}
            className={className}
            style={{
                position: 'relative',
                overflow: 'hidden',
                marginBottom: isLastLine ? '0' : '2.4rem',
            }}
        >
            {words.map((word, wordIndex) => {
                const wordLetters = word.split(/(?!$)/u);
                const wordElement = (
                    <span
                        key={wordIndex}
                        style={{
                            whiteSpace: 'nowrap', // Impede quebras dentro da palavra
                            display: 'inline-block',
                            marginRight: '0.2rem', // Espaço entre palavras
                        }}
                    >
                        {wordLetters.map((char, letterIndex) => {
                            const globalIndex = charIndex;
                            charIndex++; // Incrementa o índice global
                            return (
                                <AnimatedLetter
                                    key={`${wordIndex}-${letterIndex}`}
                                    char={char}
                                    index={globalIndex}
                                    totalChars={totalChars}
                                    lineProgress={lineProgress}
                                />
                            );
                        })}
                    </span>
                );

                return wordElement;
            })}
        </div>
    );
}

export default AnimatedLine;