import { useSpring, animated } from '@react-spring/web';
import { useMemo } from 'react';

interface AnimatedLineProps {
    text: string;
    lineProgress: number;
    isLastLine?: boolean;
    className?: string;
}

function AnimatedLine({ text, lineProgress, isLastLine, className }: AnimatedLineProps) {
    const revealPercent = useMemo(() => (1 - lineProgress) * 100, [lineProgress]);

    const spring = useSpring({
        opacity: lineProgress,
        config: { tension: 280, friction: 60 },
    });

    return (
        <animated.div
            className={className}
            style={{
                clipPath: `inset(0% ${revealPercent}% 0% 0%)`,
                opacity: spring.opacity,
                marginBottom: isLastLine ? '0' : '2.4rem',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {text}
        </animated.div>
    );
}

export default AnimatedLine;
