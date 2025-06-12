import Lenis from '@studio-freight/lenis';

export const initLenis = () => {
    const lenis = new Lenis({
        duration: 20, // Duração da suavidade (em segundos)
        easing: (t) => Math.min(1, 1.001 - Math.pow(100, -10 * t)), // Easing padrão
        smooth: true, // Ativa rolagem suave
        direction: 'vertical', // Direção da rolagem
        gestureDirection: 'vertical', // Suporte a gestos
        smoothTouch: false, // Desativa rolagem suave em dispositivos touch (ajuste conforme necessário)
    });

    // Atualiza o Lenis no loop de animação
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return lenis;
};